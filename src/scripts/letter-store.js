import { google } from 'googleapis';
import { SERVICE_KEY } from "astro:env/server";
const isDev = import.meta.env.DEV;
const isStaging = import.meta.env.STAGING;

export class StorageApi {
  constructor() {
    this.client = undefined;
    this.weekId = undefined;
    this. topFolder = isDev ? 'Letters-Development' : 
                      isStaging ? 'Letters-Staging' : 
                      'Letters';
  }
  
  /**
   * Load or request or authorization to call APIs.
   *
   */
  async authorize() {
    try {
      const keys = JSON.parse(SERVICE_KEY);
      this.client = google.auth.fromJSON(keys);
      this.client.scopes = ['https://www.googleapis.com/auth/drive'];
      return this.client;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }
  
  /**
   * find or create the folder.
   */
  async findOrCreateFolder(name, parentId) {
    const drive = google.drive({version: 'v3', auth: this.client});
    let queryTerms = [
      `name = '${name}'`,
      "trashed = false",
      "mimeType = 'application/vnd.google-apps.folder'",
    ];
    if (parentId) {
      queryTerms.push(`'${parentId}' in parents`);
    }
    const query = queryTerms.join(" and ");

    const res = await drive.files.list({
      pageSize: 10,
      q: query,
      fields: 'nextPageToken, files(id, name)',
    });
    const files = res.data.files;
    if (files.length === 0) {
      // create the missing folder
      let fileMetadata = {
        name: name,
        mimeType: 'application/vnd.google-apps.folder',
      };
      if (parentId) {
        fileMetadata.parents = [parentId];
      }
      const folder = await drive.files.create({
        requestBody: fileMetadata,
        fields: 'id',
      });
      return folder.data.id;
    }
    return files[0].id;
  }

  async getWeeklyFolder() {
    if (!this.client) {
      await this.authorize();
    }
    if (!this.weekId) {
      let weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const day = weekStart.getDate().toString().padStart(2, "0");
      const month = (weekStart.getMonth() + 1).toString().padStart(2, "0");
      const year = weekStart.getFullYear().toString().padStart(4, "0");
      const folderName = `${year}-${month}-${day}`;
  
      const lettersId = await this.findOrCreateFolder(this.topFolder, undefined);
      this.weekId = await this.findOrCreateFolder(folderName, lettersId);
    }
    return this.weekId;
  }

  /**
   * Lists the names and IDs of up to 10 files.
   * @param {OAuth2Client} authClient An authorized OAuth2 client.
   */
  async uploadLetters(letters) {
    if (!this.client) {
      await this.authorize();
    }
    if (!this.weekId) {
      await this.getWeeklyFolder();
    }
    let links = letters.map((letter) => {
      return this.uploadLetter(letter);
    });
    return await Promise.all(links);
  }

  async uploadLetter(letter) {
    const drive = google.drive({version: 'v3', auth: this.client});
    const fileMetadata = {
      name: letter.filename,
      fields: 'id',
      parents: [ this.weekId ],
    };
    const media = {
      mimeType: 'application/pdf',
      body: letter.data,
    };

    try {
      let file = await drive.files.create({  // @ts-ignore await definitely does have an effect here
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      drive.permissions.create({
        fileId: file.data.id,
        requestBody: {
          type: "anyone",
          role: "reader",
        },
      });

      return `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
    } catch (err) {
      throw err;
    }
  }
}
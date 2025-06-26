import { google } from 'googleapis';
import { GOOGLE_TOKEN } from "astro:env/server";

export class StorageApi {
  constructor() {
    this.client = undefined;
    this.weekId = undefined;
  }

  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
  loadSavedCredentialsIfExist() {
    try {
      const content = GOOGLE_TOKEN;
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      throw err;
    }
  }
  
  /**
   * Load or request or authorization to call APIs.
   *
   */
  async authorize() {
    this.client = this.loadSavedCredentialsIfExist();
    if (this.client) {
      return this.client;
    }
    throw new Error("Missing oauth token for the Google Drive API.");
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
  
      const lettersId = await this.findOrCreateFolder('Letters', undefined);
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
    let linkPromises = letters.map((letter) => {
      return this.uploadLetter(letter);
    });
    const links = await Promise.all(linkPromises);
    return links;
  }

  async uploadLetter(letter) {
    const drive = google.drive({version: 'v3', auth: this.client});
    const requestBody = {
      name: letter.filename,
      fields: 'id',
      mimeType: 'application/pdf',
      parents: [ this.weekId ],
    };
    const media = {
      mimeType: 'application/pdf',
      body: letter.data,
    };

    try {
      let file = await drive.files.create({  // @ts-ignore await definitely does have an effect here
        requestBody,
        media: media,
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
      console.log(err);
      throw err;
    }
  }
}
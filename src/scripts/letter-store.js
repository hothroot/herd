import { authenticate } from '@google-cloud/local-auth';
import { google } from 'googleapis';

import { DRIVE_CREDENTIALS , GOOGLE_TOKEN } from "astro:env/server";

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/drive'];

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
      return null;
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

    this.client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    // sadly, we have nowhere to save them
    // if (this.client.credentials) {
    //   await this.saveCredentials();
    // }
    this.client = client;
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
      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id',
      });
      const perm = await drive.permissions.create({
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
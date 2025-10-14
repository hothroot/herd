import { DriveClient } from '@/scripts/google-drive';

export class Ledger {
  constructor() {
    this.client = new DriveClient();
    this.topFolder = 'Letters';
    this.sheetName = 'Ledger';
  }

  /**
   * add letters to the ledger
   * 
   * Create the destination spreadsheet if necessary.
   * Log the cross-reference tag for lookup.
   */
   async recordLetters(letters) {
    await this.client.authorize();
    const sheetId = await this.#getLedger();

    const logValue = {
      values: [[
        letters[0].letterId,
      ]]
    };
    const response = this.client.appendRow({
        spreadsheetId: sheetId,
        range: 'Sheet1',
        valueInputOption: 'RAW',
        resource: logValue,
    });
    return response;
  }

  async #getLedger() {
    const lettersId = await this.client.findOrCreateFolder(this.topFolder, undefined);
    return this.client.findOrCreateFile(
        this.sheetName,
        'application/vnd.google-apps.spreadsheet',
        lettersId);
  }
}
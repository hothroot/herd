import PDFDocument from 'pdfkit';
import fs from 'fs';
import { type Address, type Reps } from '@/scripts/letter-state.js';
import { stateDecoder } from `./states.ts`;

export default function letterToPdf(address: Address, reps: Reps, today: string, message: string) {
    const postalCode = stateDecoder(address.state);
    const senator = reps[0].name;
    const messageClean = message.replaceAll('\r', '');
    const margin = 72;

    const doc = new PDFDocument({
        size: 'LETTER',
        font: 'Times-Roman',
        info: {
            'Title': `a constituent letter for ${reps[0].name}`,
            'Subject': `authored by ${address['name']} using HerdOnTheHill.org`,
        },
        margin: margin,
    });

    // TODO
    doc.pipe(fs.createWriteStream('output.pdf'));
    
    doc.fontSize(14);
    doc.moveDown(2.0);

    let line1 = address.name;
    let line2 = address.street;
    let line3 = `${address.city}, ${postalCode}, ${address.zipcode}`;
    let addressWidth = Math.max(
        doc.widthOfString(line1),
        doc.widthOfString(line2),
        doc.widthOfString(line3),
    );
    let addressIndent = doc.page.width - 2 * margin - addressWidth - 5;

    doc.text(
        `${line1}\n${line2}\n${line3}`,
        {
            indent: addressIndent,
            indentAll: true,
        }
    );
    doc.moveDown(2.0);

    doc.text(today);
    doc.moveDown(2.0);
    doc.text(
        `The Honorable ${senator}\n` +
        `United States Senate\n` +
        `Washington, D.C. 20510`
        );
    doc.moveDown(2.0);

    doc.text(`Dear Senator ${senator},`); doc.moveDown();

    doc.text(messageClean); doc.moveDown();

    doc.text('Sincerely yours,', {indent: 250}); doc.moveDown();
    doc.text(address.name, {indent: 250});

    doc.end();
};
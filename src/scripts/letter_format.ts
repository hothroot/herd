import PDFDocument from 'pdfkit';
import fs from 'fs';
import { type Address, type Reps } from '@/scripts/letter_state.js';
import { stateDecoder } from `@/scripts/states.ts`;

export default function letterToPdf(address: Address, reps: Reps, today: string, message: string) {
    const postalCode = stateDecoder(address.state);
    const senator = reps[0].name;
    const messageClean = message.replaceAll('\r', '');

    const doc = new PDFDocument({
        size: 'LETTER',
        font: 'Times-Roman',
        info: {
            'Title': `a constituent letter for ${reps[0].name}`,
            'Subject': `authored by ${address['name']} using HerdOnTheHill.org`,
        }
    });

    // TODO
    doc.pipe(fs.createWriteStream('output.pdf'));

    doc.fontSize(14);
    doc.moveDown(2.0);
    doc.text(
        (
            `${address.name}\n` +
            `${address.street}\n` +
            `${address.city}, ${postalCode}, ${address.zipcode}`
        ),
        {
            indent: 250,
            indentAll: true,
        });
    doc.moveDown(4.0);

    doc.text(today);
    doc.moveDown(4.0);

    doc.text(`The Honorable ${senator},`); doc.moveDown();

    doc.text(messageClean); doc.moveDown();

    doc.text('Sincerely yours,', {indent: 250}); doc.moveDown();
    doc.text(address.name, {indent: 250});

    doc.end();
};
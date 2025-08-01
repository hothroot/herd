import PDFDocument from 'pdfkit';
import { type Address, type Rep } from '@/scripts/letter-state.js';
import { stateDecoder } from '@/scripts//states.ts';
import crypto from "crypto";

const FONT_SIZE = 14;
const FOOTER_SIZE = 10;

function footer(doc: typeof PDFDocument, fontSize: number, prefix: string, pageNumber: number) {
    var bottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    doc.fontSize(FOOTER_SIZE);
    const foot = `${prefix}-${pageNumber}`;
    const width = doc.widthOfString(foot);
    doc.text(foot,
        doc.page.width - width - doc.page.margins.right,
        doc.page.height - 50,
        {
            lineBreak: false
        },
    );
    doc.fontSize(fontSize);
    doc.text('', 50, 50);
    doc.page.margins.bottom = bottom;
}

export default function letterToPdf(address: Address, rep: Rep, today: string, message: string, photo: string | null) {
    const postalCode = stateDecoder(address.state);
    const officeLine = rep.office !== "unknown" ? `${rep.office}\n`: "";
    const messageClean = message.replaceAll('\r', '');
    const margin = 72;
    const buildingNumber = rep.office === "unknown" ? "UNK" : rep.office.substring(0, 3);
    const buildingInitial = rep.office === "unknown" ? 'X' : rep.office[4];
    const senatorId = rep.id.replace(/_/g,'-');
    const authorId = crypto.createHash('sha256')
        .update(address.name)
        .update(address.street)
        .update(address.city)
        .update(address.state)
        .update(address.zipcode)
        .update(today)
        .digest('hex')
        .substring(0, 5);
    var pageNumber = 1;
    var fontSize = FONT_SIZE;

    const foot = `${buildingNumber}-${buildingInitial}-${senatorId}-${authorId}`;

    const doc = new PDFDocument({
        size: 'LETTER',
        font: 'Times-Roman',
        info: {
            'Title': `a constituent letter for ${rep.fullName}`,
            'Subject': `authored by ${address['name']} using HerdOnTheHill.org`,
        },
        margin: margin,
    });

    doc.fontSize(fontSize);

    footer(doc, fontSize, foot, pageNumber);
    doc.on('pageAdded', () => {
        pageNumber ++;
        footer(doc, fontSize, foot, pageNumber);
    });

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
        }
    );
    doc.moveDown(1.0);

    doc.text(today);
    doc.moveDown(1.0);
    doc.text(
        `The Honorable ${rep.fullName}\n` +
        `United States Senate\n` +
        officeLine +  
        `Washington, D.C. 20510`
        );
    doc.moveDown(2.0);

    doc.text(`Dear Senator ${rep.salutation},`); doc.moveDown();

    var spaceRemaining = (doc.page.height
        - doc.page.margins.bottom
        - doc.y
        - 5 * doc.currentLineHeight()
    );
    while (doc.heightOfString(messageClean) > spaceRemaining) {
        fontSize *= 0.95;
        doc.fontSize(fontSize);
    }
    doc.text(messageClean); doc.moveDown();
    
    fontSize = FONT_SIZE;
    doc.fontSize(fontSize);

    if (photo) {
        doc.image(photo, 250, doc.y, {width: 50});
    }
    doc.text('Sincerely yours,', {indent: 250}); doc.moveDown();
    doc.text(address.name, {indent: 250});

    doc.end();
    return doc;
};
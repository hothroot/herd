import fs from 'fs';
import * as fontkit from 'fontkit';

let src = fs.readFileSync("./public/NotoSerif.ttf")
let font = fontkit.create(src, null);
console.log(font)
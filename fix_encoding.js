import fs from 'fs';
let code = fs.readFileSync('src/App.jsx', 'utf8');
code = Buffer.from(code, 'latin1').toString('utf8');
fs.writeFileSync('src/App.jsx', code, 'utf8');

import fs from 'fs';
const header = `\
/* eslint-disable */ 
`;
console.log(' YERP');

const orig = fs.readFileSync('peg/parser.js', 'utf8');
fs.writeFileSync('src/parsers/taf-parser.js', header + orig);

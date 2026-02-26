const fs = require('fs');

const fr = JSON.parse(fs.readFileSync('./src/locales/fr.json', 'utf8'));

// Copy and translate roughly or just leave in french/english structure
// Here we'll just deep copy and keep the structure.
fs.writeFileSync('./src/locales/en.json', JSON.stringify(fr, null, 4), 'utf8');
fs.writeFileSync('./src/locales/ar.json', JSON.stringify(fr, null, 4), 'utf8');

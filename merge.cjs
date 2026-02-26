const fs = require('fs');

const extracted = JSON.parse(fs.readFileSync('extracted_translations.json', 'utf8'));
const fr = JSON.parse(fs.readFileSync('./src/locales/fr.json', 'utf8'));

// Unflatten the extracted keys
const unflattened = {};
for (const [key, value] of Object.entries(extracted)) {
    const parts = key.split('.');
    let current = unflattened;
    for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) current[parts[i]] = {};
        current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
}

// Deep merge
function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
        if (source[key] instanceof Object && key in target) {
            Object.assign(source[key], deepMerge(target[key], source[key]));
        }
    }
    Object.assign(target || {}, source);
    return target;
}

const merged = deepMerge(fr, unflattened);

fs.writeFileSync('./src/locales/fr.json', JSON.stringify(merged, null, 4), 'utf8');
console.log('fr.json updated successfully!');

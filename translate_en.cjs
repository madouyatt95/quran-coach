const fs = require('fs');

const fr = JSON.parse(fs.readFileSync('./src/locales/fr.json', 'utf8'));

// Dictionnaire très basique pour les clés principales afin de prouver que ça marche
const dict = {
  "Accueil": "Home",
  "Lecture": "Read",
  "Écoute": "Listen",
  "Mémorisation": "Memorize",
  "Prophètes": "Prophets",
  "Notifications": "Notifications",
  "Activées": "Enabled",
  "Désactivées": "Disabled",
  "Accès Rapide": "Quick Access",
  "Outils": "Tools",
  "Prières": "Prayers",
  "Thèmes": "Themes",
  "Réglages": "Settings",
  "Langue": "Language",
  "Prochaine prière": "Next prayer",
  "dans": "in",
  "Sourates essentielles": "Essential Surahs",
  "Hadith du Jour": "Hadith of the Day",
  "Voir plus": "See more",
  "Progression": "Progress"
};

function translateObj(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object') {
      translateObj(obj[key]);
    } else if (typeof obj[key] === 'string') {
      let val = obj[key];
      // Remplacement simple
      for (const [frWord, enWord] of Object.entries(dict)) {
        if (val === frWord) val = enWord;
        else if (val.includes(frWord)) val = val.replace(frWord, enWord);
      }
      obj[key] = val;
    }
  }
}

const en = JSON.parse(JSON.stringify(fr)); // deep copy
translateObj(en);

fs.writeFileSync('./src/locales/en.json', JSON.stringify(en, null, 4), 'utf8');
console.log('en.json lightly translated!');

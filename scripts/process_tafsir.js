/**
 * SCRIPT D'EXTRACTION TAFSIR IBN KATHIR (FR)
 * Ce script permet de transformer un texte structuré (ex: copié d'un PDF)
 * en un fichier JSON compatible avec l'application Quran Coach.
 * 
 * Usage: node scripts/process_tafsir.js input.txt output.json
 */

const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'french_ibnkathir_local.json';

if (!inputFile) {
    console.error("Erreur : Veuillez spécifier un fichier d'entrée (.txt)");
    process.exit(1);
}

try {
    const content = fs.readFileSync(inputFile, 'utf8');
    const lines = content.split('\n');
    const tafsirMap = {};

    let currentSurah = 1;
    let currentAyah = 1;

    console.log("Démarrage du parsing...");

    lines.forEach(line => {
        // Détection de Sourates (ex: "Sourate 1 : Al-Fatiha")
        const surahMatch = line.match(/Sourate\s+(\d+)/i);
        if (surahMatch) {
            currentSurah = parseInt(surahMatch[1]);
            console.log(`- Traitement de la Sourate ${currentSurah}`);
            return;
        }

        // Détection de Versets (ex: "Verset 1" ou "Verset 1 à 3")
        const ayahMatch = line.match(/Verset\s+(\d+)/i);
        if (ayahMatch) {
            currentAyah = parseInt(ayahMatch[1]);
            return;
        }

        // Accumulation du texte si la ligne n'est pas vide
        const trimmed = line.trim();
        if (trimmed.length > 10) { // On ignore les lignes trop courtes ou bruits d'extraction
            const key = `${currentSurah}:${currentAyah}`;
            if (!tafsirMap[key]) {
                tafsirMap[key] = trimmed;
            } else {
                tafsirMap[key] += "\n\n" + trimmed;
            }
        }
    });

    fs.writeFileSync(outputFile, JSON.stringify(tafsirMap, null, 2), 'utf8');
    console.log(`\nSuccès ! Fichier JSON généré : ${outputFile}`);
    console.log(`Total Versets extraits : ${Object.keys(tafsirMap).length}`);

} catch (err) {
    console.error("Erreur lors du traitement :", err.message);
}

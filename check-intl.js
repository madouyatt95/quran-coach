const date = new Date('2026-03-07T12:00:00Z');

const format = new Intl.DateTimeFormat('fr-FR-u-ca-islamic-umalqura', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
});

const parts = format.formatToParts(date);
const day = parts.find(p => p.type === 'day').value;
const month = parts.find(p => p.type === 'month').value;
const year = parts.find(p => p.type === 'year').value;

console.log('Umm al-Qura Date:', { day: parseInt(day), month: parseInt(month), year: parseInt(year) });

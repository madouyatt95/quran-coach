const date = new Date('2026-03-01T02:25:47+01:00');
const formatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
});
console.log(formatter.format(date));
const parts = formatter.formatToParts(date);
const d = parts.find(p => p.type === 'day')?.value;
console.log(d);

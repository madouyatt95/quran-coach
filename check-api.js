async function checkEnc() {
    const res = await fetch('https://quranenc.com/api/v1/translations/list');
    const data = await res.json();
    const fr = data.translations.filter(t => t.language_iso_code === 'fr' || t.title.toLowerCase().includes('muyassar'));
    console.log(fr);
}
checkEnc();

async function test() {
    console.log('Testing QuranEnc Tafsir...');
    const res1 = await fetch('https://quranenc.com/api/v1/translation/aya/french_mokhtasar/1/1');
    console.log('QuranEnc Status:', res1.status);

    console.log('Testing QuranCDN Verse...');
    const res2 = await fetch('https://api.qurancdn.com/api/v4/verses/by_key/1:1?translations=136&fields=text_uthmani');
    console.log('QuranCDN Status:', res2.status);
}
test();

// Juz (Part) data for the Quran
// Each Juz spans multiple pages

export interface JuzInfo {
    number: number;
    name: string;
    nameArabic: string;
    startPage: number;
    endPage: number;
    startSurah: number;
    startAyah: number;
}

export const JUZ_DATA: JuzInfo[] = [
    { number: 1, name: "Alif Lam Mim", nameArabic: "ألم", startPage: 1, endPage: 21, startSurah: 1, startAyah: 1 },
    { number: 2, name: "Sayaqool", nameArabic: "سيقول", startPage: 22, endPage: 41, startSurah: 2, startAyah: 142 },
    { number: 3, name: "Tilka ar-Rusul", nameArabic: "تلك الرسل", startPage: 42, endPage: 61, startSurah: 2, startAyah: 253 },
    { number: 4, name: "Lan Tanaloo", nameArabic: "لن تنالوا", startPage: 62, endPage: 81, startSurah: 3, startAyah: 93 },
    { number: 5, name: "Wal Mohsanat", nameArabic: "والمحصنات", startPage: 82, endPage: 101, startSurah: 4, startAyah: 24 },
    { number: 6, name: "La Yuhibbu-Allah", nameArabic: "لا يحب الله", startPage: 102, endPage: 121, startSurah: 4, startAyah: 148 },
    { number: 7, name: "Wa Iza Sami'oo", nameArabic: "وإذا سمعوا", startPage: 122, endPage: 141, startSurah: 5, startAyah: 83 },
    { number: 8, name: "Wa Lau Annana", nameArabic: "ولو أننا", startPage: 142, endPage: 161, startSurah: 6, startAyah: 111 },
    { number: 9, name: "Qalal Mala'", nameArabic: "قال الملأ", startPage: 162, endPage: 181, startSurah: 7, startAyah: 88 },
    { number: 10, name: "Wa A'lamu", nameArabic: "واعلموا", startPage: 182, endPage: 201, startSurah: 8, startAyah: 41 },
    { number: 11, name: "Ya'tazirun", nameArabic: "يعتذرون", startPage: 202, endPage: 221, startSurah: 9, startAyah: 94 },
    { number: 12, name: "Wa Mamin Da'abba", nameArabic: "وما من دابة", startPage: 222, endPage: 241, startSurah: 11, startAyah: 6 },
    { number: 13, name: "Wa Ma Ubarri'u", nameArabic: "وما أبرئ", startPage: 242, endPage: 261, startSurah: 12, startAyah: 53 },
    { number: 14, name: "Rubama", nameArabic: "ربما", startPage: 262, endPage: 281, startSurah: 15, startAyah: 1 },
    { number: 15, name: "Subhana Allazi", nameArabic: "سبحان الذي", startPage: 282, endPage: 301, startSurah: 17, startAyah: 1 },
    { number: 16, name: "Qal Alam", nameArabic: "قال ألم", startPage: 302, endPage: 321, startSurah: 18, startAyah: 75 },
    { number: 17, name: "Iqtaraba", nameArabic: "اقترب", startPage: 322, endPage: 341, startSurah: 21, startAyah: 1 },
    { number: 18, name: "Qad Aflaha", nameArabic: "قد أفلح", startPage: 342, endPage: 361, startSurah: 23, startAyah: 1 },
    { number: 19, name: "Wa Qalallazina", nameArabic: "وقال الذين", startPage: 362, endPage: 381, startSurah: 25, startAyah: 21 },
    { number: 20, name: "A'man Khalaqa", nameArabic: "أمن خلق", startPage: 382, endPage: 401, startSurah: 27, startAyah: 56 },
    { number: 21, name: "Utlu Ma Oohi", nameArabic: "اتل ما أوحي", startPage: 402, endPage: 421, startSurah: 29, startAyah: 46 },
    { number: 22, name: "Wa Man Yaqnut", nameArabic: "ومن يقنت", startPage: 422, endPage: 441, startSurah: 33, startAyah: 31 },
    { number: 23, name: "Wa Mali", nameArabic: "ومالي", startPage: 442, endPage: 461, startSurah: 36, startAyah: 22 },
    { number: 24, name: "Faman Azlam", nameArabic: "فمن أظلم", startPage: 462, endPage: 481, startSurah: 39, startAyah: 32 },
    { number: 25, name: "Ilaihi Yurad", nameArabic: "إليه يرد", startPage: 482, endPage: 501, startSurah: 41, startAyah: 47 },
    { number: 26, name: "Ha Meem", nameArabic: "حم", startPage: 502, endPage: 521, startSurah: 46, startAyah: 1 },
    { number: 27, name: "Qala Fama Khatbukum", nameArabic: "قال فما خطبكم", startPage: 522, endPage: 541, startSurah: 51, startAyah: 31 },
    { number: 28, name: "Qad Sami' Allah", nameArabic: "قد سمع الله", startPage: 542, endPage: 561, startSurah: 58, startAyah: 1 },
    { number: 29, name: "Tabaraka Allazi", nameArabic: "تبارك الذي", startPage: 562, endPage: 581, startSurah: 67, startAyah: 1 },
    { number: 30, name: "Amma Yatasa'alun", nameArabic: "عم يتساءلون", startPage: 582, endPage: 604, startSurah: 78, startAyah: 1 },
];

export function getJuzForPage(page: number): JuzInfo | undefined {
    return JUZ_DATA.find(juz => page >= juz.startPage && page <= juz.endPage);
}

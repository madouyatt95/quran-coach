// Quranic Locations Data
// Places mentioned in the Quran with their coordinates and related verses

export interface QuranLocation {
    id: string;
    name: string;
    nameAr: string;
    coords: [number, number]; // [lat, lng]
    description: string;
    verses: Array<{
        surah: number;
        ayah: number;
        surahName: string;
        excerpt: string;
    }>;
    category: 'city' | 'mountain' | 'sea' | 'region' | 'prophet';
}

export const QURAN_LOCATIONS: QuranLocation[] = [
    {
        id: 'makkah',
        name: 'La Mecque',
        nameAr: 'مكة',
        coords: [21.4225, 39.8262],
        description: 'Ville sacree, lieu de la Kaaba',
        verses: [
            { surah: 3, ayah: 96, surahName: 'Al-Imran', excerpt: 'La premiere Maison erigee pour les gens...' },
            { surah: 48, ayah: 24, surahName: 'Al-Fath', excerpt: 'Dans la vallee de la Mecque...' },
        ],
        category: 'city'
    },
    {
        id: 'madinah',
        name: 'Medine',
        nameAr: 'المدينة',
        coords: [24.4539, 39.6142],
        description: 'Ville du Prophete, lieu de la mosquee',
        verses: [
            { surah: 9, ayah: 101, surahName: 'At-Tawbah', excerpt: 'Parmi les Bedouins et les habitants de Medine...' },
        ],
        category: 'city'
    },
    {
        id: 'alquds',
        name: 'Jerusalem',
        nameAr: 'القدس',
        coords: [31.7683, 35.2137],
        description: 'Al-Aqsa, premiere Qibla, lieu du Isra',
        verses: [
            { surah: 17, ayah: 1, surahName: 'Al-Isra', excerpt: 'Gloire a Celui qui a fait voyager Son serviteur...' },
        ],
        category: 'city'
    },
    {
        id: 'tur-sinai',
        name: 'Mont Sinai',
        nameAr: 'طور سيناء',
        coords: [28.5392, 33.9751],
        description: 'Lieu ou Moussa a recu les Tables de la Loi',
        verses: [
            { surah: 19, ayah: 52, surahName: 'Maryam', excerpt: 'Nous appelames du cote droit du Mont...' },
            { surah: 20, ayah: 80, surahName: 'Ta-Ha', excerpt: 'O Enfants Israel, Nous vous avons delivres...' },
        ],
        category: 'mountain'
    },
    {
        id: 'egypt',
        name: 'Egypte',
        nameAr: 'مصر',
        coords: [26.8206, 30.8025],
        description: 'Terre des Pharaons, histoire de Moussa et Youssef',
        verses: [
            { surah: 12, ayah: 21, surahName: 'Youssouf', excerpt: 'Celui qui acheta en Egypte dit a sa femme...' },
            { surah: 10, ayah: 87, surahName: 'Younous', excerpt: 'Prenez pour votre peuple en Egypte des maisons...' },
        ],
        category: 'region'
    },
    {
        id: 'badr',
        name: 'Badr',
        nameAr: 'بدر',
        coords: [23.7833, 38.7833],
        description: 'Lieu de la premiere bataille de Islam',
        verses: [
            { surah: 3, ayah: 123, surahName: 'Al-Imran', excerpt: 'Allah vous a secourus a Badr...' },
        ],
        category: 'city'
    },
    {
        id: 'arafat',
        name: 'Mont Arafat',
        nameAr: 'عرفات',
        coords: [21.3549, 39.9842],
        description: 'Lieu du sermon adieu et du pelerinage',
        verses: [
            { surah: 2, ayah: 198, surahName: 'Al-Baqarah', excerpt: 'Quand vous deferlez depuis Arafat...' },
        ],
        category: 'mountain'
    },
    {
        id: 'red-sea',
        name: 'Mer Rouge',
        nameAr: 'البحر الأحمر',
        coords: [22.0, 38.0],
        description: 'Miracle de Moussa - la mer fendue',
        verses: [
            { surah: 26, ayah: 63, surahName: 'Ash-Shuara', excerpt: 'Frappe la mer de ton baton. Elle se fendit...' },
            { surah: 2, ayah: 50, surahName: 'Al-Baqarah', excerpt: 'Nous avons fendu la mer pour vous...' },
        ],
        category: 'sea'
    },
    {
        id: 'babylon',
        name: 'Babylone',
        nameAr: 'بابل',
        coords: [32.5421, 44.4209],
        description: 'Ou les anges Harout et Marout enseignerent',
        verses: [
            { surah: 2, ayah: 102, surahName: 'Al-Baqarah', excerpt: 'Ce qui fut descendu sur les deux anges a Babylone...' },
        ],
        category: 'city'
    },
    {
        id: 'saba',
        name: 'Saba (Yemen)',
        nameAr: 'سبأ',
        coords: [15.3694, 45.0],
        description: 'Royaume de la Reine de Saba et Soulayman',
        verses: [
            { surah: 34, ayah: 15, surahName: 'Saba', excerpt: 'Il y avait pour la tribu de Saba un signe...' },
            { surah: 27, ayah: 22, surahName: 'An-Naml', excerpt: 'La huppe dit: Je viens de Saba...' },
        ],
        category: 'region'
    },
    {
        id: 'thamud',
        name: 'Al-Hijr (Madain Saleh)',
        nameAr: 'الحِجر',
        coords: [26.7867, 37.9550],
        description: 'Demeure du peuple de Thamoud et du prophete Salih',
        verses: [
            { surah: 7, ayah: 73, surahName: 'Al-Araf', excerpt: 'Aux Thamoud, leur frere Salih. O mon peuple...' },
            { surah: 15, ayah: 80, surahName: 'Al-Hijr', excerpt: 'Les gens de Al-Hijr traiterent de menteurs...' },
        ],
        category: 'region'
    },
    {
        id: 'cave-hira',
        name: 'Grotte de Hira',
        nameAr: 'غار حراء',
        coords: [21.4578, 39.8583],
        description: 'Lieu de la premiere revelation au Prophete',
        verses: [
            { surah: 96, ayah: 1, surahName: 'Al-Alaq', excerpt: 'Lis! Au nom de ton Seigneur qui a cree...' },
        ],
        category: 'mountain'
    },
];

// Categories for filtering
export const LOCATION_CATEGORIES = [
    { id: 'all', name: 'Tous', icon: '🌍' },
    { id: 'city', name: 'Villes', icon: '🏛️' },
    { id: 'mountain', name: 'Montagnes', icon: '⛰️' },
    { id: 'sea', name: 'Mers', icon: '🌊' },
    { id: 'region', name: 'Regions', icon: '📍' },
];

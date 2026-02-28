import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, CheckCircle, Star, Sparkles, BookOpen, RotateCcw, Trophy } from 'lucide-react';
import { useAcademyStore, type AcademyLevel } from '../stores/academyStore';
import './AcademyPage.css';

// ─── Module Definitions ──────────────────────────────────

interface AcademyModule {
    id: string;
    emoji: string;
    title: string;
    titleAr: string;
    description: string;
    category: 'alphabet' | 'quran' | 'fiqh' | 'aqidah';
    difficulty: 1 | 2 | 3;
    estimatedMinutes: number;
    content: ModuleContent[];
}

interface ModuleContent {
    type: 'lesson' | 'quiz' | 'practice';
    title: string;
    data: LessonData | QuizData;
}

interface LessonData {
    sections: { title: string; body: string; arabic?: string }[];
}

interface QuizData {
    questions: { q: string; options: string[]; answer: number; explanation: string }[];
}

// ─── Modules Database ────────────────────────────────────

const ACADEMY_MODULES: AcademyModule[] = [
    // === ALPHABET ===
    {
        id: 'alphabet',
        emoji: '🔤',
        title: 'L\'Alphabet Arabe',
        titleAr: 'الحروف العربية',
        description: 'Apprendre les 28 lettres arabes, leur forme et leur prononciation',
        category: 'alphabet',
        difficulty: 1,
        estimatedMinutes: 30,
        content: [{
            type: 'lesson',
            title: 'Les lettres de base',
            data: {
                sections: [
                    { title: 'Groupe 1 — Les lettres similaires au français', body: 'Certaines lettres arabes ont des sons proches du français. Commençons par celles-ci pour faciliter l\'apprentissage.', arabic: 'ب ت ث ن ي' },
                    { title: 'Ba (ب)', body: 'Se prononce comme le B français. Un point sous la lettre.', arabic: 'بِسْمِ اللَّهِ' },
                    { title: 'Ta (ت)', body: 'Se prononce comme le T français. Deux points au-dessus.', arabic: 'تَوْبَة' },
                    { title: 'Tha (ث)', body: 'Se prononce comme le TH anglais dans "think". Trois points au-dessus.', arabic: 'ثَلَاثَة' },
                    { title: 'Noun (ن)', body: 'Se prononce comme le N français. Un point au-dessus.', arabic: 'نُور' },
                    { title: 'Ya (ي)', body: 'Se prononce comme le I long ou le Y français. Deux points en dessous.', arabic: 'يَوْم' },
                ]
            } as LessonData,
        }, {
            type: 'quiz',
            title: 'Quiz — Lettres de base',
            data: {
                questions: [
                    { q: 'Quelle lettre est ب ?', options: ['Ba', 'Ta', 'Noun', 'Ya'], answer: 0, explanation: 'ب (Ba) a un point en dessous.' },
                    { q: 'Combien de points a la lettre ث ?', options: ['1', '2', '3', '0'], answer: 2, explanation: 'ث (Tha) a trois points au-dessus.' },
                    { q: 'Comment se lit ن ?', options: ['Ba', 'Ta', 'Noun', 'Ya'], answer: 2, explanation: 'ن (Noun) se prononce comme le N français.' },
                    { q: 'Quelle lettre a deux points en dessous ?', options: ['ب', 'ت', 'ن', 'ي'], answer: 3, explanation: 'ي (Ya) a deux points en dessous.' },
                ]
            } as QuizData,
        }],
    },

    // === FATIHA ===
    {
        id: 'fatiha',
        emoji: '📖',
        title: 'Sourate Al-Fatiha',
        titleAr: 'سورة الفاتحة',
        description: 'Apprendre et comprendre la sourate d\'ouverture du Coran',
        category: 'quran',
        difficulty: 1,
        estimatedMinutes: 20,
        content: [{
            type: 'lesson',
            title: 'Al-Fatiha — La Mère du Livre',
            data: {
                sections: [
                    { title: 'Introduction', body: 'Al-Fatiha est la première sourate du Coran. Elle est récitée dans chaque rak\'at de la prière. Le Prophète ﷺ l\'a appelée "Oumm al-Kitab" (la Mère du Livre).', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
                    { title: 'Verset 1', body: '"Au nom d\'Allah, le Tout Miséricordieux, le Très Miséricordieux" — On commence tout par le nom d\'Allah.', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
                    { title: 'Verset 2', body: '"Louange à Allah, Seigneur des mondes" — Toute louange appartient à Allah seul.', arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
                    { title: 'Verset 3', body: '"Le Tout Miséricordieux, le Très Miséricordieux" — Deux noms qui expriment la miséricorde infinie d\'Allah.', arabic: 'الرَّحْمَٰنِ الرَّحِيمِ' },
                    { title: 'Verset 4', body: '"Maître du Jour de la Rétribution" — Allah est le Juge suprême au Jour du Jugement.', arabic: 'مَالِكِ يَوْمِ الدِّينِ' },
                    { title: 'Versets 5-7', body: '"C\'est Toi que nous adorons et c\'est Toi dont nous implorons secours. Guide-nous dans le droit chemin, le chemin de ceux que Tu as comblés de bienfaits, non pas de ceux qui ont encouru Ta colère, ni des égarés."', arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ' },
                ]
            } as LessonData,
        }, {
            type: 'quiz',
            title: 'Quiz — Al-Fatiha',
            data: {
                questions: [
                    { q: 'Quel est le surnom d\'Al-Fatiha ?', options: ['Le cœur du Coran', 'La Mère du Livre', 'La protectrice', 'La lumière'], answer: 1, explanation: 'Al-Fatiha est surnommée "Oumm al-Kitab" (la Mère du Livre).' },
                    { q: 'Combien de versets contient Al-Fatiha ?', options: ['5', '6', '7', '8'], answer: 2, explanation: 'Al-Fatiha contient 7 versets.' },
                    { q: 'Quel verset dit "C\'est Toi que nous adorons" ?', options: ['Verset 2', 'Verset 4', 'Verset 5', 'Verset 7'], answer: 2, explanation: 'Le verset 5 : "Iyyaka na\'budu wa iyyaka nasta\'in".' },
                ]
            } as QuizData,
        }],
    },

    // === PILLARS ===
    {
        id: 'pillars',
        emoji: '🕌',
        title: 'Les 5 Piliers de l\'Islam',
        titleAr: 'أركان الإسلام',
        description: 'Comprendre les fondements de la pratique musulmane',
        category: 'aqidah',
        difficulty: 1,
        estimatedMinutes: 15,
        content: [{
            type: 'lesson',
            title: 'Les fondements',
            data: {
                sections: [
                    { title: 'Introduction', body: 'L\'Islam repose sur 5 piliers fondamentaux, comme l\'a enseigné le Prophète ﷺ dans le célèbre hadith rapporté par ibn Omar.' },
                    { title: '1. La Shahada (الشهادة)', body: 'L\'attestation de foi : "J\'atteste qu\'il n\'y a de divinité qu\'Allah et que Muhammad est Son messager." C\'est la porte d\'entrée dans l\'Islam.', arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا رَسُولُ اللَّهِ' },
                    { title: '2. La Salat (الصلاة)', body: 'Les 5 prières quotidiennes : Fajr (2), Dhuhr (4), Asr (4), Maghrib (3), Isha (4). C\'est le deuxième pilier et le plus important après la Shahada.' },
                    { title: '3. La Zakat (الزكاة)', body: 'L\'aumône obligatoire de 2,5% sur l\'épargne qui atteint le seuil (Nissab) pendant un an lunaire.' },
                    { title: '4. Le Sawm (الصيام)', body: 'Le jeûne du mois de Ramadan, de l\'aube au coucher du soleil.' },
                    { title: '5. Le Hajj (الحج)', body: 'Le pèlerinage à la Mecque, obligatoire une fois dans la vie pour celui qui en a la capacité physique et financière.' },
                ]
            } as LessonData,
        }, {
            type: 'quiz',
            title: 'Quiz — Les Piliers',
            data: {
                questions: [
                    { q: 'Quel est le premier pilier de l\'Islam ?', options: ['La Salat', 'La Shahada', 'Le Hajj', 'La Zakat'], answer: 1, explanation: 'La Shahada (attestation de foi) est le premier pilier.' },
                    { q: 'Combien de prières obligatoires par jour ?', options: ['3', '4', '5', '7'], answer: 2, explanation: 'Il y a 5 prières obligatoires par jour.' },
                    { q: 'Quel est le pourcentage de la Zakat ?', options: ['1%', '2,5%', '5%', '10%'], answer: 1, explanation: 'La Zakat est de 2,5% sur l\'épargne éligible.' },
                    { q: 'Pendant quel mois jeûne-t-on ?', options: ['Muharram', 'Rajab', 'Ramadan', 'Dhul Hijjah'], answer: 2, explanation: 'Le jeûne est obligatoire pendant le mois de Ramadan.' },
                ]
            } as QuizData,
        }],
    },

    // === READING BASICS ===
    {
        id: 'reading-basics',
        emoji: '📝',
        title: 'Bases de la Lecture',
        titleAr: 'أساسيات القراءة',
        description: 'Les voyelles (harakat), la shadda et le sukun',
        category: 'alphabet',
        difficulty: 2,
        estimatedMinutes: 25,
        content: [{
            type: 'lesson',
            title: 'Les voyelles courtes',
            data: {
                sections: [
                    { title: 'Fatha (الفتحة)', body: 'Un petit trait oblique au-dessus de la lettre. Se prononce "a". Exemple : بَ = Ba', arabic: 'بَ تَ نَ' },
                    { title: 'Kasra (الكسرة)', body: 'Un petit trait oblique en dessous de la lettre. Se prononce "i". Exemple : بِ = Bi', arabic: 'بِ تِ نِ' },
                    { title: 'Damma (الضمة)', body: 'Un petit و au-dessus de la lettre. Se prononce "ou". Exemple : بُ = Bou', arabic: 'بُ تُ نُ' },
                    { title: 'Sukun (السكون)', body: 'Un petit cercle au-dessus. La lettre n\'a pas de voyelle, elle est "muette". Exemple : بْ', arabic: 'بْ' },
                    { title: 'Shadda (الشدة)', body: 'Un W au-dessus de la lettre. Elle se prononce deux fois (doublée). Exemple : بّ = bb', arabic: 'رَبّ' },
                ]
            } as LessonData,
        }],
    },

    // === WUDU ===
    {
        id: 'wudu',
        emoji: '💧',
        title: 'Les Ablutions (Wudu)',
        titleAr: 'الوضوء',
        description: 'Apprendre les étapes des ablutions pas à pas',
        category: 'fiqh',
        difficulty: 1,
        estimatedMinutes: 15,
        content: [{
            type: 'lesson',
            title: 'Les étapes du Wudu',
            data: {
                sections: [
                    { title: 'L\'intention (Niyyah)', body: 'Avant de commencer, formuler l\'intention dans son cœur de faire les ablutions pour la prière.' },
                    { title: '1. Bismillah', body: 'Dire "Bismillah" (Au nom d\'Allah) pour commencer.', arabic: 'بِسْمِ اللَّهِ' },
                    { title: '2. Laver les mains', body: 'Se laver les mains 3 fois jusqu\'aux poignets.' },
                    { title: '3. Rincer la bouche et le nez', body: 'Prendre de l\'eau dans la main droite, rincer la bouche puis aspirer l\'eau par le nez et la rejeter. 3 fois chacun.' },
                    { title: '4. Laver le visage', body: 'Laver le visage 3 fois, du haut du front jusqu\'au menton et d\'une oreille à l\'autre.' },
                    { title: '5. Laver les avant-bras', body: 'Laver le bras droit puis le gauche, du bout des doigts jusqu\'au coude inclus. 3 fois chacun.' },
                    { title: '6. Essuyer la tête', body: 'Passer les mains mouillées sur la tête, d\'avant en arrière puis d\'arrière en avant. 1 fois.' },
                    { title: '7. Laver les pieds', body: 'Laver le pied droit puis le gauche, jusqu\'aux chevilles incluses, en passant les doigts entre les orteils. 3 fois chacun.' },
                    { title: 'Invocation après le Wudu', body: '"Ash-hadu an la ilaha illa Allah, wahdahu la sharika lah, wa ash-hadu anna Muhammadan abduhu wa rasuluh"', arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ' },
                ]
            } as LessonData,
        }],
    },

    // === SHORT SURAHS ===
    {
        id: 'short-surahs',
        emoji: '📜',
        title: 'Petites Sourates',
        titleAr: 'السور القصيرة',
        description: 'Mémoriser les sourates courtes essentielles pour la prière',
        category: 'quran',
        difficulty: 1,
        estimatedMinutes: 25,
        content: [{
            type: 'lesson',
            title: 'Sourates pour la prière',
            data: {
                sections: [
                    { title: 'Sourate Al-Ikhlas (112)', body: '"Dis : Il est Allah, Unique. Allah, le Seul à être imploré. Il n\'a jamais engendré, n\'a pas été engendré. Et nul n\'est égal à Lui." — Récitée, elle équivaut à un tiers du Coran.', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ' },
                    { title: 'Sourate Al-Falaq (113)', body: '"Dis : Je cherche protection auprès du Seigneur de l\'aube naissante, contre le mal de ce qu\'Il a créé..."', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ' },
                    { title: 'Sourate An-Nas (114)', body: '"Dis : Je cherche protection auprès du Seigneur des gens, le Souverain des gens, la Divinité des gens..."', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ' },
                    { title: 'Sourate Al-Kawthar (108)', body: '"Nous t\'avons certes accordé l\'Abondance. Accomplis la prière pour ton Seigneur et sacrifie. Celui qui te hait sera lui le privé."', arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ ۝ فَصَلِّ لِرَبِّكَ وَانْحَرْ ۝ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ' },
                ]
            } as LessonData,
        }],
    },

    // === SALAT BASICS ===
    {
        id: 'salat-basics',
        emoji: '🕌',
        title: 'Apprendre la Prière',
        titleAr: 'تعلم الصلاة',
        description: 'Les étapes de la prière islamique pas à pas',
        category: 'fiqh',
        difficulty: 2,
        estimatedMinutes: 30,
        content: [{
            type: 'lesson',
            title: 'Les étapes de la Salat',
            data: {
                sections: [
                    { title: 'Préparation', body: 'S\'assurer d\'avoir les ablutions, un endroit propre, et être habillé convenablement. Se tourner vers la Qibla (direction de la Mecque).' },
                    { title: '1. Takbir al-Ihram', body: 'Lever les mains au niveau des oreilles et dire "Allahu Akbar" pour commencer la prière.', arabic: 'اللَّهُ أَكْبَرُ' },
                    { title: '2. Qiyam (debout)', body: 'Poser la main droite sur la gauche sur la poitrine. Réciter Al-Fatiha obligatoirement, puis une autre sourate.', arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ' },
                    { title: '3. Ruku (inclinaison)', body: 'Dire "Allahu Akbar" et s\'incliner en posant les mains sur les genoux. Dire 3 fois "Subhana Rabbiyal Adhim".', arabic: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ' },
                    { title: '4. I\'tidal (relèvement)', body: 'Se relever en disant "Sami Allahu liman hamida, Rabbana wa lakal hamd".', arabic: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ' },
                    { title: '5. Sujud (prosternation)', body: 'Se prosterner front, nez, paumes, genoux et orteils au sol. Dire 3 fois "Subhana Rabbiyal A\'la".', arabic: 'سُبْحَانَ رَبِّيَ الْأَعْلَى' },
                    { title: '6. Juloos (assis)', body: 'S\'asseoir brièvement entre les deux prosternations, en disant "Rabbi ghfir li".', arabic: 'رَبِّ اغْفِرْ لِي' },
                    { title: '7. Tashahud et Salam', body: 'À la fin, réciter le Tashahud puis saluer à droite et à gauche en disant "Assalamu Alaykum wa Rahmatullah".', arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ' },
                ]
            } as LessonData,
        }],
    },

    // === TAJWEED INTRO ===
    {
        id: 'tajweed-intro',
        emoji: '🎵',
        title: 'Introduction au Tajweed',
        titleAr: 'مقدمة في التجويد',
        description: 'Les règles de base de la récitation du Coran',
        category: 'quran',
        difficulty: 2,
        estimatedMinutes: 25,
        content: [{
            type: 'lesson',
            title: 'Les bases du Tajweed',
            data: {
                sections: [
                    { title: 'Qu\'est-ce que le Tajweed ?', body: 'Le Tajweed signifie "amélioration" ou "embellissement". C\'est l\'art de réciter le Coran correctement en donnant à chaque lettre son droit et ses caractéristiques.' },
                    { title: 'Les points d\'articulation (Makharij)', body: 'Chaque lettre arabe a un point de sortie précis dans la bouche, la gorge ou les lèvres. Les maîtriser est essentiel pour une récitation correcte.' },
                    { title: 'Règle : Idgham (إدغام)', body: 'Fusion de deux lettres. Quand un Noun sakin ou un Tanwin est suivi de ي ر م ل و ن, on fusionne les deux sons.' },
                    { title: 'Règle : Ikhfa (إخفاء)', body: 'Dissimulation du Noon sakin. Le son est atténué devant 15 lettres spécifiques, ni prononcé clairement ni fusionné.' },
                    { title: 'Règle : Iqlab (إقلاب)', body: 'Le Noon sakin ou Tanwin se transforme en M devant la lettre ب (Ba).' },
                ]
            } as LessonData,
        }],
    },

    // === MEMORIZATION ===
    {
        id: 'memorization',
        emoji: '🧠',
        title: 'Techniques de Mémorisation',
        titleAr: 'حفظ القرآن',
        description: 'Méthodes éprouvées pour mémoriser le Coran',
        category: 'quran',
        difficulty: 2,
        estimatedMinutes: 20,
        content: [{
            type: 'lesson',
            title: 'Comment mémoriser efficacement',
            data: {
                sections: [
                    { title: 'Méthode 3×3×3', body: '1) Lire le verset 3 fois en regardant 2) Essayer de réciter 3 fois sans regarder 3) Répéter la combinaison 3 fois dans la journée (matin, après-midi, soir).' },
                    { title: 'L\'intention (Ikhlas)', body: 'Commencer par une intention sincère. Invoquer Allah pour qu\'Il facilite la mémorisation. La sincérité est la clé de la réussite.' },
                    { title: 'La régularité', body: 'Mieux vaut mémoriser un verset par jour avec régularité que 10 versets une fois par semaine. La constance est plus bénie.' },
                    { title: 'La révision', body: 'Le Prophète ﷺ a dit : "Révisez le Coran car il s\'échappe plus vite que les chameaux de leurs liens." Il faut réviser ce qu\'on a mémorisé au moins 1 fois par semaine.' },
                    { title: 'Écouter un récitateur', body: 'Écouter un récitateur reconnu (Husary, Minshawy, Afasy) plusieurs fois avant de mémoriser aide à ancrer la prononciation et la mélodie.' },
                ]
            } as LessonData,
        }],
    },

    // === FASTING ===
    {
        id: 'fasting',
        emoji: '🌙',
        title: 'Le Jeûne (Sawm)',
        titleAr: 'الصيام',
        description: 'Les règles du jeûne du Ramadan et du jeûne surérogatoire',
        category: 'fiqh',
        difficulty: 2,
        estimatedMinutes: 20,
        content: [{
            type: 'lesson',
            title: 'Les règles du jeûne',
            data: {
                sections: [
                    { title: 'Qu\'est-ce que le Sawm ?', body: 'Le jeûne (Sawm) consiste à s\'abstenir de manger, boire et avoir des rapports intimes du Fajr au Maghrib, avec l\'intention de jeûner pour Allah.' },
                    { title: 'Ce qui annule le jeûne', body: '1) Manger ou boire volontairement 2) Les rapports intimes 3) Le vomissement provoqué 4) Les menstrues/lochies.' },
                    { title: 'Ce qui N\'annule PAS', body: 'Manger/boire par oubli, se brosser les dents, avaler sa salive, les injections non nutritives, goûter sans avaler.' },
                    { title: 'Les jeûnes surérogatoires', body: 'Lundi et jeudi, les Jours Blancs (13-14-15 de chaque mois lunaire), 6 jours de Shawwal, Jour d\'Arafat, Achoura.' },
                ]
            } as LessonData,
        }],
    },

    // === SALAT ADVANCED ===
    {
        id: 'salat-advanced',
        emoji: '🕋',
        title: 'Prières Avancées',
        titleAr: 'الصلوات المتقدمة',
        description: 'Prière du voyageur, de l\'Aïd, funéraire et du vendredi',
        category: 'fiqh',
        difficulty: 3,
        estimatedMinutes: 25,
        content: [{
            type: 'lesson',
            title: 'Les prières spéciales',
            data: {
                sections: [
                    { title: 'Prière du voyageur', body: 'Raccourcir les prières de 4 rak\'at à 2 (Dhuhr, Asr, Isha). Possibilité de combiner : Dhuhr+Asr et Maghrib+Isha.' },
                    { title: 'Prière de l\'Aïd', body: '2 rak\'at avec Takbirat supplémentaires. 1ère rak\'at : 7 Takbirat. 2ème rak\'at : 5 Takbirat. Pas d\'Adhan.' },
                    { title: 'Prière du Vendredi', body: '2 rak\'at remplaçant le Dhuhr, précédées de 2 sermons. Recommandé : ghusl, bels habits, Sourate Al-Kahf.' },
                    { title: 'Prière funéraire (Janaza)', body: '4 Takbirat debout, sans ruku ni sujud. 1) Fatiha 2) Salat sur le Prophète 3) Dua pour le défunt 4) Salam.' },
                ]
            } as LessonData,
        }],
    },

    // === ZAKAT ===
    {
        id: 'zakat',
        emoji: '💰',
        title: 'La Zakat',
        titleAr: 'الزكاة',
        description: 'Calcul, bénéficiaires et règles de la Zakat',
        category: 'fiqh',
        difficulty: 3,
        estimatedMinutes: 20,
        content: [{
            type: 'lesson',
            title: 'Comprendre la Zakat',
            data: {
                sections: [
                    { title: 'Le Nissab', body: 'Seuil minimal pour devoir la Zakat : 85g d\'or ou 595g d\'argent, possédé pendant un an lunaire complet.' },
                    { title: 'Le taux', body: '2,5% sur l\'épargne (argent, or, actions, marchandises) moins les dettes.' },
                    { title: 'Les 8 bénéficiaires (Coran 9:60)', body: 'Pauvres, nécessiteux, collecteurs, ceux dont le cœur est à gagner, esclaves, endettés, pour la cause d\'Allah, voyageurs.', arabic: 'إِنَّمَا الصَّدَقَاتُ لِلْفُقَرَاءِ وَالْمَسَاكِينِ' },
                    { title: 'Zakat al-Fitr', body: 'Obligatoire à la fin du Ramadan. Environ 7€ par personne (un Saa\' = ~2,5 kg de nourriture). À payer avant la prière de l\'Aïd.' },
                ]
            } as LessonData,
        }],
    },

    // === HAJJ BASICS ===
    {
        id: 'hajj-basics',
        emoji: '🕋',
        title: 'Le Pèlerinage (Hajj)',
        titleAr: 'الحج',
        description: 'Les piliers, obligations et rites du Hajj',
        category: 'fiqh',
        difficulty: 3,
        estimatedMinutes: 25,
        content: [{
            type: 'lesson',
            title: 'Les rites du Hajj',
            data: {
                sections: [
                    { title: 'Les 4 Piliers du Hajj', body: '1) Ihram au Miqat 2) Stationnement à Arafat (9 Dhul Hijjah) 3) Tawaf al-Ifada 4) Sa\'y entre Safa et Marwa.' },
                    { title: 'Ihram (الإحرام)', body: 'Vêtements blancs non cousus pour les hommes. Intention au Miqat. Interdictions : parfum, coupe de cheveux/ongles, rapports.' },
                    { title: 'Arafat', body: 'Le jour d\'Arafat est le pilier principal. "Le Hajj c\'est Arafat." On y fait des invocations du Dhuhr au Maghrib.' },
                    { title: 'Tawaf et Sa\'y', body: 'Tawaf : 7 tours autour de la Ka\'ba en sens inverse des aiguilles. Sa\'y : 7 trajets entre Safa et Marwa.' },
                ]
            } as LessonData,
        }],
    },
];

// ─── Category Info ───────────────────────────────────────

const CATEGORIES = [
    { id: 'alphabet', label: 'Alphabet & Lecture', emoji: '🔤', color: '#FF9800' },
    { id: 'quran', label: 'Coran', emoji: '📖', color: '#4CAF50' },
    { id: 'fiqh', label: 'Fiqh (Pratique)', emoji: '⚖️', color: '#2196F3' },
    { id: 'aqidah', label: 'Aqidah (Croyance)', emoji: '☪️', color: '#9C27B0' },
];

const DIFFICULTY_LABELS = ['', '⭐ Débutant', '⭐⭐ Intermédiaire', '⭐⭐⭐ Avancé'];

// ─── Component ───────────────────────────────────────────

export function AcademyPage() {
    const navigate = useNavigate();
    const store = useAcademyStore();
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [lessonStep, setLessonStep] = useState(0);
    const [quizIndex, setQuizIndex] = useState(0);
    const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizTotal, setQuizTotal] = useState(0);
    const [showResult, setShowResult] = useState(false);

    const currentModule = useMemo(() =>
        ACADEMY_MODULES.find(m => m.id === activeModule),
        [activeModule]
    );

    const handleStartModule = useCallback((moduleId: string) => {
        if (!store.unlockedModules.includes(moduleId)) return;
        setActiveModule(moduleId);
        setLessonStep(0);
        setQuizIndex(0);
        setQuizAnswer(null);
        setQuizScore(0);
        setQuizTotal(0);
        setShowResult(false);
    }, [store.unlockedModules]);

    const handleCompleteModule = useCallback(() => {
        if (activeModule) {
            const finalScore = quizTotal > 0 ? Math.round((quizScore / quizTotal) * 100) : 100;
            store.completeModule(activeModule, finalScore);
        }
        setActiveModule(null);
    }, [activeModule, quizScore, quizTotal, store]);

    const handleQuizAnswer = useCallback((answerIdx: number) => {
        if (quizAnswer !== null) return;
        setQuizAnswer(answerIdx);
        setQuizTotal(prev => prev + 1);

        const content = currentModule?.content.find(c => c.type === 'quiz');
        if (content && content.type === 'quiz') {
            const quiz = content.data as QuizData;
            if (answerIdx === quiz.questions[quizIndex].answer) {
                setQuizScore(prev => prev + 1);
            }
        }
    }, [quizAnswer, quizIndex, currentModule]);

    const handleNextQuizQuestion = useCallback(() => {
        const content = currentModule?.content.find(c => c.type === 'quiz');
        if (content && content.type === 'quiz') {
            const quiz = content.data as QuizData;
            if (quizIndex + 1 < quiz.questions.length) {
                setQuizIndex(prev => prev + 1);
                setQuizAnswer(null);
            } else {
                setShowResult(true);
            }
        }
    }, [quizIndex, currentModule]);

    // ─── Active Module View ──────────────────────────────

    if (activeModule && currentModule) {
        const lessonContent = currentModule.content.find(c => c.type === 'lesson');
        const quizContent = currentModule.content.find(c => c.type === 'quiz');
        const lesson = lessonContent?.data as LessonData | undefined;
        const quiz = quizContent?.data as QuizData | undefined;

        const isInQuiz = lesson ? lessonStep >= lesson.sections.length : true;
        const isComplete = showResult;

        return (
            <div className="academy-page">
                {/* Module Header */}
                <div className="academy-module-header">
                    <button className="academy-back" onClick={() => setActiveModule(null)}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="academy-module-info">
                        <span className="academy-module-emoji">{currentModule.emoji}</span>
                        <span className="academy-module-name">{currentModule.title}</span>
                    </div>
                    <div className="academy-module-progress-bar">
                        <div
                            className="academy-module-progress-fill"
                            style={{
                                width: isComplete ? '100%' : lesson
                                    ? `${(lessonStep / (lesson.sections.length + (quiz?.questions.length || 0))) * 100}%`
                                    : '0%'
                            }}
                        />
                    </div>
                </div>

                {/* Lesson View */}
                {!isInQuiz && lesson && (
                    <div className="academy-lesson">
                        <div className="academy-lesson-card">
                            <h3>{lesson.sections[lessonStep].title}</h3>
                            {lesson.sections[lessonStep].arabic && (
                                <div className="academy-lesson-arabic">
                                    {lesson.sections[lessonStep].arabic}
                                </div>
                            )}
                            <p>{lesson.sections[lessonStep].body}</p>
                        </div>

                        <div className="academy-lesson-nav">
                            {lessonStep > 0 && (
                                <button className="academy-btn academy-btn--secondary" onClick={() => setLessonStep(s => s - 1)}>
                                    ← Précédent
                                </button>
                            )}
                            <button
                                className="academy-btn academy-btn--primary"
                                onClick={() => {
                                    if (lessonStep + 1 < lesson.sections.length) {
                                        setLessonStep(s => s + 1);
                                    } else if (quiz) {
                                        setLessonStep(lesson.sections.length); // Go to quiz
                                    } else {
                                        handleCompleteModule();
                                    }
                                }}
                            >
                                {lessonStep + 1 < lesson.sections.length ? 'Suivant →' : quiz ? 'Passer au Quiz 📝' : 'Terminer ✅'}
                            </button>
                        </div>

                        <div className="academy-lesson-counter">
                            {lessonStep + 1} / {lesson.sections.length}
                        </div>
                    </div>
                )}

                {/* Quiz View */}
                {isInQuiz && quiz && !isComplete && (
                    <div className="academy-quiz">
                        <div className="academy-quiz-header">
                            <BookOpen size={18} />
                            <span>Question {quizIndex + 1} / {quiz.questions.length}</span>
                        </div>

                        <div className="academy-quiz-question">
                            {quiz.questions[quizIndex].q}
                        </div>

                        <div className="academy-quiz-options">
                            {quiz.questions[quizIndex].options.map((opt, i) => {
                                const isSelected = quizAnswer === i;
                                const isCorrect = i === quiz.questions[quizIndex].answer;
                                const showFeedback = quizAnswer !== null;

                                return (
                                    <button
                                        key={i}
                                        className={`academy-quiz-option ${showFeedback ? (isCorrect ? 'correct' : isSelected ? 'wrong' : '') : ''} ${isSelected ? 'selected' : ''}`}
                                        onClick={() => handleQuizAnswer(i)}
                                        disabled={quizAnswer !== null}
                                    >
                                        <span className="academy-quiz-option-letter">{String.fromCharCode(65 + i)}</span>
                                        <span>{opt}</span>
                                        {showFeedback && isCorrect && <CheckCircle size={16} />}
                                    </button>
                                );
                            })}
                        </div>

                        {quizAnswer !== null && (
                            <div className={`academy-quiz-explanation ${quizAnswer === quiz.questions[quizIndex].answer ? 'correct' : 'wrong'}`}>
                                <p>{quiz.questions[quizIndex].explanation}</p>
                                <button className="academy-btn academy-btn--primary" onClick={handleNextQuizQuestion}>
                                    {quizIndex + 1 < quiz.questions.length ? 'Question suivante →' : 'Voir les résultats'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results View */}
                {isComplete && (
                    <div className="academy-results">
                        <div className="academy-results-icon">
                            {quizScore >= quizTotal * 0.8 ? '🏆' : quizScore >= quizTotal * 0.5 ? '👍' : '📚'}
                        </div>
                        <h3>
                            {quizScore >= quizTotal * 0.8 ? 'Excellent !' : quizScore >= quizTotal * 0.5 ? 'Bien joué !' : 'Continuez à apprendre !'}
                        </h3>
                        <div className="academy-results-score">
                            {quizScore} / {quizTotal} correct{quizScore > 1 ? 's' : ''}
                        </div>
                        <div className="academy-results-xp">
                            + {Math.round((quizScore / quizTotal) * 50)} XP
                        </div>
                        <div className="academy-results-actions">
                            <button className="academy-btn academy-btn--secondary" onClick={() => handleStartModule(activeModule!)}>
                                <RotateCcw size={16} /> Refaire
                            </button>
                            <button className="academy-btn academy-btn--primary" onClick={handleCompleteModule}>
                                <CheckCircle size={16} /> Terminer
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ─── Roadmap View (default) ──────────────────────────

    const groupedModules = CATEGORIES.map(cat => ({
        ...cat,
        modules: ACADEMY_MODULES.filter(m => m.category === cat.id),
    }));

    const completedCount = Object.values(store.progress).filter(p => p.completed).length;

    return (
        <div className="academy-page">
            {/* Header */}
            <div className="academy-header">
                <button className="academy-back" onClick={() => navigate(-1)}>
                    <ChevronLeft size={20} />
                </button>
                <div className="academy-header-content">
                    <h1>📚 Académie</h1>
                    <p>Votre parcours d'apprentissage guidé</p>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="academy-stats">
                <div className="academy-stat">
                    <Trophy size={16} />
                    <span>{store.totalXp} XP</span>
                </div>
                <div className="academy-stat">
                    <CheckCircle size={16} />
                    <span>{completedCount}/{ACADEMY_MODULES.length} modules</span>
                </div>
                <div className="academy-stat">
                    <Star size={16} />
                    <span>{store.level === 'enfant' ? 'Enfant' : store.level === 'debutant' ? 'Débutant' : 'Intermédiaire'}</span>
                </div>
            </div>

            {/* Level Selector */}
            <div className="academy-levels">
                {(['enfant', 'debutant', 'intermediaire'] as AcademyLevel[]).map(lvl => (
                    <button
                        key={lvl}
                        className={`academy-level ${store.level === lvl ? 'active' : ''}`}
                        onClick={() => store.setLevel(lvl)}
                    >
                        {lvl === 'enfant' ? '🧒 Enfant' : lvl === 'debutant' ? '📗 Débutant' : '📘 Intermédiaire'}
                    </button>
                ))}
            </div>

            {/* Module Groups */}
            <div className="academy-roadmap">
                {groupedModules.map(group => (
                    <div key={group.id} className="academy-group">
                        <div className="academy-group-title" style={{ color: group.color }}>
                            <span>{group.emoji}</span>
                            <span>{group.label}</span>
                        </div>

                        <div className="academy-modules">
                            {group.modules.map(mod => {
                                const isUnlocked = store.unlockedModules.includes(mod.id);
                                const progress = store.progress[mod.id];
                                const isCompleted = progress?.completed;

                                return (
                                    <button
                                        key={mod.id}
                                        className={`academy-module-card ${isCompleted ? 'completed' : ''} ${!isUnlocked ? 'locked' : ''}`}
                                        onClick={() => handleStartModule(mod.id)}
                                        disabled={!isUnlocked}
                                    >
                                        <div className="academy-module-card-left">
                                            <span className="academy-module-card-emoji">{mod.emoji}</span>
                                            <div className="academy-module-card-info">
                                                <div className="academy-module-card-title">{mod.title}</div>
                                                <div className="academy-module-card-desc">{mod.description}</div>
                                                <div className="academy-module-card-meta">
                                                    <span>{DIFFICULTY_LABELS[mod.difficulty]}</span>
                                                    <span>~{mod.estimatedMinutes} min</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="academy-module-card-status">
                                            {isCompleted ? (
                                                <div className="academy-module-done">
                                                    <CheckCircle size={20} />
                                                    <span>{progress.score}%</span>
                                                </div>
                                            ) : !isUnlocked ? (
                                                <Lock size={18} />
                                            ) : (
                                                <Sparkles size={18} />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

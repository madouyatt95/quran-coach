// Histoires et Moralités du Coran (hors prophètes, déjà dans prophets.ts)

export type StoryCategory =
  | 'peuples'
  | 'personnages'
  | 'paraboles'
  | 'evenements'
  | 'divers';

export interface StorySurah {
  number: number;
  name: string;
}

export interface Story {
  id: string;
  title: string;
  titleAr: string;
  icon: string;
  category: StoryCategory;
  summary: string;
  morals: string[];
  surahs: StorySurah[];
  color: string;
}

export const STORY_CATEGORIES: Record<StoryCategory, { label: string; labelAr: string; icon: string; color: string }> = {
  peuples: { label: 'Peuples détruits', labelAr: 'الأُمَم الهالِكَة', icon: '🏚️', color: '#E74C3C' },
  personnages: { label: 'Personnages remarquables', labelAr: 'شَخصِيَّات بارِزَة', icon: '👤', color: '#9C27B0' },
  paraboles: { label: 'Paraboles & Allégories', labelAr: 'أَمثَال وعِبَر', icon: '🔮', color: '#2196F3' },
  evenements: { label: 'Événements historiques', labelAr: 'أَحدَاث تَارِيخِيَّة', icon: '⚔️', color: '#FF9800' },
  divers: { label: 'Récits divers', labelAr: 'قِصَص مُتَنَوِّعَة', icon: '📜', color: '#4CAF50' },
};

export const stories: Story[] = [
  // ========== PEUPLES DÉTRUITS ==========
  {
    id: 'aad',
    title: 'Le peuple de \'Aad',
    titleAr: 'قَوْمُ عَاد',
    icon: '🌪️',
    category: 'peuples',
    summary: 'Le peuple de \'Aad était une civilisation ancienne et exceptionnellement puissante du Yémen, dotée par Allah d\'une force physique rare et d\'une prospérité éclatante. Ils bâtirent des monuments gigantesques (Iram) dont les pareils n\'avaient jamais été créés sur terre. Grisés par leur suprématie, ils sombrèrent dans l\'idolâtrie et l\'oppression. Le Prophète Houd (psl) tenta sans relâche de les ramener au monothéisme, mais rencontra moqueries et hostilité. En châtiment de leur arrogance obstinée, Allah leur envoya un vent glacial d\'une furie destructrice inouïe. Soufflant violemment pendant sept nuits et huit jours ininterrompus, il anéantit leur civilisation, ne laissant derrière lui que des corps semblables à des souches de palmiers évidées.',
    morals: [
      'La puissance physique et matérielle ne protège pas de la punition divine',
      'L\'arrogance mène à la ruine',
      'Les civilisations les plus avancées ne sont pas à l\'abri de la destruction',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf' },
      { number: 11, name: 'Hud' },
      { number: 26, name: 'Ash-Shu\'ara' },
      { number: 41, name: 'Fussilat' },
      { number: 46, name: 'Al-Ahqaf' },
      { number: 54, name: 'Al-Qamar' },
      { number: 69, name: 'Al-Haaqqa' },
      { number: 89, name: 'Al-Fajr' },
    ],
    color: '#E74C3C',
  },
  {
    id: 'thamoud',
    title: 'Le peuple de Thamoud',
    titleAr: 'قَوْمُ ثَمُود',
    icon: '🏔️',
    category: 'peuples',
    summary: 'Successeurs spirituels des \'Aad, les Thamoud, établis à Al-Hijr, excellaient dans une ingénierie spectaculaire : ils taillaient d\'imposantes et robustes demeures directement dans les flancs des montagnes de roche blanche pour se croire immortels. Le Prophète Salih (psl) leur fut envoyé. Pour éprouver leur foi à leur propre demande, Allah fit miraculeusement surgir d\'un rocher une chamelle monumentale, avec l\'ordre formel de la laisser paître paisiblement. Mais orgueil et rébellion prirent le dessus. Neuf individus corrompus, avec l\'assentiment de la population, égorgèrent cruellement le miracle vivant. En réponse à cette suprême impudence, un cataclysme foudroyant (un cri dévastateur venu du ciel) les terrassa tous à l\'aube dans leurs luxueux palais rupestres.'Allah, signe qui leur avait été donné, et furent détruits par un cri terrifiant (as-sayha).',
    morals: [
      'Détruire les signes d\'Allah entraîne la destruction',
      'L\'art et la civilisation sans foi n\'ont aucune valeur',
      'Le défi envers les miracles divins est fatal',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf' },
      { number: 11, name: 'Hud' },
      { number: 26, name: 'Ash-Shu\'ara' },
      { number: 27, name: 'An-Naml' },
      { number: 54, name: 'Al-Qamar' },
      { number: 91, name: 'Ash-Shams' },
    ],
    color: '#8D6E63',
  },
  {
    id: 'pharaon',
    title: 'Pharaon et les Égyptiens',
    titleAr: 'فِرْعَوْنُ وَقَوْمُهُ',
    icon: '👑',
    category: 'peuples',
    summary: 'Pharaon (Fir\'awn) d\'Égypte incarne la quintessence du tyran politique et de l\'aveuglement de l\'ego dans le Coran. Dominant son puissant empire et asservissant les Enfants d\'Israël (Bani Isra\'il) jusqu\'à massacrer leurs nouveau-nés mâles, il franchit l\'insurpassable ligne de l\'infamie en se proclamant publiquement "Seigneur le Très-Haut". Face aux prodiges de Moïse (Musa) — le bâton changé en serpent et les neuf fléaux — et malgré la défaite publique et la conversion de ses propres maîtres magiciens, il demeura sourd et vindicatif. Pourchassant Moïse et son peuple en fuite à travers la mer miraculeusement ouverte par Allah, il y trouva une mort misérable par noyade avec l\'intégralité de son immense armée. Son repentir de la dernière seconde, formulé dans les flots mortels, fut rejeté à jamais.'la"), persécuta les Bani Isra\'il et s\'opposa au Prophète Musa. Il fut noyé dans la mer Rouge et son corps fut préservé comme signe pour les générations futures.',
    morals: [
      'Le tyran qui se prend pour Dieu sera humilié',
      'Le repentir au moment de la mort n\'est pas accepté',
      'Le corps de Pharaon préservé est un signe pour les générations futures',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
      { number: 7, name: 'Al-A\'raf' },
      { number: 10, name: 'Yunus' },
      { number: 20, name: 'Ta-Ha' },
      { number: 26, name: 'Ash-Shu\'ara' },
      { number: 28, name: 'Al-Qasas' },
      { number: 40, name: 'Ghafir' },
      { number: 79, name: 'An-Nazi\'at' },
    ],
    color: '#FF5722',
  },
  {
    id: 'qarun',
    title: 'Qarun (Coré)',
    titleAr: 'قَارُون',
    icon: '💰',
    category: 'peuples',
    summary: 'Membre des Enfants d\'Israël (contemporain de Moïse), Qarun (Coré) fut gratifié par Allah de trésors d\'une abondance si colossale et de coffres si inestimables qu\'une force d\'hommes remarquablement robustes en ployait sous le simple poids des clefs. Mais l\'ivresse de la richesse pervertit son âme. Se paradant avec faste devant une foule souvent envieuse, il refusa l\'injonction de charité en proclamant avec haughteur qu\'il ne devait sa fortune qu\'à sa propre science et son intelligence personnelle, reniant la Grâce d\'Allah. L\'avertissement divin fut retentissant : le sol s\'ouvrit subitement, l\'engloutissant vif avec tout son palais, son or, et son insolence, démontrant brutalement la fragilité des biens matériels.'un groupe d\'hommes forts peinait à les porter. Il se vantait de sa richesse et refusait de partager. Il fut englouti par la terre avec sa maison.',
    morals: [
      'La richesse est un don d\'Allah, pas un mérite personnel',
      'L\'arrogance due à la richesse mène à la perte',
      'La terre peut engloutir ceux qui abusent de leurs biens',
    ],
    surahs: [
      { number: 28, name: 'Al-Qasas' },
      { number: 29, name: 'Al-Ankabut' },
      { number: 40, name: 'Ghafir' },
    ],
    color: '#FFC107',
  },
  {
    id: 'madyan',
    title: 'Les gens de Madyan',
    titleAr: 'أَصْحَابُ مَدْيَن',
    icon: '⚖️',
    category: 'peuples',
    summary: 'Le peuple commerçant de Madyan, situé au carrefour d\'importantes routes marchandes, avait institutionnalisé la fraude et le brigandage économique : ils abusaient des poids, trompaient sur les mesures, ruinaient l\'économie de leurs partenaires et semaient le désordre sur les axes de transit. Le Prophète Shu\'ayb, surnommé l\'orateur des prophètes par sa grande éloquence, tenta de les raisonner, leur enjoignant de pratiquer le commerce équitable et de se contenter des gains licites bénis. Moqué et menacé d\'expulsion par ses compatriotes cupides, le peuple entier fut surpris et foudroyé par "le Jour de l\'Ombre" : croyant trouver refuge contre une chaleur accablante sous un large nuage noir, ils y trouvèrent en réalité une pluie de braises suivie d\'un séisme mortel qui les laissa gisants dans leurs demeures.'ayb les avertit mais ils refusèrent de s\'amender. Ils furent détruits par un tremblement de terre.',
    morals: [
      'L\'honnêteté dans le commerce est un pilier de la société',
      'La fraude économique est un péché majeur',
      'La justice dans les transactions est un devoir religieux',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf' },
      { number: 11, name: 'Hud' },
      { number: 26, name: 'Ash-Shu\'ara' },
      { number: 29, name: 'Al-Ankabut' },
    ],
    color: '#795548',
  },
  {
    id: 'ashab-al-fil',
    title: 'Les gens de l\'Éléphant',
    titleAr: 'أَصْحَابُ الْفِيل',
    icon: '🐘',
    category: 'peuples',
    summary: 'En l\'An 570, l\'année même de la naissance du Prophète Muhammad (psl), Abraha, l\'ambitieux vice-roi abyssin du Yémen furieux de voir le Pèlerinage arabe se diriger immanquablement vers la modeste Ka\'ba de La Mecque au détriment de sa cathédrale fastueuse, lança une expédition militaire faramineuse vers la ville sainte. Son armée d\'invasion inédite, appuyée par des chars et de puissants éléphants de guerre censés semer la terrifiante panique, apparut invincible. Contre toute attente humaine, La Mecque sans défense militaire n\'eut besoin d\'aucune armée : Allah expédia en essaims de minuscules oiseaux (les Ababil), portant dans leurs becs et griffes des pierres d\'argile durcie ardente. Cette frappe aérienne miraculeuse et implacable anéantit les phalanges lourdement armées, les réduisant à l\'état de "paille mâchée".'éléphants marchèrent contre la Ka\'ba pour la détruire. Allah envoya des oiseaux (Ababil) qui lancèrent des pierres d\'argile brûlante, anéantissant l\'armée entière.',
    morals: [
      'Allah protège Sa Maison sacrée',
      'La supériorité militaire ne vaut rien face à la volonté d\'Allah',
      'Les signes d\'Allah se manifestent dans les événements historiques',
    ],
    surahs: [
      { number: 105, name: 'Al-Fil' },
    ],
    color: '#607D8B',
  },
  {
    id: 'ashab-al-ukhdud',
    title: 'Les gens du Fossé',
    titleAr: 'أَصْحَابُ الْأُخْدُود',
    icon: '🔥',
    category: 'peuples',
    summary: 'Victimes d\'une terrible inquisition religieuse en des temps anciens (souvent associés à Najran), les "Gens du Fossé" furent une communauté croyante monothéiste inébranlable vivant sous le joug d\'un perfide et féroce roi païen qui se prenait pour un dieu. Refusant l\'ordre absolu de renier Allah suite à l\'exemplaire foi d\'un jeune garçon prodige de la région, la communauté entière fut condamnée par d\'effroyables représailles. Le tyran fit creuser de profondes tranchées remplies d\'immenses brasiers incandescents où les croyants, gardant le nom d\'Allah sur leurs lèvres, furent suppliciés et précipités vivants avec un terrifiant cynisme. Le Coran exalte la splendeur de leur foi intègre pour laquelle ils témoignèrent et promet un terrible châtiment brûlant pour les meurtriers réjouis.'abandonner Allah.',
    morals: [
      'Les croyants martyrs sont victorieux même dans la mort',
      'La foi est plus précieuse que la vie',
      'Les tyrans qui persécutent les croyants seront châtiés',
    ],
    surahs: [
      { number: 85, name: 'Al-Buruj' },
    ],
    color: '#D32F2F',
  },
  {
    id: 'ashab-as-sabt',
    title: 'Les compagnons du Sabbat',
    titleAr: 'أَصْحَابُ السَّبْت',
    icon: '🐟',
    category: 'peuples',
    summary: 'Vivant au bord de la mer, cette communauté israélite fut durement testée par son obéissance à la solennelle obligation chômée rituelle du samedi (le Sabbat). Comme épreuve divine, une extraordinaire abondance de poissons argentés bondissants se manifestait à la surface des flots uniquement le magnifique jour du Sabbat, fuyant complètement la zone les autres jours tolérés de la semaine. Dévorés par leur avidité marchande et refusant la patience du test spirituel, ils imaginèrent de très mesquines astuces juridiques insidieuses avec effronterie : bloquer la miraculeuse pêche dans des enclos fermés le samedi béni pour la ramasser opportunément le dimanche profané. A l\'encontre de cette malheureuse et grave manipulation de Ses décrets stricts sacrés, Allah châtia terriblement les transgresseurs en les avilissant d\'une tragique et fulgurante transformation divine corporelle en singes.',
    morals: [
      'Ruser avec les interdits d\'Allah revient à les violer',
      'La lettre de la loi ne prime pas sur l\'esprit',
      'Les stratagèmes pour contourner les commandements divins sont vains',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
      { number: 7, name: 'Al-A\'raf' },
    ],
    color: '#00BCD4',
  },

  // ========== PERSONNAGES REMARQUABLES ==========
  {
    id: 'maryam',
    title: 'Maryam (Marie)',
    titleAr: 'مَرْيَمُ عَلَيْهَا السَّلَام',
    icon: '🌸',
    category: 'personnages',
    summary: 'Maryam (Marie) est la seule femme dont le nom éclaire glorieusement les sourates du Coran, désignée modèle insigne de pureté universelle. Vouée exclusivement au temple adorateur de Jérusalem par le serment mystique de sa mère très pieuse de la grande famille de Imran, elle étonna son protecteur, le prophète Zacharie, en prodiguant de mystérieuses et douces nourritures du Paradis dans son modeste sanctuaire solitaire. Retirée à l\'est, elle rencontra et conversera avec l\'Archange Jibril (Gabriel) avec chasteté, lui annonçant l\'incompréhensible miracle exceptionnel divin imminent et inédit d\'être enceinte, sans mariage mâle préalable, d\'un Esprit du Seigneur (\'Isa/Jésus). C\'est dans une absolue solitude douloureuse, adossée affligée au tronc rugueux d\'un aride petit dattier isolé qu\'elle affronta le dur enfantement par la seule force sublime de la fraîcheur d\'une source miraculeusement et doucement apparue, avant le magnifique triomphe social stupéfiant du grand miracle du berceau divin oral et purificateur de son bel enfant.'ange Jibril lui annonça la naissance miraculeuse de \'Isa (sans père). Elle accoucha seule sous un palmier et le nouveau-né parla au berceau pour défendre son honneur.',
    morals: [
      'La piété féminine est exemplaire dans le Coran',
      'La confiance en Allah dans la solitude et l\'épreuve',
      'La chasteté et la dévotion sont récompensées',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran' },
      { number: 19, name: 'Maryam' },
    ],
    color: '#E91E63',
  },
  {
    id: 'luqman',
    title: 'Luqman le Sage',
    titleAr: 'لُقْمَانُ الْحَكِيم',
    icon: '🧓',
    category: 'personnages',
    summary: 'Bien qu\'il ne fût qu\'un humble homme, probablement modeste charpentier ou petit berger originaire de Nubie par sa lignée, Allah accorda immensément au sage et noble Luqman une vertu rarissime du cœur : Al-Hikma (la Sagesse clairvoyante lumineuse). Le Coran grave éternellement dans l\'humanité la magistrale série d\'enseignements de tendre préceptorat adressée profondément par le père avisé à un fils à l\'orée cruciale de vie : un absolu rejet premier foudroyant radical de toutes les stupides idolâtries pernicieuses (le plus grave forfait d\'injustice des cœurs), allié magnifiquement avec la bonté parentale sincère primordiale. Il insista majestueusement doucement ensuite pragmatiquement avec une humble fermeté vertueuse sur toute patience requise, la courtoise démarche paisible des pas, le juste milieu et l\'éviction expresse sublime des affreux travers de jactance criarde et sociale ou la fière hauteur outrecuidante.',
    morals: [
      'La sagesse est un don d\'Allah',
      'L\'éducation des enfants est un devoir sacré',
      'L\'humilité est la marque du sage',
    ],
    surahs: [
      { number: 31, name: 'Luqman' },
    ],
    color: '#9C27B0',
  },
  {
    id: 'dhul-qarnayn',
    title: 'Dhul-Qarnayn',
    titleAr: 'ذُو الْقَرْنَيْن',
    icon: '🛡️',
    category: 'personnages',
    summary: 'Roi puissant et juste qui voyagea vers l\'Est et l\'Ouest de la terre. Il construisit un mur de fer et de cuivre pour protéger un peuple opprimé contre Ya\'juj et Ma\'juj (Gog et Magog).',
    morals: [
      'Le pouvoir doit être utilisé pour protéger les opprimés',
      'La justice est la base du leadership',
      'Même le plus grand pouvoir humain est temporaire',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#3F51B5',
  },
  {
    id: 'khidr',
    title: 'Al-Khidr et Musa',
    titleAr: 'الْخَضِرُ وَمُوسَى',
    icon: '🌿',
    category: 'personnages',
    summary: 'Musa voyage avec Al-Khidr pour apprendre. Al-Khidr perce un bateau, tue un enfant et reconstruit un mur. Chaque acte apparemment injuste cachait une sagesse divine profonde que Musa ne pouvait comprendre.',
    morals: [
      'La sagesse humaine est limitée',
      'Ce qui semble mauvais peut être un bien caché',
      'Il ne faut pas juger sur les apparences',
      'Allah voit ce que nous ne voyons pas',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#4CAF50',
  },
  {
    id: 'ashab-al-kahf',
    title: 'Les gens de la Caverne',
    titleAr: 'أَصْحَابُ الْكَهْف',
    icon: '🕳️',
    category: 'personnages',
    summary: 'Des jeunes croyants fuirent la persécution d\'un roi idolâtre et se réfugièrent dans une grotte. Allah les endormit pendant 309 ans. Leur chien gardait l\'entrée. Ils se réveillèrent dans une société devenue croyante.',
    morals: [
      'La fuite pour préserver sa foi est légitime (Hijra)',
      'Allah protège ceux qui Le choisissent',
      'Le temps est relatif et entre les mains d\'Allah',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#00897B',
  },
  {
    id: 'habil-qabil',
    title: 'Les deux fils d\'Adam',
    titleAr: 'هَابِيلُ وَقَابِيل',
    icon: '⚔️',
    category: 'personnages',
    summary: 'Les deux fils d\'Adam offrirent chacun un sacrifice. Celui de Habil fut accepté. Par jalousie, Qabil tua son frère — le premier meurtre de l\'humanité. Un corbeau lui montra comment enterrer le corps.',
    morals: [
      'La jalousie est destructrice',
      'Tuer un innocent équivaut à tuer l\'humanité entière (5:32)',
      'Le regret après le mal ne suffit pas à l\'effacer',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida' },
    ],
    color: '#F44336',
  },
  {
    id: 'bilqis',
    title: 'La Reine de Saba (Bilqis)',
    titleAr: 'بِلْقِيسُ مَلِكَةُ سَبَأ',
    icon: '👸',
    category: 'personnages',
    summary: 'La huppe informa Sulayman d\'une reine qui gouvernait un peuple adorant le soleil. Après un échange diplomatique, elle visita Sulayman, fut émerveillée par le palais de cristal et embrassa l\'Islam.',
    morals: [
      'Une femme peut être une dirigeante sage et juste',
      'L\'intelligence et le dialogue mènent à la vérité',
      'Le dialogue vaut mieux que la guerre',
    ],
    surahs: [
      { number: 27, name: 'An-Naml' },
      { number: 34, name: 'Saba' },
    ],
    color: '#AB47BC',
  },
  {
    id: 'croyant-pharaon',
    title: 'Le croyant de la famille de Pharaon',
    titleAr: 'مُؤْمِنُ آلِ فِرْعَوْن',
    icon: '🤫',
    category: 'personnages',
    summary: 'Un homme de la famille de Pharaon qui cachait sa foi défendit Musa avec des arguments logiques et courageux, s\'opposant au pouvoir en place pour la vérité.',
    morals: [
      'Le courage de défendre la vérité même en milieu hostile',
      'La foi peut exister dans les endroits les plus inattendus',
      'Un seul homme courageux peut faire la différence',
    ],
    surahs: [
      { number: 40, name: 'Ghafir' },
    ],
    color: '#5C6BC0',
  },
  {
    id: 'uzayr',
    title: 'Uzayr et la ville détruite',
    titleAr: 'عُزَيْرٌ وَالْقَرْيَة',
    icon: '🏚️',
    category: 'personnages',
    summary: 'Uzayr passa devant une ville en ruines et douta de la résurrection. Allah le fit mourir pendant 100 ans puis le ressuscita. Son âne et sa nourriture servirent de preuves de la puissance divine.',
    morals: [
      'La résurrection est une réalité prouvée par des signes',
      'Le doute sincère reçoit une réponse d\'Allah',
      'Allah montre Ses signes à ceux qui cherchent',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#78909C',
  },

  // ========== PARABOLES & ALLÉGORIES ==========
  {
    id: 'deux-jardins',
    title: 'Les deux jardins',
    titleAr: 'صَاحِبُ الْجَنَّتَيْن',
    icon: '🌿',
    category: 'paraboles',
    summary: 'Un homme possédait deux jardins luxuriants et devint arrogant, niant la résurrection et prétendant mériter éternellement ses biens. Ses jardins furent complètement détruits.',
    morals: [
      'La richesse est éphémère',
      'L\'arrogance due aux biens matériels est destructrice',
      'Les bonnes œuvres qui perdurent sont meilleures que la richesse',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#66BB6A',
  },
  {
    id: 'jardin-avares',
    title: 'Le jardin des avares',
    titleAr: 'أَصْحَابُ الْجَنَّة',
    icon: '🌙',
    category: 'paraboles',
    summary: 'Des héritiers jurèrent de récolter leur jardin très tôt le matin pour ne rien donner aux pauvres. Pendant la nuit, le jardin fut entièrement détruit par un fléau divin.',
    morals: [
      'L\'avarice et le refus de partager mènent à la perte totale',
      'La charité préserve les biens et les multiplie',
      'Les plans contre les pauvres se retournent contre leurs auteurs',
    ],
    surahs: [
      { number: 68, name: 'Al-Qalam' },
    ],
    color: '#43A047',
  },
  {
    id: 'parabole-lumiere',
    title: 'La parabole de la Lumière',
    titleAr: 'آيَةُ النُّور',
    icon: '💡',
    category: 'paraboles',
    summary: '« Allah est la Lumière des cieux et de la terre. Sa lumière est semblable à une niche dans laquelle se trouve une lampe... » Un des versets les plus célèbres décrivant la guidance divine.',
    morals: [
      'La guidance divine illumine les cœurs croyants',
      'La foi est une lumière qui éclaire le chemin',
      'Allah guide vers Sa lumière qui Il veut',
    ],
    surahs: [
      { number: 24, name: 'An-Nur' },
    ],
    color: '#FFD54F',
  },
  {
    id: 'parabole-araignee',
    title: 'La parabole de l\'araignée',
    titleAr: 'مَثَلُ الْعَنْكَبُوت',
    icon: '🕸️',
    category: 'paraboles',
    summary: 'Ceux qui prennent des protecteurs en dehors d\'Allah sont comme l\'araignée qui se construit une maison — la plus fragile des maisons.',
    morals: [
      'Tout support autre qu\'Allah est fragile et illusoire',
      'Les fausses divinités ne protègent de rien',
      'Seul Allah offre une protection véritable',
    ],
    surahs: [
      { number: 29, name: 'Al-Ankabut' },
    ],
    color: '#757575',
  },
  {
    id: 'vache-baqara',
    title: 'La vache des Bani Isra\'il',
    titleAr: 'بَقَرَةُ بَنِي إِسْرَائِيل',
    icon: '🐄',
    category: 'paraboles',
    summary: 'Les Bani Isra\'il devaient sacrifier une vache pour résoudre un meurtre. Au lieu d\'obéir simplement, ils posèrent question sur question, rendant la tâche de plus en plus difficile.',
    morals: [
      'L\'excès de questions pour retarder l\'obéissance rend les choses plus difficiles',
      'La simplicité dans l\'obéissance est préférable',
      'Obéir promptement à Allah simplifie la vie',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#8D6E63',
  },
  {
    id: 'village-ingrat',
    title: 'Le village ingrat',
    titleAr: 'الْقَرْيَةُ الْكَافِرَة',
    icon: '🏘️',
    category: 'paraboles',
    summary: 'Un village vivait en paix et en prospérité mais fut ingrat envers les bienfaits d\'Allah. Il fut alors frappé par la faim et la peur en punition de son ingratitude.',
    morals: [
      'L\'ingratitude envers les bienfaits d\'Allah les fait disparaître',
      'La sécurité et la prospérité sont des dons à préserver par la gratitude',
      'Le kufr (ingratitude) attire les épreuves',
    ],
    surahs: [
      { number: 16, name: 'An-Nahl' },
    ],
    color: '#EF6C00',
  },

  // ========== ÉVÉNEMENTS HISTORIQUES ==========
  {
    id: 'badr',
    title: 'La bataille de Badr',
    titleAr: 'غَزْوَةُ بَدْر',
    icon: '⚔️',
    category: 'evenements',
    summary: 'Première grande bataille de l\'Islam : 313 musulmans contre environ 1000 Quraysh. Victoire miraculeuse avec l\'aide de milliers d\'anges envoyés par Allah.',
    morals: [
      'La victoire vient d\'Allah, pas du nombre',
      'La foi et la discipline l\'emportent sur la force brute',
      'Allah envoie Son secours à ceux qui Lui font confiance',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran' },
      { number: 8, name: 'Al-Anfal' },
    ],
    color: '#C62828',
  },
  {
    id: 'uhud',
    title: 'La bataille de Uhud',
    titleAr: 'غَزْوَةُ أُحُد',
    icon: '🏹',
    category: 'evenements',
    summary: 'Les archers musulmans quittèrent leur position stratégique, causant un retournement de la bataille. Le Prophète ﷺ fut blessé et Hamza tomba en martyr.',
    morals: [
      'La désobéissance au commandement cause la défaite',
      'L\'épreuve après la victoire est un test divin',
      'L\'amour du butin peut compromettre la victoire',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran' },
    ],
    color: '#D84315',
  },
  {
    id: 'ahzab',
    title: 'La bataille des Coalisés (Al-Khandaq)',
    titleAr: 'غَزْوَةُ الْأَحْزَاب',
    icon: '🏰',
    category: 'evenements',
    summary: '10 000 combattants assiégèrent Médine. Les musulmans creusèrent un fossé (Khandaq) sur conseil de Salman al-Farsi. Allah envoya un vent violent qui dispersa les coalisés.',
    morals: [
      'Allah défend les croyants par des moyens invisibles',
      'La stratégie complète la foi',
      'La patience dans le siège mène à la victoire',
    ],
    surahs: [
      { number: 33, name: 'Al-Ahzab' },
    ],
    color: '#BF360C',
  },
  {
    id: 'hudaybiyya',
    title: 'Le traité de Hudaybiyya',
    titleAr: 'صُلْحُ الْحُدَيْبِيَة',
    icon: '📜',
    category: 'evenements',
    summary: 'Un traité de trêve apparemment défavorable signé avec les Quraysh, mais qualifié par Allah de « victoire éclatante » (Fath Mubin). Il ouvrit la voie à la conquête pacifique de La Mecque.',
    morals: [
      'Ce qui semble une défaite peut être la plus grande victoire',
      'La diplomatie est une force, pas une faiblesse',
      'Allah voit la sagesse au-delà des apparences',
    ],
    surahs: [
      { number: 48, name: 'Al-Fath' },
    ],
    color: '#E65100',
  },
  {
    id: 'fath-makkah',
    title: 'La conquête de La Mecque',
    titleAr: 'فَتْحُ مَكَّة',
    icon: '🕋',
    category: 'evenements',
    summary: 'Entrée victorieuse du Prophète ﷺ à La Mecque sans effusion de sang. Il accorda le pardon général à tous les Quraysh qui l\'avaient persécuté pendant des années.',
    morals: [
      'La miséricorde en position de force est la plus grande noblesse',
      'Le pardon est plus puissant que la vengeance',
      'La victoire véritable est celle des cœurs',
    ],
    surahs: [
      { number: 110, name: 'An-Nasr' },
    ],
    color: '#FF6F00',
  },
  {
    id: 'isra-miraj',
    title: 'L\'Isra\' et le Mi\'raj',
    titleAr: 'الْإِسْرَاءُ وَالْمِعْرَاج',
    icon: '🌙',
    category: 'evenements',
    summary: 'Le Voyage Nocturne et l\'Ascension forment l\'un des miracles majeurs du pèlerinage prophétique pur. Par une nuit très lourde, au cœur terrible et amer d\'une décennie douloureuse (généralement désignée \'L\'Année de la tristesse\'), le sublime Prophète Muhammad (psl) chevaucha de la très sainte et noble mosquée inviolable sereine endormie de la vertueuse La Mecque vers d\'autres saintes contrées saintes, à l\'antique pieuse lumineuse mosquée Al-Aqsa magnifique et sainte lointaine sur le dos lumineux majestueux très preste de l\'étourdissant rapide de l\'héroïque monture l\'aérienne destrier divin Al-Buraq. De Jérusalem majestueuse commença l\'ascension cosmique (Mi\'raj) : la noble admirable très extraordinaire magnifique fabuleuse éclatante montée foudroyante très pure cosmique ascension majestueuse fabuleuse des immenses et inouïs sept immaculés fabuleux cieux de mystère divin.'), puis ascension à travers les cieux (Mi\'raj). Il rencontra les prophètes précédents et reçut la prescription des 5 prières quotidiennes.',
    morals: [
      'L\'honneur divin vient souvent après l\'épreuve',
      'Les 5 prières sont un cadeau direct d\'Allah',
      'Jérusalem est inséparable de l\'héritage islamique',
    ],
    surahs: [
      { number: 17, name: 'Al-Isra' },
      { number: 53, name: 'An-Najm' },
    ],
    color: '#1A237E',
  },
  {
    id: 'ifk',
    title: 'L\'incident de la calomnie (Al-Ifk)',
    titleAr: 'حَادِثَةُ الْإِفْك',
    icon: '🗣️',
    category: 'evenements',
    summary: 'Aïcha (رضي الله عنها) fut calomniée par des hypocrites. Après une période douloureuse, elle fut innocentée par une révélation divine directe dans le Coran.',
    morals: [
      'Ne pas propager de rumeurs sans vérification',
      'La calomnie est un péché majeur',
      'La patience dans l\'accusation injuste est récompensée par l\'innocence divine',
    ],
    surahs: [
      { number: 24, name: 'An-Nur' },
    ],
    color: '#AD1457',
  },

  // ========== RÉCITS DIVERS ==========
  {
    id: 'fourmi',
    title: 'La fourmi qui avertit son peuple',
    titleAr: 'نَمْلَةُ سُلَيْمَان',
    icon: '🐜',
    category: 'divers',
    summary: 'Une fourmi avertit son peuple de l\'approche de l\'armée de Sulayman pour qu\'ils se mettent à l\'abri. Sulayman sourit de sa parole et remercia Allah.',
    morals: [
      'Le leadership implique la responsabilité de protéger les siens',
      'Même les plus petites créatures ont de la sagesse',
      'La gratitude envers Allah pour Ses dons',
    ],
    surahs: [
      { number: 27, name: 'An-Naml' },
    ],
    color: '#558B2F',
  },
  {
    id: 'huppe',
    title: 'La huppe de Sulayman',
    titleAr: 'هُدْهُدُ سُلَيْمَان',
    icon: '🐦',
    category: 'divers',
    summary: 'La huppe revint informer Sulayman qu\'elle avait découvert un peuple adorant le soleil, gouverné par une reine (Bilqis). Cette information mena à la conversion de tout un peuple.',
    morals: [
      'Même le plus petit serviteur peut apporter une information capitale',
      'L\'observation et l\'initiative sont des qualités précieuses',
      'Chaque créature a un rôle dans le plan d\'Allah',
    ],
    surahs: [
      { number: 27, name: 'An-Naml' },
    ],
    color: '#33691E',
  },
  {
    id: 'corbeau',
    title: 'Le corbeau enseignant',
    titleAr: 'الْغُرَابُ الْمُعَلِّم',
    icon: '🐦‍⬛',
    category: 'divers',
    summary: 'Après que Qabil eut tué son frère Habil, il ne savait pas quoi faire du corps. Allah envoya un corbeau qui gratta la terre, lui montrant comment enterrer les morts.',
    morals: [
      'Allah enseigne à travers Ses créatures les plus humbles',
      'Le regret tardif ne ramène pas les morts',
      'Les animaux peuvent être source d\'enseignement',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida' },
    ],
    color: '#212121',
  },
  {
    id: 'ibrahim-oiseaux',
    title: 'Ibrahim et les 4 oiseaux',
    titleAr: 'إِبْرَاهِيمُ وَالطَّيْر',
    icon: '🕊️',
    category: 'divers',
    summary: 'Ibrahim demanda à Allah de lui montrer comment Il ressuscite les morts. Allah lui ordonna de découper 4 oiseaux, de les placer sur 4 collines, puis de les appeler. Ils revinrent vivants vers lui.',
    morals: [
      'Demander des preuves par soif de certitude est accepté',
      'La résurrection est un fait démontré par Allah',
      'La foi se renforce par la connaissance et la vision',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#0277BD',
  },
  {
    id: 'manna-salwa',
    title: 'La Manne et les Cailles',
    titleAr: 'الْمَنُّ وَالسَّلْوَى',
    icon: '🍯',
    category: 'divers',
    summary: 'Les Bani Isra\'il reçurent d\'Allah une nourriture miraculeuse gratuite dans le désert : la manne (al-Mann) et les cailles (as-Salwa). Malgré ce bienfait, ils se montrèrent ingrats et demandèrent de la nourriture terrestre.',
    morals: [
      'L\'ingratitude face aux bienfaits divins gratuits est condamnée',
      'Se contenter des dons d\'Allah est une vertu',
      'Préférer le bas monde aux dons divins est une perte',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
      { number: 7, name: 'Al-A\'raf' },
      { number: 20, name: 'Ta-Ha' },
    ],
    color: '#F9A825',
  },
  {
    id: 'talut-jalut',
    title: 'Talut, Dawud et Jalut',
    titleAr: 'طَالُوتُ وَدَاوُدُ وَجَالُوت',
    icon: '🗡️',
    category: 'divers',
    summary: 'Les Bani Isra\'il demandèrent un roi. Talut fut choisi malgré sa pauvreté. Lors du test de la rivière, seuls ceux qui burent modérément combattirent. Le jeune Dawud tua le géant Jalut.',
    morals: [
      'Le mérite ne se mesure pas à la richesse',
      'La discipline et l\'obéissance sont des clés de la victoire',
      'Un petit groupe déterminé peut vaincre une armée',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#546E7A',
  },
];

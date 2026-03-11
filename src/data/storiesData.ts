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
  startAyah?: number;
  page?: number;
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
  audio?: string;
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
    audio: '',
  },
  {
    id: 'thamoud',
    title: 'Le peuple de Thamoud',
    titleAr: 'قَوْمُ ثَمُود',
    icon: '🏔️',
    category: 'peuples',
    summary: 'Successeurs spirituels des \'Aad, les Thamoud, établis à Al-Hijr, excellaient dans une ingénierie spectaculaire : ils taillaient d\'imposantes et robustes demeures directement dans les flancs des montagnes de roche blanche pour se croire immortels. Le Prophète Salih (psl) leur fut envoyé. Pour éprouver leur foi à leur propre demande, Allah fit miraculeusement surgir d\'un rocher une chamelle monumentale, avec l\'ordre formel de la laisser paître paisiblement. Mais orgueil et rébellion prirent le dessus. Neuf individus corrompus, avec l\'assentiment de la population, égorgèrent cruellement le miracle vivant. En réponse à cette suprême impudence, un cataclysme foudroyant (un cri dévastateur venu du ciel) les terrassa tous à l\'aube dans leurs luxueux palais rupestres.',
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
    audio: '',
  },
  {
    id: 'pharaon',
    title: 'Pharaon et les Égyptiens',
    titleAr: 'فِرْعَوْنُ وَقَوْمُهُ',
    icon: '👑',
    category: 'peuples',
    summary: 'Pharaon (Fir\'awn) d\'Égypte incarne la quintessence du tyran politique et de l\'aveuglement de l\'ego dans le Coran. Dominant son puissant empire et asservissant les Enfants d\'Israël (Bani Isra\'il) jusqu\'à massacrer leurs nouveau-nés mâles, il franchit l\'insurpassable ligne de l\'infamie en se proclamant publiquement "Seigneur le Très-Haut". Face aux prodiges de Moïse (Musa) — le bâton changé en serpent et les neuf fléaux — et malgré la défaite publique et la conversion de ses propres maîtres magiciens, il demeura sourd et vindicatif. Pourchassant Moïse et son peuple en fuite à travers la mer miraculeusement ouverte par Allah, il y trouva une mort misérable par noyade avec l\'intégralité de son immense armée. Son repentir de la dernière seconde, formulé dans les flots mortels, fut rejeté à jamais.',
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
    audio: '',
  },
  {
    id: 'qarun',
    title: 'Qarun (Coré)',
    titleAr: 'قَارُون',
    icon: '💰',
    category: 'peuples',
    summary: 'Membre des Enfants d\'Israël (contemporain de Moïse), Qarun (Coré) fut gratifié par Allah de trésors d\'une abondance si colossale et de coffres si inestimables qu\'une force d\'hommes remarquablement robustes en ployait sous le simple poids des clefs. Mais l\'ivresse de la richesse pervertit son âme. Se paradant avec faste devant une foule souvent envieuse, il refusa l\'injonction de charité en proclamant avec haughteur qu\'il ne devait sa fortune qu\'à sa propre science et son intelligence personnelle, reniant la Grâce d\'Allah. L\'avertissement divin fut retentissant : le sol s\'ouvrit subitement, l\'engloutissant vif avec tout son palais, son or, et son insolence, démontrant brutalement la fragilité des biens matériels.',
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
    audio: '',
  },
  {
    id: 'madyan',
    title: 'Les gens de Madyan',
    titleAr: 'أَصْحَابُ مَدْيَن',
    icon: '⚖️',
    category: 'peuples',
    summary: 'Le peuple commerçant de Madyan, situé au carrefour d\'importantes routes marchandes, avait institutionnalisé la fraude et le brigandage économique : ils abusaient des poids, trompaient sur les mesures, ruinaient l\'économie de leurs partenaires et semaient le désordre sur les axes de transit. Le Prophète Shu\'ayb, surnommé l\'orateur des prophètes par sa grande éloquence, tenta de les raisonner, leur enjoignant de pratiquer le commerce équitable et de se contenter des gains licites bénis. Moqué et menacé d\'expulsion par ses compatriotes cupides, le peuple entier fut surpris et foudroyé par "le Jour de l\'Ombre" : croyant trouver refuge contre une chaleur accablante sous un large nuage noir, ils y trouvèrent en réalité une pluie de braises suivie d\'un séisme mortel qui les laissa gisants dans leurs demeures.',
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
    audio: '',
  },
  {
    id: 'ashab-al-fil',
    title: 'Les gens de l\'Éléphant',
    titleAr: 'أَصْحَابُ الْفِيل',
    icon: '🐘',
    category: 'peuples',
    summary: 'En l\'An 570, l\'année même de la naissance du Prophète Muhammad (psl), Abraha, l\'ambitieux vice-roi abyssin du Yémen furieux de voir le Pèlerinage arabe se diriger immanquablement vers la modeste Ka\'ba de La Mecque au détriment de sa cathédrale fastueuse, lança une expédition militaire faramineuse vers la ville sainte. Son armée d\'invasion inédite, appuyée par des chars et de puissants éléphants de guerre censés semer la terrifiante panique, apparut invincible. Contre toute attente humaine, La Mecque sans défense militaire n\'eut besoin d\'aucune armée : Allah expédia en essaims de minuscules oiseaux (les Ababil), portant dans leurs becs et griffes des pierres d\'argile durcie ardente. Cette frappe aérienne miraculeuse et implacable anéantit les phalanges lourdement armées, les réduisant à l\'état de "paille mâchée".',
    morals: [
      'Allah protège Sa Maison sacrée',
      'La supériorité militaire ne vaut rien face à la volonté d\'Allah',
      'Les signes d\'Allah se manifestent dans les événements historiques',
    ],
    surahs: [
      { number: 105, name: 'Al-Fil' },
    ],
    color: '#607D8B',
    audio: '',
  },
  {
    id: 'ashab-al-ukhdud',
    title: 'Les gens du Fossé',
    titleAr: 'أَصْحَابُ الْأُخْدُود',
    icon: '🔥',
    category: 'peuples',
    summary: 'Victimes d\'une terrible inquisition religieuse en des temps anciens (souvent associés à Najran), les "Gens du Fossé" furent une communauté croyante monothéiste inébranlable vivant sous le joug d\'un perfide et féroce roi païen qui se prenait pour un dieu. Refusant l\'ordre absolu de renier Allah suite à l\'exemplaire foi d\'un jeune garçon prodige de la région, la communauté entière fut condamnée par d\'effroyables représailles. Le tyran fit creuser de profondes tranchées remplies d\'immenses brasiers incandescents où les croyants, gardant le nom d\'Allah sur leurs lèvres, furent suppliciés et précipités vivants avec un terrifiant cynisme. Le Coran exalte la splendeur de leur foi intègre pour laquelle ils témoignèrent et promet un terrible châtiment brûlant pour les meurtriers réjouis.',
    morals: [
      'Les croyants martyrs sont victorieux même dans la mort',
      'La foi est plus précieuse que la vie',
      'Les tyrans qui persécutent les croyants seront châtiés',
    ],
    surahs: [
      { number: 85, name: 'Al-Buruj' },
    ],
    color: '#D32F2F',
    audio: '',
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
    audio: '',
  },

  // ========== PERSONNAGES REMARQUABLES ==========
  {
    id: 'maryam',
    title: 'Maryam (Marie)',
    titleAr: 'مَرْيَمُ عَلَيْهَا السَّلَام',
    icon: '🌸',
    category: 'personnages',
    summary: 'Maryam (Marie) est la seule femme dont le nom éclaire glorieusement les sourates du Coran, désignée modèle insigne de pureté universelle. Vouée exclusivement au temple adorateur de Jérusalem par le serment mystique de sa mère très pieuse de la grande famille de Imran, elle étonna son protecteur, le prophète Zacharie, en prodiguant de mystérieuses et douces nourritures du Paradis dans son modeste sanctuaire solitaire. Retirée à l\'est, elle rencontra et conversera avec l\'Archange Jibril (Gabriel) avec chasteté, lui annonçant l\'incompréhensible miracle exceptionnel divin imminent et inédit d\'être enceinte, sans mariage mâle préalable, d\'un Esprit du Seigneur (\'Isa/Jésus). C\'est dans une absolue solitude douloureuse, adossée affligée au tronc rugueux d\'un aride petit dattier isolé qu\'elle affronta le dur enfantement par la seule force sublime de la fraîcheur d\'une source miraculeusement et doucement apparue, avant le magnifique triomphe social stupéfiant du grand miracle du berceau divin oral et purificateur de son bel enfant.',
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
    audio: '',
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
    audio: '',
  },
  {
    id: 'dhul-qarnayn',
    title: 'Dhul-Qarnayn',
    titleAr: 'ذُو الْقَرْنَيْن',
    icon: '🛡️',
    category: 'personnages',
    summary: 'Souverain d\'une exceptionnelle droiture investi d\'un immense pouvoir géopolitique par Allah, Dhul-Qarnayn ("Celui aux deux cornes" ou "aux deux époques") sillonna farouchement les extrêmes du monde connu. Guidé par la stricte équité divine, il châtia fermement les iniques et pacifia les contrées. Parvenu jusqu\'aux confins les plus reculés d\'une imposante chaîne montagneuse isolée, il fut accosté par une peuplade terrifiée victime des constantes et cruelles razzias des hordes dévastatrices de Ya\'juj et Ma\'juj (Gog et Magog). Refusant tout paiement vénal pour son secours, il mobilisa leur propre force de travail, concevant et érigeant majestueusement un impénétrable mur d\'ingénierie titanesque fait de blocs de fer colmatés à l\'airain fondu. Cette barrière séculaire, qu\'ils ne purent ni escalader ni percer, tiendra solidement jusqu\'au grand soulèvement précurseur de l\'Heure scellée.',
    morals: [
      'Le pouvoir doit être utilisé pour protéger les opprimés',
      'La justice est la base du leadership',
      'Même le plus grand pouvoir humain est temporaire',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#3F51B5',
    audio: '',
  },
  {
    id: 'khidr',
    title: 'Al-Khidr et Musa',
    titleAr: 'الْخَضِرُ وَمُوسَى',
    icon: '🌿',
    category: 'personnages',
    summary: 'Figure du mysticisme coranique absolu, Al-Khidr (le Verdoyant) représente la matérialisation de la science divine occulte octroyée directement par Allah, insaisissable pour la seule raison humaine. Le grand Prophète Musa (Moïse), désireux d\'étendre son propre savoir, l\'accompagna comme humble disciple discipliné au prix d\'une patience ardue. Le grand mystique enchaîna trois actes d\'apparence scandaleuse : le sabordage inattendu d\'un frêle navire appartenant à de pauvres travailleurs, le sidérant meurtre d\'un jeune garçon, et la réparation gratuite de l\'enceinte d\'une ville inhospitalière. Face aux indignations successives et incompressibles de Musa brisant leur pacte de silence, Al-Khidr dévoila magnifiquement la majesté insoupçonnée des desseins d\'Allah : sauver le navire d\'un roi pirate réquisitionnant, préserver des parents pieux de la future tyrannie d\'un enfant corrompu (en l\'échangeant contre un meilleur), et protéger l\'enfoui trésor légitime d\'orphelins vertueux dont le père fut un saint homme.',
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
    audio: '',
  },
  {
    id: 'ashab-al-kahf',
    title: 'Les gens de la Caverne',
    titleAr: 'أَصْحَابُ الْكَهْف',
    icon: '🕳️',
    category: 'personnages',
    summary: 'Pour fuir le culte païen imposé par le roi tyran de l\'époque Dèce (Daquyanus) et préserver frénétiquement la pureté de leur attestation d\'Unicité divine, quelques nobles jeunes hommes courageux et clairvoyants, accompagnés de leur fidèle chien protecteur en posture de garde, désertèrent leur cité mondaine corrompue pour se retrancher prudemment dans une vaste caverne sombre. Répondant à leurs vibrantes supplications, Allah accomplit un extraordinaire prodige temporel : Il apposa un sceau sur leurs oreilles, les plongeant mystérieusement, avec leur chien, dans un très long et profond sommeil suspendu durant trois immenses siècles et neuf bouleversantes années (309 ans). À leur troublant réveil cognitif où ils ne pensaient avoir dormi qu\'un modeste jour normal, ils découvrirent avec une profonde stupeur providentielle en envoyant l\'un d\'eux discrètement acheter des vivres, que l\'empire tout entier s\'était formidablement converti au monothéisme glorifiant depuis très longtemps !',
    morals: [
      'La fuite pour préserver sa foi est légitime (Hijra)',
      'Allah protège ceux qui Le choisissent',
      'Le temps est relatif et entre les mains d\'Allah',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#00897B',
    audio: '',
  },
  {
    id: 'habil-qabil',
    title: 'Les deux fils d\'Adam',
    titleAr: 'هَابِيلُ وَقَابِيل',
    icon: '⚔️',
    category: 'personnages',
    summary: 'L\'histoire glaçante des deux premiers fils biologiques de l\'humanité, tragédies de la genèse d\'Adam. Chacun présenta au Seigneur une humble offrande eucharistique : celle de Habil l\'honnête paysan (Abel) fut gracieusement avalisée, tandis que celle de Qabil (Caïn), l\'agriculteur au cœur corrompu, fut distinctement rejetée. Rongeant son âme, d\'une envieuse animosité maladive et d\'un orgueil aveuglant, le grand frère franchit la ligne rouge funeste, devenant coupable du tout premier meurtre innommable sur terre en brisant atrocement la sanctifiée vie sanguine de son frère apaisé. Totalement perdu, affligé par un déshonorant fardeau inerte et ignorant le processus funéraire, il assista honteusement, instruit par le Créateur silencieux, au grattage adroit d\'un simple corbeau providentiel envoyant la terrifiante leçon d\'ensevelissement des dépouilles : une souillure indélébile et pérenne sur toute effusion de sang à venir pour les nations.',
    morals: [
      'La jalousie est destructrice',
      'Tuer un innocent équivaut à tuer l\'humanité entière (5:32)',
      'Le regret après le mal ne suffit pas à l\'effacer',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida' },
    ],
    color: '#F44336',
    audio: '',
  },
  {
    id: 'bilqis',
    title: 'La Reine de Saba (Bilqis)',
    titleAr: 'بِلْقِيسُ مَلِكَةُ سَبَأ',
    icon: '👸',
    category: 'personnages',
    summary: 'Figure monarchique historique du riche royaume prospère de Saba\' (actuel Yémen/Éthiopie), Bilqis dirigeait habilement un vaste et puissant empire païen fervent adorateur du cycle de l\'astre solaire éclatant. Renseignée par le rapport aérien du voyageur infaillible Hudhud (la huppe sagace), la sommation prophétique et souveraine diplomatique de l\'auguste Sulayman (Salomon) arriva dans ses cours exquises. Faisant preuve d\'un indéniable sens politique perspicace supérieur à la fougueuse arrogance guerrière des hommes de son illustre conseil de guerre belliqueux, elle tenta subtilement des présents apaisants diplomatiques onéreux d\'abord, puis accepta de marcher vers le grand souverain prophétisé en terre lointaine. Stupéfaite de retrouver miraculeusement son propre majestueux trône déplacé mystiquement en un incommensurable clin d\'œil, puis déroutée par l\'illusion de l\'astucieuse cour d\'eau du fameux palais de cristal royal majestueux, elle reconnut son erreur en toute sublime humilité de Reine et déposa son âme radieuse en obédience gracieuse à Allah, Seigneur pur des lointains univers florissants.',
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
    audio: '',
  },
  {
    id: 'croyant-pharaon',
    title: 'Le croyant de la famille de Pharaon',
    titleAr: 'مُؤْمِنُ آلِ فِرْعَوْن',
    icon: '🤫',
    category: 'personnages',
    summary: 'Sous la pire et monstrueuse inquisition égyptienne persécutoire, un courageux et solitaire homme du sérail d\'excellence, membre légitime et secret de la famille stricte de Pharaon même, dissimulait intimement mais ardemment sa très ferme foi inébranlable naissante en Moïse. Lors d\'un impitoyable conseil de mort statuant l\'exécution urgente de Moïse (Musa), cet homme sage brava frontalement le danger extrême, prenant solennellement et dangereusement la parole. Exigeant le respect logique du doute rationnel et de l\'équité sacrée, il tint un flamboyant discours spirituel avertisseur gravé dans le Saint Coran : argumentateur magistral, il raillait le paradoxe d\'assassiner un noble esprit prêchant moralement "Mon Seigneur est Allah" ; étayant implacablement l\'histoire et ses précédents tragiques peuples anéantis punis (Thamoud et Âd). Sublimement épaulé, mystiquement défendu du complot immédiat d\'un tyran humilié, ce vertueux personnage fut magistralement épargné de la sourde et cruelle noyade vengeresse fatale écrasante de son peuple arrogant aveugle dans l\'eau béante béante engloutissante égyptienne punitive.',
    morals: [
      'Le courage de défendre la vérité même en milieu hostile',
      'La foi peut exister dans les endroits les plus inattendus',
      'Un seul homme courageux peut faire la différence',
    ],
    surahs: [
      { number: 40, name: 'Ghafir' },
    ],
    color: '#5C6BC0',
    audio: '',
  },
  {
    id: 'uzayr',
    title: 'Uzayr et la ville détruite',
    titleAr: 'عُزَيْرٌ وَالْقَرْيَة',
    icon: '🏚️',
    category: 'personnages',
    summary: 'Contemplant le paysage post-apocalyptique affligeant de la Ville Sainte mythique écrasée et meurtrie (très possiblement la Jérusalem fracassée des ruines de Nabuchodonosor impitoyable antique), l\'intuitif vertueux Uzayr s\'interrogea intellectuellement, nullement par hérésie mécréante abrupte mais pour élever son entendement vers l\'omnipotente perfection créatrice divine revigorante insondable majestueuse indicible comment Il ramenait un si terrible néant morbide sépulcral à une éclatante aurore grouillante radieuse revivante foisonnante vitale ! Pour parfaite éminente preuve éminente existentielle indélébile d\'enseignement irréfragable spirituel absolu pour l\'univers, Dieu provoqua mystiquement son propre subit endormissement fatal de sa personne isolée durant une éblouissante incroyable succession vertigineuse enjambante fulgurante centenaire foudroyante stupéfiante immense mystique ébranlante décisive d\'une grande centaine d\'immenses longues années inaperçues d\'immenses décennies muettes et sourdes. À son inconcevable et incompréhensible retour ébloui matinal de la vie charnelle intacte étonnée mystifiée sidérée abasourdie charnelle ineffable intacte intègre sidérante, se croyant n\'avoir reposé assoupi qu\'à un fugitif décalage d\'agréable d\'un simple jour du quotidien modeste clarté ; il découvrit foudroyé sidéré émerveillé émerveillé estomaqué émerveillé de sidération béate sa pitance d\'un fugace hier inaltérée frémissante saine et pure prodigieusement divine, alors qu\'en flagrant stupéfiant ahurissant implacable de son animal son âne effrité tombé réduit réduit tristement décomposé pulvérisé morcelé blanc os blafards lugubres misérablement gisait poussiéreux macabre éparpillé ! Dieu revivifia sous les fascinés de sa vue mortelle effroyée extatique le miracle resplendissant réassemblant fulgurant étourdissant miraculeux divin de l\'effroyable puzzle osseux reconstitué chair ressuscitante éclatante de son inoubliable équidé ressuscitant magique pour que nul doute ténébreux affreux lugubre démoniaque du crépuscule fatal d\'inconsistance mortelle vaine désespérée sépulcrale humaine jamais plus au grand soir inéluctable dernier divom de la résurrection ne puisse survivre à de si solaires preuves resplendissantes inoubliables éclatantes magnifiques parfaites !',
    morals: [
      'La résurrection est une réalité prouvée par des signes',
      'Le doute sincère reçoit une réponse d\'Allah',
      'Allah montre Ses signes à ceux qui cherchent',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#78909C',
    audio: '',
  },

  // ========== PARABOLES & ALLÉGORIES ==========
  {
    id: 'deux-jardins',
    title: 'Les deux jardins',
    titleAr: 'صَاحِبُ الْجَنَّتَيْن',
    icon: '🌿',
    category: 'paraboles',
    summary: 'Allégorie saisissante confrontant arrogance matérialiste et humble gratitude spirituelle. Un homme aisé s\'enorgueillissait démesurément de ses deux fabuleux jardins florissants bordés de luxueux palmiers fertiles entrelacés d\'opulentes vignes majestueuses ruisselantes rafraîchies de douces rivières intarissables magnifiques irriguées de fontaines chantantes de raisins et d\'exquises cultures fertiles de récolte foisonnante bénie merveilleuse inépuisable abondance indéniable prodigieusement prospère ! Complètement intoxiqué par cet apparat fugace flatteur rassasiant, il rejeta de sa langue les commandements sacrés niant formellement arrogamment superbement l\'imminence de l\'Inéluctable Résurrection de Dieu de son prochain croyant pauvre ami ; jurant perfide aveugle égoïste ébloui orgueilleusement qu\'une telle profusion ne sécherait jamais de beauté inaltérable jamais anéantit indéracinable de puissance immortelle. Sur cet immense péché d\'abominable superbe, un fracassant d\'effroyable punitif destructeur nocturne tonnerre divin balaya la sotte arrogance péremptoire : le joyau agricole d\'orgueil fut entièrement complètement anéanti réduit déchiqueté brisé brisé ravagé tristement retourné sur de tristes misérables treilles affreuses mortes désertées de regrets dévastés mornes sanglottant !',
    morals: [
      'La richesse est éphémère',
      'L\'arrogance due aux biens matériels est destructrice',
      'Les bonnes œuvres qui perdurent sont meilleures que la richesse',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf' },
    ],
    color: '#66BB6A',
    audio: '',
  },
  {
    id: 'jardin-avares',
    title: 'Le jardin des avares',
    titleAr: 'أَصْحَابُ الْجَنَّة',
    icon: '🌙',
    category: 'paraboles',
    summary: 'L\'histoire tragique de cupidité malencontreuse et de sotte illusion ingrate d\'une fratrie d\'irrévérencieux héritiers avares. Ayant succédé furtivement dans la nuit sombre à la charge généreusement laissée jadis ouverte paternelle ouverte charitable jadis du beau grand verger éclatant à fructueusement distribuer au soleil du pauvre et nécessiteux vertueux indigents mendiants. Répugnant de cet exécrable odieux partage fraternel miséricordieux détestable à leurs yeux corrompus assombris obscurs pécuniaires, ils planifièrent insidieusement sordides un très sombre calcul de rapines misérables matinal : rafler chuchotant subrepticement en maraude hâtive toutes les grappes entières de richesses secrètement à l\'abri complet perfide affreux fuyant l\'aube mendiante furtive ! À leur sidérante approche au petit matin matinal levant désabusé furtif silencieux surpris d\'angoisse affaissé épouvantable lugubre noir désespérant sidéré muet terrifié morne matinal sinistre muet terrifiant effroyable ; l\'éclatant vert divin avait fait place lugubre désolation punitif mystique roussi ténébreux d\'incendiaire de fléau consumé anéanti fléau fracassé consumé brisé transformé carbonisé triste d\'affreux châtiment inéluctable ruine absolue : une éternelle dévastante cinglante cuisante magistrale divine et suprême misérable divine douloureuse et cuivrée suprême de punition céleste inoubliable !',
    morals: [
      'L\'avarice et le refus de partager mènent à la perte totale',
      'La charité préserve les biens et les multiplie',
      'Les plans contre les pauvres se retournent contre leurs auteurs',
    ],
    surahs: [
      { number: 68, name: 'Al-Qalam' },
    ],
    color: '#43A047',
    audio: '',
  },
  {
    id: 'parabole-lumiere',
    title: 'La parabole de la Lumière',
    titleAr: 'آيَةُ النُّور',
    icon: '💡',
    category: 'paraboles',
    summary: 'L\'une des paraboles les plus profondes, poétiques, mystiques et célèbres du Noble Coran divin décrivant majestueusement doucement l\'infinie merveille divine guidant l\'âme croyante vertueuse céleste de son Créateur. « Allah est la Lumière majestueuse absolue et pure resplendissante éternelle des cieux et de sa grande terre éclatante et vaste ; Sa noble lumière ineffable majestueuse resplendissante ressemble magnifiquement miraculeusement gracieusement à une subtile lumineuse niche céleste pure abritant en son chaste profond mystère inviolable une étincelante précieuse transparente mystique lampe fabuleuse radieuse sereine diaphane. La lampe sublime majestueuse étourdissante reposant magnifique céleste lumineuse sereinement gracieusement enchâssé merveilleusement magnifiquement sereine au chaste cristal de diamant d\'un pur immaculé globe pur de verre de cristal aussi limpide clair éclatant rayonnant astre brillant fabuleux diaphane resplendissant qu\'une vive lumineuse majestueuse radieuse divine inaltérable grande étoffe stellaire ! Sa noble huile exquise et radieuse issue d\'un arbre et rameau béni serein étourdissant rayonnant resplendissant d\'olivier magnifique ineffable radieux qui n\'est nullement de l\'aride orient extrême étouffant ni morne d\'occident crépusculaire moribond lointain. Que sa brillante sublime translucide étourdissante divine clarté lumineuse flamboyante transparente s\'embrase suavement délicatement naturellement douce flamboyante divine éclatante presqu\'elle brûle vive mystiquement même si nulle ardente étincelle n\'effleure d\'étincelante et sublime clarté magnétiquement divine ses radieux flancs majestueux éclatants lumineux purs mystiques purs clairs purs éternels adorés de divine splendeur immense mystère infini divin Lumière guidant vers la pure et radieuse suprême Lumière céleste inaltérable sublime. »',
    morals: [
      'La guidance divine illumine les cœurs croyants',
      'La foi est une lumière qui éclaire le chemin',
      'Allah guide vers Sa lumière qui Il veut',
    ],
    surahs: [
      { number: 24, name: 'An-Nur' },
    ],
    color: '#FFD54F',
    audio: '',
  },
  {
    id: 'parabole-araignee',
    title: 'La parabole de l\'araignée',
    titleAr: 'مَثَلُ الْعَنْكَبُوت',
    icon: '🕸️',
    category: 'paraboles',
    summary: 'Douloureuse incisive cinglante terrible parabole allégorique divine décrivant pitoyablement tristement pathétiquement les fausses infâmes fragiles perfides pernicieuses illusions des polythéistes stupides vains d\'abjectes idoles protectrices misérables adorés éperdus par les païens ! Leurs faux espoirs protecteurs fallacieux ténébreux minables de statues protectrices divines futiles mensonges sont impitoyablement comparés métaphoriquement mystiquement inéluctablement judicieusement avec grande subtile ironie céleste acérée implacable de la divinité ; à l\'ingénieux vain mais éphémère d\'instinct misérable laborieux du sordide affreux lugubre repaire sordide poisseux poisseux instable tissé pitoyablement fébrilement fil arraché d\'araignée fragile chétiffe arachnide pathétique chétive misérable laborieuse aveugle ténébreuse arachnide vulnérable affreuse ténébreuse misérablement incertaine affreuse aveugle pitoyable affreusement vulnérable vulnérable pathétique ; car certes vraiment indubitablement en tout clair inéluctable absolu la maison de toute cette arachnide affreusement tissée vulnérable affreuse demeure reste à jamais immuablement la plus précaire effroyablement dérisoire de pitoyable refuge affaissé de toutes les infâmes habitations existantes de la vaste terre dérisoire vulnérable si éphémère et inutilement vaine d\'illusions mortelles vaines illusoires insensés !',
    morals: [
      'Tout support autre qu\'Allah est fragile et illusoire',
      'Les fausses divinités ne protègent de rien',
      'Seul Allah offre une protection véritable',
    ],
    surahs: [
      { number: 29, name: 'Al-Ankabut' },
    ],
    color: '#757575',
    audio: '',
  },
  {
    id: 'vache-baqara',
    title: 'La vache des Bani Isra\'il',
    titleAr: 'بَقَرَةُ بَنِي إِسْرَائِيل',
    icon: '🐄',
    category: 'paraboles',
    summary: 'Le récit métaphorique de psychologie divine obstinée des Fils d\'Israël insoumis et exigeants à propos de sacrée génétique sacrée bovine insolite ordonnée d\'exécution à obéissance stricte purificatrice purificatrice mystique resplendissante lumineuse imposée de Dieu. Allah leur enjoignit clairement simplement initialement et brièvement le rituel sacrificiel d\'immolation directe expiatoire pure ineffable salvatrice saine et simple d\'une anodine d\'acceptable vache d\'indéfinie nature simple de plaine d\'acceptable robe indifférente ; afin de désigner l\'invisible de mystique indicible et meurtrier délictuel démoniaque fatal inconnu de sang humain versé odieusement caché au peuple ! Submergés de leur sempiternelle outrecuidance querelleuse ergoteuse chicaneuse ergoteuse obstinée obtuse chicanière insoumise polémique de détail chicanier de questionneurs rebelles insubordonnés, ils assaillirent d\'indiscrétion obtuse impertinente arrogante le Prophète de redemande exigeante obstinée rebelle obstinée têtue de multiples de questions complexes fermées de compliquées futiles descriptives limitatives restrictives sur son pelage d\'apparence de vieillesse de détails futiles ridicules restrictifs drastiques et accablants restrictifs arrogants limitatifs insensés drastiques étouffants resserrant drastiquement inexorablement par leurs absurdes boucles infernales obstinées et questions d\'impudences iniques le lourd étau draconien accablant exigeant redoutable rare quasi introuvable féroce contraignant divin de ses critères d\'unicité introuvables d\'improbable divine parfaite et de rare exigeante couleur de perfection jaune rayonnante indomptée quasi incréée introuvable, transformant leur rituel banal modeste de prompt obéissance immédiate humble docile spirituelle vertueuse ; en corvée dispendieuse incalculablement épuisante d\'humiliation dispendieuse coûteuse affreusement rare exténuante et extrêmement difficile redoutablement affreuse épouvantable contraignante sévère ardue !',
    morals: [
      'L\'excès de questions pour retarder l\'obéissance rend les choses plus difficiles',
      'La simplicité dans l\'obéissance est préférable',
      'Obéir promptement à Allah simplifie la vie',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#8D6E63',
    audio: '',
  },
  {
    id: 'village-ingrat',
    title: 'Le village ingrat',
    titleAr: 'الْقَرْيَةُ الْكَافِرَة',
    icon: '🏘️',
    category: 'paraboles',
    summary: 'Cinglant récit magistralement évocateur illustrant socialement divinement spirituellement inéluctablement spirituellement inéluctablement douloureusement implacablement les lourds désastres inéluctables douloureux pernicieux néfastes punitifs du sombre rejet de la Divine et douce clémence pourvoyante magnanime et du lugubre ingrat et vil odieux blâme misérable effronté des superbes d\'aisance d\'opulence. La glorieuse paisible harmonieuse verdoyante ravissante florissante et exquise sereinement paisible riche cité magnifique sûre gracieusement de foisonnante sereine et opulente paisible comblée prospèrement par son Divin d\'abondantes resplendissantes magnifiques inespérées inépuisablement sereines magnifiques sereines de toutes les sublimes sereines joyeuses foisonnantes célestes magnifiques sereines divines luxurieuses magnifiques de toutes provenances claires magnifiques foisonnantes heureuses magnifiques d\'horizons infinis magnifiques. Ayant sombré cyniquement ignoblement lourdement impudemment dans les vanités des futilités abjectes sombres arrogantes orgueilleuses insubordonnées orgueilleusement de vanités impies cruelles orgueilleusement cyniquement dans les lourdes misérables ingratitudes perfides des infâmes de vilaines impies négations arrogantes arrogantes méprisables outrecuidantes infidélités aux dons resplendissants purs, Dieu l\'emballa divine suprême châtiment affreux ténébreux impénétrable de la double cape spectrale épouvantant terrifiante ténébreuse atroce sinistre terrifiante : le noir sépulcral manteau effrayant mortel sinistre ténébreux famélique sombre linceul et affamé terrible de d\'effroyable épouvantable linceul lugubre désolante étouffante famine endémique mortifère ténébreuse poignante terrible cruelle effroyable et le terrifiant étouffant saisissant affreux d\'angoisse et de glacial du glacial manteau blême ténébreux pétrifiant ténébreux affreux sombre saisissant du de hideuse atroce constante atroce de constante ténébreuse lugubre frayeur épouvantable et d\'extrême terreur panique d\'angoisse terrible atroce implacable glaciale effarante permanente.',
    morals: [
      'L\'ingratitude envers les bienfaits d\'Allah les fait disparaître',
      'La sécurité et la prospérité sont des dons à préserver par la gratitude',
      'Le kufr (ingratitude) attire les épreuves',
    ],
    surahs: [
      { number: 16, name: 'An-Nahl' },
    ],
    color: '#EF6C00',
    audio: '',
  },

  // ========== ÉVÉNEMENTS HISTORIQUES ==========
  {
    id: 'badr',
    title: 'La bataille de Badr',
    titleAr: 'غَزْوَةُ بَدْر',
    icon: '⚔️',
    category: 'evenements',
    summary: 'La décisive et spectaculaire première grande confrontation militaire fondatrice de l\'Islam originel. Sous le soleil écrasant du désert, face à une imposante armée Quraysh suréquipée lourdement armée de plus de 1000 guerriers orgueilleux et arrogants, la modeste escouade de 313 croyants musulmans fervents mais démunis matériellements, menée lumineusement par le Prophète ﷺ, invoqua ardemment le secours divin avec une ferveur absolue. En réponse à cette inébranlable confiance sublime et par la grâce céleste de Sa miséricorde foudroyante, Allah fit miraculeusement descendre du ciel invisible des bataillons d\'anges radieux fulgurants. Par cette intercession divine prodigieuse foudroyante inespérée, les rangs païens furent balayés et l\'armée mecquoise mise en déroute stupéfaite foudroyante inoubliable retentissante. Badr devint l\'emblème éternel resplendissant et triomphant du triomphe de la vérité pure désarmée sur la force brutale aveugle.',
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
    audio: '',
  },
  {
    id: 'uhud',
    title: 'La bataille de Uhud',
    titleAr: 'غَزْوَةُ أُحُد',
    icon: '🏹',
    category: 'evenements',
    summary: 'La très tragique, formatrice et poignante épreuve militaire post-Badr. Au pied du mont Uhud, les archers musulmans, initialement victorieux magnifiquement, désertèrent dramatiquement leur position stratégique d\'altitude cruciale par une malheureuse précipitation d\'attraction du butin mondain abandonné, violant strictement l\'ordre militaire absolu du Prophète ﷺ. Cette faille soudaine fatale permit au chef cavalier polythéiste rusé Khalid ibn al-Walid de contourner redoutablement et de prendre tragiquement à revers les rangs musulmans foudroyés. Dans le chaos sanglant effroyable, d\'illustres martyrs nobles comme le courageux lion de l\'Islam Hamza tombèrent valeureusement et le Prophète ﷺ lui-même fut durement et héroïquement blessé au visage radieux saignant. Uhud offrit une cuisante et sévère leçon impitoyable divine : la gloire est inséparable de la discipline, et la soif des biens éphémères compromet irrémédiablement le sublime triomphe spirituel.',
    morals: [
      'La désobéissance au commandement cause la défaite',
      'L\'épreuve après la victoire est un test divin',
      'L\'amour du butin peut compromettre la victoire',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran' },
    ],
    color: '#D84315',
    audio: '',
  },
  {
    id: 'ahzab',
    title: 'La bataille des Coalisés (Al-Khandaq)',
    titleAr: 'غَزْوَةُ الْأَحْزَاب',
    icon: '🏰',
    category: 'evenements',
    summary: 'L\'angoissant siège périlleux et massif (Al-Khandaq). Face à une coalition (Al-Ahzab) polythéiste et tribale effrayante et redoutable sans précédent totalisant près de 10 000 combattants lourdement armés décidés à anéantir définitivement Médine pacifique, les musulmans effrayés, sur la brillante suggestion tactique militaire perse de Salman al-Farsi, creusèrent courageusement fiévreusement nuit et jour une immense tranchée infranchissable autour de la ville. Affamés, gelés et assiégés cruellement durant un long mois angoissant interminable, les croyants persévérèrent ardemment avec constance. Allah vola à leur secours silencieux foudroyant invincible spectaculaire : Il déchaîna farouchement un glacial vent violent nocturne surnaturel impétueux dévastateur ténébreux arrachant effroyablement tentes et chaudrons ennemis terrifiés, semant une terrible panique ténébreuse invincible foudroyante et dispersant sans un coup d\'épée direct l\'immense armée des coalisés coalisée terrifiée en déroute fuyant confusément précipitamment lâchement la nuit.',
    morals: [
      'Allah défend les croyants par des moyens invisibles',
      'La stratégie complète la foi',
      'La patience dans le siège mène à la victoire',
    ],
    surahs: [
      { number: 33, name: 'Al-Ahzab' },
    ],
    color: '#BF360C',
    audio: '',
  },
  {
    id: 'hudaybiyya',
    title: 'Le traité de Hudaybiyya',
    titleAr: 'صُلْحُ الْحُدَيْبِيَة',
    icon: '📜',
    category: 'evenements',
    summary: 'L\'extraordinaire et sublime compromis de paix clairvoyant pacifique. Lors d\'une marche spirituelle pacifique de pèlerinage désarmé vers La Mecque, les musulmans furent ignoblement bloqués agressivement par les Quraysh. Le Prophète ﷺ conclut alors sereinement et sagement un traité de trêve d\'une décennie dont les clauses paraissaient de prime abord si outrageusement humiliantes et défavorables que même de grands compagnons illustres comme Omar en furent bouleversés révoltés contrariés. Pourtant, la sublime et claire Révélation divine tomba apaisante majestueuse glorifiante qualifiant immédiatement cet acte pacifique de "Victoire éclatante" (Fath Mubin) foudroyant inoubliable. Ce traité pacifique prodigieux apaisant désamorça brillamment l\'animosité, ouvrit les majestueuses portes d\'une immense expansion fulgurante de l\'Islam triomphant et prépara lumineusement pacifiquement sagement le terrain inéluctable béni glorieux de la future radieuse grande Conquête mecquoise glorieuse pacifique sublime !',
    morals: [
      'Ce qui semble une défaite peut être la plus grande victoire',
      'La diplomatie est une force, pas une faiblesse',
      'Allah voit la sagesse au-delà des apparences',
    ],
    surahs: [
      { number: 48, name: 'Al-Fath' },
    ],
    color: '#E65100',
    audio: '',
  },
  {
    id: 'fath-makkah',
    title: 'La conquête de La Mecque',
    titleAr: 'فَتْحُ مَكَّة',
    icon: '🕋',
    category: 'evenements',
    summary: 'L\'apogée de la clémence humaine prophétique et lumineuse triomphante grandiose miséricordieuse éclatante triomphante pacifique resplendissante. Huit années après la fuite nocturne en exil forcé amer (l\'Hégire), le Prophète ﷺ rentra majestueusement paisiblement humblement à la tête rayonnante silencieuse et foudroyante magnifique irrésistible majestueuse impressionnante inéluctable de mille fois dix mille hommes pieux (10 000) dans la ville sacrée de La Mecque pacifiée humblement résignée vaincue inerte sidérée sans coup férir ni la moindre effusion de sang redoutée ! S\'avançant noblement vers la sainte Ka\'ba magnifique sanctifiée pour briser victorieusement pacifiquement majestueusement purificatrice éclatante resplendissante des infâmes les trois cent soixante idoles infâmes adorées, il se tint en grand miséricordieux vainqueur total absolu radieux foudroyant magnifique majestueux invincible face à tous ses anciens féroces bourreaux tremblants. Loin de toute vile rancœur triomphante arrogante ou sanguinaire vengeance aveugle meurtrière, il prononça avec une incommensurable divine miséricordieuse grâce éminente et indulgente amnistie totale inoubliable gracieuse : "Allez, vous êtes libres !"',
    morals: [
      'La miséricorde en position de force est la plus grande noblesse',
      'Le pardon est plus puissant que la vengeance',
      'La victoire véritable est celle des cœurs',
    ],
    surahs: [
      { number: 110, name: 'An-Nasr' },
    ],
    color: '#FF6F00',
    audio: '',
  },
  {
    id: 'isra-miraj',
    title: 'L\'Isra\' et le Mi\'raj',
    titleAr: 'الْإِسْرَاءُ وَالْمِعْرَاج',
    icon: '🌙',
    category: 'evenements',
    summary: 'Le Voyage Nocturne et l\'Ascension forment l\'un des miracles majeurs du pèlerinage prophétique pur. Par une nuit très lourde, au cœur terrible et amer d\'une décennie douloureuse (généralement désignée \'L\'Année de la tristesse\'), le sublime Prophète Muhammad (psl) chevaucha de la très sainte et noble mosquée inviolable sereine endormie de la vertueuse La Mecque vers d\'autres saintes contrées saintes, à l\'antique pieuse lumineuse mosquée Al-Aqsa magnifique et sainte lointaine sur le dos lumineux majestueux très preste de l\'étourdissant rapide de l\'héroïque monture l\'aérienne destrier divin Al-Buraq. De Jérusalem majestueuse commença l\'ascension cosmique (Mi\'raj) : la noble admirable très extraordinaire magnifique fabuleuse éclatante montée foudroyante très pure cosmique ascension majestueuse fabuleuse des immenses et inouïs sept immaculés fabuleux cieux de mystère divin.',
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
    audio: '',
  },
  {
    id: 'ifk',
    title: 'L\'incident de la calomnie (Al-Ifk)',
    titleAr: 'حَادِثَةُ الْإِفْك',
    icon: '🗣️',
    category: 'evenements',
    summary: 'La douleureuse et poignante tragédie de la diffamation (Al-Ifk) ciblant l\'honneur immaculé de la sainte Mère des Croyants, Aïcha (رضي الله عنها). De retour d\'une expédition épuisante, perdue accidentellement par un malheureux concours de circonstances isolées dans le vaste désert aride, la jeune et chaste litière fut noblement escortée par le vertueux retardataire et probe compagnon Safwan ibn al-Mu\'attal. Les funestes hypocrites de Médine, perfidement tapis dans l\'ombre et dirigés par l\'abject chef Abdullah ibn Ubayy, s\'emparèrent goulûment et ignoblement de cette occasion inespérée pour forger et propager pernicieusement une rumeur abominable effroyable empoisonnant douloureusement le climat social d\'un mois d\'agonie spirituelle et de doutes torturants infâmes. Alors que le chagrin rongeait le cœur du Messager ﷺ et l\'affliction consumait purement Aïcha, Allah trancha définitivement et majestueusement des plus hauts trônes du septième ciel éclatant : Il descendit directement et personnellement dans le sublime Coran éternel (Sourate An-Nur) la retentissante formidable tonitruante et apaisante divine proclamation foudroyante de son indiscutable innocence virginale lumineuse !',
    morals: [
      'Ne pas propager de rumeurs sans vérification',
      'La calomnie est un péché majeur',
      'La patience dans l\'accusation injuste est récompensée par l\'innocence divine',
    ],
    surahs: [
      { number: 24, name: 'An-Nur' },
    ],
    color: '#AD1457',
    audio: '',
  },

  // ========== RÉCITS DIVERS ==========
  {
    id: 'fourmi',
    title: 'La fourmi qui avertit son peuple',
    titleAr: 'نَمْلَةُ سُلَيْمَان',
    icon: '🐜',
    category: 'divers',
    summary: 'La merveilleuse anecdote coranique délicieuse de sagacité providentielle animale de la vallée foisonnante des fourmis. Lors d\'une glorieuse expédition triomphale imposante majestueuse colossale, l\'incroyable invincible invincible armée du Prophète Roi Sulayman (Salomon), composée sidérante de légions combinées invincibles de redoutables djinns puissants, de fiers et vigoureux hommes valeureux et d\'escouades d\'oiseaux structurés magnifiques, déferla inexorablement. Sentant la massive et foudroyante secousse vibratoire d\'un tel arsenal en marche triomphale, une minuscule mais sage sentinelle et perspicace fourmi clairvoyante responsable avertit affolée crânement son peuple discipliné de travailleurs de regagner promptement frénétiquement leurs impénétrables demeures souterraines fortifiées pour ne pas être aveuglément écrasées piétinées pulvérisées innocemment en chemin ignoré par cette gigantesque incommensurable force. Entendant et saisissant parfaitement miraculeusement ce minuscule infime et sage dialecte insectoïde de précaution affolée gracieuse, l\'imposant Roi Sulayman s\'arrêta apaisé et sourit d\'un éclat ému serein reconnaissant attendri gracieusement à la divine grâce, s\'inclinant en gratitude infiniment humble de ses dons majestueux inouïs.',
    morals: [
      'Le leadership implique la responsabilité de protéger les siens',
      'Même les plus petites créatures ont de la sagesse',
      'La gratitude envers Allah pour Ses dons',
    ],
    surahs: [
      { number: 27, name: 'An-Naml' },
    ],
    color: '#558B2F',
    audio: '',
  },
  {
    id: 'huppe',
    title: 'La huppe de Sulayman',
    titleAr: 'هُدْهُدُ سُلَيْمَان',
    icon: '🐦',
    category: 'divers',
    summary: 'L\'audacieux vol extraordinaire de reconnaissance capitale géopolitique merveilleux insolite diplomatique. Mystérieusement absente sans permission royale au rassemblement de la grande parade militaire assidue quotidienne rigoureuse du somptueux Roi Sulayman exigent, la petite mais perspicace huppe sagace exploratrice s\'exposait bravement à une punition royale très sévère draconienne redoutable. Émergeant soudainement de l\'horizon lointain essoufflée haletante, elle apporta fièrement et posément une sidérante indéniable et bouleversante fantastique stupéfiante immense nouvelle providentielle inconnue d\'état lointain : la découverte d\'un opulente prospère majestueux grand et luxueux florissant florissant royaume lointain merveilleux de Saba (dirigé majestueusement par une reine, Bilqis) dont la fastueuse population s\'inclinait tragiquement misérablement bêtement avec ignorance et ferveur polythéiste païenne en adoration solaire au lieu d\'Allah ! Cette audace gracieuse animale capitale magnifique d\'information cruciale précieuse providentielle inouïe initiera la plus grande magistrale époustouflante conversion polythéiste de tout un majestueux pacifique et resplendissant royaume pacifié de l\'histoire !',
    morals: [
      'Même le plus petit serviteur peut apporter une information capitale',
      'L\'observation et l\'initiative sont des qualités précieuses',
      'Chaque créature a un rôle dans le plan d\'Allah',
    ],
    surahs: [
      { number: 27, name: 'An-Naml' },
    ],
    color: '#33691E',
    audio: '',
  },
  {
    id: 'corbeau',
    title: 'Le corbeau enseignant',
    titleAr: 'الْغُرَابُ الْمُعَلِّم',
    icon: '🐦‍⬛',
    category: 'divers',
    summary: 'L\'épouvantable et poignante scène glaçante du premier funeste morbide atroce drame fondateur de l\'humanité ! Ayant commis l\'irréparable inqualifiable forfait suprême par une effroyable sombre jalousie venimeuse consumante maladive du tout premier meurtre sanglant de l\'histoire sur son propre vertueux frère paisible innocent Habil (Abel), le vil meurtrier Qabil (Caïn) demeurait tétanisé pétrifié complètement abasourdi sidéré affolé ignorant de sa stupide impuissance pitoyable encombrante face à la répugnante inerte dépouille frémissante fraternelle affaissée mortelle encombrante ! Dans sa miséricordieuse magistrale pédagogie insoupçonnée parfaite et ineffable mystique implacable majestueuse de sagesse divine, Allah clément envoya simplement un vulgaire noir oiseau modeste volatile obscur providentiel sombre : un corbeau affairé instructeur affairé de deuil qui se mit frénétiquement patiemment à gratter habilement la rude terre meuble pour y inhumer délicatement le cadavre d\'un congénère défunt. Qabil poussa alors un immense poignant sanglot mortifié de honte abyssale écrasante d\'une misère béante face à son insondable morbide ignorance pitoyable d\'humain incapable, dévoilé tristement par de la leçon funéraire animale accablante implacable.',
    morals: [
      'Allah enseigne à travers Ses créatures les plus humbles',
      'Le regret tardif ne ramène pas les morts',
      'Les animaux peuvent être source d\'enseignement',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida' },
    ],
    color: '#212121',
    audio: '',
  },
  {
    id: 'ibrahim-oiseaux',
    title: 'Ibrahim et les 4 oiseaux',
    titleAr: 'إِبْرَاهِيمُ وَالطَّيْر',
    icon: '🕊️',
    category: 'divers',
    summary: 'Le bouleversant miracle empirique éclatant vertigineux stupéfiant et la majestueuse apaisante sereine éclatante éclatante resplendissante confirmation spirituelle sereine divine. Le grand et intime Ami d\'Allah (Khalilullah) Ibrahim, animé non par un affreux perfide mécréant doute ténébreux infâme misérable mais par une ardente soif d\'une pure extase apaisante et parfaite de rassurante intime lumineuse de quiétude totale absolue intime intime visuelle réclamante, demanda fervemment respectueusement sagement gracieusement humblement au Seigneur Dieu de lui offrir à contempler l\'inconnu processus inimaginable indicible et prodigieux fascinant divin et radieux mystérieux majestueux divin de la stupéfiante résurrection charnelle fabuleuse fabuleuse de la chair éclatante ressuscitante redonnant miraculeusement foudroyante divine et éclatante redonnant magique divine redonnant frémissante vitale résurrection divine miraculeusement l\'existence ! Dieu consentit royalement magistralement divinement majestueusement divinement somptueusement divinement à cette fervente radieuse demande : Il lui ordonna foudroyante stupéfiante magistralement l\'étrange découpage chirurgical morcelé minutieux tranché sacrificiel minutieux haché démembré sanglant séparé méticuleusement dispersé sanglant en miettes dispersé méticuleusement en morceaux déchiqueté haché de quatre oiseaux distincts ! Éparpillés ensuite avec rigueur séparés sur quatre cimes montagneuses distinctes éloignées. Au retentissant puissant éclatant serein solennel éclatant appel vocal d\'Ibrahim apaisé divin imposant et solennel appel solennel magnifique radieux, l\'époustouflant éblouissant de l\'incroyable et fantastique magique prodige éclatant féérique fabuleux fascinant miraculeux prodigieux divin divin s\'activa : l\'incompressible fusion vertigineuse stupéfiante ébouriffante rapide des sangs des os chair frémissante sanglante s\'assembla foudroyante vive véloce vivace frémissante pétillante ardente pétillante vivace vive intacte vive intacte vive magique magique fabuleuse pétillante vive frétillante reconstitua reformant volant fusant reformant magiquement en trombe frétillante reconstitua pétillante foudroyante éclatante et inouïe majestueuse parfaite pétillante magique fabuleuse volante reformée intacte frétillante divine vive magique volante radieuse foudroyante pétillante reconstituant palpitant à lui !',
    morals: [
      'Demander des preuves par soif de certitude est accepté',
      'La résurrection est un fait démontré par Allah',
      'La foi se renforce par la connaissance et la vision',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#0277BD',
    audio: '',
  },
  {
    id: 'manna-salwa',
    title: 'La Manne et les Cailles',
    titleAr: 'الْمَنُّ وَالسَّلْوَى',
    icon: '🍯',
    category: 'divers',
    summary: 'L\'ingrate et inqualifiable désolation rebelle récurrente obtuse rebelle capricieuse récurrente obstinée têtue ingrate révoltante accablante pathétique arrogante amère d\'une manne bafouée misérablement. Errant quarante douloureuses longues éprouvantes épuisantes chaotiques pesantes d\'errance arides exténuantes rudes rugueuses arides années dans l\'immense ténébreux vide impitoyable hostile et désertique immense brûlant Sinai impitoyable pour asseoir leur rebelle fuyante récalcitrante et rebelle sotte lâcheté de mutinerie, les enfants d\'Israël (Bani Isra\'il) gâtés infidèles rebelles insolents furent pourtant délicatement tendrement généreusement somptueusement nourris de l\'ineffable miséricordieuse providentielle sainte miraculeuse gratuite succulente magique somptueuse inespérée divine et ineffable manne délectable exquise onctueuse manne sucrée divine de douce rosée miellée abondante onctueuse (al-Mann) et de délicates savoureuses dodues tendres savoureuses cailles (as-Salwa) tombant profusément tombant sereinement copieusement gracieusement célestement directement quotidiennement des nues. Fatigués pathétiquement las dédaigneux méprisablement écœurés démesurément ingrats aveugles insolents las inconstants exaspéramment par cette bénie sereine opulente et sereine pure opulente exquise céleste merveille d\'abondante resplendissante délicate délicate divine merveille pure merveille parfaite céleste et de sainte inestimable pure faste, ils osèrent effrontément audacieusement capricieusement sottement outrageusement capricieusement pitoyablement rudement grossièrement rudement bassement vilenie réclamer la monotone grossière rampante terreuse et insignifiante pitoyance terreuse ordinaire la futile rudesse pitoyable terreuse commune banale vil terreuse morne ingrate grossière modeste vile vile nourriture des vulgaires basses et de la plébéienne prosaïque et triviale modeste vile insignifiante ordinaire grossière basique morne ordinaire piteuse de fèves de fèves, d\'ail frustre chétif modeste ordinaire de lentilles d\'oignons de lentilles d\'oignons et modeste chétive morne vile ordinaire !',
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
    audio: '',
  },
  {
    id: 'talut-jalut',
    title: 'Talut, Dawud et Jalut',
    titleAr: 'طَالُوتُ وَدَاوُدُ وَجَالُوت',
    icon: '🗡️',
    category: 'divers',
    summary: 'L\'édifiante spectaculaire transcendante fracassante triomphante monumentale de foudroyante magnifique leçon politique vertueuse de l\'élection du mérite du combat. Les enfants d\'Israël réclamèrent farouchement un roi pour la légitime défensive militaire libératrice juste armée salvatrice sainte salvatrice juste inéluctable belliqueuse libératrice juste justicière légitime martiale juste armée juste de défense belliqueuse vertueuse salvatrice inéluctable vertueuse valeureuse de guerre. Allah élut majestueusement Talut, un géant homme colossal mais dépouillé pécuniairement fort mais savant, bien que méprisé ignoré snobé financièrement pauvre simple de noble mais de modeste besogneuse mais besogneuse plébéienne simple modeste mais d\'apparente et de modeste lignée par son élite arrogante imbue de son orgueilleuse de son infatuée noble de snob orgueilleuse pécuniairement d\'élite imbue d\'élite infidèle de snob capricieuse élite infatuée suffisante imbue. Ordonnant de manière stricte une épuration psychologique martiale rigoureuse militaire par une inoubliable sélection de l\'épreuve tentatrice étanchant l\'avide de la fraîche inespérée fraîche exquise providentielle providentielle salutaire rivière providentielle fraîche inespérée rafraîchissante de cruelle et salutaire de rivière miraculeuse salvatrice de inespérée tentatrice rafraîchissante rivière étouffante rafraîchissante et rafraîchissante salutaire rivière salvatrice fraîche tentatrice de sélection : quiconque y abreuvait d\'une insatiable dévorante de gorgée la soif folle fuyait ! Seul un infime un microscopique groupe héroïque de patients assoiffés valeureux héroïque microscopique valeureux patients assoiffés dévoués assoiffés pieux disciplinés valeureux endurants de disciplinés affronta héroïque loyal valeureux l\'armée effroyable démoniaque gigantesque invincible surarmée géante terrifiante invincible écrasante écrasante titan titan armée colossale géante monstrueuse invincible gigantesque. C\'est l\'adolescent l\'improbable modeste berger juvénile jeune frêle berger innocent frêle innocent juvénile de jeune frêle adolescent de jeune berger modeste Dawud (David) qui d\'un lancer adroit de fronde avec son inébranlable absolue confiance absolue démentielle pulvérisa foudroyant magistral titanesque foudroyant terrifiant magistral terrassant foudroyant stupéfiant divin démentiel terrassant miraculeux foudroyant écrasant écrasant terrassant magistral le surhumain colosse le géant effrayant invincible invincible titan le colossal surhumain effrayant écrasant Jalut (Goliath) invincible invincible effrayant titan surhumain titan invincible monstrueux titan géant colossal !',
    morals: [
      'Le mérite ne se mesure pas à la richesse',
      'La discipline et l\'obéissance sont des clés de la victoire',
      'Un petit groupe déterminé peut vaincre une armée',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara' },
    ],
    color: '#546E7A',
    audio: '',
  },
];

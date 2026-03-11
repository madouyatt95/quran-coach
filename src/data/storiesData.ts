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
    summary: 'Le peuple de \'Aad était une civilisation ancienne établie dans la région d\'Al-Ahqaf, au Yémen. Allah leur avait accordé une puissance physique exceptionnelle et une grande prospérité, leur permettant de bâtir Iram, la cité aux colonnes, dont les monuments étaient sans pareils. Cependant, cette force les mena à l\'arrogance et à l\'idolâtrie. Ils pensèrent que personne ne pourrait les vaincre. Le Prophète Houd leur fut envoyé pour les appeler au monothéisme et leur rappeler les bienfaits d\'Allah. Malgré ses avertissements répétés sur plusieurs années, les \'Aad persistèrent dans leur superbe et défièrent le châtiment divin. Allah leur envoya alors une sécheresse prolongée, suivie d\'un nuage qu\'ils prirent pour de la pluie bénéfique. En réalité, ce nuage portait un vent glacial et dévastateur qui souffla sans interruption pendant sept nuits et huit jours. À son passage, le vent déracinait les hommes et les constructions, laissant le pays dévasté, jonché de corps semblables à des troncs de palmiers évidés.',
    morals: [
      'La puissance physique et matérielle ne protège pas de la punition divine',
      'L\'arrogance mène à la ruine',
      'Les civilisations les plus avancées ne sont pas à l\'abri de la destruction',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf', startAyah: 65 },
      { number: 11, name: 'Hud', startAyah: 50 },
      { number: 26, name: 'Ash-Shu\'ara', startAyah: 123 },
      { number: 41, name: 'Fussilat', startAyah: 15 },
      { number: 46, name: 'Al-Ahqaf', startAyah: 21 },
      { number: 54, name: 'Al-Qamar', startAyah: 18 },
      { number: 69, name: 'Al-Haaqqa', startAyah: 4 },
      { number: 89, name: 'Al-Fajr', startAyah: 6 },
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
    summary: 'Les Thamoud succédèrent au peuple de \'Aad et s\'installèrent à Al-Hijr. Excellant dans l\'art de la pierre, ils taillaient leurs demeures directement dans les montagnes pour se protéger et affirmer leur puissance. Le Prophète Salih les appela à n\'adorer qu\'Allah, mais les notables du peuple exigèrent un miracle pour le croire : ils lui demandèrent de faire sortir d\'un rocher spécifique une chamelle vivante et enceinte. Allah exauça ce vœu, et la chamelle devint un signe vivant parmi eux. Elle partageait l\'eau de la source avec le peuple, buvant un jour sur deux. Salih les avertit de ne lui faire aucun mal. Malheureusement, la haine et l\'orgueil prirent le dessus. Neuf hommes corrompus complotèrent et tuèrent la chamelle. Salih leur annonça alors qu\'il ne leur restait que trois jours à vivre. Au lever du soleil du quatrième jour, un cri terrifiant (Sayhah) venu du ciel les foudroya tous, les laissant sans vie dans leurs habitations rocheuses.',
    morals: [
      'Détruire les signes d\'Allah entraîne la destruction',
      'L\'art et la civilisation sans foi n\'ont aucune valeur',
      'Le défi envers les miracles divins est fatal',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf', startAyah: 73 },
      { number: 11, name: 'Hud', startAyah: 61 },
      { number: 26, name: 'Ash-Shu\'ara', startAyah: 141 },
      { number: 27, name: 'An-Naml', startAyah: 45 },
      { number: 54, name: 'Al-Qamar', startAyah: 23 },
      { number: 91, name: 'Ash-Shams', startAyah: 11 },
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
    summary: 'Pharaon (Fir\'awn) dirigeait l\'Égypte avec une tyrannie absolue, asservissant les Enfants d\'Israël et ordonnant le massacre de leurs nouveau-nés mâles pour empêcher l\'avènement d\'un sauveur annoncé. Son arrogance atteignit son paroxysme lorsqu\'il se proclama lui-même "Dieu le Très-Haut". Allah envoya Moïse (Musa) et son frère Aaron pour l\'appeler à la foi et libérer leur peuple. Malgré les miracles éclatants de Moïse — son bâton se transformant en serpent et sa main devenant lumineuse — et les neuf plaies qui frappèrent l\'Égypte, Pharaon resta sourd à la vérité, accusant Moïse de magie. Lorsque Moïse guida les Enfants d\'Israël vers la sortie d\'Égypte de nuit, Pharaon les poursuivit avec une immense armée. Arrivés devant la Mer Rouge, Moïse frappa l\'eau de son bâton et la mer se fendit, offrant un passage à sec. Pharaon et ses soldats s\'y engouffrèrent à leur suite, mais les flots se refermèrent sur eux, les noyant tous. Au moment de mourir, Pharaon tenta de proclamer sa foi, mais il était trop tard. Allah décida de préserver son corps pour qu\'il serve de leçon aux générations futures.',
    morals: [
      'Le tyran qui se prend pour Dieu sera humilié',
      'Le repentir au moment de la mort n\'est pas accepté',
      'Le corps de Pharaon préservé est un signe pour les générations futures',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 49 },
      { number: 7, name: 'Al-A\'raf', startAyah: 103 },
      { number: 10, name: 'Yunus', startAyah: 75 },
      { number: 20, name: 'Ta-Ha', startAyah: 24 },
      { number: 26, name: 'Ash-Shu\'ara', startAyah: 10 },
      { number: 28, name: 'Al-Qasas', startAyah: 38 },
      { number: 40, name: 'Ghafir', startAyah: 23 },
      { number: 79, name: 'An-Nazi\'at', startAyah: 17 },
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
    summary: 'Qarun (Coré) faisait partie du peuple de Moïse, mais il se révolta contre lui par jalousie et fierté. Allah l\'avait gratifié d\'une fortune immense, à tel point que les clés de ses coffres étaient trop lourdes pour être portées par un groupe d\'hommes forts. Des gens de son peuple lui conseillèrent de ne pas s\'exalter et d\'utiliser sa richesse pour l\'au-delà, mais il leur répondit avec mépris : "Cette richesse n\'est due qu\'au savoir que je possède". Un jour, il sortit devant son peuple dans tout son apparat, provoquant l\'envie chez certains. Cependant, son refus de reconnaître la grâce d\'Allah et son injustice envers les pauvres entraînèrent sa ruine. Allah fit en sorte que la terre se fende et l\'engloutisse, lui et sa demeure. Aucun de ses richesses ni de ses partisans ne purent le sauver du châtiment divin, montrant ainsi que la réussite matérielle sans la foi est une illusion éphémère.',
    morals: [
      'La richesse est un don d\'Allah, pas un mérite personnel',
      'L\'arrogance due à la richesse mène à la perte',
      'La terre peut engloutir ceux qui abusent de leurs biens',
    ],
    surahs: [
      { number: 28, name: 'Al-Qasas', startAyah: 76 },
      { number: 29, name: 'Al-Ankabut', startAyah: 39 },
      { number: 40, name: 'Ghafir', startAyah: 24 },
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
    summary: 'Le peuple de Madyan habitait une région commerçante prospère, mais leurs pratiques étaient basées sur la corruption et l\'injustice sociale. Ils avaient pour habitude de truquer les balances, de diminuer les mesures et de ne pas respecter leurs engagements financiers, appauvrissant ainsi ceux qui commerçaient avec eux. Le Prophète Shu\'ayb leur fut envoyé pour rétablir la justice. Il les exhorta à abandonner la fraude et à se contenter des gains licites : "Le reste qu\'Allah vous laisse est meilleur pour vous, si vous êtes croyants". Les notables du peuple se moquèrent de lui et le menacèrent d\'expulsion. Finalement, alors qu\'ils persistaient dans leurs péchés, Allah leur envoya un châtiment singulier : après une chaleur accablante, un nuage apparut pour leur offrir de l\'ombre, mais il déversa sur eux une pluie de feu, tandis qu\'un tremblement de terre et un cri (Sayhah) les anéantissaient dans leurs demeures, comme s\'ils n\'y avaient jamais vécu.',
    morals: [
      'L\'honnêteté dans le commerce est un pilier de la société',
      'La fraude économique est un péché majeur',
      'La justice dans les transactions est un devoir religieux',
    ],
    surahs: [
      { number: 7, name: 'Al-A\'raf', startAyah: 85 },
      { number: 11, name: 'Hud', startAyah: 84 },
      { number: 26, name: 'Ash-Shu\'ara', startAyah: 176 },
      { number: 29, name: 'Al-Ankabut', startAyah: 36 },
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
    summary: 'En l\'an 570, année de la naissance du Prophète Muhammad ﷺ, le gouverneur abyssin du Yémen, Abraha, construisit une cathédrale immense à Sanaa pour détourner le pèlerinage arabe de la Ka\'ba vers son édifice. Devant l\'échec de son projet, il décida de détruire la Ka\'ba et mena une armée puissante vers La Mecque, incluant des éléphants de guerre pour terrifier les Arabes. Arrivé aux portes de la ville, son éléphant principal, nommé Mahmoud, refusa d\'avancer vers la Ka\'ba malgré les coups. Alors que l\'armée semblait invincible, Allah envoya des nuées d\'oiseaux, les Ababil, transportant de petites pierres d\'argile cuite. Ces oiseaux bombardèrent les soldats d\'Abraha avec une précision millimétrée. Quiconque était touché par une pierre voyait son corps se décomposer. L\'armée fut totalement anéantie, réduite à l\'état de "paille mâchée", et la Maison d\'Allah fut préservée miraculeusement.',
    morals: [
      'Allah protège Sa Maison sacrée',
      'La supériorité militaire ne vaut rien face à la volonté d\'Allah',
      'Les signes d\'Allah se manifestent dans les événements historiques',
    ],
    surahs: [
      { number: 105, name: 'Al-Fil', startAyah: 1 },
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
    summary: 'Cette histoire relate le sacrifice d\'une communauté croyante face à la tyrannie d\'un roi païen. Un jeune garçon, ayant appris la foi auprès d\'un moine caché, commença à accomplir des miracles par la permission d\'Allah. Le roi, craignant pour son pouvoir, tenta de le tuer plusieurs fois sans succès. Le garçon finit par lui dire : "Tu ne pourras me tuer que si tu rassembles les gens et que tu me tires une flèche en disant : Au nom d\'Allah, le Seigneur de ce garçon". Le roi s\'exécuta et tua le garçon, mais ce sacrifice poussa tout le peuple à embrasser la foi. Fou de rage, le roi ordonna de creuser de larges fossés (Ukhdud) et de les remplir de feu. Il demanda aux croyants de renier leur foi sous peine d\'y être jetés. Hommes, femmes et enfants acceptèrent le martyre avec une patience héroïque plutôt que d\'abandonner leur croyance en l\'Unique. Allah maudit les auteurs de ce massacre et promit aux croyants le Paradis pour leur sacrifice ultime.',
    morals: [
      'Les croyants martyrs sont victorieux même dans la mort',
      'La foi est plus précieuse que la vie',
      'Les tyrans qui persécutent les croyants seront châtiés',
    ],
    surahs: [
      { number: 85, name: 'Al-Buruj', startAyah: 4 },
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
    summary: 'Il s\'agit d\'un groupe parmi les Enfants d\'Israël qui vivait dans une cité côtière. Allah les éprouva en leur interdisant de pêcher le jour du Sabbat (samedi). Pour tester leur foi et leur patience, Allah fit en sorte que les poissons apparaissent en abondance à la surface de l\'eau uniquement le samedi, disparaissant les autres jours de la semaine. Au lieu d\'accepter l\'épreuve, ils cherchèrent des ruses pour contourner l\'interdiction divine : ils installèrent des filets et des barrages le vendredi soir pour piéger les poissons le samedi, et les ramasser le dimanche. Leurs savants se divisèrent en trois groupes : ceux qui dénonçaient ouvertement ce péché, ceux qui se taisaient, et les transgresseurs. Face à cette moquerie des lois divines, Allah transforma les rebelles en singes et en porcs, les humiliant devant tout le peuple pour leur manque d\'intégrité spirituelle.',
    morals: [
      'Ruser avec les interdits d\'Allah revient à les violer',
      'La lettre de la loi ne prime pas sur l\'esprit',
      'Les stratagèmes pour contourner les commandements divins sont vains',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 65 },
      { number: 7, name: 'Al-A\'raf', startAyah: 163 },
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
    summary: 'L\'histoire de Maryam commence avant même sa naissance. Sa mère, la femme de Imran, porta un enfant et fit un vœu solennel : "Seigneur, je T\'ai voué en toute exclusivité ce qui est dans mon ventre. Accepte-le donc de moi". Elle espérait un garçon qu\'elle consacrerait au service du Temple. Mais lorsqu\'elle accoucha d\'une fille, elle dit avec émotion : "Seigneur, voilà que j\'ai accouché d\'une fille — et Allah savait mieux ce dont elle avait accouché — le garçon n\'est pas comme la fille. Je l\'ai nommée Maryam". Allah accepta ce don avec la plus belle acceptation et confia la garde de Maryam au Prophète Zacharie. C\'est dans le Temple que Maryam grandit, isolée du monde, vouée entièrement à l\'adoration. Zacharie, chaque fois qu\'il entrait dans son sanctuaire pour la voir, trouvait auprès d\'elle de la nourriture. Intrigué, il lui demandait : "Ô Maryam, d\'où te vient cela ?". Elle répondait simplement : "Cela vient d\'Allah. Allah donne sans compter à qui Il veut". Ces fruits hors saison — des fruits d\'été en hiver et d\'hiver en été — étaient un signe qu\'Allah la préparait à un miracle bien plus grand. Un jour, alors qu\'elle était seule dans son lieu de prière, un homme apparut devant elle. Terrifiée, elle s\'écria : "Je cherche refuge auprès du Tout Miséricordieux contre toi ! Si tu es un homme pieux, laisse-moi !". L\'apparition répondit : "Je ne suis que le messager de ton Seigneur pour te faire don d\'un fils pur". C\'était l\'Archange Gabriel. Maryam, bouleversée, demanda : "Comment aurais-je un fils, alors qu\'aucun homme ne m\'a touchée et que je n\'ai jamais été une femme de mœurs légères ?". Gabriel répondit : "C\'est ainsi. Ton Seigneur dit : Cela M\'est facile". Par le souffle divin, Maryam conçut Jésus (\'Isa). Lorsque les douleurs de l\'accouchement la surprirent, seule et loin de tous, elle s\'agrippa à un tronc de palmier desséché dans le désert. La souffrance physique et la peur du jugement de son peuple la submergèrent au point qu\'elle s\'écria : "Malheur à moi ! Que je fusse morte avant cet instant ! Que je fusse oubliée à jamais !". Mais une voix la rassura d\'en dessous d\'elle : "Ne t\'afflige pas ! Ton Seigneur a placé à tes pieds une source d\'eau. Secoue vers toi le tronc du palmier, il fera tomber sur toi des dattes fraîches et mûres". Le palmier sec reverdit et donna ses fruits, l\'eau jaillit du sol aride. Fortifiée, Maryam prit son nouveau-né et retourna vers son peuple. Les regards accusateurs fusèrent immédiatement : "Ô Maryam ! Tu as commis une chose monstrueuse ! Ô sœur d\'Aaron, ton père n\'était pas un homme indécent et ta mère n\'était pas une femme impure !". Pour toute réponse, Maryam, obéissant à l\'instruction divine de garder le silence, pointa du doigt le nourrisson dans ses bras. Les gens s\'indignèrent : "Comment parlerions-nous à un bébé au berceau ?". C\'est alors que le miracle éclata : le bébé Jésus ouvrit la bouche et déclara : "Je suis vraiment le serviteur d\'Allah. Il m\'a donné le Livre et m\'a désigné prophète. Où que je sois, Il m\'a rendu béni, et Il m\'a recommandé la prière et la charité tant que je vivrai". Cette scène — un nourrisson parlant au berceau pour défendre l\'honneur de sa mère — reste l\'un des miracles les plus bouleversants du Coran.',
    morals: [
      'La piété féminine est exemplaire dans le Coran',
      'La confiance en Allah dans la solitude et l\'épreuve',
      'La chasteté et la dévotion sont récompensées',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran', startAyah: 35 },
      { number: 19, name: 'Maryam', startAyah: 16 },
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
    summary: 'Luqman n\'était ni prophète ni roi — selon les traditions, il était un homme de condition modeste, peut-être un charpentier ou un berger d\'Éthiopie. Mais Allah l\'avait distingué parmi tous les hommes de son époque en lui accordant un don rare : la Hikma, cette sagesse profonde qui permet de voir au-delà des apparences et de comprendre les vérités éternelles. Le Coran consacre une sourate entière à son nom, non pour ses exploits guerriers ou sa richesse, mais pour une seule scène : le moment où il s\'assit avec son fils et lui transmit les fondements d\'une vie juste. Luqman commença par le pilier de tout : "Ô mon fils, n\'associe rien à Allah, car l\'association est vraiment une injustice énorme". Il ne se contenta pas d\'interdire l\'idolâtrie — il lui expliqua que c\'est la plus grande injustice qui existe, car elle revient à attribuer à des créatures impuissantes les droits du Créateur. Puis il aborda la question des parents avec une nuance remarquable. Allah Lui-même interrompt le discours de Luqman pour rappeler : "Nous avons commandé à l\'homme la bienveillance envers ses père et mère. Sa mère l\'a porté de faiblesse en faiblesse". Luqman ajouta cependant une limite : si les parents poussent à l\'idolâtrie, il ne faut pas leur obéir dans ce domaine, tout en continuant à les traiter avec bonté dans la vie quotidienne. Ensuite, Luqman utilisa une image saisissante pour enseigner à son fils la science infinie d\'Allah : "Ô mon fils, même si tes actions ne pesaient que le poids d\'un grain de moutarde, et qu\'il se trouvait dans un rocher, ou dans les cieux ou dans la terre, Allah le fera venir. Allah est Subtil et Parfaitement Informé". Rien n\'échappe à Allah, même l\'atome le plus infime caché dans les profondeurs de la pierre. Il poursuivit avec les devoirs pratiques : "Ô mon fils, accomplis la prière, commande le bien, interdis le mal et endure ce qui t\'arrive avec patience. Car cela fait partie des choses recommandées". Enfin, il conclut par des leçons de comportement social d\'une finesse extraordinaire : "Ne détourne pas ton visage des gens par mépris, et ne marche pas sur terre avec arrogance. Car Allah n\'aime pas le prétentieux plein de gloriole. Sois modeste dans ta démarche et baisse ta voix, car la plus détestée des voix est celle de l\'âne". Cette dernière comparaison — comparer le haussement de voix arrogant au braiment de l\'âne — illustre parfaitement le style de Luqman : direct, imagé, impossible à oublier.',
    morals: [
      'La sagesse est un don d\'Allah',
      'L\'éducation des enfants est un devoir sacré',
      'L\'humilité est la marque du sage',
    ],
    surahs: [
      { number: 31, name: 'Luqman', startAyah: 12 },
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
    summary: 'Dhul-Qarnayn — "Celui aux deux cornes" — était un souverain à qui Allah avait accordé un pouvoir et des moyens sans précédent sur terre. Le Coran raconte trois de ses grandes expéditions. Lors de son premier voyage vers l\'Ouest, il atteignit l\'endroit où le soleil semblait se coucher et trouva un peuple. Allah lui donna le choix : "Ô Dhul-Qarnayn, soit tu les châties, soit tu uses de bonté envers eux". Sa réponse révéla sa justice : "Quant à celui qui est injuste, nous le châtierons, puis il sera ramené à son Seigneur qui le punira d\'un châtiment terrible. Et quant à celui qui croit et fait le bien, il aura une belle récompense". Lors de son deuxième voyage vers l\'Est, il découvrit un peuple vivant dans une terre sans abri contre le soleil — des gens si primitifs qu\'ils n\'avaient ni maisons ni vêtements pour se protéger. Dhul-Qarnayn les laissa en paix. Puis vint son troisième et plus célèbre voyage. Il arriva entre deux immenses montagnes et rencontra un peuple dont la langue était à peine compréhensible. Ces gens, terrorisés, lui expliquèrent leur malheur : "Ô Dhul-Qarnayn ! Ya\'juj et Ma\'juj commettent des ravages sur terre. Pouvons-nous te verser un tribut pour que tu construises une barrière entre eux et nous ?". Ces tribus sauvages de Ya\'juj et Ma\'juj déferlaient sur eux périodiquement, pillant, tuant et détruisant tout sur leur passage. La réponse de Dhul-Qarnayn fut celle d\'un roi humble devant Allah : "Ce que mon Seigneur m\'a conféré vaut mieux que vos tributs. Aidez-moi plutôt par la force de vos bras, et je placerai un rempart entre vous et eux". Il refusa leur argent mais accepta leur travail. Alors commença un chantier titanesque. Il ordonna : "Apportez-moi des blocs de fer". Les gens charrièrent des tonnes de minerai entre les deux flancs des montagnes. Lorsque le fer combla entièrement l\'espace entre les deux parois rocheuses, il commanda : "Soufflez !". Des soufflets géants attisèrent le feu jusqu\'à ce que tout le fer devienne rouge incandescent. Puis il ordonna : "Apportez-moi de l\'airain fondu, que je le déverse dessus". Le cuivre en fusion coula sur le fer brûlant, fusionnant les deux métaux en une muraille infranchissable, lisse comme un miroir, impossible à escalader et impossible à percer. Ya\'juj et Ma\'juj vinrent s\'y heurter et échouèrent. Mais Dhul-Qarnayn, au sommet de sa gloire d\'ingénieur et de conquérant, ne s\'attribua aucun mérite. Il déclara simplement : "C\'est une miséricorde de mon Seigneur. Mais lorsque la promesse de mon Seigneur viendra, Il le réduira en poussière, et la promesse de mon Seigneur est vérité". Même la plus grande construction humaine n\'est que temporaire face à la volonté d\'Allah.',
    morals: [
      'Le pouvoir doit être utilisé pour protéger les opprimés',
      'La justice est la base du leadership',
      'Même le plus grand pouvoir humain est temporaire',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf', startAyah: 83 },
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
    summary: 'Un jour, le Prophète Moïse (Musa) donna un sermon si éloquent aux Enfants d\'Israël que quelqu\'un lui demanda : "Existe-t-il sur terre quelqu\'un de plus savant que toi ?". Moïse répondit : "Non". Allah lui révéla alors qu\'un serviteur, au confluent des deux mers, possédait une science que Moïse ne possédait pas. Piqué dans son humilité, Moïse se mit en route avec son jeune serviteur Yusha\' ibn Nun, emportant un poisson salé dans un panier. Allah leur avait indiqué un signe : là où le poisson disparaîtrait, ils trouveraient cet homme. Au confluent des deux mers, le poisson salé revint miraculeusement à la vie et sauta dans l\'eau, laissant une trace dans la mer comme un tunnel. Après avoir dépassé l\'endroit sans s\'en apercevoir, Moïse réalisa l\'oubli et ils revinrent sur leurs pas. Là, assis sur un rocher au bord de l\'eau, ils trouvèrent un homme enveloppé d\'un vêtement vert — Al-Khidr, le serviteur d\'Allah doté d\'une science directement inspirée. Moïse lui demanda : "Puis-je te suivre pour que tu m\'enseignes ce que tu as appris ?". Al-Khidr répondit avec franchise : "Tu ne pourras pas être patient avec moi. Comment pourrais-tu être patient face à ce dont tu n\'as aucune connaissance ?". Moïse promit d\'être patient et de ne poser aucune question. Ils embarquèrent alors sur un bateau appartenant à de pauvres pêcheurs qui les transportèrent gratuitement par générosité. En pleine mer, Al-Khidr arracha une planche du fond du bateau, y ouvrant un trou. Moïse, horrifié, s\'écria : "L\'as-tu percé pour noyer ses passagers ? Tu as commis une chose monstrueuse !". Al-Khidr lui rappela : "N\'ai-je pas dit que tu ne pourrais pas être patient ?". Moïse s\'excusa. Plus loin sur la route, ils croisèrent un groupe d\'enfants qui jouaient. Al-Khidr repéra un garçon parmi eux, alla vers lui et le tua. Moïse, bouleversé, éclata : "As-tu tué un être innocent qui n\'a tué personne ? Tu as commis une chose abominable !". Al-Khidr le rappela encore une fois à sa promesse. Moïse, tremblant de honte, dit : "Si je te questionne après cela, ne m\'accompagne plus". Ils marchèrent ensuite jusqu\'à une ville et demandèrent l\'hospitalité à ses habitants. Ceux-ci refusèrent catégoriquement de les nourrir ou de les héberger. Alors qu\'ils traversaient la cité inhospitalière, Al-Khidr aperçut un mur sur le point de s\'écrouler. Sans que personne ne le lui demande, et sans réclamer aucun salaire, il le reconstruit de ses propres mains. Moïse ne put se retenir : "Si tu voulais, tu aurais au moins exigé un salaire pour cela !". Al-Khidr déclara alors : "Ceci marque la séparation entre toi et moi. Je vais t\'informer de l\'interprétation de ce que tu n\'as pu supporter". Le bateau appartenait à des pêcheurs pauvres. En le rendant défectueux, Al-Khidr les avait sauvés, car juste derrière eux, un roi tyran confisquait de force tous les bateaux en bon état. Le garçon allait grandir pour devenir un mécréant cruel qui aurait brisé le cœur de ses parents pieux par sa tyrannie et son impiété — Allah le remplacerait par un enfant meilleur. Et le mur abritait un trésor enfoui par un père vertueux pour ses deux fils orphelins — si le mur s\'était écroulé, les habitants avares de la ville auraient découvert et volé cet héritage avant que les orphelins ne soient assez grands pour le récupérer. Al-Khidr conclut : "Je ne l\'ai pas fait de ma propre initiative. Voilà l\'interprétation de ce que tu n\'as pas pu supporter avec patience".',
    morals: [
      'La sagesse humaine est limitée',
      'Ce qui semble mauvais peut être un bien caché',
      'Il ne faut pas juger sur les apparences',
      'Allah voit ce que nous ne voyons pas',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf', startAyah: 60 },
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
    summary: 'Dans une époque ancienne, un roi tyrannique régnait sur une cité où il imposait le culte des idoles et persécutait quiconque osait adorer un Dieu unique. Dans cette atmosphère de terreur, un petit groupe de jeunes hommes — le Coran ne précise pas leur nombre exact, laissant les gens spéculer entre trois, cinq ou sept — refusèrent de se prosterner devant les statues. Ils se dirent entre eux : "Nos concitoyens ont pris en dehors d\'Allah des divinités. Pourquoi ne produisent-ils pas une preuve évidente ?". Sachant que leur désobéissance signifiait la mort, ils prirent une décision courageuse : fuir. Ils quittèrent la ville avec leur chien fidèle et trouvèrent une caverne dans la montagne. En s\'y installant, ils levèrent les mains et implorèrent : "Seigneur ! Accorde-nous de Ta part une miséricorde et assure-nous un bon dénouement de notre affaire !". Allah exauça leur prière d\'une manière qu\'aucun d\'eux n\'aurait imaginée : Il leur scella les oreilles — les plongeant dans un sommeil si profond que rien ne pouvait les réveiller — et cela dura 309 ans. Pendant ces trois siècles, Allah veilla sur eux avec une attention miraculeuse. Le soleil, à son lever, s\'écartait de la caverne vers la droite, et à son coucher, s\'éloignait vers la gauche — ne les frappant jamais directement pour ne pas brûler leur peau. Ils se trouvaient dans un espace ouvert de la caverne, recevant juste assez d\'air frais. Et pour préserver leurs corps de la décomposition, Allah les faisait se retourner durant leur sommeil : tantôt sur le côté droit, tantôt sur le côté gauche. Leur chien, couché à l\'entrée, les pattes étendues, montait la garde. Quiconque les aurait aperçus se serait enfui de terreur, tant leur apparence était saisissante — des corps immobiles mais vivants, les yeux grands ouverts sans qu\'ils ne voient rien. Puis vint le jour du réveil. Allah les ressuscita. Le premier à parler demanda : "Combien de temps avons-nous dormi ?". Les autres répondirent : "Nous avons dormi un jour, ou une partie d\'une journée". Sentant la faim, ils envoyèrent l\'un d\'entre eux en ville avec des pièces d\'argent en lui recommandant la discrétion. Mais quand le jeune homme présenta ses pièces au marchand de nourriture, celui-ci les examina avec stupeur : ces monnaies dataient de plusieurs siècles ! L\'affaire remonta jusqu\'aux autorités. On découvrit que la cité avait entre-temps embrassé le monothéisme. Le roi tyrannique et ses idoles n\'étaient plus qu\'un lointain souvenir. Les Gens de la Caverne réalisèrent alors l\'ampleur du miracle qu\'ils avaient vécu. Leur sommeil de trois siècles devint la preuve la plus éclatante que la résurrection est réelle : Celui qui peut endormir des hommes pendant 309 ans et les ramener intacts peut certainement ressusciter les morts le Jour du Jugement.',
    morals: [
      'La fuite pour préserver sa foi est légitime (Hijra)',
      'Allah protège ceux qui Le choisissent',
      'Le temps est relatif et entre les mains d\'Allah',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf', startAyah: 9 },
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
    summary: 'À l\'aube de l\'humanité, les deux premiers fils d\'Adam — Habil (Abel) et Qabil (Caïn) — se trouvèrent confrontés à la première épreuve de jalousie que le genre humain ait connue. Selon la tradition, chacun devait épouser la sœur jumelle de l\'autre, mais Qabil refusa car la sœur qui lui était destinée était moins belle que sa propre jumelle. Pour trancher le différend, Adam leur ordonna d\'offrir chacun un sacrifice à Allah : celui dont l\'offrande serait acceptée aurait raison. Habil, berger de son état, choisit le meilleur de son troupeau — un bélier gras et sans défaut — et l\'offrit avec une sincérité totale. Qabil, cultivateur, prit de ses récoltes les plus médiocres — des épis maigres et des grains abîmés — et les présenta avec le cœur absent. Le signe de l\'acceptation divine se manifesta : un feu descendit du ciel et consuma l\'offrande de Habil, tandis que celle de Qabil resta intacte, rejetée. La jalousie, déjà présente, se transforma en rage noire dans le cœur de Qabil. Il gronda : "Je te tuerai !". Face à cette menace de mort, Habil ne paniqua pas, ne s\'enfuit pas et ne menaça pas en retour. Il répondit avec une noblesse d\'âme désarmante : "Allah n\'accepte que de la part de ceux qui Le craignent. Si tu étends ta main vers moi pour me tuer, moi je n\'étendrai pas la main vers toi pour te tuer, car je crains Allah, le Seigneur des mondes. Je veux que tu portes mon péché en plus du tien, et tu seras alors parmi les compagnons du Feu". Habil refusa de lever la main sur son frère, même pour se défendre, préférant subir l\'injustice plutôt que la commettre. Mais ces paroles n\'atteignirent pas le cœur endurci de Qabil. Son ego finit par l\'emporter, et il tua son frère. Le Coran décrit ce moment avec une précision glaçante : "Son âme l\'incita à tuer son frère. Il le tua donc et devint l\'un des perdants". Le premier sang humain coula sur cette terre, et la mort — jusque-là inconnue de l\'humanité — fit son entrée dans l\'histoire. C\'est à la suite de cet événement qu\'Allah révéla la loi universelle : "Quiconque tue un être humain — en dehors d\'un meurtre ou d\'une corruption sur terre — c\'est comme s\'il avait tué tous les hommes".',
    morals: [
      'La jalousie est destructrice',
      'Tuer un innocent équivaut à tuer l\'humanité entière (5:32)',
      'Le regret après le mal ne suffit pas à l\'effacer',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida', startAyah: 27 },
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
    summary: 'Lorsque la huppe de Sulayman revint de son voyage de reconnaissance et décrivit le royaume de Saba — gouverné par une femme assise sur un trône magnifique, dont le peuple se prosternait devant le soleil — Sulayman rédigea une lettre et l\'envoya par la huppe. La lettre commençait par : "Au nom d\'Allah, le Tout Miséricordieux" et disait : "Ne soyez pas hautains envers moi et venez à moi en soumission". Quand Bilqis reçut cette lettre, elle ne réagit pas par l\'émotion mais par l\'intelligence. Elle réunit son conseil : "Ô notables ! Conseillez-moi dans cette affaire. Je ne tranche aucune affaire sans que vous ne soyez présents". Ses généraux, gonflés d\'orgueil, lui répondirent : "Nous sommes dotés de force et d\'une grande puissance guerrière. Le commandement t\'appartient". Ils voulaient la guerre. Mais Bilqis, avec une sagesse rare pour une dirigeante face à une menace, refusa la confrontation. Elle déclara : "Quand les rois envahissent une cité, ils la corrompent et humilient les plus distingués de ses habitants". Elle choisit plutôt la diplomatie et envoya de riches cadeaux pour sonder les intentions de Sulayman. Quand les émissaires arrivèrent avec leurs présents somptueux, Sulayman les repoussa avec mépris : "Voulez-vous me tenter avec des biens ? Ce qu\'Allah m\'a donné vaut mieux que ce qu\'Il vous a donné. Retournez vers eux ! Nous viendrons à eux avec des armées auxquelles ils ne pourront résister !". Bilqis comprit qu\'elle n\'avait pas affaire à un roi ordinaire motivé par la richesse, et décida de se rendre en personne. Pendant qu\'elle était en route, Sulayman se tourna vers sa cour et demanda : "Ô notables ! Qui de vous m\'apportera son trône avant qu\'ils n\'arrivent ?". Un djinn puissant (Ifrit) proposa de le faire avant que Sulayman ne se lève de son siège. Mais un homme doté de la science du Livre dit : "Je te l\'apporterai avant que tu n\'aies cligné de l\'œil". En un instant, le trône magnifique de Bilqis se matérialisa devant Sulayman. Il en fit modifier certains détails pour tester la perspicacité de la reine. À son arrivée, on lui demanda : "Ton trône ressemble-t-il à ceci ?". Elle répondit avec finesse : "On dirait que c\'est lui". Elle ne dit pas "oui" catégoriquement — car il y avait des différences — ni "non" — car la ressemblance était frappante. Puis vint l\'épisode final : on l\'invita à entrer dans le palais de Sulayman. En franchissant le seuil, elle vit un sol d\'une clarté éblouissante et le prit pour une étendue d\'eau profonde. Par réflexe, elle releva sa robe pour ne pas la mouiller, dévoilant ses jambes. Sulayman lui révéla : "C\'est un palais pavé de cristal". Ce n\'était pas de l\'eau, mais du verre transparent sous lequel coulait de l\'eau. Bilqis, frappée par l\'ampleur de ce qu\'elle venait de vivre — le transport de son trône, le palais de cristal, la puissance qui dépassait tout ce qu\'elle connaissait — reconnut avec humilité : "Seigneur ! Je me suis fait du tort à moi-même. Je me soumets avec Salomon à Allah, Seigneur de l\'univers".',
    morals: [
      'Une femme peut être une dirigeante sage et juste',
      'L\'intelligence et le dialogue mènent à la vérité',
      'Le dialogue vaut mieux que la guerre',
    ],
    surahs: [
      { number: 27, name: 'An-Naml', startAyah: 23 },
      { number: 34, name: 'Saba', startAyah: 15 },
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
    summary: 'La scène se passe au cœur du palais de Pharaon, dans la salle du conseil où siègent les courtisans et les ministres les plus puissants d\'Égypte. Pharaon vient de décréter la mort de Moïse. Haman, son vizir, approuve. Les courtisans acquiescent en silence. La sentence semble scellée. C\'est alors qu\'un homme se lève — un membre de la propre famille de Pharaon, un courtisan respecté qui, jusqu\'à cet instant, avait dissimulé sa foi en Allah au sein même de la cour la plus idolâtre du monde. Le Coran ne donne pas son nom, mais immortalise son discours, l\'un des plus courageux de l\'histoire humaine. Il ouvrit par une question de bon sens percutante : "Allez-vous tuer un homme simplement parce qu\'il dit : Mon Seigneur est Allah, alors qu\'il vous est venu avec des preuves évidentes de la part de votre Seigneur ?". Puis il leur présenta un raisonnement imparable : "S\'il ment, son mensonge retombera sur lui. Mais s\'il dit vrai, alors une partie de ce dont il vous menace vous atteindra certes. Allah ne guide pas celui qui est outrancier et menteur". Il ne leur demandait pas de croire — juste de faire preuve de prudence logique. Après cette entrée, il éleva le ton et rappela les destins tragiques des peuples passés : "Ô mon peuple ! Je crains pour vous un jour semblable à celui des peuples coalisés ! Un destin semblable à celui du peuple de Noé, des \'Aad, des Thamoud et de ceux qui vinrent après eux. Allah ne veut aucune injustice pour Ses serviteurs". Il les avertit ensuite du Jour du Jugement avec une émotion croissante : "Ô mon peuple ! Je crains pour vous le Jour de l\'appel réciproque, le jour où vous tournerez le dos en fuyant sans que personne ne vous protège contre Allah". Face à l\'indifférence de Pharaon et aux murmures hostiles de la cour, l\'homme ne recula pas. Il poursuivit en évoquant l\'histoire de Joseph : "Joseph vous est venu avec des preuves évidentes, mais vous n\'avez cessé d\'avoir des doutes sur ce qu\'il vous apportait". Son plaidoyer se fit de plus en plus pressant, de plus en plus personnel. Il termina par cette supplique déchirante : "Ô mon peuple ! Suivez-moi, je vous guiderai au chemin de la droiture. Ô mon peuple ! Cette vie n\'est que jouissance temporaire, alors que l\'au-delà est la demeure de la stabilité". Pharaon et Haman complotèrent contre lui, mais le Coran conclut avec une phrase d\'une puissance extraordinaire : "Allah le protégea des maux qu\'ils tramèrent tandis que le pire châtiment cerna la famille de Pharaon".',
    morals: [
      'Le courage de défendre la vérité même en milieu hostile',
      'La foi peut exister dans les endroits les plus inattendus',
      'Un seul homme courageux peut faire la différence',
    ],
    surahs: [
      { number: 40, name: 'Ghafir', startAyah: 28 },
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
    summary: 'Par un jour ordinaire, un homme pieux nommé Uzayr cheminait sur son âne à travers une contrée qu\'il connaissait bien. Il emportait avec lui un panier contenant des figues fraîches et une gourde de jus pressé pour son voyage. Mais lorsqu\'il atteignit l\'emplacement de la cité — identifiée par les exégètes comme Jérusalem après sa destruction par Nabuchodonosor — le spectacle qui s\'offrit à lui le figea. Là où s\'élevaient autrefois des maisons animées, des marchés bruyants et des rues pleines de vie, il ne restait plus que des murs effondrés, des toits éventrés, des ossements humains éparpillés sur le sol et un silence de mort. Pas un oiseau dans le ciel, pas une plante vivante, rien que la désolation la plus totale. Uzayr s\'arrêta, descendit de son âne, et contempla longuement ce cimetière à ciel ouvert. Une question monta dans son esprit, non pas par doute, mais par émerveillement devant l\'ampleur de la destruction : \"Comment Allah pourrait-Il redonner vie à cette cité après sa mort ?\". Comment ces os redeviendraient-ils des hommes ? Comment ces ruines redeviendraient-elles des demeures ? À peine cette pensée eut-elle traversé son esprit qu\'Allah le fit mourir sur place, là, au milieu des ruines, à côté de son âne et de son panier de provisions. Cent ans passèrent. Un siècle entier. Durant ces cent années, la cité fut reconstruite pierre par pierre, de nouvelles générations naquirent et grandirent, la vie reprit ses droits, et le monde continua de tourner — tandis qu\'Uzayr gisait immobile, figé dans la mort, invisible du monde. Puis, au bout de ces cent ans, Allah le ressuscita. Uzayr ouvrit les yeux. Pour lui, c\'était comme s\'il avait simplement fermé les paupières un instant. Le soleil était dans le ciel, l\'air était tiède, et il se sentait parfaitement reposé. Une voix lui demanda : \"Combien de temps es-tu resté ainsi ?\". Uzayr réfléchit brièvement et répondit : \"Je suis resté un jour, ou une partie d\'une journée\". La voix lui révéla alors la vérité stupéfiante : \"Non. Tu es resté cent ans\". Pour lui prouver cette réalité, on lui dit : \"Regarde ta nourriture et ta boisson : elles n\'ont pas changé\". Uzayr se tourna vers son panier : les figues étaient aussi fraîches que le matin où il les avait cueillies, le jus n\'avait pas tourné — pas une moisissure, pas une altération après un siècle. Puis on lui dit : \"Et regarde ton âne\". Il se retourna vers l\'endroit où se tenait autrefois sa monture et ne trouva qu\'un squelette blanchi par le temps, les os dispersés et desséchés par cent étés. Alors, sous ses yeux médusés, le miracle de la résurrection se déroula en temps réel. Les os de l\'âne se mirent à bouger, glissant sur le sol les uns vers les autres, se reconnectant dans l\'ordre exact — les vertèbres s\'emboîtèrent, les côtes se refermèrent, les pattes se reformèrent. Puis des tendons rouges apparurent, enveloppant les os, suivis par des couches de muscles qui gonflèrent et prirent forme. La chair recouvrit les muscles, puis la peau s\'étendit par-dessus, et enfin le pelage repoussa. En quelques instants, l\'âne était debout devant lui, vivant, braillant comme si rien ne s\'était passé. Uzayr, les larmes aux yeux, murmura avec une conviction qui venait du plus profond de son être : \"Je sais qu\'Allah est Omnipotent\". Il avait posé une question sur la résurrection — Allah lui avait fait vivre la réponse dans sa propre chair.',
    morals: [
      'La résurrection est une réalité prouvée par des signes',
      'Le doute sincère reçoit une réponse d\'Allah',
      'Allah montre Ses signes à ceux qui cherchent',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 259 },
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
    summary: 'Le Coran met en scène deux amis aux conditions radicalement différentes. L\'un était un homme immensément riche, propriétaire de deux jardins paradisiaques bordés de palmiers, plantés de vignes luxuriantes, avec des céréales poussant entre les arbres. Une rivière traversait ses terres, assurant une irrigation permanente. Rien ne manquait à ses récoltes. L\'autre était un croyant modeste, sans grandes possessions. Un jour, le riche invita son ami à visiter ses jardins. Il y entra en se faisant du tort à lui-même, c\'est-à-dire que son cœur bascula dans l\'arrogance au moment même où il contempla sa fortune. Il déclara : "Je ne pense pas que ceci puisse jamais périr. Et je ne pense pas que l\'Heure viendra. Et si on me ramenait vers mon Seigneur, je trouverais sûrement meilleur que ceci en retour". Il venait de nier à la fois la fragilité des biens terrestres et le Jour du Jugement, tout en se croyant méritant devant Allah. Son ami croyant, au lieu de l\'envier, le mit en garde avec une sagesse empreinte de fraternité : "Aurais-tu mécru en Celui qui t\'a créé de poussière, puis de sperme, puis t\'a façonné en homme ? Quant à moi, Allah est mon Seigneur et je n\'associe personne à mon Seigneur". Il lui conseilla ensuite de prononcer les mots que tout musulman connaît : "En entrant dans ton jardin, tu aurais dû dire : C\'est par la volonté d\'Allah ! Il n\'y a de puissance que par Allah (Mâ shâ\' Allâh, lâ quwwata illâ billâh)". Mais le riche resta sourd, engourdi par sa propre magnificence. Peu de temps après, la sentence divine tomba. Un fléau venu du ciel s\'abattit sur les deux jardins : les vignes furent arrachées, les palmiers brisés, les fruits pourris, et l\'eau de la rivière s\'enfonça dans le sol, disparaissant à jamais. Le terrain devint une surface glissante et stérile, incapable de porter quoi que ce soit. L\'homme, dévasté, se mit à retourner ses mains de désespoir devant ses jardins effondrés, là où il avait tant dépensé et tant espéré. Il répétait, trop tard : "Que n\'ai-je associé personne à mon Seigneur...". Il n\'eut personne pour le secourir en dehors d\'Allah, et il ne put se secourir lui-même.',
    morals: [
      'La richesse est éphémère',
      'L\'arrogance due aux biens matériels est destructrice',
      'Les bonnes œuvres qui perdurent sont meilleures que la richesse',
    ],
    surahs: [
      { number: 18, name: 'Al-Kahf', startAyah: 32 },
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
    summary: 'Un vieil homme vertueux possédait un grand verger dont les arbres ployaient sous le poids de fruits magnifiques. Chaque année, au moment de la récolte, il commençait par mettre de côté la part des pauvres. Les indigents et les nécessiteux du voisinage savaient qu\'ils pouvaient compter sur sa générosité, et le verger était béni. À la mort du père, ses fils héritèrent de ce jardin. Mais ils ne partageaient pas la vision de leur père. La cupidité parla plus fort que la charité. Ils se réunirent le soir et complotèrent entre eux : ils iraient cueillir les fruits à l\'aube, avant le lever du soleil, pendant que les pauvres dormaient encore. Ainsi, "aucun miséreux n\'y entrera aujourd\'hui". Ils se jurèrent mutuelle détermination et partirent au petit matin, chuchotant sur le chemin. Le Coran décrit leur marche avec ironie : "Et ils allèrent de bon matin, déterminés dans leur dessein, capables de l\'exécuter". Mais pendant la nuit, alors qu\'ils dormaient, une tempête envoyée par Allah avait dévasté leur verger. Quand ils arrivèrent sur place dans la pénombre de l\'aube, ils ne reconnaissaient pas les lieux. Les arbres étaient noircis, calcinés, réduits en cendres comme après un incendie. Les fruits avaient disparu. Le premier réagit : "Nous nous sommes sûrement trompés de chemin !". Un autre réalisa la vérité et dit : "Non... nous sommes bel et bien là. Mais nous sommes privés de tout". Alors le plus sage d\'entre eux, celui qui les avait pourtant avertis, leur dit : "Ne vous avais-je pas dit de glorifier Allah ?". Le remords les frappa comme une vague. Ils se tournèrent les uns vers les autres en se blâmant mutuellement, puis avouèrent enfin : "Malheur à nous ! Nous avons été de vrais transgresseurs ! Peut-être notre Seigneur nous donnera-t-Il quelque chose de meilleur. C\'est vers notre Seigneur que nous tournons notre espérance". Leur avarice leur avait coûté la totalité de leur héritage en une seule nuit.',
    morals: [
      'L\'avarice et le refus de partager mènent à la perte totale',
      'La charité préserve les biens et les multiplie',
      'Les plans contre les pauvres se retournent contre leurs auteurs',
    ],
    surahs: [
      { number: 68, name: 'Al-Qalam', startAyah: 17 },
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
    summary: 'Le "Verset de la Lumière" (Ayat an-Nur) est l\'un des passages les plus sublimes et les plus médités du Coran. Allah Se propose d\'expliquer Sa lumière aux hommes par une image d\'une beauté inégalée. Il dit : "Allah est la Lumière des cieux et de la terre. Sa lumière est semblable à une niche dans laquelle se trouve une lampe. La lampe est dans un récipient de cristal, et celui-ci ressemble à un astre de grand éclat". La niche, obscure et profonde, représente le cœur du croyant. Dans ce cœur se trouve une lampe — la foi — protégée par un verre si pur qu\'il brille comme une étoile. Cette lampe n\'est pas alimentée par n\'importe quelle huile : elle provient d\'un olivier béni, qui n\'est "ni de l\'Orient ni de l\'Occident", un arbre si parfaitement situé que le soleil l\'éclaire du matin au soir, produisant une huile d\'une pureté si extrême qu\'elle "semble éclairer même sans que le feu ne la touche". C\'est-à-dire que cette huile est si limpide, si proche de la lumière, qu\'elle en est presque lumineuse par elle-même. Et quand cette huile rencontre la flamme, c\'est une "Lumière sur Lumière" (Nur \'ala Nur) — une foi si pure, nourrie par une nature si saine, que la lumière se multiplie, illuminant tout ce qui l\'entoure. Allah conclut : "Allah guide vers Sa lumière qui Il veut, et Allah propose des paraboles aux gens, et Allah est Omniscient". Les savants ont interprété cette parabole comme la description de la foi dans le cœur du croyant sincère : une lumière qui ne vacille pas, protégée par la pureté de l\'intention, alimentée par la connaissance et la gratitude, et qui brille d\'un éclat surnaturel dans un monde plongé dans l\'obscurité de l\'ignorance et du doute.',
    morals: [
      'La guidance divine illumine les cœurs croyants',
      'La foi est une lumière qui éclaire le chemin',
      'Allah guide vers Sa lumière qui Il veut',
    ],
    surahs: [
      { number: 24, name: 'An-Nur', startAyah: 35 },
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
    summary: 'Dans cette parabole, Allah adresse un message cinglant à ceux qui placent leur confiance, leurs espoirs et leur protection dans autre chose que Lui. Que ce soient les idoles de pierre, les faux dieux, les richesses matérielles, ou les alliances humaines, le Coran les compare tous à la demeure de l\'araignée. L\'araignée est une tisseuse remarquable : elle produit son fil de soie avec une précision ingénieuse et construit une toile géométriquement complexe. Mais malgré toute cette ingéniosité, sa maison reste la plus fragile de toutes les demeures du règne animal. Un souffle de vent la déchire, une goutte de pluie la détruit, le moindre prédateur la traverse sans effort. Elle ne protège ni du froid, ni de la chaleur, ni d\'aucun danger. Le Coran déclare : "Ceux qui ont pris des protecteurs en dehors d\'Allah ressemblent à l\'araignée qui s\'est donné une maison. Or la plus fragile des maisons est celle de l\'araignée, si seulement ils savaient !". L\'expression "si seulement ils savaient" ajoute une dimension tragique : ces gens ne se rendent même pas compte de la fragilité de leur refuge. Ils s\'accrochent à des fils invisibles, se croyant en sécurité, alors que tout leur édifice peut s\'effondrer au premier souffle de l\'épreuve. Les exégètes soulignent également un autre aspect remarquable : la science moderne a découvert que la maison de l\'araignée est aussi la plus hostile, car la femelle dévore souvent le mâle après l\'accouplement. Ainsi, la demeure qui devrait être un refuge devient un lieu de destruction interne. De même, ceux qui cherchent protection dans autre chose qu\'Allah trouveront que leur refuge les détruira de l\'intérieur.',
    morals: [
      'Tout support autre qu\'Allah est fragile et illusoire',
      'Les fausses divinités ne protègent de rien',
      'Seul Allah offre une protection véritable',
    ],
    surahs: [
      { number: 29, name: 'Al-Ankabut', startAyah: 41 },
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
    summary: 'Un meurtre fut commis parmi les Enfants d\'Israël et personne ne savait qui était le coupable. Les accusations fusaient dans tous les sens et chacun rejetait la faute sur l\'autre. Ils vinrent trouver Moïse pour qu\'Allah les aide à identifier le meurtrier. Moïse reçut alors un ordre divin simple : "Allah vous ordonne d\'immoler une vache". C\'est tout. N\'importe quelle vache aurait fait l\'affaire. Mais au lieu d\'obéir immédiatement, les Enfants d\'Israël firent ce qu\'ils savaient faire le mieux : compliquer les choses. Ils répondirent avec insolence : "Te moques-tu de nous ?". Moïse, choqué, leur dit : "Qu\'Allah me garde d\'être du nombre des ignorants !". Ce qui aurait dû être un ordre exécuté en une heure se transforma en un interrogatoire interminable. Première question : "Invoque pour nous ton Seigneur pour qu\'Il nous précise ce qu\'elle doit être". Réponse : "Ni vieille ni jeune, d\'un âge moyen". Au lieu d\'obéir, ils poserent une deuxième question : "Invoque pour nous ton Seigneur pour qu\'Il nous précise sa couleur". Réponse : "Une vache jaune, d\'un jaune éclatant, agréable aux regards". Toujours pas satisfaits, ils posèrent une troisième question : "Invoque pour nous ton Seigneur pour qu\'Il nous précise exactement ce qu\'elle est, car les vaches se ressemblent pour nous". Réponse : "Une vache qui n\'a pas été soumise au labourage de la terre, ni à l\'arrosage des champs, une vache saine et sans défaut". À chaque question supplémentaire, Allah avait rendu les critères plus restrictifs. Ce qui aurait pu être n\'importe quelle vache devint une vache d\'âge moyen, jaune vif, n\'ayant jamais labouré, sans la moindre tache — un animal quasiment introuvable. Ils finirent par en trouver une chez un homme qui en demanda un prix exorbitant. Ils l\'immolèrent, "mais ils y étaient réticents" — même au dernier moment, leur obéissance était à contrecur. Puis Moïse leur ordonna de frapper le mort avec un morceau de la vache. Quand ils le firent, le cadavre se redressa momentanément, vivant, et désigna son meurtrier devant tous avant de retomber mort. Allah résuma la leçon : "C\'est ainsi qu\'Allah ressuscite les morts et vous montre Ses signes afin que vous raisonniez".',
    morals: [
      'L\'excès de questions pour retarder l\'obéissance rend les choses plus difficiles',
      'La simplicité dans l\'obéissance est préférable',
      'Obéir promptement à Allah simplifie la vie',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 67 },
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
    summary: 'Allah propose ici l\'exemple d\'une cité qui réunissait tous les ingrédients du bonheur terrestre. Ses habitants vivaient dans une sécurité totale : aucun ennemi ne les menaçait, aucun voleur ne troublait leur tranquillité, et ils pouvaient circuler de jour comme de nuit sans crainte. Leur subsistance leur parvenait en abondance de toutes parts : les caravanes commerciales affluaient de toutes directions, les récoltes étaient généreuses, et ils ne manquaient de rien. Cette cité était un modèle de prospérité et de paix, un bienfait que bien des peuples leur enviaient. Mais au lieu de reconnaître la source de ces dons et de remercier Celui qui les avait comblés, les habitants de cette cité firent preuve d\'une ingratitude profonde (Kufr an-Ni\'mah). Ils prirent ces bienfaits pour acquis, se comportèrent comme si leur prospérité était due à leur propre mérite, et tournèrent le dos à Allah. En conséquence de leur attitude, Allah retourna contre eux les deux choses mêmes dont ils jouissaient le plus. Leur abondance fut remplacée par la famine — le Coran utilise l\'image saisissante de "revêtir les vêtements de la faim" comme si la famine les enveloppait entièrement, collant à leur peau comme un habit. Et leur sécurité fut remplacée par la peur — une terreur permanente qui s\'installa dans leurs cœurs. Ce qui rend cette parabole universelle et intemporelle, c\'est que le Coran ne nomme pas cette cité. Les exégètes suggèrent qu\'il pourrait s\'agir de La Mecque avant l\'Islam, mais le message dépasse tout contexte géographique : toute société, toute nation qui reçoit les bienfaits d\'Allah et y répond par l\'arrogance et l\'oubli court le risque de voir ces bienfaits retirés et remplacés par leur exact contraire.',
    morals: [
      'L\'ingratitude envers les bienfaits d\'Allah les fait disparaître',
      'La sécurité et la prospérité sont des dons à préserver par la gratitude',
      'Le kufr (ingratitude) attire les épreuves',
    ],
    surahs: [
      { number: 16, name: 'An-Nahl', startAyah: 112 },
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
    summary: 'La bataille de Badr est la première grande confrontation entre les Musulmans de Médine et les Qurayshites de La Mecque. Survenant la deuxième année de l\'Hégire, elle fut un tournant décisif. Les Musulmans, au nombre de 313 et peu équipés, faisaient face à une armée mecquoise de 1000 hommes lourdement armés. Le Prophète ﷺ passa la nuit à prier Allah de lui accorder la victoire, craignant que si sa petite communauté était détruite, personne d\'autre n\'adorerait Allah sur terre. Allah répondit à son appel en envoyant des milliers d\'anges pour soutenir les croyants. Malgré leur infériorité numérique, les Musulmans remportèrent une victoire éclatante, tuant plusieurs chefs prestigieux de La Mecque. Badr est devenue le symbole ultime du secours divin accordé à ceux qui placent leur confiance totale en Allah, prouvant que la force réelle ne réside pas dans le nombre mais dans la sincérité de la foi.',
    morals: [
      'La victoire vient d\'Allah, pas du nombre',
      'La foi et la discipline l\'emportent sur la force brute',
      'Allah envoie Son secours à ceux qui Lui font confiance',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran', startAyah: 123 },
      { number: 8, name: 'Al-Anfal', startAyah: 5 },
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
    summary: 'Un an après Badr, les Mecquois revinrent pour se venger avec 3000 hommes au pied du mont Uhud. Le Prophète ﷺ avait établi un plan stratégique en plaçant 50 archers sur une colline avec l\'ordre strict de ne jamais quitter leur poste, quelle que soit l\'issue du combat. Au début, les Musulmans prirent l\'avantage, et voyant l\'ennemi fuir en laissant son butin, la majorité des archers abandonnèrent leur position pour ramasser les richesses, malgré les ordres. Khalid ibn al-Walid, alors général mecquois, saisit cette faille, contourna la montagne et attaqua les Musulmans par derrière. La victoire se transforma en déroute. Le Prophète ﷺ lui-même fut blessé et de nombreux compagnons périrent, dont son oncle Hamza. Uhud fut une leçon douloureuse sur les conséquences de la désobéissance et de l\'attrait pour les biens terrestres, mais aussi une épreuve pour distinguer les croyants sincères des hypocrites.',
    morals: [
      'La désobéissance au commandement cause la défaite',
      'L\'épreuve après la victoire est un test divin',
      'L\'amour du butin peut compromettre la victoire',
    ],
    surahs: [
      { number: 3, name: 'Al-Imran', startAyah: 121 },
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
    summary: 'Aussi appelée bataille du Fossé (Khandaq), cet événement vit une coalition massive de 10 000 hommes, regroupant les Qurayshites et plusieurs tribus arabes et juives, assiéger Médine. Devant cette menace sans précédent, le Prophète ﷺ accepta le conseil de Salman le Perse de creuser une immense tranchée autour de la ville, une tactique inconnue des Arabes. Le siège dura près d\'un mois dans un froid intense et une faim sévère. La tension était extrême, surtout avec la trahison interne d\'une tribu juive. Cependant, les Musulmans restèrent fermes dans leur foi. Allah finit par envoyer un vent glacial et violent qui arracha les tentes des coalisés, éteignit leurs feux et sema la discorde parmi eux. Terrifiés et épuisés par les éléments, ils abandonnèrent le siège et repartirent. Cette bataille marqua la fin des grandes offensives mecquoises contre Médine.',
    morals: [
      'Allah défend les croyants par des moyens invisibles',
      'La stratégie complète la foi',
      'La patience dans le siège mène à la victoire',
    ],
    surahs: [
      { number: 33, name: 'Al-Ahzab', startAyah: 9 },
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
    summary: 'Six ans après l\'Hégire, le Prophète ﷺ et 1400 compagnons partirent vers La Mecque pour accomplir la \'Omra (petit pèlerinage), sans armes et en état de sacralisation (\'Ihram\'). Bloqués à Hudaybiyya par les Mecquois, des négociations s\'engagèrent. Le traité qui en résulta semblait défavorable aux Musulmans : ils devaient retourner à Médine sans faire le pèlerinage et accepter des clauses inégales. De nombreux compagnons, dont Omar, furent frustrés par ces conditions. Cependant, le Prophète ﷺ, guidé par la sagesse divine, accepta la trêve de dix ans. Peu après, la sourate Al-Fath fut révélée, qualifiant ce traité de "victoire éclatante". Hudaybiyya permit en effet une période de paix durant laquelle l\'Islam se propagea massivement, transformant une apparente concession diplomatique en un triomphe stratégique qui prépara la conquête finale de La Mecque.',
    morals: [
      'Ce qui semble une défaite peut être la plus grande victoire',
      'La diplomatie est une force, pas une faiblesse',
      'Allah voit la sagesse au-delà des apparences',
    ],
    surahs: [
      { number: 48, name: 'Al-Fath', startAyah: 1 },
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
    summary: 'Huit ans après l\'Hégire, en réponse à la violation du traité de Hudaybiyya par les alliés des Quraysh, le Prophète ﷺ marcha sur La Mecque avec une armée de 10 000 hommes. Pour éviter toute effusion de sang, il ordonna une entrée pacifique. Les Mecquois, conscients de leur infériorité, n\'opposèrent aucune résistance. Le Prophète ﷺ se rendit à la Ka\'ba, détruisit les 360 idoles qui l\'entouraient en récitant le verset : "La Vérité est venue et l\'Erreur a disparu". Loin de chercher vengeance pour les années de persécution, il accorda une amnistie générale à ses anciens ennemis, déclarant : "Allez, vous êtes libres !". Bilal monta alors sur le toit de la Ka\'ba pour appeler à la prière. Cet événement marqua la fin du paganisme à La Mecque et l\'unification de l\'Arabie sous la bannière de l\'Islam.',
    morals: [
      'La miséricorde en position de force est la plus grande noblesse',
      'Le pardon est plus puissant que la vengeance',
      'La victoire véritable est celle des cœurs',
    ],
    surahs: [
      { number: 110, name: 'An-Nasr', startAyah: 1 },
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
    summary: 'Cet événement miraculeux se déroula en deux phases durant une seule nuit. L\'Isra (voyage nocturne) vit le Prophète ﷺ transporté de La Mecque à Jérusalem (Al-Qods) sur le Buraq, une monture céleste. À la mosquée Al-Aqsa, il dirigea la prière avec tous les prophètes précédents. Ensuite commença le Mi\'raj (ascension) : il monta à travers les sept cieux avec l\'Archange Gabriel, rencontrant des prophètes tels qu\'Adam, Moïse et Jésus à chaque niveau. Il atteignit enfin le "Lotus de la Limite" (Sidrat al-Muntaha), où il fut en présence divine. C\'est lors de cette ascension qu\'Allah prescrivit aux Musulmans les cinq prières quotidiennes. À son retour, bien que les Mecquois se soient moqués de ce récit, Abou Bakr fut le premier à y croire sans hésiter, gagnant ainsi le titre de "As-Siddiq" (le Véridique).',
    morals: [
      'L\'honneur divin vient souvent après l\'épreuve',
      'Les 5 prières sont un cadeau direct d\'Allah',
      'Jérusalem est inséparable de l\'héritage islamique',
    ],
    surahs: [
      { number: 17, name: 'Al-Isra', startAyah: 1 },
      { number: 53, name: 'An-Najm', startAyah: 1 },
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
    summary: 'L\'affaire de l\'Ifk (la calomnie) fut une épreuve sociale et personnelle majeure pour le Prophète ﷺ et sa famille. De retour d\'une expédition, son épouse Aïcha fut accidentellement laissée en arrière alors qu\'elle cherchait son collier. Elle fut ramenée à Médine par un compagnon, Safwan ibn al-Mu\'attal. Des hypocrites, menés par Abdallah ibn Ubayy, saisirent cette occasion pour lancer d\'horribles rumeurs contre elle. La calomnie se propagea dans Médine, plongeant le Prophète ﷺ et Aïcha dans une immense tristesse durant un mois entier, alors que la Révélation tardait à venir. Finalement, Allah fit descendre des versets dans la sourate An-Nur, attestant solennellement de l\'innocence de Aïcha et condamnant sévèrement les calomniateurs. Cet événement fonda des lois juridiques strictes contre la diffamation et montra la valeur de la réputation des croyants.',
    morals: [
      'Ne pas propager de rumeurs sans vérification',
      'La calomnie est un péché majeur',
      'La patience dans l\'accusation injuste est récompensée par l\'innocence divine',
    ],
    surahs: [
      { number: 24, name: 'An-Nur', startAyah: 11 },
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
    summary: 'Le Prophète Sulayman (Salomon) régnait sur un royaume sans pareil dans l\'histoire. Allah lui avait soumis non seulement les hommes, mais aussi les djinns qui bâtissaient pour lui palais et forteresses, et les oiseaux qui le servaient en éclaireurs. Il comprenait le langage de toutes les créatures vivantes, un don qu\'aucun autre roi n\'avait reçu. Un jour, Sulayman mobilisa son armée pour une grande expédition. Le spectacle était saisissant : des colonnes d\'hommes en armure marchaient aux côtés de djinns imposants, tandis que des formations d\'oiseaux couvraient le ciel, le tout avançant en rangs ordonnés à travers le désert. Lorsque cette armée colossale atteignit une vallée où vivait une colonie de fourmis, une petite fourmi sentit le sol trembler sous les pas de cette multitude. Comprenant le danger imminent pour tout son peuple, elle lança un cri d\'alarme à ses compagnes : "Ô fourmis ! Entrez dans vos demeures, de peur que Salomon et ses armées ne vous écrasent sans s\'en rendre compte !". Elle ne les accusa pas de malveillance — elle précisa bien "sans s\'en rendre compte" — faisant preuve à la fois de sagesse et de bonne opinion envers le prophète-roi. Sulayman, grâce au don divin, entendit distinctement cet appel minuscule au milieu du fracas de son armée. Loin de l\'ignorer, il s\'arrêta net. Un sourire ému se dessina sur son visage, non pas de moquerie, mais d\'émerveillement devant la sagesse et le sens des responsabilités de cette créature si infime. Il leva les mains au ciel et prononça cette prière que le Coran immortalise : "Seigneur ! Inspire-moi pour que je rende grâce au bienfait dont Tu m\'as comblé, ainsi qu\'à mes parents, et pour que j\'accomplisse une bonne œuvre que Tu agrées. Fais-moi entrer, par Ta miséricorde, parmi Tes serviteurs vertueux". Cet épisode révèle que le véritable pouvoir ne réside pas dans la capacité de détruire, mais dans la conscience de protéger jusqu\'aux plus faibles.',
    morals: [
      'Le leadership implique la responsabilité de protéger les siens',
      'Même les plus petites créatures ont de la sagesse',
      'La gratitude envers Allah pour Ses dons',
    ],
    surahs: [
      { number: 27, name: 'An-Naml', startAyah: 18 },
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
    summary: 'Le Prophète Sulayman (Salomon) passait régulièrement en revue les rangs de ses troupes, qu\'il s\'agisse des hommes, des djinns ou des oiseaux, car chacun avait un rôle précis dans son royaume. Un jour, lors de l\'inspection des oiseaux, il remarqua l\'absence de la huppe (Al-Hudhud). Irrité par cette désertion non justifiée, Sulayman déclara avec fermeté : "Pourquoi ne vois-je pas la huppe ? Est-elle parmi les absents ? Je la châtierai d\'un dur châtiment, ou je l\'égorgerai, à moins qu\'elle ne m\'apporte un argument clair !". La huppe ne tarda pas à revenir et se présenta devant le roi avec une assurance surprenante pour un si petit oiseau. Elle déclara : "J\'ai appris ce que tu n\'as pas appris ! Je t\'apporte de Saba une nouvelle certaine". Elle raconta alors qu\'elle avait survolé un royaume lointain au Yémen, gouverné par une femme possédant un trône magnifique. Elle avait vu ce peuple prospère se prosterner devant le soleil au lieu d\'adorer Allah. Le Shaytan leur avait embelli leurs œuvres et les avait détournés du droit chemin. Sulayman, au lieu de punir la huppe, écouta attentivement son rapport. Pour vérifier ses dires, il rédigea une lettre au nom d\'Allah, le Tout Miséricordieux, et la confia à la huppe en lui ordonnant : "Pars avec ma lettre que voici, puis lance-la-leur, éloigne-toi d\'eux et observe ce qu\'ils répondront". La huppe s\'envola fidèlement vers Saba et déposa la lettre devant la Reine Bilqis, déclenchant ainsi toute la chaîne d\'événements qui mena à la conversion de la reine et de son peuple. Ce récit montre qu\'un serviteur en apparence insignifiant peut être porteur d\'une information qui change le cours de l\'histoire, et que l\'initiative intelligente est une qualité précieuse.',
    morals: [
      'Même le plus petit serviteur peut apporter une information capitale',
      'L\'observation et l\'initiative sont des qualités précieuses',
      'Chaque créature a un rôle dans le plan d\'Allah',
    ],
    surahs: [
      { number: 27, name: 'An-Naml', startAyah: 20 },
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
    summary: 'Après le premier meurtre de l\'histoire humaine, Qabil (Caïn) se trouva dans une situation que nul être humain n\'avait jamais connue : debout devant le cadavre de son propre frère Habil (Abel), qu\'il venait de tuer sous l\'emprise de la jalousie. La mort n\'existait pas encore dans l\'expérience humaine — personne n\'avait jamais vu un corps sans vie, et personne ne savait ce qu\'il fallait en faire. Qabil resta là, paralysé, portant sur ses épaules le poids écrasant de son crime tandis que le corps de son frère gisait à ses pieds. La culpabilité commença à ronger son âme. Il erra avec le cadavre, ne sachant ni où aller ni comment se débarrasser de cette vision qui le hantait. C\'est alors qu\'Allah, dans Sa sagesse, envoya un signe par l\'intermédiaire de la plus humble des créatures. Un corbeau apparut, tenant dans ses griffes le corps d\'un autre corbeau mort. Sous les yeux de Qabil, l\'oiseau se mit à gratter la terre avec ses pattes et son bec, creusant un trou dans le sol, puis y déposa délicatement le corbeau mort et le recouvrit de terre. Qabil observa la scène, médusé. Un animal, une simple bête noire, savait faire ce que lui, l\'être humain créé par Allah de Ses propres mains, était incapable d\'accomplir. La honte et le désespoir le submergèrent. Il s\'écria dans un cri déchirant : "Malheur à moi ! Suis-je incapable d\'être comme ce corbeau et d\'ensevelir le cadavre de mon frère ?". Il enterra alors son frère, imitant le geste de l\'oiseau, et devint l\'un de ceux rongés par un regret éternel. Ainsi, c\'est un corbeau qui enseigna à l\'humanité le rite de la sépulture, et le premier acte funéraire de l\'histoire fut accompli dans la honte et les larmes d\'un fratricide.',
    morals: [
      'Allah enseigne à travers Ses créatures les plus humbles',
      'Le regret tardif ne ramène pas les morts',
      'Les animaux peuvent être source d\'enseignement',
    ],
    surahs: [
      { number: 5, name: 'Al-Ma\'ida', startAyah: 31 },
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
    summary: 'Le Prophète Ibrahim (Abraham) était déjà l\'ami intime d\'Allah (Al-Khalil), celui qui avait brisé les idoles de son peuple, survécu au bûcher et accepté toutes les épreuves avec une foi inébranlable. Pourtant, un jour, un désir profond naquit dans son cœur : non pas un doute sur la puissance d\'Allah, mais une aspiration à voir de ses propres yeux le mystère de la résurrection. Il s\'adressa à son Seigneur avec une requête audacieuse : "Seigneur ! Montre-moi comment Tu redonnes vie aux morts". Allah, qui connaît les cœurs, lui demanda : "N\'as-tu donc pas cru ?". Ibrahim répondit avec une sincérité désarmante : "Si ! Mais c\'est pour que mon cœur soit apaisé". Il ne doutait pas — il voulait passer de la certitude intellectuelle (\'Ilm al-Yaqin) à la certitude visuelle (\'Ayn al-Yaqin). Allah accepta sa demande et lui donna des instructions précises : "Prends quatre oiseaux, apprivoise-les bien auprès de toi, puis place un morceau de chacun d\'eux sur chaque montagne, puis appelle-les. Ils viendront à toi en hâte". Ibrahim s\'exécuta avec obéissance. Il choisit quatre oiseaux de différentes espèces — selon les exégètes, un paon, un aigle, un coq et un corbeau — et les garda auprès de lui jusqu\'à ce qu\'ils le reconnaissent. Puis vint l\'épreuve : il les immola, mélangea leurs chairs, leurs plumes et leurs os ensemble, et distribua ces fragments sur les sommets de quatre montagnes différentes, ne gardant que leurs têtes dans ses mains. Quand tout fut en place, Ibrahim se tint au milieu et appela les oiseaux par leurs noms. Alors, sous ses yeux émerveillés, les morceaux de chair se mirent en mouvement, chaque fragment volant vers les autres fragments de son espèce, se rejoignant dans les airs, les os se ressoudant, les plumes repoussant, jusqu\'à ce que quatre oiseaux complets et vivants atterrissent devant Ibrahim, chacun retrouvant sa propre tête. Ibrahim contempla ce prodige avec des yeux emplis de larmes et une certitude absolue : "Sache qu\'Allah est Puissant et Sage".',
    morals: [
      'Demander des preuves par soif de certitude est accepté',
      'La résurrection est un fait démontré par Allah',
      'La foi se renforce par la connaissance et la vision',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 260 },
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
    summary: 'Après la traversée miraculeuse de la Mer Rouge et la noyade de Pharaon, Moïse conduisit les Enfants d\'Israël vers la Terre Promise. Mais en raison de leur refus d\'y entrer par peur de ses habitants géants, Allah les condamna à errer quarante ans dans le désert brûlant du Sinaï. Cette errance aurait pu être un calvaire, mais Allah, dans Son infinie miséricorde, les couvrit de bienfaits surnaturels. Pour les protéger du soleil écrasant du désert, Il fit planer au-dessus d\'eux des nuages qui leur faisaient de l\'ombre en permanence, un parasol céleste dans un océan de sable. Pour les nourrir, Il fit descendre chaque matin la Manne (Al-Mann), une substance sucrée et nourrissante qui apparaissait comme de la rosée à l\'aube sur les rochers et les feuilles, et Il envoya des vols de Cailles (As-Salwa) qui se posaient à leur portée, leur offrant une viande tendre et abondante sans qu\'ils aient besoin de chasser. Il fit également jaillir pour eux douze sources d\'eau d\'un rocher, une pour chaque tribu, lorsque Moïse le frappa de son bâton. Malgré cette générosité divine sans précédent — nourris, abreuvés et protégés sans le moindre effort — les Enfants d\'Israël se lassèrent de cette nourriture céleste. Ils vinrent se plaindre à Moïse : "Ô Moïse ! Nous ne pouvons plus supporter une nourriture unique. Invoque pour nous ton Seigneur pour qu\'Il nous fasse sortir de la terre ce qu\'elle fait pousser : des légumes, des concombres, de l\'ail, des lentilles et des oignons !". Ils préféraient les produits les plus banals de la terre aux dons extraordinaires du ciel. Moïse, stupéfait par cette ingratitude, leur répondit avec une tristesse mêlée de reproche : "Voulez-vous échanger le meilleur pour le pire ? Descendez dans n\'importe quelle ville, vous y trouverez ce que vous demandez !". L\'avilissement et la misère furent alors leur lot, car ils avaient mécru aux signes d\'Allah et rejeté Ses bienfaits les plus précieux pour des désirs terrestres.',
    morals: [
      'L\'ingratitude face aux bienfaits divins gratuits est condamnée',
      'Se contenter des dons d\'Allah est une vertu',
      'Préférer le bas monde aux dons divins est une perte',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 57 },
      { number: 7, name: 'Al-A\'raf', startAyah: 160 },
      { number: 20, name: 'Ta-Ha', startAyah: 80 },
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
    summary: 'Des générations après la mort de Moïse, les Enfants d\'Israël traversèrent une période de déclin et de soumission. Leurs ennemis les avaient chassés de leurs terres, tué leurs hommes et capturé l\'Arche d\'Alliance, le coffre sacré contenant les reliques de Moïse et Aaron. Humiliés, ils supplièrent leur prophète de l\'époque : "Désigne pour nous un roi, et nous combattrons dans le sentier d\'Allah". Le prophète, les connaissant, leur répondit : "Et si le combat vous est prescrit, n\'allez-vous pas vous dérober ?". Ils jurèrent que non. Allah choisit alors Talut (Saül) comme roi, un homme d\'origine modeste mais qu\'Allah avait pourvu de qualités exceptionnelles : une science profonde et une puissance physique imposante. Les notables protestèrent aussitôt : "Comment règnerait-il sur nous alors que nous sommes plus dignes de la royauté que lui et qu\'il n\'a pas reçu de fortune ?". Le prophète leur répondit que le signe de sa royauté serait le retour miraculeux de l\'Arche, portée par des anges. Talut rassembla son armée et se mit en marche. Mais avant d\'affronter l\'ennemi, il soumit ses troupes à une épreuve décisive. En arrivant à une rivière, il leur annonça : "Allah va vous éprouver par une rivière : quiconque en boira ne sera pas des miens, et quiconque n\'en goûtera pas sera des miens, sauf celui qui en puisera une seule poignée dans sa main". Malgré cet ordre clair, la grande majorité des soldats, assoiffés par la marche, burent abondamment de la rivière. Sur les milliers de départ, seuls 313 hommes — le même nombre que les combattants de Badr — résistèrent à l\'épreuve et poursuivirent la marche. Quand cette petite troupe fidèle se trouva face à l\'armée colossale de Jalut (Goliath), un guerrier géant réputé invincible, certains faiblirent : "Nous n\'avons pas la force aujourd\'hui contre Jalut et ses troupes". Mais ceux dont la foi était ancrée rétorquèrent : "Combien de fois une petite troupe a-t-elle vaincu une grande avec la permission d\'Allah !". Au moment de l\'affrontement, un jeune berger nommé Dawud (David), qui n\'était ni soldat ni noble, s\'avança face au géant Jalut. Armé d\'une simple fronde et de quelques cailloux, il fit tournoyer sa pierre et frappa Goliath en plein front. Le géant s\'écroula, mort. Son armée, voyant leur champion terrassé, s\'enfuit en déroute. Cette victoire miraculeuse propulsa le jeune David au rang de héros, et Allah lui accorda plus tard la prophétie et la royauté, unissant en lui le pouvoir temporel et la sagesse spirituelle.',
    morals: [
      'Le mérite ne se mesure pas à la richesse',
      'La discipline et l\'obéissance sont des clés de la victoire',
      'Un petit groupe déterminé peut vaincre une armée',
    ],
    surahs: [
      { number: 2, name: 'Al-Baqara', startAyah: 246 },
    ],
    color: '#546E7A',
    audio: '',
  },
];

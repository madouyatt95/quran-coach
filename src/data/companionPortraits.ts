import {companionLifeStories,type CompanionLifeSection} from './companionLifeStories';
/** Original French biographies, with separate hadith and historical references. */
export interface CompanionReference { label: string; url: string; description: string }
export interface CompanionPortrait {
 id: string; nameFr: string; nameAr: string; aliases: string; title: string;
 group: 'caliphs' | 'companions' | 'women'; theme: 'faith' | 'knowledge' | 'solidarity';
 scene: 'dawn' | 'desert' | 'water' | 'garden' | 'night' | 'cave';
 paragraphs: string[]; references: CompanionReference[]; bookId?: string;
 lifeSections?:CompanionLifeSection[];
}
const B=(number:string,description:string):CompanionReference=>({label:`Sahih al-Bukhari ${number}`,url:`https://sunnah.com/bukhari:${number}`,description});
const M=(number:string,description:string):CompanionReference=>({label:`Sahih Muslim ${number}`,url:`https://sunnah.com/muslim:${number}`,description});
const T=(number:string,description:string):CompanionReference=>({label:`Jami‘ at-Tirmidhi ${number}`,url:`https://sunnah.com/tirmidhi:${number}`,description});

const portraitEntries:CompanionPortrait[]=[
 {id:'abu-bakr',nameFr:'Abu Bakr as-Siddiq',nameAr:'أبو بكر الصديق',aliases:'Abou Bakr Aboubakr',title:'La confiance dans les moments décisifs',group:'caliphs',theme:'faith',scene:'cave',bookId:'abu-bakr-confiance',paragraphs:[
  'Dans la grotte, Abu Bakr voit le danger tout près. Son inquiétude est rapportée dans un témoignage précis, avec la réponse du Prophète qui lui rappelle la présence et le secours d’Allah. L’Hégire se découvre ici à hauteur d’un compagnon exposé, et non comme une route dont l’arrivée serait déjà acquise.',
  'D’autres passages le montrent capable de regretter une parole trop dure, puis de chercher le pardon. Après la mort du Prophète, il rappelle à la communauté une vérité coranique au milieu du bouleversement. Ces épisodes dessinent une fidélité qui n’efface ni l’émotion ni la responsabilité de réparer.'
 ],references:[B('3653','La grotte pendant l’Hégire.'),B('3661','Le différend avec Umar et la recherche de réconciliation.'),B('3667','Le décès du Prophète et le rappel d’Abu Bakr.')]},
 {id:'umar',nameFr:'Umar ibn al-Khattab',nameAr:'عمر بن الخطاب',aliases:'Omar Oumar Farouq',title:'La force mise au service d’une responsabilité',group:'caliphs',theme:'faith',scene:'desert',bookId:'umar-responsabilite',paragraphs:[
  'Umar apparaît dans les témoignages avec une force de caractère reconnue. Pourtant, le récit de sa relation avec Abu Bakr conserve aussi un regret et un déplacement pour retrouver celui dont il avait refusé les excuses. La fermeté n’y devient pas une permission de rester enfermé dans son premier mouvement.',
  'Au moment de sa mort, le témoignage d’Amr ibn Maymun suit des préoccupations concrètes : ses dettes, sa succession et la demande d’être enterré auprès de ses compagnons. On découvre ainsi une responsabilité qui se prolonge jusque dans les dernières décisions.'
 ],references:[B('3661','Umar revient chercher Abu Bakr après leur différend.'),B('3700','Derniers jours, dette et consultation pour la succession.')]},
 {id:'uthman',nameFr:'Uthman ibn Affan',nameAr:'عثمان بن عفان',aliases:'Othman Osman Dhun Nurayn',title:'Préserver et transmettre le Coran',group:'caliphs',theme:'knowledge',scene:'dawn',bookId:'uthman-transmission',paragraphs:[
  'Le témoignage d’Anas rapporte une inquiétude de Hudhayfa devant les divergences de récitation. Uthman demande alors les feuillets conservés chez Hafsa et confie à un groupe de compagnons la préparation de copies de référence. La préservation se raconte à travers une demande, une équipe et une consigne précise.',
  'Ce travail n’est pas présenté comme une nouvelle révélation. Il s’appuie sur les feuillets déjà réunis et sur des personnes identifiées. Le parcours d’Uthman permet de comprendre la différence entre l’origine du texte coranique et les étapes de sa transmission écrite.'
 ],references:[B('4987','Demande des feuillets à Hafsa, commission et copies de référence.'),B('3699','Le Prophète sur le mont Uhud avec Abu Bakr, Umar et Uthman.')]},
 {id:'ali',nameFr:'Ali ibn Abi Talib',nameAr:'علي بن أبي طالب',aliases:'Aly Abou Tourab',title:'Le courage et l’attention aux siens',group:'caliphs',theme:'solidarity',scene:'night',bookId:'ali-proximite',paragraphs:[
  'À Khaybar, les compagnons attendent de savoir à qui sera confié l’étendard. Ali, qui souffre des yeux, est appelé. Le récit associe cette responsabilité à une invitation à transmettre le message avant de combattre : le courage ne se réduit pas au rapport de force.',
  'Un autre témoignage ouvre la porte de son foyer avec Fatima. La fatigue du travail domestique conduit à demander une aide, puis à recevoir un enseignement de rappel avant le sommeil. Ces deux scènes rapprochent la responsabilité publique et la vie quotidienne.'
 ],references:[B('3701','L’étendard à Khaybar et l’appel adressé aux habitants.'),B('5361','Fatima, Ali et le rappel avant le sommeil.')]},
 {id:'talha',nameFr:'Talha ibn Ubaydillah',nameAr:'طلحة بن عبيد الله',aliases:'Talhah Talha ibn Oubaydillah',title:'La main qui a protégé',group:'companions',theme:'solidarity',scene:'desert',paragraphs:[
  'Qays ibn Abi Hazim rapporte avoir vu la main de Talha devenue paralysée, celle avec laquelle il avait protégé le Prophète. Cette trace visible fait revenir le geste par lequel il s’est exposé pour protéger le Messager.',
  'Ce portrait prend pour point de départ cette main. Il invite à regarder ce que signifie protéger quelqu’un lorsque cette protection a un coût durable, sans ajouter de dialogue ni de détail absent du passage.'
 ],references:[B('3724','Le témoignage de Qays sur la main de Talha.')]},
 {id:'zubayr',nameFr:'Az-Zubayr ibn al-Awwam',nameAr:'الزبير بن العوام',aliases:'Zoubayr Zubair',title:'Répondre présent',group:'companions',theme:'faith',scene:'desert',paragraphs:[
  'Jabir transmet la parole qui désigne Az-Zubayr comme le disciple du Prophète. Un autre témoignage, celui de son fils Abdullah, rapporte une mission d’observation auprès des Banu Qurayza. La fidélité apparaît dans une responsabilité acceptée et accomplie.',
  'Le lecteur peut rapprocher ces passages sans confondre un titre transmis et les circonstances particulières d’une mission. Leur intérêt est de donner un visage concret à la disponibilité au service des autres.'
 ],references:[B('3719','La désignation comme disciple.'),B('3720','Le souvenir d’Abdullah ibn az-Zubayr pendant une mission de son père.')]},
 {id:'abdurrahman',nameFr:'Abd ar-Rahman ibn Awf',nameAr:'عبد الرحمن بن عوف',aliases:'Abderrahmane Abdr Rahman Auf',title:'Recommencer sans oublier la générosité',group:'companions',theme:'solidarity',scene:'garden',paragraphs:[
  'À Médine, Saad ibn ar-Rabi propose à Abd ar-Rahman une aide considérable. Celui-ci remercie, demande où se trouve le marché et se met à commercer. Le récit maintient ensemble la générosité de l’accueil et la recherche d’une activité.',
  'Un autre passage le montre après son mariage, interrogé sur sa situation puis invité à offrir un repas. Ces scènes éclairent une manière de recommencer sa vie en gardant une place pour la gratitude, le travail et les liens.'
 ],references:[B('2048','L’accueil à Médine et la demande du chemin du marché.'),B('5155','Le mariage et le repas de noces.')]},
 {id:'saad',nameFr:'Saad ibn Abi Waqqas',nameAr:'سعد بن أبي وقاص',aliases:'Sa‘d Saad Abi Waqqâs',title:'Le don qui n’oublie pas la famille',group:'companions',theme:'solidarity',scene:'garden',paragraphs:[
  'Malade, Saad envisage de donner une grande part de ses biens. Le Prophète l’oriente vers une limite et lui rappelle la situation des héritiers. La générosité est ainsi pensée avec la responsabilité envers ceux qui restent.',
  'Le même compagnon apparaît aussi dans les témoignages de courage à Uhud. Lire ces passages côte à côte permet de rencontrer un homme dans des circonstances différentes, sans réduire son histoire au seul champ de bataille.'
 ],references:[B('1295','La maladie de Saad et la limite du legs.'),B('3728','Le soutien du Prophète à Saad lorsqu’il tire ses flèches.')]},
 {id:'said',nameFr:'Said ibn Zayd',nameAr:'سعيد بن زيد',aliases:'Sa‘id Saïd ibn Zayd',title:'Un témoin des premières épreuves',group:'companions',theme:'faith',scene:'night',paragraphs:[
  'Le souvenir transmis par Ibn Umar présente Said et sa famille au temps où leur foi provoquait des persécutions. Ce témoignage permet d’évoquer les débuts difficiles sans transformer tous les récits populaires de conversion en faits également établis.',
  'Sa vie nous rejoint à travers ces liens familiaux mis à l’épreuve. La foi choisie a un coût immédiat, alors que son avenir demeure encore ouvert.'
 ],references:[B('3866','Le témoignage relatif à Said, sa famille et Umar avant sa conversion.')]},
 {id:'abu-ubayda',nameFr:'Abu Ubayda ibn al-Jarrah',nameAr:'أبو عبيدة بن الجراح',aliases:'Abou Oubayda Abu Ubaidah',title:'Être digne de confiance',group:'companions',theme:'solidarity',scene:'dawn',paragraphs:[
  'Le Prophète désigne Abu Ubayda comme l’homme de confiance de cette communauté. Quand une délégation demande qu’une personne digne de confiance l’accompagne, c’est à lui que la mission est confiée.',
  'Le rapprochement de ces deux témoignages donne du relief à cette qualité. La confiance est liée à une tâche à remplir pour d’autres personnes, et non à une réputation simplement proclamée.'
 ],references:[B('3744','La parole sur l’homme de confiance de la communauté.'),B('4380','La mission auprès de la délégation de Najran.')]},
 {id:'bilal',nameFr:'Bilal ibn Rabah',nameAr:'بلال بن رباح',aliases:'Bilâl Bilal Rabah',title:'Une dignité que personne ne peut retirer',group:'companions',theme:'faith',scene:'dawn',bookId:'bilal-dignite',paragraphs:[
  'Umar parle de Bilal avec un respect qui rapproche son nom de celui d’Abu Bakr, l’homme qui l’a affranchi. Le témoignage est bref, mais il refuse de laisser l’ancienne condition d’esclave définir sa valeur.',
  'Dans un autre passage, le Prophète interroge Bilal sur une pratique dont il espère la récompense. Sa réponse porte sur les ablutions et la prière. Le livre suit aussi l’installation de l’appel à la prière, pour retrouver le compagnon derrière une voix devenue familière.'
 ],references:[B('3754','Les paroles d’Umar sur Bilal et son affranchissement.'),B('1149','Les ablutions et la prière de Bilal.'),B('604','La consultation sur l’appel à la prière et le rôle de Bilal.')]},
 {id:'khalid',nameFr:'Khalid ibn al-Walid',nameAr:'خالد بن الوليد',aliases:'Khaled Walid',title:'Assumer le commandement dans l’épreuve',group:'companions',theme:'faith',scene:'desert',paragraphs:[
  'À propos de Muta, Khalid rapporte que plusieurs épées se sont brisées dans sa main. Un autre témoignage suit la succession des chefs et la prise de l’étendard après leur mort. Ces sources présentent une situation éprouvante plutôt qu’une aventure sans danger.',
  'Après la mort de Zayd, Jafar et Abdullah ibn Rawaha, Khalid reprend l’étendard. La succession des chefs donne toute sa gravité à cette responsabilité confiée au milieu de l’épreuve.'
 ],references:[B('3757','Le souvenir de Khalid à Muta.'),B('4262','L’annonce du sort des chefs et la prise de l’étendard.')]},
 {id:'abu-dharr',nameFr:'Abu Dharr al-Ghifari',nameAr:'أبو ذر الغفاري',aliases:'Abou Dharr Abou Dhar Jundub',title:'Chercher avant d’affirmer',group:'companions',theme:'faith',scene:'water',bookId:'abou-dharr-recherche',paragraphs:[
  'Abu Dharr raconte sa recherche du Prophète à La Mecque : les nouvelles entendues, le voyage, la prudence nécessaire et les rencontres. Son témoignage donne une place importante au temps de l’enquête et à l’attente.',
  'Le récit suit ensuite son engagement sans présenter chaque réaction comme une règle à reproduire. Le lecteur retrouve un chemin de recherche, un accueil et une responsabilité envers son peuple.'
 ],references:[M('2473a','Le long témoignage d’Abu Dharr sur sa venue à La Mecque.')]},
 {id:'salman',nameFr:'Salman al-Farisi',nameAr:'سلمان الفارسي',aliases:'Salmane Salman le Perse',title:'Donner à chaque droit sa place',group:'companions',theme:'solidarity',scene:'garden',paragraphs:[
  'Salman rend visite à Abu ad-Darda et découvre un foyer déséquilibré par une pratique qui néglige d’autres obligations. Il intervient au moment du repas puis de la nuit, avant de rappeler les droits du Seigneur, du corps et de la famille.',
  'Le Prophète confirme la justesse de son rappel. Cet épisode devient une entrée pour comprendre l’équilibre : une ferveur sincère ne dispense pas de regarder ceux qui vivent à nos côtés.'
 ],references:[B('1968','La visite de Salman à Abu ad-Darda et la confirmation prophétique.')]},
 {id:'ibn-masud',nameFr:'Abdullah ibn Masud',nameAr:'عبد الله بن مسعود',aliases:'Ibn Massoud Ibn Mas‘ud',title:'Apprendre le Coran et l’écouter',group:'companions',theme:'knowledge',scene:'night',paragraphs:[
  'Le Prophète recommande d’apprendre le Coran auprès de plusieurs compagnons, dont Ibn Masud. Cette recommandation le situe dans une transmission vivante, auprès d’autres personnes explicitement nommées.',
  'Un autre récit montre Ibn Masud récitant devant le Prophète, qui souhaite entendre le Coran de la bouche d’un autre. L’attention à l’écoute rejoint ainsi l’attention à la mémorisation et à l’enseignement.'
 ],references:[B('3806','Les quatre compagnons auprès desquels apprendre le Coran.'),B('5050','La récitation d’Ibn Masud devant le Prophète.')]},
 {id:'musab',nameFr:'Musab ibn Umayr',nameAr:'مصعب بن عمير',aliases:'Mousab Mus‘ab Umayr',title:'Transmettre avant de posséder',group:'companions',theme:'knowledge',scene:'desert',bookId:'musab-transmettre',paragraphs:[
  'Al-Bara se souvient de Musab et d’Ibn Umm Maktum enseignant le Coran à Médine avant l’arrivée du Prophète. Le passage fait apparaître des apprenants et une transmission déjà commencée, avant les grandes scènes publiques de l’Hégire.',
  'Khabbab rapporte ensuite la mort de Musab à Uhud et le manque de tissu pour son linceul. Entre ces deux témoignages, le portrait suit ce qu’un homme peut laisser aux autres lorsque ses biens ne racontent pas la mesure de son œuvre.'
 ],references:[B('3925','Musab et Ibn Umm Maktum enseignent le Coran à Médine.'),B('1276','Le témoignage de Khabbab sur le linceul de Musab.')]},
 {id:'hamza',nameFr:'Hamza ibn Abd al-Muttalib',nameAr:'حمزة بن عبد المطلب',aliases:'Hamzah Abd al Mouttalib',title:'Une perte à Uhud',group:'companions',theme:'faith',scene:'desert',paragraphs:[
  'Le récit de Wahshi porte sur la mort de Hamza à Uhud. Il permet de lire un événement douloureux à partir d’un témoin identifié, tout en gardant la sobriété nécessaire devant la violence.',
  'Bien après, Abd ar-Rahman ibn Awf évoque encore Hamza devant un repas, avec Musab. La mémoire des compagnons morts demeure présente lorsque la communauté connaît davantage d’aisance.'
 ],references:[B('4072','Le témoignage de Wahshi sur la mort de Hamza.'),B('1275','Le souvenir de Hamza et de Musab dans la parole d’Abd ar-Rahman.')]},
 {id:'jafar',nameFr:'Jafar ibn Abi Talib',nameAr:'جعفر بن أبي طالب',aliases:'Jaafar Djaafar Ja‘far',title:'La fraternité au-delà de l’exil',group:'companions',theme:'solidarity',scene:'water',paragraphs:[
  'À Muta, Jafar prend l’étendard après Zayd. Le Prophète annonce à la communauté la mort des chefs, les yeux remplis de larmes. L’affection et la peine ont toute leur place dans ce témoignage.',
  'Ibn Umar salue ensuite son fils en rappelant le surnom des deux ailes. Ce salut garde la mémoire de Jafar dans une relation qui se poursuit avec la génération suivante.'
 ],references:[B('3709','Le salut d’Ibn Umar au fils de Jafar.'),B('4262','Les chefs de Muta et l’annonce de leur mort.')]},
 {id:'abu-hurayra',nameFr:'Abu Hurayra',nameAr:'أبو هريرة',aliases:'Abou Hourayra Abu Hurairah',title:'Garder et transmettre ce que l’on reçoit',group:'companions',theme:'knowledge',scene:'night',paragraphs:[
  'Abu Hurayra rapporte une difficulté à retenir ce qu’il entend puis une invocation du Prophète. Son témoignage permet de parler de mémoire et de transmission sans réduire sa vie à un chiffre de hadiths.',
  'D’autres récits le montrent aussi dans le besoin, notamment autour d’une coupe de lait offerte puis partagée. Le transmetteur n’est pas séparé de l’homme qui a connu la faim et l’accueil.'
 ],references:[B('119','Le témoignage sur la mémoire.'),B('6452','La faim, l’accueil et le partage du lait.')]},
 {id:'khadija',nameFr:'Khadija bint Khuwaylid',nameAr:'خديجة بنت خويلد',aliases:'Khadidja Khadijah',title:'Accueillir la peur et soutenir la vérité',group:'women',theme:'faith',scene:'cave',bookId:'khadija-soutien',paragraphs:[
  'Lorsque le Prophète revient de Hira bouleversé, Khadija l’écoute et lui rappelle les qualités concrètes de sa vie : les liens entretenus, l’aide aux personnes démunies et l’hospitalité. Elle l’accompagne ensuite auprès de Waraqa.',
  'Le salut transmis par Jibril et les souvenirs d’Aicha permettent de poursuivre ce portrait. Le livre suit une présence qui soutient, puis une mémoire qui continue d’être honorée après la mort.'
 ],references:[B('3','Le retour de Hira et l’accompagnement de Khadija.'),B('3820','Le salut transmis à Khadija.'),B('3821','Le souvenir de Khadija dans le témoignage d’Aicha.')]},
 {id:'aicha',nameFr:'Aicha bint Abi Bakr',nameAr:'عائشة بنت أبي بكر',aliases:'Aïcha Aisha Ayesha',title:'Retrouver une parole au milieu de l’épreuve',group:'women',theme:'knowledge',scene:'dawn',bookId:'aicha-innocence',paragraphs:[
  'Aicha raconte une accusation, le bouleversement qu’elle provoque et une longue attente avant que son innocence soit déclarée. Sa propre parole nous fait approcher une épreuve qui touche toute sa vie.',
  'La lecture est accompagnée des passages d’An-Nur sur la rumeur et la responsabilité de transmettre une accusation. L’épisode ne devient pas un prétexte pour exposer la vie privée d’autrui ; il aide à reconnaître les conséquences d’une parole sans preuve.'
 ],references:[B('4141','Le témoignage d’Aicha sur l’épreuve de la calomnie.'),{label:'Coran 24:11-20',url:'https://quran.com/24/11-20',description:'La responsabilité devant la rumeur et la calomnie.'}]},
 {id:'fatima',nameFr:'Fatima az-Zahra',nameAr:'فاطمة الزهراء',aliases:'Fatimah Fatma',title:'De La Mecque aux derniers mois de Médine',group:'women',theme:'solidarity',scene:'night',bookId:'fatima-proximite',paragraphs:[
  'Fatima vient demander une aide face à la fatigue du travail. Le témoignage d’Ali suit cette démarche et le rappel reçu avant le sommeil, en laissant apparaître la réalité des tâches domestiques.',
  'Un autre passage conserve une confidence de son père et le changement de son émotion : des larmes, puis un sourire. La proximité familiale apparaît dans cette parole donnée et gardée.'
 ],references:[B('5361','La demande d’aide et le rappel avant le sommeil.'),B('3624','La confidence du Prophète à Fatima.')]},
 {id:'zayd-thabit',nameFr:'Zayd ibn Thabit',nameAr:'زيد بن ثابت',aliases:'Zaid Thâbit Zayd le scribe',title:'Une confiance plus lourde qu’une montagne',group:'companions',theme:'knowledge',scene:'dawn',bookId:'zayd-thabit-confie',paragraphs:[
  'Abu Bakr confie à Zayd une tâche qui lui paraît plus lourde que le déplacement d’une montagne : réunir les éléments écrits et les témoignages de mémorisation du Coran. Le récit ne dissimule pas sa première hésitation.',
  'Plus tard, il participe au travail demandé par Uthman. Le livre distingue ces deux étapes pour rendre compréhensible une transmission souvent racontée en une seule phrase.'
 ],references:[B('4986','Le rassemblement sous Abu Bakr raconté par Zayd.'),B('4987','La commission des copies sous Uthman.')]},
 {id:'ibn-abbas',nameFr:'Abdullah ibn Abbas',nameAr:'عبد الله بن عباس',aliases:'Ibn Abbâs Abdallah Abbas',title:'Grandir dans la compréhension',group:'companions',theme:'knowledge',scene:'night',paragraphs:[
  'Ibn Abbas prépare de l’eau pour les ablutions du Prophète et reçoit une invocation pour sa compréhension de la religion. Le passage associe un service discret et un encouragement à apprendre.',
  'Dans le récit de la consultation autour de la sourate An-Nasr, Umar lui donne aussi la parole parmi des compagnons plus âgés. Le savoir se révèle dans une explication soumise à l’écoute des autres.'
 ],references:[B('143','L’eau préparée et l’invocation pour Ibn Abbas.'),B('4970','La compréhension de la sourate An-Nasr.')]},
 {id:'ibn-umar',nameFr:'Abdullah ibn Umar',nameAr:'عبد الله بن عمر',aliases:'Ibn Omar Abdallah Oumar',title:'Recevoir un conseil et en faire une habitude',group:'companions',theme:'faith',scene:'night',paragraphs:[
  'Un songe d’Abdullah est raconté au Prophète. La réponse comporte un encouragement à la prière nocturne, et le témoignage conserve la manière dont Abdullah en tient ensuite compte.',
  'Il transmet aussi le conseil de vivre en ce monde comme un étranger ou un voyageur. Ces passages permettent de rencontrer un compagnon à travers les conseils qu’il reçoit puis transmet.'
 ],references:[B('1122','Le songe et l’encouragement à la prière nocturne.'),B('6416','Le conseil du voyageur et le rappel d’Ibn Umar.')]},
 {id:'anas',nameFr:'Anas ibn Malik',nameAr:'أنس بن مالك',aliases:'Anass Anas Malek',title:'Grandir auprès de la douceur',group:'companions',theme:'solidarity',scene:'garden',paragraphs:[
  'Anas se souvient des années passées au service du Prophète et décrit une relation sans humiliations pour ce qu’il avait fait ou laissé de faire. Son témoignage apporte un point de vue précieux sur l’éducation et la vie quotidienne.',
  'Le souvenir d’un enfant appelé Abu Umayr et de son petit oiseau fait aussi partie de cette mémoire. Une attention adressée à un enfant devient un enseignement transmis à des générations.'
 ],references:[M('2309a','Le souvenir d’Anas sur la douceur dans le service.'),B('6203','Abu Umayr et son oiseau.')]},
 {id:'muadh',nameFr:'Muadh ibn Jabal',nameAr:'معاذ بن جبل',aliases:'Mouadh Mu‘adh',title:'Enseigner sans décourager',group:'companions',theme:'knowledge',scene:'desert',paragraphs:[
  'Muadh reçoit un enseignement sur le droit d’Allah et la situation de Ses serviteurs alors qu’il accompagne le Prophète. Le récit garde la proximité du moment et la question qui lui est adressée.',
  'Lorsqu’il est envoyé au Yémen avec Abu Musa, les consignes portent aussi sur la manière de s’adresser aux gens : faciliter et annoncer de bonnes nouvelles sans repousser les personnes. La transmission engage donc autant la méthode que le contenu.'
 ],references:[B('2856','L’enseignement adressé à Muadh pendant le trajet.'),B('4341','Les consignes pour la mission au Yémen.')]},
 {id:'ubayy',nameFr:'Ubayy ibn Kab',nameAr:'أبي بن كعب',aliases:'Oubay Ubayy Kaab Ubay',title:'Être appelé pour le Coran',group:'companions',theme:'knowledge',scene:'dawn',paragraphs:[
  'Ubayy apprend que le Prophète a reçu l’ordre de lui réciter un passage du Coran. Sa question sur le fait d’avoir été nommé et son émotion sont conservées dans le témoignage.',
  'Il figure aussi parmi les personnes auprès desquelles le Prophète recommande d’apprendre le Coran. L’honneur reçu s’accompagne d’une responsabilité de transmission.'
 ],references:[B('3808','Le Prophète annonce à Ubayy qu’il doit lui réciter le Coran.'),B('3806','Les compagnons recommandés pour l’apprentissage du Coran.')]},
 {id:'zayd-haritha',nameFr:'Zayd ibn Haritha',nameAr:'زيد بن حارثة',aliases:'Zaid Hâritha',title:'Un nom, des liens et une responsabilité',group:'companions',theme:'solidarity',scene:'desert',paragraphs:[
  'Ibn Umar rapporte que Zayd était appelé Zayd ibn Muhammad avant le rappel coranique sur la filiation. Le portrait distingue les liens d’affection de la manière de nommer les personnes et leurs pères.',
  'À Muta, Zayd est le premier des chefs dont le Prophète annonce la mort. Le témoignage sur le commandement d’Usama rappellera aussi l’affection et la confiance portées à son père.'
 ],references:[B('4782','Le nom de Zayd et le rappel sur la filiation.'),B('4262','La désignation des chefs à Muta.')]},
 {id:'usama',nameFr:'Usama ibn Zayd',nameAr:'أسامة بن زيد',aliases:'Oussama Ousama Usamah',title:'Apprendre les limites du pouvoir',group:'companions',theme:'solidarity',scene:'desert',paragraphs:[
  'La nomination d’Usama à un commandement suscite des remarques auxquelles le Prophète répond en rappelant la confiance portée auparavant à son père. Le passage fait entendre la responsabilité confiée à un jeune homme.',
  'D’autres témoignages contiennent des rappels sévères qui lui sont adressés, notamment sur le jugement porté sur la foi d’une personne. Le portrait garde ces limites : l’affection et le rang ne suppriment pas la possibilité d’une erreur.'
 ],references:[B('3730','La confiance accordée à Usama et à son père.'),B('4269','Le rappel adressé à Usama après la mort d’un homme ayant prononcé l’attestation.')]},
 {id:'abdullah-rawaha',nameFr:'Abdullah ibn Rawaha',nameAr:'عبد الله بن رواحة',aliases:'Abdallah Rawâha Rawahah',title:'Une parole au milieu de l’effort',group:'companions',theme:'faith',scene:'desert',paragraphs:[
  'Le nom d’Abdullah ibn Rawaha apparaît dans la succession des chefs à Muta. Le Prophète annonce leur sort à la communauté, et le récit ne cache ni la peine ni la gravité du moment.',
  'Après Zayd et Jafar, Abdullah ibn Rawaha prend à son tour l’étendard et meurt. Son nom reste associé à celui de ces compagnons dans la mémoire d’une communauté à laquelle le Prophète annonce leur perte.'
 ],references:[B('4262','L’annonce relative à Zayd, Jafar et Abdullah ibn Rawaha.')]},
 {id:'khabbab',nameFr:'Khabbab ibn al-Aratt',nameAr:'خباب بن الأرت',aliases:'Khabab Khabbâb',title:'Demander du secours dans l’épreuve',group:'companions',theme:'faith',scene:'night',paragraphs:[
  'Khabbab raconte une demande adressée au Prophète pendant les persécutions. La réponse évoque ceux qui ont subi des épreuves avant les musulmans et annonce une sécurité encore éloignée de leur expérience immédiate.',
  'C’est aussi lui qui transmet le souvenir du linceul de Musab. Sa mémoire relie la dureté des commencements à la question de ce qu’un engagement laisse après lui.'
 ],references:[B('3612','La demande de Khabbab pendant les persécutions.'),B('1276','Son témoignage sur Musab après Uhud.')]},
 {id:'asma',nameFr:'Asma bint Abi Bakr',nameAr:'أسماء بنت أبي بكر',aliases:'Asmaa Asmâ Dhat an Nitaqayn',title:'Les gestes qui rendent un départ possible',group:'women',theme:'solidarity',scene:'desert',bookId:'asma-liens',paragraphs:[
  'Asma prépare les provisions du départ vers Médine. Faute d’un lien pour fermer le contenant, sa ceinture est partagée. Son témoignage fait apparaître le travail concret qui rend possible une route souvent racontée seulement à travers ceux qui la parcourent.',
  'Elle interroge aussi le Prophète sur l’accueil de sa mère, qui ne partage pas sa foi. Un autre récit suit les tâches difficiles de son foyer. Ces scènes donnent à voir des liens familiaux, du travail et des choix personnels.'
 ],references:[B('3907','La préparation des provisions de l’Hégire.'),B('2620','La question sur l’accueil de sa mère.'),B('5224','Le travail d’Asma et les noyaux de dattes.')]},
 {id:'hafsa',nameFr:'Hafsa bint Umar',nameAr:'حفصة بنت عمر',aliases:'Hafsa Hafsah Omar',title:'Les feuillets confiés',group:'women',theme:'knowledge',scene:'dawn',paragraphs:[
  'Après le veuvage de Hafsa, Umar propose sa main à Uthman puis à Abu Bakr. Le premier réfléchit puis décline ; le second garde le silence. Lorsque le Prophète demande à l’épouser, Abu Bakr explique qu’il avait gardé confidentielle une intention dont il avait connaissance.',
  'Les feuillets réunis sous Abu Bakr passent ensuite à Umar puis à Hafsa. Lors du travail demandé par Uthman, ils sont empruntés puis rendus. Son nom occupe ainsi une place concrète dans la transmission écrite du Coran.'
 ],references:[B('5122','Le témoignage d’Umar sur le veuvage et le mariage de Hafsa.'),B('4986','La conservation des feuillets chez Hafsa.'),B('4987','L’emprunt des feuillets et leur restitution.')]},
 {id:'umm-salama',nameFr:'Umm Salama',nameAr:'أم سلمة',aliases:'Oum Salama Hind Abi Umayya',title:'La sagesse quand les mots ne suffisent plus',group:'women',theme:'solidarity',scene:'garden',bookId:'umm-salama-sagesse',paragraphs:[
  'Umm Salama transmet une invocation reçue face au deuil et raconte sa propre perte. Le passage ne transforme pas la patience en absence de douleur ; il garde la place d’une personne qui ne voit pas encore comment son avenir pourrait se rouvrir.',
  'À Hudaybiyya, son conseil aide à traverser un moment où les compagnons peinent à agir. Elle propose une démarche concrète, et le récit montre ce qui suit. Son portrait donne toute leur place à l’écoute, au discernement et à l’action.'
 ],references:[M('918b','Umm Salama raconte le deuil d’Abu Salama et l’invocation reçue.'),B('2731','Le conseil d’Umm Salama à Hudaybiyya.')]},
 {id:'umm-sulaym',nameFr:'Umm Sulaym',nameAr:'أم سليم',aliases:'Oum Soulaym Roumaysa Rumaysa',title:'Prendre soin et transmettre',group:'women',theme:'solidarity',scene:'garden',paragraphs:[
  'Umm Sulaym demande une invocation pour Anas, son fils. Ce geste la situe dans la transmission de sa vie au service du Prophète et dans l’attention qu’une mère porte à son avenir.',
  'Le récit de la mort d’un enfant dans son foyer demande une lecture délicate. Il est proposé comme un événement transmis, sans en faire une obligation de cacher un deuil ni une manière imposée de traverser la peine.'
 ],references:[B('6380','La demande d’invocation pour Anas.'),B('1301','Le décès d’un enfant dans le foyer d’Abu Talha.')]},
 {id:'nusayba',nameFr:'Nusayba bint Kab',nameAr:'نسيبة بنت كعب',aliases:'Nousseiba Nusaybah Umm Umara Oum Oumara',title:'La place des croyantes dans le rappel',group:'women',theme:'faith',scene:'dawn',paragraphs:[
  'Le témoignage transmis sous le nom d’Umm Umara al-Ansariyya rapporte une question sur la place des femmes dans le rappel adressé aux croyants. Il est associé au verset qui énumère ensemble les croyants et les croyantes et leurs qualités.',
  'Sa question nous conduit à lire les qualités que le Coran énumère ensemble pour les hommes et les femmes : la foi, la sincérité, la patience, le don et le souvenir d’Allah.'
 ],references:[T('3211','La question d’Umm Umara et le passage d’Al-Ahzab.'),{label:'Coran 33:35',url:'https://quran.com/33/35',description:'Les croyants et les croyantes dans les qualités énumérées.'}]},
 {id:'umm-habiba',nameFr:'Umm Habiba',nameAr:'أم حبيبة',aliases:'Oum Habiba Ramla Abi Sufyan',title:'Un enseignement gardé dans la durée',group:'women',theme:'faith',scene:'night',paragraphs:[
  'Umm Habiba transmet la promesse attachée à douze unités de prière volontaires accomplies dans la journée et la nuit. Son témoignage conserve aussi son attachement à cette pratique après l’avoir entendue.',
  'Elle raconte avoir conservé cette pratique après l’avoir entendue. Les personnes qui transmettent ensuite son témoignage décrivent à leur tour leur attachement à ces prières : une parole reçue devient une habitude partagée.'
 ],references:[M('728a','Le témoignage d’Umm Habiba sur les prières volontaires.')]},
 {id:'safiyya',nameFr:'Safiyya bint Huyayy',nameAr:'صفية بنت حيي',aliases:'Safiya Safiyyah Houyay',title:'Préserver la confiance',group:'women',theme:'solidarity',scene:'night',paragraphs:[
  'Safiyya rend visite au Prophète pendant sa retraite spirituelle. Lorsqu’il la raccompagne et rencontre deux hommes, il précise son identité afin de prévenir une mauvaise interprétation.',
  'Une rencontre ordinaire devient ainsi un enseignement sur la confiance. Une précision donnée à temps peut préserver une relation et éviter qu’un soupçon s’installe.'
 ],references:[B('2035','La visite de Safiyya pendant la retraite spirituelle.')]},
 {id:'juwayriya',nameFr:'Juwayriya bint al-Harith',nameAr:'جويرية بنت الحارث',aliases:'Jouwayriya Juwayriyya',title:'La profondeur d’un rappel',group:'women',theme:'faith',scene:'dawn',paragraphs:[
  'Le Prophète quitte Juwayriya au début du jour puis revient alors qu’elle est encore à sa place de prière. Il lui enseigne un rappel qui évoque la grandeur d’Allah au-delà du simple compte de ce que l’on peut prononcer.',
  'L’épisode invite à comprendre ce que l’on dit. Il ne promet pas qu’une formule dispense de toute présence du cœur ni qu’une pratique se juge seulement au nombre de minutes qui lui sont consacrées.'
 ],references:[M('2726a','Le rappel enseigné à Juwayriya.')]},
 {id:'kaab-malik',nameFr:'Kab ibn Malik',nameAr:'كعب بن مالك',aliases:'Kaab Ka‘b ibn Mâlik',title:'La vérité après les jours remis à demain',group:'companions',theme:'faith',scene:'night',bookId:'kaab-verite',paragraphs:[
  'Kab décrit lui-même les moyens dont il disposait avant Tabouk et la préparation qu’il a sans cesse remise au lendemain. Lorsqu’il ne peut plus rejoindre le départ, il reste face à une faute dont il connaît les circonstances.',
  'Le livre suit son choix de dire la vérité et l’attente du repentir accueilli. Le témoignage est accompagné des versets d’At-Tawba, sans proposer le boycott de cet épisode comme une méthode à reproduire contre une personne en difficulté.'
 ],references:[B('4418','Le long témoignage de Kab sur Tabouk et les cinquante nuits.'),{label:'Coran 9:117-119',url:'https://quran.com/9/117-119',description:'Le repentir accueilli et l’appel à être avec les véridiques.'}]},
 {id:'jabir',nameFr:'Jabir ibn Abdullah',nameAr:'جابر بن عبد الله',aliases:'Jâbir Djabir Abdallah',title:'Une attention qui voit les besoins',group:'companions',theme:'solidarity',scene:'garden',bookId:'jabir-attention',paragraphs:[
  'Le retour d’un voyage, une monture fatiguée, un accord de vente puis un don : le témoignage de Jabir suit des gestes précis qui tiennent compte de ses moyens de vivre. Le récit conserve les conditions de l’accord au lieu d’effacer la transaction derrière sa conclusion généreuse.',
  'Un autre passage montre le poids d’une dette laissée par son père et l’aide reçue pour la rembourser. Ces scènes relient la bienveillance à des situations matérielles concrètes.'
 ],references:[B('2718','Le chameau de Jabir et la condition posée lors de la vente.'),B('2396','La dette du père et la récolte des dattes.')]},
];

const extraReferences:Record<string,CompanionReference[]>={
 zubayr:[B('3129','Abdullah rapporte les dettes de son père et le règlement de son héritage.')],
 khalid:[B('4339','Le Prophète désavoue l’acte de Khalid auprès des Banu Jadhima.')],
 safiyya:[B('5086','Anas rapporte l’affranchissement de Safiyya et sa dot.')],
};
export const companionPortraits:CompanionPortrait[]=portraitEntries.map(p=>{
 const life=companionLifeStories[p.id];
 if(!life)return p;
 return {...p,lifeSections:life.sections,paragraphs:life.sections.flatMap(s=>s.text.split(/\n\s*\n/u)),references:[
  ...p.references,...extraReferences[p.id]||[],
  {label:`Adh-Dhahabi · Siyar alam an-nubala · ${p.nameFr}`,url:`https://ar.wikisource.org/wiki/سير_أعلام_النبلاء/${life.arabicNotice.replaceAll(' ','_')}`,description:'Notice biographique ancienne : origines, parcours et dernières années. Les dates divergentes restent signalées ; les récits historiques ne sont pas assimilés à un hadith authentifié.'},
 ]};
});

export const companionThemes={all:'Tous les portraits',faith:'Foi et persévérance',knowledge:'Savoir et transmission',solidarity:'Entraide et responsabilité'} as const;
export const companionPortraitById=(id:string)=>companionPortraits.find(p=>p.id===id);
export const companionHref=(id?:string)=>id?`/companions?companion=${encodeURIComponent(id)}`:'/companions';

import type { NarrativeBook } from '../../lib/narrativeBooks';

/** Original French narration. Source labels and study notes are never synthesized. */
export const adamBook: NarrativeBook = {
  id: 'adam',
  version: 'adam-conte-2026-10-23-v1',
  status: 'draft',
  title: 'Adam',
  subtitle: 'Le commencement et le chemin du retour',
  category: 'prophet',
  voice: 'George',
  editorialNote: 'Manuscrit original proposé à la relecture. Le récit suit des passages coraniques identifiés pour chaque scène. Les paroles rapportées sont reformulées au discours indirect ; aucun dialogue supplémentaire, lieu d’arrivée sur terre ou détail matériel absent de ces passages n’est ajouté. Les rapprochements entre sourates constituent un ordre de narration pédagogique, sans datation des événements. Un épisode de salutation est également adapté de Sahih al-Bukhari 3326 : son emplacement dans le chapitre est pédagogique et ne fixe pas sa chronologie par rapport à l’enseignement des noms. Aucun récit secondaire non référencé n’est utilisé.',
  sources: [
    { id: 'announcement', type: 'quran', surah: 2, first: 30, last: 33, description: 'L’annonce aux anges, l’enseignement des noms et la reconnaissance des limites du savoir', checkedAt: '2026-10-23' },
    { id: 'refusal', type: 'quran', surah: 2, first: 34, last: 34, description: 'L’ordre de prosternation et le refus d’Iblis', checkedAt: '2026-10-23' },
    { id: 'clay', type: 'quran', surah: 38, first: 71, last: 76, description: 'La création à partir d’argile et l’argument de supériorité avancé par Iblis', checkedAt: '2026-10-23' },
    { id: 'enemy', type: 'quran', surah: 7, first: 12, last: 18, description: 'Le refus, la demande de délai et l’hostilité déclarée', checkedAt: '2026-10-23' },
    { id: 'oath', type: 'quran', surah: 38, first: 77, last: 83, description: 'L’exclusion d’Iblis, le délai et les limites qu’il reconnaît à son projet', checkedAt: '2026-10-23' },
    { id: 'garden', type: 'quran', surah: 2, first: 35, last: 36, description: 'Le séjour dans le Jardin, la limite et le départ', checkedAt: '2026-10-23' },
    { id: 'warning', type: 'quran', surah: 20, first: 115, last: 119, description: 'L’engagement, l’oubli, l’avertissement et la subsistance dans le Jardin', checkedAt: '2026-10-23' },
    { id: 'temptation', type: 'quran', surah: 7, first: 19, last: 22, description: 'La tentation, le serment trompeur et les feuilles du Jardin', checkedAt: '2026-10-23' },
    { id: 'promise', type: 'quran', surah: 20, first: 120, last: 121, description: 'La promesse de durée et de pouvoir, puis la faute', checkedAt: '2026-10-23' },
    { id: 'return', type: 'quran', surah: 7, first: 23, last: 25, description: 'La demande de pardon et la vie sur terre', checkedAt: '2026-10-23' },
    { id: 'mercy', type: 'quran', surah: 2, first: 37, last: 39, description: 'Les paroles reçues, le repentir accueilli et l’annonce d’une guidance', checkedAt: '2026-10-23' },
    { id: 'guidance', type: 'quran', surah: 20, first: 122, last: 123, description: 'Adam choisi, son repentir accueilli et la guidance promise', checkedAt: '2026-10-23' },
    { id: 'greeting', type: 'hadith', collection: 'Sahih al-Bukhari', number: '3326', url: 'https://sunnah.com/bukhari:3326', grade: 'Sahih — recueil de Sahih al-Bukhari', description: 'Extrait consacré à la salutation d’Adam aux anges et à leur réponse ; les autres thèmes du hadith ne sont pas développés ici', checkedAt: '2026-10-23' },
  ],
  chapters: [
    {
      id: 'names',
      title: 'Le savoir et le refus',
      recap: '',
      scenes: [
        {
          id: 'beginning', title: 'Une histoire qui commence par une annonce',
          paragraphs: [
            { text: 'Les anges se prosternent devant Adam. Un ordre leur a été donné, et ils l’accomplissent. Iblis refuse. Ce refus va devenir une hostilité déclarée, puis une menace pour Adam et son épouse. Mais avant de suivre cette menace jusqu’au Jardin, revenons à ce qui a précédé. Au commencement de l’histoire, Allah annonce aux anges qu’Il va établir un être humain sur terre. Adam va recevoir un enseignement.', sources: ['announcement', 'refusal', 'enemy', 'garden'] },
            { text: 'À cette annonce, les anges posent une question. Cet être établira-t-il sur terre le désordre et y versera-t-il le sang ? Eux célèbrent la louange d’Allah et proclament Sa sainteté. Allah leur répond qu’Il sait ce qu’ils ne savent pas. Leur question demeure dans notre mémoire lorsque l’enseignement commence. Ce qui leur échappe va leur être montré : Adam reçoit d’Allah un savoir qu’il pourra ensuite faire connaître.', sources: ['announcement'] },
          ],
          studyNote: 'La question des anges est rapportée en 2:30. Aucune jalousie, désobéissance ou connaissance détaillée de l’avenir ne leur est attribuée dans cette narration.',
        },
        {
          id: 'names', title: 'Ce qu’Adam reçoit',
          paragraphs: [
            { text: 'Adam est créé à partir d’argile. Allah lui enseigne les noms, puis présente aux anges ce dont ils sont invités à donner les noms. Les anges reconnaissent qu’ils ne connaissent que ce qu’Allah leur a enseigné. Ils Le glorifient et reconnaissent Sa science et Sa sagesse. Ils n’avancent pas des noms qu’ils ignorent. Devant ce qui leur est présenté, leur réponse exprime la limite de leur propre connaissance.', sources: ['clay', 'announcement'] },
            { text: 'Adam est appelé à son tour. Il donne les noms qui lui ont été enseignés. Ce qui échappait aux anges vient d’être nommé devant eux. Allah leur rappelle alors Sa connaissance de ce qui est caché dans les cieux et sur la terre, ainsi que de ce qu’ils montrent et dissimulent. Adam a reçu un enseignement ; il a pu répondre grâce à ce qu’il a appris. L’annonce faite aux anges est désormais suivie de cette scène de transmission.', sources: ['announcement'] },
          ],
          studyNote: 'Les noms ne sont pas énumérés dans le manuscrit. Les différentes interprétations de leur étendue demanderaient une étude de tafsir distincte ; elles ne sont pas transformées ici en détails du récit.',
        },
        {
          id: 'greeting', title: 'Une salutation à transmettre',
          paragraphs: [
            { text: 'Un autre enseignement nous est rapporté au sujet d’Adam. Allah lui ordonne d’aller saluer un groupe d’anges et d’écouter la manière dont ils lui répondront. Cette salutation sera la sienne et celle de sa descendance. Adam va donc vers les anges et leur adresse un salut de paix. Ils lui répondent en lui souhaitant la paix et en y ajoutant la miséricorde d’Allah.', sources: ['greeting'] },
            { text: 'Adam avait été invité à écouter leur réponse. Il reçoit ainsi la salutation qu’il lui a été demandé d’apprendre, une parole appelée à se transmettre à ses descendants. Gardons un instant ce geste auprès de l’enseignement des noms : recevoir, écouter, puis transmettre. L’histoire d’Adam porte aussi cette rencontre avec les anges et ce salut de paix qui, de génération en génération, appartiendra à sa descendance.', sources: ['greeting', 'announcement'] },
          ],
          studyNote: 'Épisode attesté par Sahih al-Bukhari 3326, transmis d’après Abu Hurayra. Les salutations sont paraphrasées en français. Aucun ordre chronologique entre cet épisode et la scène des noms n’est affirmé.',
        },
        {
          id: 'refusal', title: 'Un ordre, puis un refus',
          paragraphs: [
            { text: 'Un ordre est alors adressé aux anges : se prosterner devant Adam. Les anges se prosternent. Iblis, lui, refuse. Après l’enseignement des noms, un autre moment décisif s’ouvre. La question porte maintenant sur ce refus. Interrogé sur ce qui l’a empêché d’obéir, Iblis avance une comparaison entre son origine et celle d’Adam. Il affirme avoir été créé de feu, tandis qu’Adam a été créé d’argile, et il se déclare meilleur que lui.', sources: ['refusal', 'clay', 'enemy'] },
            { text: 'Iblis invoque ainsi sa création de feu pour se déclarer supérieur à Adam. L’argile dont Adam est créé devient, dans son argument, une raison de le rabaisser. Il a reçu un ordre, mais il persiste dans son refus. Les anges se sont prosternés ; lui s’est enorgueilli. Sa réponse met en avant ce qu’il prétend être et s’oppose à ce qui lui a été commandé.', sources: ['refusal', 'clay', 'enemy'] },
          ],
          studyNote: 'La prosternation est racontée comme l’exécution d’un ordre divin. Iblis n’est pas qualifié d’ange. La comparaison feu/argile est présentée comme son argument, sans lui donner valeur de vérité.',
        },
        {
          id: 'hostility', title: 'Une hostilité annoncée',
          paragraphs: [
            { text: 'Iblis est chassé. Il demande à être laissé jusqu’au jour où les êtres humains seront ressuscités. Un délai lui est accordé, jusqu’au terme fixé. Il annonce alors qu’il les guettera sur la voie droite, qu’il les abordera de devant et de derrière, de leur droite et de leur gauche. Il prétend que beaucoup ne seront pas reconnaissants. Il jure de les égarer, tout en exceptant les serviteurs sincères d’Allah. Son hostilité est maintenant déclarée.', sources: ['enemy', 'oath'] },
            { text: 'Adam et son épouse vont habiter le Jardin. Ils pourront y manger avec abondance. Une limite leur sera donnée concernant un arbre, et Adam sera averti de l’ennemi qui menace leur séjour. La parole d’Iblis accompagne désormais notre écoute : celui qui a refusé de se prosterner a annoncé son projet d’égarement. Lorsqu’il s’adressera à Adam et à son épouse, il prétendra pourtant leur vouloir du bien.', sources: ['garden', 'warning', 'temptation'] },
          ],
          studyNote: 'Le rapprochement de 7:12-18 et 38:77-83 suit les éléments communs du récit. Le texte ne fixe ni durée du séjour dans le Jardin ni intervalle entre les scènes.',
        },
      ],
    },
    {
      id: 'temptation',
      title: 'La promesse trompeuse',
      recap: 'Adam a reçu un enseignement. Iblis a refusé l’ordre de se prosterner et déclaré son hostilité. Adam et son épouse habitent maintenant le Jardin.',
      scenes: [
        {
          id: 'abundance', title: 'L’abondance et la limite',
          paragraphs: [
            { text: 'Adam et son épouse habitent le Jardin. Ils peuvent profiter de sa nourriture où ils le souhaitent. La faim, la soif, la nudité et l’exposition à la chaleur ne doivent pas y être leur condition. C’est dans cette abondance qu’une limite leur est confiée : ils ne doivent pas approcher d’un arbre. Leur séjour s’accompagne ainsi d’une possibilité largement ouverte et d’un interdit précis. Pour comprendre ce qui va suivre, il faut garder ensemble ces deux éléments.', sources: ['garden', 'warning', 'temptation'] },
            { text: 'Adam reçoit aussi un avertissement concernant Iblis : cet ennemi l’est pour lui et pour son épouse. Il ne doit pas les faire sortir du Jardin, car Adam connaîtrait alors la peine. Il est donc averti avant que la tentation ne survienne. L’ennemi a été désigné. La limite a été donnée. Adam connaît ce qu’il doit préserver et le danger dont il doit se garder.', sources: ['warning'] },
          ],
          studyNote: 'Les bienfaits énumérés viennent de 20:118-119. Le manuscrit ne décrit ni paysage, ni espèce de l’arbre, ni apparence physique des personnages.',
        },
        {
          id: 'whisper', title: 'Une parole qui promet davantage',
          paragraphs: [
            { text: 'Satan vient pourtant les tenter. Sa parole attire leur attention sur l’arbre interdit et lui associe une promesse. Il présente la limite comme ce qui les empêcherait d’accéder à un autre état, d’être des anges ou de demeurer indéfiniment. Il va jusqu’à leur jurer qu’il est pour eux un conseiller sincère. Celui dont l’hostilité a été annoncée se présente maintenant sous les traits d’un conseiller.', sources: ['temptation'] },
            { text: 'À Adam, Satan promet un arbre d’immortalité et un pouvoir qui ne s’userait pas. Dans les paroles du tentateur, l’arbre prend un autre visage. Ce qui a été défendu devient ce qu’il invite à désirer. Il fait miroiter la durée et la permanence. Il met devant Adam la promesse de quelque chose qui ne passerait pas, alors que l’avertissement reçu lui a déjà indiqué la manière de préserver son séjour.', sources: ['promise', 'warning'] },
            { text: 'Dans le Jardin, Adam et son épouse ont de quoi manger. Ils ont reçu l’autorisation d’en profiter, avec cette limite concernant l’arbre. C’est pourtant vers cet arbre que Satan cherche à les conduire. Il a déclaré son hostilité ; il jure maintenant leur donner un conseil sincère. Il menace leur séjour ; il promet maintenant de demeurer. Sa parole trompeuse s’interpose entre ce qui leur a été accordé et l’ordre qu’ils ont reçu.', sources: ['garden', 'warning', 'temptation', 'promise'] },
          ],
          studyNote: 'Les promesses sont attribuées au tentateur. Le manuscrit ne les présente pas comme les propriétés réelles de l’arbre. Les deux sourates apportent des formulations complémentaires ; elles ne sont pas assemblées en un dialogue fictif.',
        },
        {
          id: 'fault', title: 'Le moment où tout change',
          paragraphs: [
            { text: 'Adam et son épouse mangent de l’arbre. Leur nudité leur apparaît et ils commencent à assembler sur eux des feuilles du Jardin pour se couvrir. À la promesse de durée et de pouvoir succède ce geste concret : chercher des feuilles, les assembler sur soi. Tous deux ont mangé. Tous deux se couvrent maintenant. Ce qui leur avait été caché leur est apparu, et l’acte qui vient d’être accompli les place devant ses conséquences.', sources: ['temptation', 'promise'] },
            { text: 'Leur Seigneur les interpelle. Ne leur a-t-Il pas interdit cet arbre ? Ne les a-t-Il pas avertis que Satan était pour eux un ennemi déclaré ? L’ordre et l’avertissement leur sont rappelés. Adam a oublié l’engagement qui lui avait été confié. Il n’a pas tenu ferme, il a désobéi à son Seigneur et s’est égaré. Les promesses du tentateur ont conduit jusqu’à ce moment où la faute est désormais accomplie.', sources: ['temptation', 'warning', 'promise'] },
            { text: 'Adam avait reçu les noms et les avait fait connaître. Il a également reçu un engagement auquel il vient de manquer. L’enseignement et la faute appartiennent maintenant tous deux à son histoire. Adam et son épouse vont répondre à leur Seigneur. Après le geste de se couvrir vient un autre mouvement : se tourner vers Lui et reconnaître ce qu’ils ont fait. Leur réponse ouvre le dernier chapitre.', sources: ['announcement', 'warning', 'promise', 'return'] },
          ],
          studyNote: 'L’acte est attribué aux deux époux. Aucune responsabilité exclusive de l’épouse, aucune pomme, aucun serpent et aucune durée de tentation ne sont ajoutés.',
        },
      ],
    },
    {
      id: 'guidance',
      title: 'Le chemin du retour',
      recap: 'Adam et son épouse ont mangé de l’arbre malgré l’interdit. Ils cherchent à se couvrir et leur Seigneur leur rappelle l’avertissement reçu. Ils vont maintenant Lui répondre.',
      scenes: [
        {
          id: 'recognition', title: 'Reconnaître et demander',
          paragraphs: [
            { text: 'Adam et son épouse s’adressent ensemble à leur Seigneur. Ils reconnaissent le tort qu’ils se sont fait à eux-mêmes. Ils demandent Son pardon et Sa miséricorde, et reconnaissent qu’ils seront parmi les perdants s’ils ne les reçoivent pas. Après l’interdit franchi et l’avertissement rappelé, c’est cette demande qu’ils présentent. Ils se tournent vers Allah avec la reconnaissance de leur tort et le besoin de Son pardon.', sources: ['return'] },
            { text: 'Plus tôt dans l’histoire, Iblis avait justifié son refus en mettant en avant sa supériorité supposée. Adam et son épouse répondent maintenant en reconnaissant leur tort. Ces réponses donnent à suivre deux attitudes différentes devant un manquement. Le récit nous a laissé entendre l’argument d’Iblis ; il nous fait maintenant entendre une demande de pardon. Leurs paroles se portent vers ce dont ils ont besoin après ce qu’ils ont fait.', sources: ['clay', 'return'] },
          ],
          studyNote: 'Le sens de l’invocation de 7:23 est reformulé sans citation littérale et sans récitation arabe synthétique. Le rapprochement avec le refus d’Iblis est une lecture pédagogique explicitement présentée comme telle.',
        },
        {
          id: 'accepted', title: 'Un repentir accueilli',
          paragraphs: [
            { text: 'Adam reçoit de son Seigneur des paroles, et son repentir est accueilli. Allah le choisit et le guide. Celui qui a mangé de l’arbre malgré l’interdit reçoit maintenant l’accueil de son retour. Après la parole trompeuse suivie dans le Jardin, il reçoit de son Seigneur. La faute a eu lieu, mais son histoire se poursuit avec ce pardon accueilli et avec cette guidance.', sources: ['mercy', 'guidance', 'promise'] },
            { text: 'La promesse du tentateur avait conduit Adam et son épouse vers l’arbre. Leur demande est maintenant tournée vers le pardon et la miséricorde. Ce qu’ils viennent de demander donne à cette étape une autre direction. Adam a reçu les noms au commencement ; il reçoit à présent des paroles de son Seigneur. Le retour dont il avait besoin est accueilli. Une nouvelle étape de son existence va s’ouvrir.', sources: ['announcement', 'promise', 'return', 'mercy'] },
          ],
          studyNote: '2:37 mentionne des paroles reçues et l’accueil du repentir. Le manuscrit n’invente ni les mots d’un dialogue supplémentaire ni le temps écoulé avant cet accueil.',
        },
        {
          id: 'earth', title: 'Une vie sur terre et une direction',
          paragraphs: [
            { text: 'Le séjour dans le Jardin prend fin. La terre sera un lieu de séjour et de jouissance pour un temps. C’est là que les êtres humains vivront et mourront, et c’est de là qu’ils seront ramenés. L’hostilité qui accompagnera cette descente leur est aussi rappelée. Cette terre avait été évoquée au commencement, lorsque l’annonce avait été faite aux anges. La vie qui s’y ouvre a désormais traversé l’épreuve du Jardin.', sources: ['return', 'garden', 'announcement'] },
            { text: 'Le départ s’accompagne d’une promesse de guidance. Lorsqu’elle viendra d’Allah, ceux qui la suivront ne connaîtront ni crainte ni affliction ; ils ne s’égareront pas et ne seront pas malheureux. À cette promesse est associé un avertissement au sujet de ceux qui rejetteront les signes divins. L’existence sur terre est ainsi accompagnée d’une direction et d’un appel à lui répondre. Adam quitte le Jardin avec l’annonce de cette guidance.', sources: ['mercy', 'guidance'] },
            { text: 'Au début, les anges avaient reconnu que leur savoir dépendait de ce qui leur était enseigné. Adam avait reçu les noms. Au terme du récit que nous venons de suivre, il a aussi reçu des paroles pour son retour, et une guidance est annoncée. Du commencement à cette nouvelle étape, recevoir et répondre ont traversé son histoire. La vie sur terre s’ouvre avec une responsabilité, mais aussi avec cette direction donnée.', sources: ['announcement', 'mercy', 'guidance'] },
            { text: 'Nous pouvons refermer ce dernier chapitre en gardant son mouvement entier. Adam a été honoré par un enseignement. Il a été averti, puis trompé. Il a fauté, reconnu son tort et reçu l’accueil de son repentir. Le récit le conduit enfin vers une vie accompagnée d’une guidance. C’est cette histoire, avec ses étapes et leur enchaînement, qui demeure devant nous lorsque la narration s’achève.', sources: ['announcement', 'warning', 'temptation', 'return', 'mercy', 'guidance'] },
          ],
          studyNote: 'Les promesses sont rapportées dans les termes de leurs passages, sans promettre une vie terrestre dépourvue de toute épreuve. Aucun pays, montagne ou lieu de rencontre des époux sur terre n’est fixé.',
        },
      ],
    },
  ],
  epilogue: {
    text: 'L’histoire d’Adam nous laisse devant trois gestes : recevoir un savoir avec humilité, reconnaître le tort commis et chercher une direction pour la suite. Nous pouvons prendre un moment pour revenir sur l’un d’eux. Une erreur reconnue demande parfois une parole claire, un pardon sollicité ou un geste réparateur. Cette réflexion appartient maintenant à notre propre vie ; elle prolonge l’écoute sans ajouter un événement au récit d’Adam.',
    lessons: [
      'Les noms sont enseignés à Adam ; les anges reconnaissent les limites de leur savoir.',
      'Adam et son épouse reconnaissent ensemble leur tort et demandent pardon et miséricorde.',
      'L’accueil du repentir et l’annonce d’une guidance font partie de la fin du récit.',
    ],
    question: 'Après une erreur, quelle démarche juste et concrète pourrais-je engager à mon tour ?',
    sources: ['announcement', 'return', 'mercy', 'guidance'],
  },
};

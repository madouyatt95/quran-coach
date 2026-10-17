/** Editorial navigation labels; the linked Quran passages are the primary sources.
 * These chapter divisions are reading aids, not revealed divisions or claims of merit.
 */
export interface ListeningChapter {
  surah: number;
  from: number;
  to: number;
  title: string;
  introduction: string;
}
export interface ListeningJourney {
  id: string;
  title: string;
  eyebrow: string;
  icon: string;
  description: string;
  chapters: ListeningChapter[];
}
export const LISTENING_JOURNEYS: ListeningJourney[] = [
  {
    id: "kahf",
    title: "Traverser Al-Kahf",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌿",
    description:
      "Suivre la sourate entière, avec des repères pour situer chaque récit.",
    chapters: [
      {
        surah: 18,
        from: 1,
        to: 8,
        title: "L’ouverture",
        introduction:
          "La révélation du Livre et la vie terrestre ouvrent la sourate.",
      },
      {
        surah: 18,
        from: 9,
        to: 26,
        title: "Les gens de la caverne",
        introduction:
          "Des jeunes trouvent refuge dans une caverne. Écoutez le récit et les questions qui l’entourent.",
      },
      {
        surah: 18,
        from: 27,
        to: 31,
        title: "S’attacher à la révélation",
        introduction:
          "Le passage revient à la révélation et au choix de croire.",
      },
      {
        surah: 18,
        from: 32,
        to: 44,
        title: "Les deux jardins",
        introduction:
          "Deux hommes dialoguent à propos des biens et de leur devenir.",
      },
      {
        surah: 18,
        from: 45,
        to: 59,
        title: "Ce qui demeure",
        introduction:
          "Des images de la vie terrestre précèdent un rappel du rassemblement et du jugement.",
      },
      {
        surah: 18,
        from: 60,
        to: 82,
        title: "Le voyage de Moussa",
        introduction:
          "Moussa accompagne un serviteur d’Allah. Les événements reçoivent leur explication à la fin du voyage.",
      },
      {
        surah: 18,
        from: 83,
        to: 98,
        title: "Dhul-Qarnayn",
        introduction:
          "Le récit suit plusieurs voyages, jusqu’à la construction d’une barrière.",
      },
      {
        surah: 18,
        from: 99,
        to: 110,
        title: "La conclusion",
        introduction:
          "La sourate s’achève sur la rencontre avec le Seigneur et l’œuvre juste.",
      },
    ],
  },
  {
    id: "maryam",
    title: "Au fil de Maryam",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌙",
    description:
      "De l’invocation de Zakariyya aux rappels qui concluent la sourate.",
    chapters: [
      {
        surah: 19,
        from: 1,
        to: 15,
        title: "Zakariyya et Yahya",
        introduction:
          "Une invocation discrète ouvre le récit de Zakariyya et de Yahya.",
      },
      {
        surah: 19,
        from: 16,
        to: 40,
        title: "Maryam et Issa",
        introduction:
          "Le récit évoque Maryam, la naissance d’Issa et ses paroles.",
      },
      {
        surah: 19,
        from: 41,
        to: 50,
        title: "Ibrahim et son père",
        introduction: "Écoutez le dialogue d’Ibrahim avec son père.",
      },
      {
        surah: 19,
        from: 51,
        to: 65,
        title: "D’autres prophètes",
        introduction:
          "Moussa, Ismaïl et Idris sont évoqués, puis vient un rappel sur leurs successeurs.",
      },
      {
        surah: 19,
        from: 66,
        to: 98,
        title: "Résurrection et retour",
        introduction:
          "Les derniers passages traitent notamment de la résurrection et réfutent l’attribution d’un enfant au Tout Miséricordieux.",
      },
    ],
  },
  {
    id: "fatiha",
    title: "Entrer dans Al-Fatiha",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "📖",
    description:
      "Sept versets, trois repères : la louange, l’adoration et la demande de guidance.",
    chapters: [
      {
        surah: 1,
        from: 1,
        to: 4,
        title: "La louange",
        introduction:
          "Le début de la sourate nomme Allah et évoque Sa miséricorde et le Jour de la rétribution.",
      },
      {
        surah: 1,
        from: 5,
        to: 5,
        title: "Adorer et demander l’aide",
        introduction: "Le verset réunit l’adoration et la demande d’aide.",
      },
      {
        surah: 1,
        from: 6,
        to: 7,
        title: "Demander la guidance",
        introduction: "La sourate se conclut par la demande du droit chemin.",
      },
    ],
  },
  {
    id: "invocations",
    title: "Les mots de l’invocation",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🤲",
    description:
      "Une sélection d’invocations coraniques, avec leur contexte immédiat.",
    chapters: [
      {
        surah: 2,
        from: 200,
        to: 202,
        title: "Le bien ici-bas et dans l’au-delà",
        introduction: "Deux demandes sont mises en regard dans ce passage.",
      },
      {
        surah: 3,
        from: 7,
        to: 9,
        title: "Demander un cœur ferme",
        introduction:
          "La demande de ne pas laisser dévier les cœurs suit le rappel sur le Livre.",
      },
      {
        surah: 20,
        from: 24,
        to: 36,
        title: "La demande de Moussa",
        introduction: "Chargé d’une mission, Moussa demande aide et facilité.",
      },
      {
        surah: 21,
        from: 83,
        to: 90,
        title: "Des appels et des réponses",
        introduction:
          "Le passage évoque notamment Ayyoub, Dhun-Noun et Zakariyya.",
      },
    ],
  },
  {
    id: "hope",
    title: "Revenir avec espoir",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "✨",
    description:
      "Trois passages à écouter dans leur continuité : retour, rappel et facilité.",
    chapters: [
      {
        surah: 39,
        from: 53,
        to: 61,
        title: "L’appel au retour",
        introduction:
          "L’appel à ne pas désespérer est suivi d’une invitation à revenir vers Allah.",
      },
      {
        surah: 93,
        from: 1,
        to: 11,
        title: "Ad-Duha",
        introduction:
          "Écoutez la sourate entière, jusqu’aux recommandations qui la concluent.",
      },
      {
        surah: 94,
        from: 1,
        to: 8,
        title: "Ash-Sharh",
        introduction:
          "La difficulté et la facilité sont évoquées dans cette courte sourate.",
      },
    ],
  },
  {
    id: "yusuf",
    title: "Le récit de Youssouf",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌾",
    description: "Suivre un récit continu, du songe initial aux retrouvailles.",
    chapters: [
      {
        surah: 12,
        from: 1,
        to: 6,
        title: "Le songe",
        introduction: "Le récit commence par le songe de Youssouf.",
      },
      {
        surah: 12,
        from: 7,
        to: 22,
        title: "L’éloignement",
        introduction:
          "Le complot des frères conduit Youssouf loin de sa famille.",
      },
      {
        surah: 12,
        from: 23,
        to: 35,
        title: "L’épreuve dans la maison",
        introduction:
          "Le récit présente une épreuve puis les événements qui conduisent à la prison.",
      },
      {
        surah: 12,
        from: 36,
        to: 57,
        title: "De la prison à la responsabilité",
        introduction:
          "L’interprétation des songes conduit à une rencontre avec le roi.",
      },
      {
        surah: 12,
        from: 58,
        to: 87,
        title: "Les voyages des frères",
        introduction:
          "Les frères reviennent en Égypte, tandis que leur père attend des nouvelles.",
      },
      {
        surah: 12,
        from: 88,
        to: 101,
        title: "Les retrouvailles",
        introduction: "Youssouf se fait reconnaître et retrouve sa famille.",
      },
      {
        surah: 12,
        from: 102,
        to: 111,
        title: "La conclusion du récit",
        introduction:
          "La sourate se termine par des rappels sur les récits et la révélation.",
      },
    ],
  },
  {
    id: "mulk",
    title: "Contempler Al-Mulk",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌌",
    description:
      "Une sourate entière sur la souveraineté, la création et le retour.",
    chapters: [
      {
        surah: 67,
        from: 1,
        to: 5,
        title: "Observer la création",
        introduction: "La vie, la mort et les cieux ouvrent la sourate.",
      },
      {
        surah: 67,
        from: 6,
        to: 15,
        title: "Réponse et responsabilité",
        introduction:
          "Ces versets évoquent la responsabilité et ce qu’Allah connaît.",
      },
      {
        surah: 67,
        from: 16,
        to: 23,
        title: "Des signes à considérer",
        introduction: "Le passage invite notamment à regarder les oiseaux.",
      },
      {
        surah: 67,
        from: 24,
        to: 30,
        title: "Le rassemblement et la subsistance",
        introduction:
          "La fin de la sourate interroge le retour et la provenance de l’eau.",
      },
    ],
  },
  {
    id: "rahman",
    title: "Les bienfaits dans Ar-Rahman",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌺",
    description:
      "Retrouver les grandes séquences de la sourate et son refrain.",
    chapters: [
      {
        surah: 55,
        from: 1,
        to: 13,
        title: "Enseignement et équilibre",
        introduction:
          "L’enseignement du Coran, la création et la balance ouvrent la sourate.",
      },
      {
        surah: 55,
        from: 14,
        to: 30,
        title: "Les signes et les bienfaits",
        introduction: "Plusieurs aspects de la création sont évoqués.",
      },
      {
        surah: 55,
        from: 31,
        to: 45,
        title: "Le jugement",
        introduction: "Le passage annonce le jugement.",
      },
      {
        surah: 55,
        from: 46,
        to: 61,
        title: "Deux jardins",
        introduction: "Une première description des jardins est donnée.",
      },
      {
        surah: 55,
        from: 62,
        to: 78,
        title: "Deux autres jardins",
        introduction:
          "La description se poursuit jusqu’à la conclusion de la sourate.",
      },
    ],
  },
  {
    id: "waqia",
    title: "Au fil d’Al-Waqia",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌅",
    description: "Suivre les groupes évoqués, les signes et la conclusion.",
    chapters: [
      {
        surah: 56,
        from: 1,
        to: 26,
        title: "L’événement et les premiers",
        introduction:
          "Le début de la sourate annonce l’événement et présente les premiers.",
      },
      {
        surah: 56,
        from: 27,
        to: 56,
        title: "La droite et la gauche",
        introduction: "Les deux groupes sont décrits successivement.",
      },
      {
        surah: 56,
        from: 57,
        to: 74,
        title: "Des signes familiers",
        introduction:
          "La création, les cultures, l’eau et le feu sont évoqués.",
      },
      {
        surah: 56,
        from: 75,
        to: 96,
        title: "La révélation et le retour",
        introduction:
          "La fin de la sourate évoque le Coran et le terme de la vie.",
      },
    ],
  },
  {
    id: "luqman",
    title: "Écouter les conseils de Luqman",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🌳",
    description: "Situer les conseils de Luqman dans toute la sourate.",
    chapters: [
      {
        surah: 31,
        from: 1,
        to: 11,
        title: "Le Livre et la création",
        introduction:
          "La sourate présente le Livre et des signes de la création.",
      },
      {
        surah: 31,
        from: 12,
        to: 19,
        title: "Les conseils à son fils",
        introduction:
          "Gratitude, adoration, parents, prière et conduite sont évoqués.",
      },
      {
        surah: 31,
        from: 20,
        to: 30,
        title: "Observer et réfléchir",
        introduction: "Le passage développe plusieurs signes et rappels.",
      },
      {
        surah: 31,
        from: 31,
        to: 34,
        title: "Le retour à Allah",
        introduction:
          "La mer, le Jour à venir et la connaissance divine concluent la sourate.",
      },
    ],
  },
  {
    id: "hujurat",
    title: "Vivre ensemble : Al-Hujurat",
    eyebrow: "UNE SOURATE, UN PARCOURS",
    icon: "🤝",
    description: "Une sourate entière sur les rapports, la parole et la foi.",
    chapters: [
      {
        surah: 49,
        from: 1,
        to: 5,
        title: "S’adresser au Messager",
        introduction:
          "Les premiers versets traitent du comportement envers le Messager.",
      },
      {
        surah: 49,
        from: 6,
        to: 10,
        title: "Vérifier et réconcilier",
        introduction:
          "Le passage traite d’une nouvelle reçue et de la réconciliation.",
      },
      {
        surah: 49,
        from: 11,
        to: 13,
        title: "Respecter autrui",
        introduction:
          "Moquerie, soupçon, médisance et diversité des peuples sont évoqués.",
      },
      {
        surah: 49,
        from: 14,
        to: 18,
        title: "Parler de la foi",
        introduction:
          "Les derniers versets portent sur la foi et la connaissance d’Allah.",
      },
    ],
  },
  {
    id: "patience",
    title: "Traverser l’épreuve",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🪴",
    description:
      "Trois passages sur la patience, l’épreuve et le retour vers Allah.",
    chapters: [
      {
        surah: 2,
        from: 153,
        to: 157,
        title: "Patience et prière",
        introduction:
          "Le passage associe patience et prière avant d’évoquer les épreuves.",
      },
      {
        surah: 12,
        from: 83,
        to: 87,
        title: "Ne pas désespérer",
        introduction:
          "Ya‘qoub exprime sa peine et demande à ses fils de rechercher des nouvelles.",
      },
      {
        surah: 94,
        from: 1,
        to: 8,
        title: "La difficulté et la facilité",
        introduction: "Écoutez Ash-Sharh dans son ensemble.",
      },
    ],
  },
  {
    id: "gratitude",
    title: "Reconnaître les bienfaits",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🍃",
    description:
      "Écouter des passages qui évoquent la gratitude et les dons reçus.",
    chapters: [
      {
        surah: 14,
        from: 5,
        to: 8,
        title: "Un rappel de Moussa",
        introduction: "Moussa rappelle à son peuple des bienfaits reçus.",
      },
      {
        surah: 16,
        from: 10,
        to: 18,
        title: "L’eau, la terre et les signes",
        introduction:
          "Les bienfaits de la création sont évoqués successivement.",
      },
      {
        surah: 31,
        from: 12,
        to: 19,
        title: "La gratitude dans les conseils",
        introduction: "Les conseils de Luqman commencent par la gratitude.",
      },
    ],
  },
  {
    id: "parents",
    title: "Prendre soin de ses parents",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🏡",
    description:
      "Réunir trois passages sur les parents et le comportement envers eux.",
    chapters: [
      {
        surah: 17,
        from: 23,
        to: 30,
        title: "Parole et bienfaisance",
        introduction:
          "Le passage évoque les parents, puis les proches et le don.",
      },
      {
        surah: 31,
        from: 14,
        to: 15,
        title: "Reconnaissance et compagnie",
        introduction:
          "Les parents sont évoqués au milieu des conseils de Luqman.",
      },
      {
        surah: 46,
        from: 15,
        to: 16,
        title: "Une invocation de reconnaissance",
        introduction:
          "Le passage réunit les parents, la reconnaissance et une invocation.",
      },
    ],
  },
  {
    id: "giving",
    title: "Donner avec attention",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🌱",
    description:
      "Trois passages sur le don, son intention et le respect de celui qui reçoit.",
    chapters: [
      {
        surah: 2,
        from: 261,
        to: 274,
        title: "Le don et ses manières",
        introduction:
          "Des comparaisons et des recommandations encadrent le don.",
      },
      {
        surah: 76,
        from: 5,
        to: 12,
        title: "Nourrir pour Allah",
        introduction: "Le passage décrit notamment le don de nourriture.",
      },
      {
        surah: 90,
        from: 10,
        to: 18,
        title: "La voie difficile",
        introduction:
          "Libération, nourriture, patience et miséricorde sont évoquées.",
      },
    ],
  },
  {
    id: "creation",
    title: "Regarder les signes",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🌍",
    description:
      "Observer le ciel, la terre et la vie à travers trois passages.",
    chapters: [
      {
        surah: 3,
        from: 190,
        to: 195,
        title: "Contempler et invoquer",
        introduction:
          "La contemplation de la création est suivie d’invocations.",
      },
      {
        surah: 30,
        from: 20,
        to: 27,
        title: "Des signes variés",
        introduction:
          "L’origine humaine, les langues, le sommeil et d’autres signes sont évoqués.",
      },
      {
        surah: 88,
        from: 17,
        to: 26,
        title: "Regarder ce qui nous entoure",
        introduction:
          "Le passage invite à regarder la création, puis rappelle le retour.",
      },
    ],
  },
  {
    id: "forgiveness",
    title: "Le chemin du retour",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "🕊️",
    description:
      "Écouter l’appel au repentir et les passages qui l’accompagnent.",
    chapters: [
      {
        surah: 39,
        from: 53,
        to: 61,
        title: "Revenir vers son Seigneur",
        introduction:
          "L’appel à ne pas désespérer est suivi de rappels et d’une invitation au retour.",
      },
      {
        surah: 25,
        from: 63,
        to: 77,
        title: "Les serviteurs du Tout Miséricordieux",
        introduction:
          "Leurs qualités sont évoquées, avec un passage sur le repentir.",
      },
      {
        surah: 66,
        from: 8,
        to: 9,
        title: "Un repentir sincère",
        introduction: "L’appel au repentir s’accompagne d’une invocation.",
      },
    ],
  },
  {
    id: "short-surahs",
    title: "Trois courtes sourates",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "📚",
    description: "Al-Ikhlas, Al-Falaq et An-Nas, dans leur intégralité.",
    chapters: [
      {
        surah: 112,
        from: 1,
        to: 4,
        title: "Al-Ikhlas",
        introduction: "Écoutez les quatre versets de la sourate.",
      },
      {
        surah: 113,
        from: 1,
        to: 5,
        title: "Al-Falaq",
        introduction:
          "Écoutez la demande de protection formulée dans cette sourate.",
      },
      {
        surah: 114,
        from: 1,
        to: 6,
        title: "An-Nas",
        introduction: "La dernière sourate poursuit la demande de protection.",
      },
    ],
  },
  {
    id: "faith",
    title: "Des paroles de foi",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "💫",
    description: "Trois passages à écouter avec leur traduction.",
    chapters: [
      {
        surah: 2,
        from: 255,
        to: 257,
        title: "Le verset du Trône et la suite",
        introduction:
          "Le verset du Trône est suivi de deux versets à écouter dans leur continuité.",
      },
      {
        surah: 59,
        from: 22,
        to: 24,
        title: "Les noms d’Allah",
        introduction:
          "Ces derniers versets d’Al-Hashr évoquent des noms et attributs d’Allah.",
      },
      {
        surah: 112,
        from: 1,
        to: 4,
        title: "Al-Ikhlas",
        introduction:
          "La sourate entière est proposée pour conclure la séance.",
      },
    ],
  },
  {
    id: "time",
    title: "Le temps et les actes",
    eyebrow: "SÉANCE THÉMATIQUE",
    icon: "⏳",
    description: "Trois courtes sourates, proposées dans leur intégralité.",
    chapters: [
      {
        surah: 103,
        from: 1,
        to: 3,
        title: "Al-Asr",
        introduction: "Le temps ouvre cette courte sourate.",
      },
      {
        surah: 99,
        from: 1,
        to: 8,
        title: "Az-Zalzala",
        introduction:
          "La sourate évoque la terre et les actes rendus visibles.",
      },
      {
        surah: 102,
        from: 1,
        to: 8,
        title: "At-Takathur",
        introduction: "La rivalité dans l’accumulation ouvre la sourate.",
      },
    ],
  },
];
export const sourceForChapter = (c: ListeningChapter) =>
  `https://quran.com/${c.surah}/${c.from}-${c.to}`;

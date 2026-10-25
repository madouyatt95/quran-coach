// Exact unchanged chapters retain their published v1 audio and saved listening position.
export const unchangedBiographyChapters:Record<string,string[]>={
  "hamza-protection": [
    "emigration",
    "memoire"
  ],
  "jafar-deux-rivages": [
    "retour"
  ],
  "talha-engagement": [
    "origines"
  ],
  "zubayr-fidelite": [
    "origines",
    "defendre",
    "transmettre"
  ],
  "abdurrahman-confier": [
    "origines",
    "marche",
    "consultation"
  ],
  "abu-ubayda-confiance": [
    "mer",
    "najran",
    "succession",
    "amwas"
  ],
  "ibn-masud-parole": [
    "proximite",
    "ecoute",
    "kufa"
  ],
  "hafsa-depositaire": [
    "apprendre",
    "question",
    "feuillets"
  ],
  "umm-sulaym-maison": [
    "origines",
    "anas",
    "maison",
    "deuil"
  ],
  "nusayba-presence": []
};
// Methodological details moved out of the spoken narrative; factual uncertainty stays spoken.
export const biographyMethodNotes:Record<string,Record<string,string>>={
  "hamza-protection": {
    "origines": "Nous ne connaissons pas son enfance jour après jour. Les textes ne nous autorisent pas à raconter les conversations qu’il aurait eues, enfant, avec son neveu, ni à lui attribuer une intuition secrète de ce qui arriverait.",
    "conversion": "Il faut en conserver le sens sans fabriquer une pièce de théâtre. Nous pouvons suivre son adhésion et sa place parmi les premiers défenseurs ; nous ne pouvons pas remplir chaque silence par un nouvel exploit."
  },
  "jafar-deux-rivages": {
    "origines": "Nous ne possédons pas un journal de leur jeunesse. Les textes ne permettent pas d’assigner une conversation à chaque décision ni de deviner les pensées de Jafar.",
    "proximite": "Nous ne pouvons lui attribuer un raisonnement intérieur, mais les faits dessinent une continuité entre refuge reçu et accueil offert."
  },
  "talha-engagement": {
    "uhud": "Nous n’avons pas besoin d’inventer la trajectoire d’une flèche ou une pensée héroïque pour en comprendre le sens.",
    "generosite": "Nous ne pouvons pas reconstituer la comptabilité exacte de sa maison ni confirmer chaque chiffre reproduit dans les compilations.",
    "conseil": "Nous ne pouvons ni effacer les tensions de cette période ni lui attribuer, à partir d’un seul récit partisan, une intention cachée qui expliquerait tous ses gestes.",
    "division": "Nous pouvons dire le fait de la mort sans inventer une confession finale ou une conversation destinée à fermer le récit."
  },
  "zubayr-fidelite": {},
  "abdurrahman-confier": {},
  "abu-ubayda-confiance": {
    "origines": "Nous ne disposons pas d’un récit détaillé de son enfance ni de toutes les étapes de sa conversion. Sa biographie commence avec ces engagements, plutôt qu’avec une scène spectaculaire qu’il faudrait inventer."
  },
  "ibn-masud-parole": {
    "mecque": "La scène ne doit pas être embellie par une foule inventée ou une bravade que le témoin n’aurait pas transmise."
  },
  "hafsa-depositaire": {
    "veuvage": "Sa biographie ne gagne rien à ce que nous les inventions.",
    "foyer": "Une biographie qui ne laisserait apparaître aucune fragilité fabriquerait des êtres éloignés de l’expérience humaine."
  },
  "umm-sulaym-maison": {},
  "nusayba-presence": {
    "pactes": "Ces étapes ne nous autorisent pas à inventer une fonction précise pour elle à chaque déplacement.",
    "yamama": "les blessures signalées dans les notices invitent aussi à penser aux soins nécessaires après les combats, sans inventer la durée ni les détails de son rétablissement. Ce geste donne une conclusion plus juste que l’invention d’un dernier exploit."
  }
};

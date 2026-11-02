# Mushaf : écoute et étude — 2 novembre 2026

## Périmètre

Six ajouts au Mushaf Tajwid interactif, en réutilisant son moteur audio, ses identifiants de mots, son catalogue de récitateurs et les stores de révision. Aucun changement des polices, des lignes, du cadrage, du zoom, du calcul des dimensions ou du mécanisme de feuilletage.

Les commandes supplémentaires flottent au-dessus du dock en lecture normale et en immersion. Elles n'ajoutent pas de hauteur réservée à la page. Dans le pupitre, elles occupent la console existante. Un seul composant d'horloge est monté pour la disposition active.

## Fonctions

1. **Progression audio** : temps et durée provenant du fichier réellement joué. Déplacement dans le verset courant, y compris en pause, avec bornes strictes pour un passage découpé. La durée affichée concerne ce verset ou sa portion A–B, pas une estimation de la sourate ou d'une plage de plusieurs fichiers.
2. **A–B** : capture des positions réelles pendant l'écoute ou en pause ; même sourate et même récitateur obligatoires ; versets contigus vérifiés et pagination de l'édition conservée. Deux à vingt répétitions, annulation explicite, protection contre le retour tardif d'une requête annulée. Réutilisation des coupures du moteur existant.
3. **Plusieurs voix** : comparaison successive des versets entiers, avec les quatre voix déjà raccordées au Mushaf (Al-Afasy, Abdul Basit, Al-Husary, Al-Minshawi). Un seul élément audio, une seule file ; nouveaux fichiers et nouveaux repères à chaque voix. Pause, arrêt et choix de conserver la voix courante. Aucun faux alignement temporel entre deux récitateurs.
4. **Mots enregistrés → Fahm** : accès depuis « Mes mots à revoir » et depuis Fahm ; séances de cinq ou dix mots maximum, rappels échus prioritaires. Questions basées uniquement sur les traductions françaises QUL 95 livrées avec l'app. Prononciation enregistrée à l'identifiant exact du mot et lien de retour au même mot du Mushaf. Une réponse dans la même séance n'est pas présentée comme une mémorisation acquise ; le store de rappel différé existant garde cette distinction. La prononciation est une comparaison personnelle à l'enregistrement, pas une note automatique de récitation.
5. **Mains libres** : touches gauche / PageDown pour avancer, droite / PageUp pour revenir, Espace pour écouter ou suspendre. Aucune interception des champs, mots sélectionnables, boutons, liens, modificateurs, répétitions de touche et fenêtres ouvertes. Commandes Media Session pour les accessoires compatibles, avec propriété de session respectée lorsqu'un autre lecteur prend la main.
6. **Tajwid accompagné** : option dans les outils et les réglages du pupitre. Indication brève d'une règle balisée sur le mot synchronisé, avec lien vers la légende. La couleur du glyphe n'est jamais utilisée pour deviner une règle. Pas de rappel si les repères ne correspondent pas à la source audio jouée. Préférence désactivée par défaut et conservée après rechargement.

Le passage à Fahm ferme les fenêtres du lecteur : les dialogues portés dans `document.body` ne restent plus au-dessus de la nouvelle page.

## Vérifications

- 54 tests ciblés réussis dans 11 fichiers : moteur audio, coupures, annulation asynchrone A–B, ordre des voix, arrêt final, clavier, commandes multimédias et propriété de session, règles Tajwid, contenu et prononciation des mots, conservation des préférences et gestes existants.
- Le test de persistance des trois dispositions a été corrigé pour préparer explicitement son cadrage : une disposition encore non configurée hérite déjà du cadrage courant. Aucun changement du comportement de dimensionnement de l'application.
- Compilation TypeScript/Vite réussie ; préparation Capacitor iOS réussie.
- Navigateur local : boucle A–B sur 2:17, déplacement en pause, comparaison réelle Al-Afasy puis Abdul Basit jusqu'à l'arrêt, séance de compréhension à partir du mot enregistré 2:17:1, prononciation et retour au mot, affichage dans le pupitre avec deux pages et rappel Tajwid synchronisé.
- À 430 pixels de largeur, mesure de la page avant et après activation de la barre : mêmes dimensions de papier (environ 537 × 770 pixels avec le cadrage enregistré). Les nouvelles commandes ne changent pas cette mesure.

## Sources et limites

- Texte, pagination, tags Tajwid et correspondances au mot : services du Mushaf interactif déjà audités dans `interactive-tajwid.md`.
- Français : [QUL, ressource 95](https://qul.tarteel.ai/resources/translation/95), formulation fournie conservée, attribution visible dans Fahm.
- Audio : fichiers de récitation existants via Quran.com et enregistrements mot à mot Quran CDN. Aucune génération de récitation.
- [Media Session — commandes](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler) : les actions disponibles dépendent du navigateur, du système et de l'accessoire. Aucun écouteur ou pédalier physique n'a été testé pendant cette intervention.
- Les données absentes ou un fichier audio inaccessible affichent un état explicite avec reprise possible. Les pages et audios doivent déjà être en cache pour leur usage hors connexion ; aucun téléchargement intégral supplémentaire n'est lancé.
- Les captures de contrôle restent dans le dossier local `outputs/reader-audio-six-2026-11-02`, hors Git et hors déploiement.

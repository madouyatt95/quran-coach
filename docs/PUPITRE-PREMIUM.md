# Pupitre et découverte des livres — 24 octobre 2026

## Périmètre livré

Le composant commun conserve ses enfants lors du changement de disposition : aucun lecteur audio ou état d’exercice n’est recréé pour passer de classique à pupitre ou double espace.

| Activité | Partie haute | Console basse |
| --- | --- | --- |
| Mushaf Tajwid interactif | Page et sélection | Pages précédente/suivante, pause/reprise ou départ depuis le mot/verset choisi, récitateur, vitesse, traduction, passage, répétitions, réglages |
| Livres | Texte ou scène et narration synchronisée | Lecture partagée avec la bibliothèque, ±15 secondes à travers les segments du chapitre, progression, vitesse, minuterie, arrêt fin de chapitre, ambiances, chapitres, carnet |
| Catalogue | Présentation du livre sélectionné | Recherche/filtres, rangées de couvertures, continuation, prophètes, moralités, récits audio de moins de 20 minutes |
| Mémorisation | Passage et suivi | Action principale et répétitions prioritaires, écoute/récitation/bilan, aide au mot suivant, réglages |
| Quiz et corrections | Question, chrono, progression | Extrait audio, réponses, aides et correction |
| Reconnaissance audio | Indice et progression | Écouter, répondre, indice suivant, révélation |
| Familles / Memory | Familles/paires trouvées | Cartes tactiles et validation |
| Fil du récit / portes du savoir | Récit ou énigme | Cartes, choix et indices |
| Dominos / phrases / expédition | Construction ou question | Pièces, mots, choix et validation |
| Faire deviner | Carte et chrono | Pause, passer, résultat du groupe |
| Académie | Explication du cours | Narration avec commandes ouvertes, notion, exercices |
| Nahw et Ṣarf | Phrase, formes et comparaison | Choix d’exemple, mots à placer, formes, personne et correction |

Le catalogue sauvegarde sa couverture sélectionnée et le défilement horizontal des rangées dans la session du navigateur. Une couverture ne démarre aucun audio. « Lire » et « Écouter » déclenchent explicitement l’ouverture correspondante. Les récits sans audio restent accessibles à l’écrit.

## Vérifications

- Tests Vitest : conservation des nœuds audio et de la sélection lors des changements de disposition ; sélection/retour des livres ; transport du chapitre ; interactions existantes des livres ; jeux et cycle de vie audio ; ateliers d’arabe.
- Build TypeScript/Vite/PWA.
- Les couleurs de réussite/erreur et les états désactivés des jeux sont conservés.
- La détection automatique continue d’utiliser les segments d’écran déclarés par le navigateur. La largeur seule ne déclenche jamais une fausse détection de pliure ; choix manuel disponible.

## Limites

Pas de vérification visuelle sur appareil pliable physique ni sur iPhone pendant cette intervention. Le contrôle du navigateur intégré était désactivé et le serveur local refusait l’écoute du port (EPERM). Les tests automatisés ne valent pas validation matérielle de la charnière ou de l’affichage.

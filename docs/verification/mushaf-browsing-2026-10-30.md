# Feuilletage et continuité du Mushaf — 30 octobre 2026

## Changements

- Grande page centrale QCF et fragments voisins ; dimensions adaptées à la fenêtre, papier clair/sépia/sombre hérité correctement dans le dialogue.
- Glissement horizontal au doigt ou à la souris, déplacement pendant le geste, annulation et bornes 1–604. Les touches fléchées et boutons permettent aussi de parcourir les pages.
- Le curseur ne navigue plus à son relâchement. Toucher une page voisine la centre ; toucher la page centrale ou « Ouvrir » confirme. « Revenir ici » ramène l’aperçu à la page de lecture sans la quitter.
- Sourate(s), plage de références et Juz issus du manifeste. Signets existants et fin de séance comme raccourcis d’aperçu.
- Retour à la lecture conservé dans sessionStorage jusqu’à usage ou fermeture, sans expiration de 90 secondes ; capture de l’ancre visible avant les sauts explicites, y compris sur une même page. Le retour ne concurrence plus un recentrage de verset.
- Dernier verset sélectionné/écouté ajouté à l’ancre locale de défilement, mis en évidence brièvement à la réouverture. Une navigation explicite garde la priorité. Correction de la restauration annulée par le premier nettoyage d’effet React StrictMode.

## Vérifications

42 tests ciblés : PagePreview (7), readingReturn (3), useReadingTrace (6), readingSession (4), useVerseEntry (4), useBookPageTurn (13), readerPageScale (5).

Navigateur local : glissement dans les deux sens sans changement de page de lecture ; ouverture de 5 depuis 4 puis retour à 4 ; curseur vers 604 avec contrôle suivant désactivé ; repère de reprise 2:21 effectivement présent dans le DOM après rechargement ; rendu mobile 390×844 et dialogue défilable 320×568 ; géométrie 900×850 sans débordement horizontal.

Les aperçus utilisent le moteur existant : téléchargement des données et polices uniquement pour les trois pages autour de l’aperçu. L’exploration ne valide pas le Khatm. Aucun texte religieux ni audio modifié.

Limites : pas d’essai sur iPhone physique pendant cette passe. L’ancre et le dernier verset sont locaux à l’appareil ; le retour d’exploration est propre à la session de l’onglet. En lecture silencieuse, seule la position affichée est mémorisée, sans déduire le mot effectivement lu. La lisibilité d’une page entière reste contrainte par la taille de l’écran.

# Lecteur flottant de mémorisation — 11 octobre 2026

- Lecteur de l’entraînement fixé au-dessus de la navigation principale, accessible dès le début de la sourate et pendant le défilement.
- Vitesse, répétitions et phonétique déplacées dans un panneau repliable du lecteur, sans changement de position dans le passage.
- Hauteur limitée et défilement interne pour les petits écrans/paysage ; espace réservé en bas du contenu. Les onglets Séance/Progression masquent le lecteur d’entraînement.
- Aucun changement au menu Identifier : analyse et propositions seulement.

## Vérifications

- 10 tests ciblés réussis (HifdhPage et prononciation), compilation TypeScript/Vite/PWA réussie.
- Navigateur local, 390 × 844, Al-Baqara 1–286 : 286 cartes présentes. Position du lecteur identique avant/après un défilement de 6000 px (x=12, y=630, largeur=366, hauteur=148).
- Réglages ouverts : hauteur=414, entièrement dans l’écran. Vitesse 1,25× sélectionnée et répétitions portées à 2 sans changement de scrollY (6000).
- Lecture/pause utilisables ; lecteur masqué dans Progression. Aucun débordement horizontal.
- Paysage 844 × 390 : panneau ouvert contenu dans l’écran (x=142, y=14, largeur=560, hauteur=310).
- Capture locale : outputs/hifdh-lecteur-flottant-mobile.jpg dans le dossier parent de travail. Pas de test sur iPhone physique.

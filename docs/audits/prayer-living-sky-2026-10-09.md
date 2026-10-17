# Ciel interactif — 9 octobre 2026

## Réalisation
- `PrayerSunArc.tsx` : paysage SVG à trois plans, silhouette architecturale, soleil à halo, ciel nocturne, exploration directe au doigt et commande native accessible au clavier.
- `PrayerSunArc.css` : transitions de lumière, arrivée douce du soleil, palette violette, largeur mobile et cadrage limité sur grand écran. Réduction des animations selon la préférence système.
- `prayerSky.ts` : interpolation des couleurs suivant les six horaires de la journée ; position solaire illustrative relative au lever/coucher. La lune est décorative et ne prétend pas représenter sa phase réelle.
- Boutons des six repères et horaires conservés ; retour au présent, détail de la mosquée pour les prières, sans Adhan/Iqama sur le repère du lever.
- Aucun fournisseur externe ni dépendance ajouté. Horaires et compte à rebours Iqama existants conservés.

## Vérifications
- Neuf tests réussis : scènes aux limites lever/coucher/nuit, interpolation, invalidité des données, ancien utilitaire solaire et quatre régressions de la mosquée favorite.
- ESLint ciblé réussi.
- Navigateur local : largeur 390, sélection Lever/Asr/Isha, glissement horizontal (08:03 vers 18:06), flèche droite au clavier (08:02 vers 08:03), lendemain et retour au jour courant, cadrage grand écran.
- Atlas inchangé (sommes de contrôle).
- Aucun test sur iPhone physique ; respect de reduced-motion vérifié dans les styles, pas au moyen d’une préférence système modifiée.
- Build TypeScript/Vite/PWA réussi. Aucune erreur console dans la vérification locale.
- Déploiement : dpl_Fw942zM6MVrumbxzqSTCxcktaaM4, READY, alias https://www.quran-coach.fr.

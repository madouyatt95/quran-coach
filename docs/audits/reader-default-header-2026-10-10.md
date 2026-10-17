# Mushaf par défaut et cohérence des commandes — 10 octobre 2026

## Changements
- `settingsStore` : Tajwid interactif devient le mode initial. Les choix déjà enregistrés et les changements ultérieurs restent conservés sous la même clé de préférences.
- `InteractiveTajweedPage` et `ReaderHeader.css` : grille commune aux quatre modes, sélecteur d'édition dans l'en-tête, recherche/Khatm, micro, signet et même bouton de réglages.
- `ReaderSettingsDialog` partagé avec `MushafToolbar` : fenêtre modale, retour du focus, zone centrale défilante et fermeture toujours accessible.
- Réglages Tajwid : traduction, immersion, zoom, papier, récitateur/vitesse, légende, révision et polices hors ligne. La taille se règle par zoom pour respecter la composition des lignes.

## Vérifications
- 14 tests réussis : préférences (5), navigation ReadPage (7), apparence (2).
- TypeScript et build Vite/PWA réussis. ESLint ciblé du nouveau dialogue, du toolbar et du test de préférences réussi.
- Navigateur local : vue 390 × 844, ouverture/fermeture des deux fenêtres de réglages, aller-retour Tajwid/texte conservant la page 4.
- Vue 320 × 568 : en-tête et pied du dialogue restent visibles, contenu défilant.
- Pas de test sur un iPhone physique pendant cette modification ; aucune modification du moteur de polices ni du texte coranique.

## Publication
- Déploiement production `dpl_CUKtmRaHCA4Quhd5k7q4CUuDNCab` READY, alias https://www.quran-coach.fr.
- Site public vérifié après activation du bandeau PWA « Mettre à jour » : en-tête harmonisé et dialogue de réglages visibles. Capture : `/private/tmp/qc-reader-settings-published.png`.

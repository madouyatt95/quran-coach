# Menu burger — six améliorations approuvées

- Mes raccourcis remplace Mes 4 favoris ; les préférences existantes restent sous la même clé locale.
- Recherche des destinations insensible aux accents et avec synonymes ; relais de la requête vers Trouve, avec conservation du retour à la page.
- Notifications et personnalisation réunies ; pied fixe mesuré à 105 px contre 139 px auparavant (sans safe area).
- Reprises distinctes de lecture, écoute et mémorisation : l’activité récente reste principale, les autres sont accessibles via un volet. La mémorisation conserve le curseur le plus récent, session ou parcours.
- Remplacement et retrait directement dans chaque raccourci choisi, réorganisation conservée.
- Quatre rubriques, accès à Ma bibliothèque et Téléchargements ; adaptation clair/sépia, palette Original et emoji conservés.

## Vérifications

- 11 tests ciblés passés (menuFavorites, menuResume, menuSearch).
- TypeScript et build de production réussis.
- Navigateur local : téléchargement sans accent, remplacement à quatre places, conservation après rechargement ; requête patience transmise à Trouve et résultats affichés.
- Contrôle visuel des thèmes Original, clair et sépia. Préférences locales restaurées après essais.
- La demande de viewport 390 x 844 n’a pas changé le viewport effectif (1280 x 720) dans l’outil : contrôle mobile physique non effectué.
- Les reprises multiples sont couvertes par tests de sélection et conservation du curseur ; pas d’essai audio physique.

## Publication

Déploiement dpl_HQBTo8Yb8MG8LHVGcVpgSC3BJJB9 READY, alias https://www.quran-coach.fr.
Production vérifiée : Mes raccourcis, quatre rubriques, recherche révision (3 destinations), bibliothèque et téléchargements. Raccourcis existants du navigateur public conservés.

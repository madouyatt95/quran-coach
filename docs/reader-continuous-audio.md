# Lecture continue et sous-titres — 10 octobre 2026

## Comportement
- Écouter la page démarre au premier verset. Après une pause, le bouton reprend au même endroit.
- Dans les actions d’un verset, « Ce verset seul » conserve une lecture bornée ; « Lire à partir d’ici » enchaîne les versets puis les pages jusqu’à la fin du Coran.
- La fiche mot sépare la prononciation isolée et le départ en lecture continue. Les repères proviennent de `/recitations/{id}/by_ayah/{key}?fields=segments` de Quran.com et sont utilisés avec l’URL audio de la même réponse. Sans repère, le bouton annonce explicitement un départ au début du verset.
- Les sous-titres sont regroupés selon largeur, ponctuation et mots de liaison. Leur progression française reste proportionnelle à la durée du verset, sans prétendre à un alignement linguistique mot à mot.
- Ouvrir la traduction complète suspend une lecture en cours. La fermeture reprend seulement la même session. Une session déjà en pause reste en pause.
- Glisser horizontalement ou utiliser les flèches sur la bande permet de relire les groupes. Le bouton de reprise rétablit le suivi audio.
- Trois tailles de texte conservent une bande de 52 px et deux lignes maximum. En immersion, les commandes s’effacent après quatre secondes, mais les sous-titres restent. Un premier toucher réveille les commandes.

## Vérification locale
- 31 tests ciblés passent : parsing des repères, départ au mot, lecture continue entre pages, pause et reprise protégées, découpage des traductions, relecture manuelle, fiche mot et temporisation immersive.
- TypeScript et build de production passent.
- ESLint passe sur les composants interactifs modifiés, le store et le nouveau service. Le hook audio partagé conserve des alertes préexistantes (refs écrites pendant le rendu et dépendances de hooks).
- Navigateur réel : départ au mot 15 du verset 2:17 puis enchaînement ; départ au verset 2:24 puis passage automatique page 5 / verset 2:25 ; pause à l’ouverture de la traduction et reprise à la fermeture ; relecture des groupes ; commandes qui s’effacent et réapparaissent.
- Affichage contrôlé à 390 × 844 : très grands sous-titres de 18 px, deux lignes de 21 px dans la bande de 52 px. Ce contrôle ne remplace pas un essai sur iPhone physique.

Source : https://api-docs.quran.com/docs/content_apis_versioned/4.0.0/list-ayah-recitation/

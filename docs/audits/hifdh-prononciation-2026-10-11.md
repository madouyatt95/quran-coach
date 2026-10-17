# Prononciation dans Mémorisation — 11 octobre 2026

- Réutilisation de WordStudyCard du lecteur Tajwid : audio individuel, arrêt, boucle, français QUL, translittération, mots précédent/suivant et ajout aux révisions.
- Accès par appui long, double clic ou clavier sur les mots visibles. Les clics de sélection des passages conservent leur comportement. Aucun accès depuis un mot masqué ; une aide demandée pendant un rappel guidé est comptabilisée.
- Fiche superposée, sans modifier la taille du passage. Fermeture au changement de passage/étape/onglet, au toucher extérieur ou à Échap. L’audio du mot s’arrête à la fermeture et au changement de mot.
- Résolution des mots depuis les pages vérifiées du lecteur, y compris un verset réparti sur plusieurs pages. Correspondance des mots vérifiée avant d’utiliser les positions audio canoniques ; aucune recherche approximative du mot.

## Vérifications

- 18 tests ciblés : page Hifdh, séance guidée, fiche partagée, adaptation des données, nouvelles interactions, erreurs et réessai.
- TypeScript et compilation Vite/PWA réussis. ESLint ciblé sans erreur ni avertissement.
- Navigateur local 390 × 844 : appui long réel simulé sur أَلَآ (2:13:13), fiche française « Sans doute, », phonétique « alā », bouton audio en lecture. Réponse HTTP 206 de https://audio.qurancdn.com/wbw/002_013_013.mp3.
- Aucun débordement horizontal (largeur du document = 390 px). Capture : outputs/hifdh-prononciation-mobile.jpg dans le dossier de travail parent.
- Pas de validation sur iPhone physique, ni d’évaluation auditive humaine de l’ensemble des mots. Les fiches nécessitent les ressources réseau ou déjà disponibles en cache ; aucun nouveau pack hors ligne n’a été ajouté.

## Production

- Déploiement dpl_xn2NpADi2SMC3h7ydCZxKcKrC79c : READY, alias https://www.quran-coach.fr.
- Contrôle du site public /hifdh?surah=2&ayah=13 en 390 × 844 : fiche du mot 13, français, translittération, prononciation et boucle visibles. Capture : outputs/hifdh-prononciation-production.jpg.

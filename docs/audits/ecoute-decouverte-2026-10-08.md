# Écoute — découverte et marges supérieures

## Modifications
- 20 parcours au lieu de 5 : 9 sourates complètes et 11 sélections thématiques, 78 étapes.
- Grille responsive, recherche dans titres/descriptions/étapes, filtres Tout/Sourates/Thèmes/Courts, extension de la sélection.
- « Courts » signifie au plus 20 versets, sans promettre une durée identique selon le récitant.
- Outils globaux loupe/menu sur la ligne du premier en-tête, sans leur ancienne ligne vide ; suppression des marges supérieures cumulées. `/read` exclue des nouveaux styles.
- Traitement des en-têtes Écoute, Accueil, Identifier, Hifdh, lecteur immersif et pages secondaires. Navigation et couleurs conservées.

## Vérifications
- TypeScript, ESLint ciblé, compilation Vite/PWA : réussis.
- 9 tests ciblés réussis ; couverture intégrale sans trous ni doublons des 9 parcours de sourates.
- Validation des 78 plages contre `https://api.alquran.cloud/v1/surah` : aucune plage invalide.
- Navigateur local mobile : affichage des 20 liens, recherche « parents » (2 résultats), filtre Courts (7 résultats).
- Parcours Parents : préparation réelle de 12 versets, arabe et traduction, références de trois étapes visibles.
- Inspection visuelle à 390 px : Accueil, Identifier, Hifdh, Écoute, expérience, Hadiths, séance quotidienne. Expérience contrôlée aussi à 320 px.
- Pas de test physique iPhone de la zone de sécurité ; le navigateur de bureau ne simule pas l’encoche.

## Sources éditoriales
Les découpages sont des repères de lecture, sans revendication de mérite religieux spécifique. Chaque étape fournit un lien vers ses versets sur Quran.com. Les pages Luqman, Al-Hujurat et Al-Mulk ont aussi été consultées. Les nouvelles introductions sont des descriptions courtes des passages, pas un tafsir autonome.

## Propositions séparées, non intégrées
- Séances chronométrées variées : les raccourcis actuels conduisent tous au début d’Al-Kahf.
- Reprise d’un parcours complet avec chapitre et préférences, au-delà du dernier fichier audio.
- Un seul transport audio dans l’expérience immersive, pour éviter le doublon avec le mini-lecteur global.
- Préchargement du verset suivant pour réduire les coupures dues au réseau.
- Packs de parcours hors ligne regroupant audio, texte, traduction et explications.
- Mémorisation de la voix et des réglages préférés entre les séances immersives.

## Publication
- Première tentative refusée par Vercel (« Not authorized ») ; accès projet vérifié, seconde tentative réussie.
- Déploiement READY : `dpl_4qM4FdAgKEDXsnYZC3oGAiYbgh4M`, `https://quran-coach-jsl1debha-yattas-projects.vercel.app`.
- Domaine public : `https://www.quran-coach.fr/listen`, bundle `index-D8_vggnd.js`.
- Vérification publique : styles compacts et filtres présents, puis affichage des 20 parcours dans le navigateur après mise à jour PWA.
- Capture : `ecoute-decouverte-production-2026-10-08.png`.

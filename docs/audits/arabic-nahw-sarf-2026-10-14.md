# Naḥw et Ṣarf — 14 octobre 2026

## Périmètre
- Nouveau parcours `/academy/arabic`, accessible depuis Académie et Fahm.
- 12 leçons : 4 fondations, 4 Naḥw, 4 Ṣarf ; 24 questions expliquées.
- Ateliers guidés de sélection des fonctions et de comparaison racine/schème.
- Explications simples/détaillées, reprise locale, révisions différées via le moteur Fahm existant.
- Analyse de 22 mots sur 7 versets : 1:1, 1:3, 1:4, 1:5, 1:6, 112:2 et 112:3.
- Aucune vidéo intégrée, conformément à la demande. Les liens YouTube ont seulement été identifiés (titre/auteur/description) ; le parcours ne prétend pas transcrire ces cours.

## Sources et intégrité
Le texte coranique provient du lecteur existant. L'analyse vérifie la correspondance des identifiants, positions, nombre de mots et texte normalisé avant de s'afficher. Aucun remplacement ou transformation de texte coranique. Les manipulations portent sur des exemples pédagogiques explicitement distincts des versets.
Les explications françaises et exercices sont rédigés pour Quran Coach ; aucune base complète tierce n'est importée. Références consultées :
- https://corpus.quran.com/documentation/grammar.jsp
- https://corpus.quran.com/documentation/tagset.jsp
- https://corpus.quran.com/documentation/morphologicalfeatures.jsp
- https://corpus.quran.com/documentation/phrasetags.jsp
- https://corpus.quran.com/documentation/verb.jsp
- https://corpus.quran.com/documentation/verbforms.jsp
- https://corpus.quran.com/documentation/possessiveconstruction.jsp
- https://corpus.quran.com/documentation/prepositionphrase.jsp
- Pages mot à mot 1:5 et 112:1 et liens d'analyse propres aux mots.

## Vérifications
- 30 tests ciblés passent : progression, stockage, échéances, correspondance des 7 passages, cohérence des 12 leçons, non-régression Fahm et mises à jour.
- ESLint ciblé : aucune erreur.
- TypeScript et build Vite/PWA : réussis.
- Navigateur local à 390 × 844 : reprise après rechargement (étape, réponses, préférence détaillée), validation de la leçon nominale, compteur 1/12, prochain cours ; atelier des schèmes et correction de sélection testés.
- Lien cours → Fahm → séance 112:2 et exercice de transfert validés dans le navigateur. Une aide ouverte reste mémorisée après rechargement et classe la tentative comme accompagnée.
- Pas de débordement horizontal constaté sur l'atelier (largeur fenêtre 390, document 384).

## Limites
Parcours d'initiation : ce n'est ni une analyse de tout le Coran ni une certification de maîtrise. Les familles de mots sont limitées aux passages étudiés. La validation d'un cours ne valide pas la rétention : les révisions indépendantes sont espacées d'au moins 24 heures. Les cas grammaticaux plus complexes ne sont pas inférés automatiquement. La comparaison visuelle sur un iPhone physique et le mode avion réel ne sont pas testés ; le build PWA passe, et les textes de cours sont intégrés aux ressources applicatives. Les données mot à mot utilisent le cache du lecteur existant.

## Publication
Déploiement production `dpl_8XP7wnGwDk7nWZkDHzETRfRrcJbG`, état Ready ; alias `https://www.quran-coach.fr`. Page `/academy/arabic` vérifiée dans le navigateur public, accès via la carte de l'Académie et programme des 12 leçons visibles. L'ancien service worker ne connaissait pas cette nouvelle route ; le bouton « Mettre à jour » depuis `/academy` a correctement activé la version publiée sans effacer les données utilisateur.

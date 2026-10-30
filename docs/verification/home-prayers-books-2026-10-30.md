# Accueil — Adhan/Iqama et sélection de livres

Périmètre accepté : propositions 2 et 4. Les autres blocs de l’accueil sont conservés.

## Comportement

- Carte Prières : réutilise `publishedDay`, `publishedNext` et la mosquée active ; prochain Adhan puis Iqama, sessions Jumu’a distinctes, absence d’Iqama explicite. Accès au menu Prières et itinéraires Apple Plans / Google Maps sans liens imbriqués.
- Les horaires calculés sont étiquetés et ne sont jamais présentés comme ceux de la mosquée. Le lendemain est calculé indépendamment ; aucune substitution automatique par Paris si la localisation manque.
- Le minuteur est dans son propre composant et se recale au retour au premier plan.
- Six pochettes : deux prophètes, deux compagnons, deux histoires/moralités, sélection stable pour la journée locale et renouvelée le lendemain. Les trois collections et la bibliothèque restent directement accessibles.
- Durées issues des enregistrements du catalogue publié, progression audio issue du store existant ; chapitre de lecture si aucune progression audio. Les livres restent lisibles sans catalogue réseau. Le toucher ouvre la fiche existante avec ses actions Lire / Écouter, sans lecture automatique.
- Les livres se trouvent après le bloc Prières pour garder l’horaire visible avant la découverte ; l’ordre personnalisé des autres blocs est préservé.
- Catalogue chargé dans un composant différé, sans charger les manuscrits complets pour les pochettes.

## Vérifications

- 23 tests réussis : HomeHighlights (9), publishedPrayerClock (4), bookResume (5), BookDiscovery (5).
- ESLint sur les nouveaux fichiers TypeScript : aucune erreur ni avertissement.
- Compilation TypeScript et Vite/PWA vérifiée avant publication.
- Pas de nouveau build iOS natif dans cette livraison.

## Limites

- Tests DOM et logique locale ; pas de validation sur iPhone physique.
- Le contrôle du navigateur avait été bloqué par sa limite d’utilisation : pas de contrôle visuel en navigateur revendiqué pour cette livraison, ni de contournement de ce blocage.
- Disponibilité des horaires soumise aux fournisseurs existants et à la fraîcheur des données ; aucune Iqama n’est calculée.
- La durée affichée correspond aux segments audio disponibles, pas à une estimation des segments manquants.

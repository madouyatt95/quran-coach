# Mosquée automatique et calendrier — 10 octobre 2026

## Fonctionnalités livrées

- Mode « Autour de moi » activé explicitement, mémorisé ; GPS réel uniquement. Actualisation au retour et toutes les deux minutes lorsque la page est visible. Annuaire rafraîchi après déplacement de 500 m ou quinze minutes ; stabilité de 200 m pour éviter les oscillations.
- Recherche à 5 km puis 15 km si aucun résultat. Correspondances incertaines exclues. Une précision GPS supérieure à 1,5 km empêche une sélection trompeuse.
- Favorite conservée séparément ; verrouillage manuel annule les réponses GPS tardives.
- Sélection active partagée par Adhan/Iqama, compte à rebours, cinq prières et Jumu’a. Horaires publiés, source et actualisation visibles.
- Alternative explicite si la plus proche manque d’Iqama : au maximum cinq autres calendriers consultés, séquentiellement ; aucun remplacement silencieux.
- Calendrier mensuel Hijri/Gregorien avec mois réels, navigation et événements des trois prochains mois.
- Méthodes Umm al-Qura / civile, décalage personnel de -2 à +2 jours et libellé de communauté. Ces préférences ne constituent pas une annonce religieuse vérifiée.
- Planning local de jeûne prévu/accompli, exclusions des jours d’Aïd et de Tashriq, export .ics avec rappel facultatif la veille à 19 h.
- Ramadan, toutes les dix dernières nuits, accès au Khatm, lecteur et invocations.
- Fiches avec références consultables ; dates traditionnelles distinguées des pratiques sourcées. Les dates calculées restent sujettes aux annonces locales.

## Fichiers principaux

`src/hooks/useAutomaticMosque.ts`, `src/lib/automaticMosque.ts`, `src/stores/mosqueStore.ts`, `src/hooks/useFavoriteMosqueSchedule.ts`, `src/lib/locationService.ts`, `src/components/Prayer/AutomaticMosqueControl.tsx`, `src/components/Prayer/MosquePlanning.tsx`, `src/components/Prayer/PrayerExperience.css`, `src/pages/PrayerTimesPage.tsx`, `src/lib/islamicCalendar.ts`, `src/stores/islamicCalendarStore.ts`, `src/components/Prayer/IslamicCalendar.tsx` et son CSS.

## Vérifications réalisées

- 27 tests réussis dans six fichiers : calendrier (6), choix de mosquée (3), hook GPS (4), persistance mosquée (1), calculs horaires (9), affichage des horaires (4).
- GPS refusé, précision insuffisante, réponse tardive après verrouillage et limite des requêtes vérifiés avec simulations.
- Compilation TypeScript et build Vite/PWA réussis. Avertissement existant de gros bundles conservé.
- ESLint des nouveaux modules et composants concernés réussi. Le fichier PrayerTimesPage conserve deux avertissements de niveau erreur préexistants hors de cette modification : setChecked dans un effet et un type any.
- Navigateur local en 390 × 844 : grille, navigation, dix dernières nuits, fiches, persistance du jeûne après rechargement ; entrée de test retirée.
- Source réelle Grande Mosquée de Paris : calendrier publié chargé, prochain Iqama et deux séances de Jumu’a affichés.
- La validation iPhone physique, GPS en déplacement réel et réception du rappel par Apple/Google Agenda ne sont pas réalisées.

## Sources et limites

Réutilise les adaptateurs existants d’annuaire OSM/Overpass et de calendriers publiés, sans SDK officiel MAWAQIT. Couverture et fraîcheur dépendent des sources ; aucune Iqama n’est extrapolée d’un Adhan. Le mode automatique ne crée pas d’accès permanent à la position en arrière-plan. Les horaires calculés de la ville restent identifiés séparément.

Les exports agenda doivent être ouverts/importés par l’utilisateur ; pas de push autonome ajouté. Les événements déjà exportés ne sont pas resynchronisés si le réglage Hijri change.

Références incorporées : Coran 2:185 et 17:1 ; Muslim 1162b, 1164a, 1134a, 1141a ; Bukhari 1991, 2020, 969 ; Nasai 2420 ; Tirmidhi 747. Les liens sont disponibles dans les fiches concernées.

## Production

Déploiement `dpl_2woCzQ8tqzmrz6DMLBkeRoaFb6mf` READY, alias https://www.quran-coach.fr, le 10 octobre 2026. Vérification du domaine public : nouvelles commandes de mosquée et calendrier mensuel visibles après application de la mise à jour PWA. Le navigateur servait d’abord son ancienne version mise en cache ; le bouton « Mettre à jour » a finalement chargé la nouvelle. Capture mobile : `/private/tmp/qc-calendar-mobile.png`.

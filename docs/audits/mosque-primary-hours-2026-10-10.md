# Horaires de la mosquée comme source principale

## Comportement

En mode automatique, à l’ouverture de l’accueil ou de la page Prières, rechercher les mosquées par distance puis retenir la première dont un calendrier publié frais contient les cinq Adhans du jour. Les Iqamas absentes sont indiquées non renseignées. Aucun horaire n’est inventé et aucun assemblage de plusieurs mosquées n’est réalisé.

Le même calendrier alimente le compte à rebours principal, la liste Adhan/Iqama, l’accueil et son widget, les repères de prière du ciel, la carte Iqama et les séances de Jumu’a. Le prochain événement est l’Adhan, puis l’Iqama après l’Adhan ; les séances de vendredi remplacent le prochain Dhouhr. Après Isha, la recherche utilise le lendemain publié.

La recherche s’étend de 5 à 15 km et consulte au maximum dix calendriers séquentiellement par actualisation, avec caches existants. Le premier lieu sans horaires est signalé si un autre est retenu. Une favorite explicitement choisie reste verrouillée ; les installations sans favorite démarrent en automatique. L’autorisation de localisation demeure nécessaire. L’actualisation reste au premier plan.

À défaut de calendrier complet et frais, les horaires calculés restent explicitement identifiés. Lever du soleil, géométrie du ciel, fenêtres Fiqh et notifications calculées existantes ne deviennent pas des horaires publiés de la mosquée.

## Contrôles

31 tests réussis sur six fichiers : localisation (7), recherche automatique (6), horloge publiée (4), store (1), affichage des horaires (4), calculs mosquée (9). Vérification du passage au deuxième lieu, extension à 15 km, limite de requêtes, refus GPS, publication incomplète, Iqama manquante, bascule Adhan/Iqama, vendredi et lendemain.

TypeScript et build PWA réalisés. ESLint des nouveaux modules et du hook modifié passé. Les pages comportent des dettes préexistantes non incluses dans ce contrôle ciblé.

Contrôle visuel local en 390 × 844 avec la favorite déjà enregistrée Grande Mosquée de Paris : les deux écrans affichent Isha Adhan 20:41 et Iqama 20:49 le 10 octobre 2026. Source réelle chargée via l’adaptateur existant. Sélection GPS réelle non testable dans le navigateur agent ; déplacement et choix des candidats testés avec simulations.

Production : déploiement terminé et alias https://www.quran-coach.fr. Capture du test local avec données publiées : `/private/tmp/qc-mosque-home-local.png`.

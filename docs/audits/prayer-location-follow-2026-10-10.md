# Suivi de position des horaires principaux — 10 octobre 2026

## Cause

`resolveCoords()` renvoyait systématiquement les coordonnées persistées, sans nouvelle localisation. Le mode mosquée consultait un GPS indépendant. L’accueil ne recalculait pas immédiatement ses horaires lorsqu’une position changeait.

## Correction

- Mode de position « auto » ou « fixed » persisté dans le store existant, sans changer la clé de stockage. Les installations anciennes, sans mode explicite, utilisent le suivi automatique ; choisir une ville dans la recherche la fixe.
- Un GPS partagé par les horaires et la recherche de mosquées, avec déduplication des requêtes et réutilisation du correctif pendant 30 secondes.
- Actualisation au premier plan sur Accueil/Prières, au retour et toutes les deux minutes ; tentatives espacées d’au moins une minute.
- Calculs et cache actualisés à partir du déplacement (500 m), nom de ville recherché ensuite. L’accueil est abonné aux coordonnées et réglages.
- Le bouton « Autour de moi » active également la position automatique des horaires. La favorite de mosquée reste indépendante d’une ville fixe.
- Les réponses GPS et de nom de ville tardives ne peuvent pas écraser une sélection manuelle. Refus, absence de GPS ou précision supérieure à 1,5 km conservent les derniers horaires avec indication visible.
- Les deux plateformes réutilisent la même acquisition : Capacitor Geolocation en natif, navigateur sur le Web.

## Vérification

15 tests réussis : 7 cas du service de position, 4 cas du hook de mosquée, 3 de sélection stable, 1 de persistance mosquée. Cas couverts : coordonnées anciennes Paris vers Lyon, cache invalidé, acquisition partagée, ville fixe, refus GPS, position imprécise, réponses tardives GPS et reverse-geocoding.

TypeScript et build PWA réussis. ESLint du service, de ses tests, des hooks, du store et de la modale réussi. Les erreurs anciennes des pages n’ont pas été présentées comme résolues.

Contrôle navigateur local : indication « GPS », échec de localisation explicite, horaires conservés, nouveau choix suivi automatique/ville fixe. Aucun accès GPS réel ni déplacement physique iPhone testé. L’actualisation en arrière-plan lorsque l’application est fermée ne fait pas partie de cette correction.

Production : déploiement `dpl_65j3mypqDiDe1mw2MbZvahKxPCFW` READY, alias https://www.quran-coach.fr.

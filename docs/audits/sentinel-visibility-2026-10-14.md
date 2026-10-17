# Sentinelle : visibilité sur l’accueil

## Périmètre accepté : 1, 2, 3 et 5
- Carte permanente et ouverte sous la reprise de lecture, indépendante de l’ordre des sections personnalisables.
- Rappel Sentinelle prioritaire, action directe et lien vers tous les rappels ; les conseils du coach ne prennent plus cette place.
- Icône bouclier dans l’en-tête. Point pour les rappels actuels non consultés, hors simple demande de localisation.
- Prochain rappel disponible, état calme, ville manquante et réactivation explicite. Un rappel non lié à la ville peut rester visible avec un lien de configuration complémentaire.
- Liens `?space=sentinel` ouvrant directement Mes rappels. Présentation générale de la page compagnon conservée (proposition 4 non sélectionnée).
- Champ persistant additif `seenReminders`, limité à 400 entrées. Consulter les rappels ne les marque pas accomplis et ne change pas les préférences.

## Vérifications
- 20 tests passent : sélection Sentinelle, états vide/désactivé/ville manquante/à venir, accès au bon onglet, lecture des rappels sans validation d’accomplissement, logique et store existants.
- ESLint sans erreurs sur SmartSentinel, ses tests, SentinellePage, companionStore et homeExperience.
- HomePage conserve 3 erreurs et 3 avertissements ESLint dans du code préexistant (mémorisation React/dépendances notamment) ; aucune affirmation de lint global propre.
- Build TypeScript/Vite/PWA réussi.
- Navigateur local 390 × 844 : carte, accès direct, consultation retirant le point, désactivation puis réactivation et navigation principale visible. Contrôle à 320 pixels sans débordement horizontal.
- Pas de test sur iPhone physique ni de notifications système. Ce changement porte sur l’affichage dans l’application.

## Publication
Déploiement READY `quran-coach-5vhmns3a1-yattas-projects.vercel.app`, alias https://www.quran-coach.fr. Sur le site public, mise à jour PWA activée puis carte ouverte et bouclier vérifiés à 390 pixels ; préférences/raccourcis conservés. Capture : /tmp/quran-coach-sentinelle-publiee.jpg.

## Ajustement demandé : cartes seules, côte à côte
Le grand panneau a été remplacé par une rangée native à défilement horizontal. Aucun titre visible de section ni mention « Sentinelle » sur l’accueil. Chaque carte contient l’emoji, le titre et l’action ; les explications et actions secondaires restent dans Mes rappels, accessible par le bouclier. Les cartes actuelles précèdent celles à venir, sans défilement automatique. Les états de configuration et de calme utilisent le même petit format.

21 tests ciblés passent (dont consultation sans accomplissement et plusieurs cartes ordonnées), ESLint ciblé propre, build réussi. Navigateur local : 390 px (cartes ~141 px de hauteur), 320 px (~162 px), défilement au clavier effectif, aucun débordement horizontal du document. Les cartes se réadaptent au texte au lieu d’avoir une hauteur fixe qui coupe les titres.

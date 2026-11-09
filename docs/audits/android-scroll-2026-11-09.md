# Défilement des menus — 9 novembre 2026

## Signalement et cause

Défilement à un doigt bloqué dans l’accueil et plusieurs menus Android PWA,
sans TalkBack. Le problème a été reproduit dans Chrome au format 412 × 915.

`body` combine `overflow-x: hidden`, une hauteur automatique et
`overscroll-behavior: none`. Chromium calcule alors `overflow-y: auto` sur ce
conteneur sans plage de défilement propre. La chaîne de défilement est bloquée
avant d’atteindre le document (`html`), qui contient la véritable plage.

## Correction

Autoriser la transmission du défilement sur `body` avec
`overscroll-behavior: auto`. Conserver la protection contre le rebond sur `html`
et les verrous propres aux lecteurs/fenêtres. Aucun changement de dimensions,
de pagination ou de gestion des gestes du Mushaf.

## Contrôles

- Chrome, viewport 412 × 915 : geste de défilement sur l’accueil public avant
  correction, page immobile (position 0).
- Même viewport et même geste sur l’accueil local corrigé : position 915.
- Ouverture/fermeture du menu puis poursuite du défilement : position 1830.
- Réglages local : défilement jusqu’à la position 915.
- Retour sur la version publique non corrigée : blocage reproduit à nouveau.
- Les quatre tests de NavigationMemory passent (retour, filtres, restauration
  et interruption de la restauration par l’utilisateur).

Limite : ces gestes sont exécutés avec le contrôle de Chrome sur Mac, pas sur
un téléphone Android physique. Le geste tactile à un doigt et la PWA installée
doivent encore être confirmés par les utilisateurs concernés.

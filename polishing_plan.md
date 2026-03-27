# Polissage de l'Overlay Calendrier et du Drag & Drop Dhikr

Ce plan vise à améliorer l'expérience utilisateur suite aux retours sur la taille du calendrier et la fluidité de la réorganisation des Dhikrs.

## Changements Proposés

### 1. Overlay Calendrier Islamique (HomePage)
- **Problème :** Le calendrier est trop grand, occupe tout l'écran et est difficile à fermer.
- **Solution :** 
    - Limiter la hauteur du modal à `85vh`.
    - Rendre le contenu interne scrollable (`overflow-y: auto`).
    - Ajouter une transition plus douce et s'assurer que le bouton de fermeture est toujours visible et facile à cliquer.
    - Utiliser un style de "fiche" (sheet) plus moderne.

### 2. Réorganisation des Dhikrs (Drag & Drop)
- **Problème :** Le déplacement est saccadé, peu libre et sort parfois de l'écran.
- **Solution :**
    - `framer-motion`'s `Reorder` est limité à un seul axe (1D). Dans une grille 2 colonnes, cela crée des comportements imprévisibles lors des mouvements latéraux.
    - **Amélioration :** 
        - Ajouter `layout` aux items pour des transitions plus fluides.
        - Désactiver le scroll du corps de la page pendant le drag pour éviter les conflits de gestes sur mobile.
        - Ajuster les contraintes de drag pour éviter de sortir de la zone.
        - Note: Pour une grille 2D parfaite, il faudrait sortir de `Reorder` et utiliser `drag` manuel avec calcul de position, mais on va d'abord tenter d'optimiser le `Reorder` actuel.

## Plan d'Exécution

### [MODIFY] src/pages/HomePage.css
- Ajouter `.islamic-calendar-modal` avec `max-height` et `overflow-y`.
- Améliorer le z-index et le backdrop-filter.

### [MODIFY] src/pages/HomePage.tsx
- Appliquer la nouvelle classe au modal du calendrier.
- Ajouter des propriétés de layout et de contraintes aux items de réordre.
- Empêcher le scroll du body quand `isEditingDhikr` est actif et qu'un drag commence.

## Plan de Vérification
- Vérifier l'ouverture du calendrier sur mobile (doit être centré et scrollable).
- Vérifier la fluidité du drag & drop dans la grille 2 colonnes.

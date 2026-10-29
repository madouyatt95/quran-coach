# Confort du Mushaf — 29 octobre 2026

## Changements

- Continuité sémantique de lecture étendue aux changements d’immersion, de cadrage, de sous-titres et aux dimensions du lecteur. Capture avant les actions explicites ; conservation de la hauteur du mot lorsque les limites de défilement le permettent.
- Cadrage des pages 1 et 2 basé sur leur colonne réelle de 384 unités, avec 8 unités de sécurité de chaque côté. Les pages courantes conservent leur colonne de 468 unités. Aucun texte, glyphe, retour à la ligne ni identifiant coranique modifié.
- Suivi audio calme : déplacement près du bord inférieur, suspension sur défilement ou geste manuel, bouton « Rejoindre la récitation ». Les événements de défilement programmatiques ne suspendent pas le suivi.
- Dernier emplacement visible conservé localement, repère temporaire au retour. Une navigation explicite reste prioritaire ; aucun signet manuel n’est créé ou remplacé.
- Traduction complète toujours en superposition ; fermeture par glissement vers le bas depuis son en-tête, par bouton ou Échap.
- Panneau compact d’agrandissement avec aperçu réel, préférences séparées page seule / double page / pupitre. Migration des préférences existantes sans changement de version du format de sauvegarde.
- Immersion : ligne persistante de reprise audio retirée, reprise accessible par un bouton du transport. Commandes masquées retirées de la mise en page, bordure et marge inférieures superflues supprimées ; zone système iOS conservée une seule fois.

## Vérification

- 46 tests ciblés réussis (10 fichiers), dont 45 dans le lot principal et le test de traduction relancé après adaptation du simulacre de dialogue jsdom.
- `npm run build` : TypeScript, Vite et génération PWA réussis.
- Navigateur intégré, format 390 × 844 : pages d’ouverture, page 291, sous-titres, panneau d’agrandissement et fermeture de traduction par glissement vérifiés.
- Dimensions DOM vérifiées : commandes masquées hauteur zéro ; bandeau des sous-titres jusqu’au bas du viewport sans marge additionnelle (safe area nulle sur ce navigateur).
- Le Mushaf conserve sa géométrie. Lorsque la page tient entièrement dans le viewport, un espace résiduel lié au rapport hauteur/largeur reste possible. La continuité verticale est bornée par le défilement disponible, sans ajouter de grands espaces artificiels.

## Limites

- Pas de nouvel essai sur iPhone physique ou PWA iOS installée pendant cette intervention. La safe area réelle et les interruptions système restent à confirmer sur appareil.
- Pas de nouvelle archive ni de soumission App Store dans cette intervention.
- Le repère de lecture est local ; il n’est pas un signet synchronisé.

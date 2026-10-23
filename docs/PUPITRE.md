# Dispositions de lecture et de travail

Le bouton « Disposition » propose Automatique, Classique, Pupitre (haut/bas) et Double espace (côte à côte à partir de 700 px). La préférence est conservée sur cet appareil (`qc-reading-layout-v1`). Le bouton × revient au mode classique.

## Intégrations

- Mushaf Tajwid interactif : composition originale, page défilable/zoomable en haut, traduction et commandes en bas. La double page du Mushaf est désactivée dans cette disposition pour garder une largeur lisible.
- Mémorisation, espace Entraînement : passage en haut ; lecteur, répétitions, vitesse, fiche mot et bilan en bas. L’aide « Révéler le prochain mot » ne valide aucun mot comme correctement récité.
- Quiz solo et corrections ; dominos, phrases, familles, Memory, sourate mystère, récits, expéditions, portes et faire deviner : contenus et commandes séparés. Les écrans de préparation et bilans finaux peuvent revenir à leur présentation classique.
- Livres : texte ou décor/sous-titres en haut ; chapitres, ambiance, notes et commandes en bas. Le lecteur audio global conserve la même instance.
- Cours Académie Sabirin : explications et exercices de compréhension en deux zones. Les évaluations séparées gardent leur fonctionnement existant. Construction de phrases et laboratoire Ṣarf également adaptés.

## Détection

La largeur seule ne déclenche jamais le pupitre. L’automatisme utilise les media queries `vertical-viewport-segments: 2` / `horizontal-viewport-segments: 2`, ainsi que les dimensions CSS `env(viewport-segment-*)` pour éviter la charnière. La posture pliée seule sans géométrie exploitable laisse le mode classique. Aucun modèle de téléphone n’est déduit du user-agent.

Références techniques :
- https://developer.mozilla.org/en-US/docs/Web/API/Device_Posture_API
- https://developer.mozilla.org/en-US/docs/Web/API/Viewport_segments_API

Ces API ne sont pas universellement disponibles. Le choix manuel fonctionne sans API de pliure. Les composants restent montés lors des changements de disposition, afin de préserver audio et réponses.

## Vérifications

Tests de résolution des dispositions et de conservation du nœud audio / état React ; tests existants des livres, du lecteur, des jeux, de la pédagogie arabe, de Hifdh et de sa fiche mot. Contrôles visuels locaux en navigateur, écoute du livre et changement de disposition, construction d’une phrase, prononciation Hifdh. Build web/PWA vérifié. La validation d’une charnière réelle, d’iOS Capacitor et de toutes les tailles physiques reste à faire sur appareil. La publication web ne remplace pas une nouvelle livraison App Store.

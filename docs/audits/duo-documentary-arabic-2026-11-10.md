# Parcours documentaire et laboratoire d’arabe — 10 novembre 2026

## Périmètre
- Livres : accès « Voyage documentaire », panneau Comprendre du pupitre, frise des scènes du chapitre, suivi de la scène audio ou du paragraphe visible, exploration indépendante et retour au suivi, lecture/écoute au repère existant, personnes et sources dans les fenêtres existantes. Le navigateur de scènes initial reste disponible.
- Académie → Arabe → Explorer et comprendre → Le laboratoire d’arabe (`?atelier=laboratoire`) : Naḥw avec transformations en direct, choix des terminaisons, comparaison avant/après, annulation, liens vers les cours ; Ṣarf avec assemblage tactile des trois radicales et les formes/comparaisons existantes.
- Dispositions manuelles et détection native existantes réutilisées. Aucun changement du moteur, des dimensions ou de la géométrie du Mushaf, ni du correctif de défilement Android.

## Fiabilité des contenus
- Aucun nouveau récit ni texte coranique modifié. Horodatages de `bookSceneCues` / `bookAudioMarks`, jamais estimés.
- Carte uniquement pour les mentions explicites dans un paragraphe doté de références : La Mecque, Médine/Yathrib et Jérusalem. Ce sont des lieux évoqués, pas une affirmation que toute la scène s’y déroule. Les autres lieux ne sont pas positionnés par déduction. Aucun tracé de route, frontière historique ni datation inventée.
- Coordonnées de centres de villes actuels vérifiées le 10 novembre 2026 : https://www.geonames.org/104515/makkah.html ; https://www.geonames.org/109223/madinah.html ; https://www.geonames.org/281184/jerusalem.html. Liens accessibles dans chaque repère. Tuiles OpenStreetMap et attribution conservée. Le fond nécessite une connexion ; le texte et les repères restent utilisables sans tuiles.
- Dates issues du registre éditorial existant, affichées seulement si leur citation exacte existe toujours dans le chapitre. La frise est un ordre narratif, pas une chronologie datée intégrale.
- Arabe : jeu de données pédagogique existant (3 phrases, 4 constructions et familles de Ṣarf du catalogue). Pas de conjugaison générative, pas de synthèse de récitation. Aide phonétique existante en Ṣarf. Manipulations sans glisser-déposer obligatoire.

## Vérifications
- 22 tests ciblés passent : correspondances audio/texte, navigation et reprise du lecteur, exploration documentaire et seek, absence de lieux/dates inventés, terminaisons/annulation et assemblage tactile.
- TypeScript et build web/Capacitor : voir journal de préparation iOS ; lint des nouveaux composants et utilitaires sans erreur.
- Navigateur local : transformation Inna, disposition pupitre, accès documentaire, exploration indépendante, ouverture de la carte et attribution. Le catalogue audio local n’était pas raccordé : lecture réelle non attestée par ce contrôle UI ; seek couvert par les tests.
- La posture physique et le rendu tactile sur l’iPhone Duo doivent être distingués de la compilation et de l’installation.

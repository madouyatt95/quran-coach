# Six jeux pédagogiques — livraison du 22 octobre 2026

## Expériences livrées
- **Les quatre familles** : 2 grilles éditoriales, 16 cartes chacune, sélection de quatre cartes, indices, signalement de trois cartes correctement associées, explication de chaque groupe. Sens français, affichage arabe facultatif. Les essais ne sont pas limités.
- **Le récit à reconstruire** : 6 parcours (Yusuf, Musa, Nuh, Maryam, Musa et l’apprentissage, propriétaires du jardin). Reconstruction des scènes puis compréhension de chaque scène ; résultat avec enseignements et liens vers les chapitres. Ordre du parcours, sans dates inventées.
- **La sourate mystère** : 5 sourates différentes tirées de la banque audio existante par partie. Quatre propositions ou recherche parmi les 114 sourates. Trois essais par sourate. Indices par versets entiers successifs, bornés à la dernière ayah. Écoute complète requise avant réponse, révélation possible sans attribuer une réussite. Bilan et passage arabe/français après révélation.
- **Fais deviner** : 20 cartes éditoriales, 10 par partie ; trois mots interdits. Carte masquée au passage du téléphone, pause et rechargement. Validation par le groupe, sans micro. Sans chrono par défaut, ou 60/90 secondes. Chrono basé sur le temps écoulé, suspendu lorsque l’écran est quitté ; une validation tardive ne transforme pas une expiration en réussite.
- **Les portes du savoir** : 3 enquêtes, 4 portes chacune. Observation, indice, justification puis reconstruction du raisonnement par cartes à ordonner. Chaque porte exige sa résolution. Décor de bibliothèque fictif explicitement distingué des sources.
- **Le Memory des mots** : 5 jeux de 6 paires arabe/français. Les réponses des cartes retournées sont absentes du DOM et des noms accessibles. Observation sans délai forcé, prononciation lorsque la forme exacte est disponible, exemples et accès au verset.

Les six modes historiques restent visibles en premier. Les nouveaux jeux figurent dans « Jouer autrement ». Chaque jeu possède sa partie locale indépendante ; lancer un autre jeu n’efface pas la partie précédente. Changer de partie demande un clic explicite, avec avertissement lorsqu’elle est inachevée. Les scores n’affirment pas une maîtrise religieuse et ne valident aucun cours automatiquement.

## Sources et limites
- Vocabulaire : lexique existant `QURAN_VOCABULARY`. Les groupes sémantiques sont rédigés pour les cartes de leur grille, sans prétendre épuiser les sens de chaque mot.
- Prononciation : résolveur Fahm/Mushaf existant. Correspondance exacte de la forme normalisée obligatoire ; jamais de décalage par position supposée. En absence d’audio exact, lien vers le verset, sans substituer un autre mot.
- Récits : `storyChapters`, textes, références et questions existants. Aucune nouvelle citation religieuse générée.
- Enquêtes : `quizInvestigations` et cours/récits déjà intégrés. La quatrième porte assemble les réponses établies par les trois précédentes.
- Sourate mystère : source directe Alafasy `cdn.islamic.network` déjà employée par le quiz audio ; indices de versets calculés avec les longueurs canoniques des sourates. L’API de résolution Quran.com a répondu 403 depuis la CLI lors du contrôle ; le jeu n’en dépend pas pour jouer ses indices.
- Les parties sont sauvegardées sur cet appareil, séparément des séances de quiz. Elles ne sont pas ajoutées à la synchronisation chiffrée ni au registre d’export dans cette livraison.
- Les données locales sont disponibles une fois les ressources de l’application chargées ; les audios et la prononciation peuvent nécessiter le réseau. Aucun pack audio intégral hors ligne n’est annoncé.

## Vérification
- 78 tests ciblés sur 11 fichiers : six moteurs, fausses réponses, absence de saut de portes, limite des versets, contrôle des choix audio après écoute, reprise indépendante, masquage des cartes, délai audio, abandon/expiration du chrono, fin de partie unique, anciennes fonctions quiz et partage.
- Compilation TypeScript/Vite/PWA réussie ; `git diff --check` sans erreur.
- Trois fichiers audio directs contrôlés par requête partielle HTTP : Al-Fatiha 1:2, Al-Ikhlas 112:3, Al-Kawthar 108:3 ; réponses 206 et contenu `audio/mpeg`.
- Le contrôle du navigateur est désactivé dans les réglages Work. Aucun nouveau contrôle visuel navigateur ou sur iPhone physique n’a été effectué. Les tests DOM ne prouvent ni le rendu mobile réel ni la lecture sonore sur un appareil.

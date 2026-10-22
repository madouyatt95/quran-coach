# Jeux d’exploration et contrôle des quiz — 22 octobre 2026

## Livraison

Accès : Quiz & défis → Jouer autrement. Les six jeux précédents et les modes classiques restent accessibles.

- `/quiz?game=roots` : domino à deux extrémités, six pièces, trois familles (ك ت ب, ف ت ح, س م ع). Deux niveaux : racines visibles ou à reconnaître. Retournement automatique, annulation du dernier coup, détection d’une impasse, sources et explication des formes. Chaque lien associe deux racines identiques, sans prétendre que les mots sont synonymes.
- `/quiz?game=sentences` : huit constructions, quatre parcours (nominal, verbal, groupes prépositionnels/iḍāfa, parcours complet sans étiquettes). Placement tactile en cases RTL, déplacement sans duplication, aides, correction des fonctions et terminaisons. Les exemples viennent de l’Académie et sont explicitement hors verset. Lecture par le service de synthèse existant, avec arrêt à la sortie ; sa qualité dépend du service et de la voix disponible.
- `/quiz?game=expedition` : trois expéditions — Yusuf, dernières sourates, clés de la phrase arabe. Quatre étapes et deux chemins par étape, soit 24 épreuves possibles. Choix durable, verrouillage des étapes futures, correction après chaque réponse, carnet final avec références. L’expédition audio propose un accès au texte si l’écoute est indisponible, compté comme aide. Les choix de réponse sont mélangés une seule fois, puis conservés.

Les parties restent sauvegardées localement, une par jeu. Le remplacement d’une partie est explicite. La synchronisation chiffrée entre appareils et un archivage de toutes les anciennes parties ne sont pas ajoutés ici. Un jeu sauvegardé endommagé ou incompatible est ignoré à la restauration ; les autres jeux sont conservés. Les résultats de ces jeux ne valident pas automatiquement les cours de l’Académie.

## Sources

Réutilisation des contenus présents dans `src/arabic/sarf.json`, `sentenceData.ts`, `journeyData.ts`, `src/data/storyChapters.ts`, `quranVocabulary.ts` et du corpus canonique local. Aucun verset rédigé, recomposé en exercice ou généré. Les formulations pédagogiques ne sont pas présentées comme des citations.

Les sources morphologiques de chaque famille sont accessibles depuis le résultat. Pour les constructions, liens vers la documentation du Quranic Arabic Corpus :

- https://corpus.quran.com/documentation/verb.jsp
- https://corpus.quran.com/documentation/possessiveconstruction.jsp
- https://corpus.quran.com/documentation/phrasetags.jsp
- https://corpus.quran.com/documentation/prepositionphrase.jsp

Les pages « verb » et « possessiveconstruction » ont été consultées pendant cette livraison. Cela ne constitue pas une authentification exhaustive de tous les anciens contenus religieux des banques de quiz.

## Corrections apportées après contrôle

- Défi quotidien aligné sur la date locale de l’appareil, avec actualisation à la réouverture et au changement de jour.
- Chronomètre basé sur le temps écoulé, même si les callbacks sont ralentis en arrière-plan. Gel et pénalité de temps conservés.
- Double clic du sprint bloqué avant qu’il puisse répondre à la question suivante invisible.
- Réponses hors limites/fractionnaires rejetées sans consommation de question ni de bonus.
- Audio chargé uniquement à la demande, arrêt sur changement de lecteur/sortie, annulation et délai de 15 secondes avec reprise après un chargement bloqué.
- Sourate mystère : bilan des indices aligné sur les versets supplémentaires effectivement ouverts.
- Duel : difficulté commune, impossibilité de rejoindre sa propre partie, revendication conditionnelle de la seconde place pour ne pas écraser un joueur concurrent.
- Duel : abandon des résultats de synchronisation obsolètes après sortie, horloge remise à zéro quand l’adversaire rejoint.
- Duel : fin de partie en attente tant que l’adversaire n’a pas fini ; aucun gain/perte enregistré prématurément. Finalisation unique après réception des deux résultats. Quitter cette attente est possible, avec indication que le duel ne sera pas compté au bilan.
- Création d’un duel : fin des tentatives automatiques en boucle sur erreur, message et reprise manuelle. Gestion des erreurs de connexion et de copie de code. Sélecteur de thèmes utilisable au clavier.

## Vérifications

- 119 tests ciblés réussis, 16 fichiers : jeux, données, états persistés, transitions DOM, anciens modes, partage, apprentissage, audio simulé et duels simulés.
- Contrôle structurel de 1 947 questions classiques/Sira/audio et de 2 240 questions d’apprentissage (ces ensembles se recoupent) : index de bonne réponse, choix non vides et distincts, références coraniques dans les limites des sourates. Les 15 thèmes testés aux trois difficultés et les manches des duels contiennent des questions jouables.
- Tous les parcours des nouveaux jeux : huit constructions ; 16 combinaisons de chemins pour chacune des trois expéditions ; branches des dominos, sorties d’impasse, annulation, refus des doublons et finalisation unique.
- Tests de reprise et sauvegarde endommagée, indices, écoute obligatoire ou aide explicite, changement de partie.
- Livraison réseau vérifiée sur trois fichiers audio Alafasy : réponses HTTP 206, type audio/mpeg, 64 octets demandés et reçus. Cela ne démontre pas une écoute audible sur appareil.
- Compilation TypeScript et Vite/PWA ; `git diff --check`.

## Limites des contrôles

Le contrôle du navigateur est désactivé dans Work : aucune vérification visuelle interactive ni écoute sur iPhone physique pour cette livraison. Les tests DOM utilisent JSDOM ; les médias et les échanges Supabase des tests sont simulés. Un duel réel entre deux appareils et les politiques distantes Supabase restent à valider. Aucune migration, donnée de joueur distante, archive native iOS ou soumission App Store modifiée.

La suite globale signale six échecs hors quiz : `dailyAdhkar.test.ts` (1), `CoachPage.test.tsx` (2), `LiveFollowPanel.test.tsx` (3). Les mêmes six échecs ont été reproduits dans une extraction séparée du commit précédent `be08e72`, avant les modifications de cette livraison. Ils ne sont pas masqués ni déclarés corrigés.

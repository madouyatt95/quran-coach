# Quiz : explications, activités et liens depuis les lectures

## Réalisé
- Volet « Pourquoi cette réponse ? » : raisons rédigées par proposition, associations corrigées avec exemples coraniques, ordre attendu et sources. Aucune génération à la volée ; si les raisons des distracteurs manquent, seule l’explication disponible est affichée.
- Cinq accès directs sous « Une autre façon de jouer » : ordre, situation d’invocation, reconnaissance audio, associations arabe/français, recherche de confusion. Les six modes historiques restent en tête.
- Questions de compréhension de Fahm intégrées au moteur existant ; distinctions explicites ajoutées pour les sept versets d’Al-Fatiha à partir du contenu des leçons.
- Passerelles depuis les cours Sabirin, les récits possédant des chapitres pédagogiques et les leçons Fahm. Six exercices maximum, aucun élargissement à un autre chapitre ou aux autres versets de la sourate.
- Retour à la lecture conservé dans la séance, y compris après rechargement ; une séance en pause n’est remplacée qu’en lançant explicitement les nouveaux exercices.
- Le quiz enregistre ses propres acquis. Il ne déclare pas automatiquement le cours ou le passage terminé.
- Correction d’un distracteur ambigu du chapitre Sabirin Hadith 12 : deux propositions étaient auparavant des attributions erronées alors qu’une seule était attendue.

## Sources et limites éditoriales
- Académie : `courseLibrary`, `coursePedagogy`, `courseChallenges`, cours Sabirin déjà fournis par l’utilisateur. Les formulations pédagogiques ne sont pas de nouvelles citations.
- Récits : questions et explications de `storyChapters`, avec références conservées.
- Fahm : `FAHM_MEANING`, référence exacte de chaque question. Un passage sans question préparée présente un état vide, sans substitution par une question sans rapport.
- Vocabulaire : `QURAN_VOCABULARY`, exemples filtrés par `validExamples`, associations distinctes ; sens du lexique, pas une traduction contextuelle universelle.
- Invocations : chapitres et traductions existants de `HISNUL_MUSLIM_DATA`.
- Audio : fichiers et références du générateur existant `generateAudioQuestions`.
- Toutes les anciennes questions ne disposent pas encore d’une explication distincte de chaque mauvaise option.

## Contrôles
Tests automatisés : cohérence des formats et du partage, périmètre strict des sources, refus des retours externes, correction après mélange des choix, conservation de la séance, liens vers la lecture, RTL arabe et références des associations. Compilation TypeScript/Vite/PWA.
Le navigateur de la session est désactivé dans les réglages Work : pas de nouveau contrôle visuel navigateur ni sur iPhone physique pour cette livraison.

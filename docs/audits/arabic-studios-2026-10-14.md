# Ateliers d’arabe — 14 octobre 2026

## Six ajouts
- Transformations : trois phrases pédagogiques, quatre constructions chacune ; démonstration animée et reconstruction avec choix des formes. Accord féminin de kāna vérifié. Animation désactivée avec prefers-reduced-motion.
- Sourates : 15 étapes sur les 4 versets d’Al-Ikhlas, les 5 d’Al-Falaq et les 6 d’An-Nas. Audio du réciteur sélectionné, reformulation personnelle, traduction existante, question grammaticale, liens Mushaf/Fahm/cours/source.
- Décomposition : huit mots canoniques, découpage conservant tous les caractères et diacritiques, explications segment par segment. Le mot original reste visible.
- Réparation : six exemples non coraniques volontairement fautifs. Validation combinant mot, forme et justification. Le feedback reste visible avant de poursuivre la séance.
- Aides progressives : huit phrases, assemblage, indice et réponse française libre. Seules les variantes explicitement rédigées sont reconnues automatiquement ; une formulation non reconnue n’est pas déclarée fausse.
- Séance : 5/10/20 minutes indicatives, rappels effectivement échus, difficulté observée si disponible, prochain cours avec prérequis validés, applications. Durées longues ajoutent des applications. Plan figé et réponses conservées sur l’appareil ; rechargement sans perte d’étape. Aucun cours validé par la simple lecture du résumé.

## Fichiers
ArabicPage.tsx et ArabicLearning.css ; nouveaux ConstructionStudio.tsx, studioData.ts, SegmentStudio.tsx, journeyData.ts, SurahJourney.tsx, DailySession.tsx, dailyPlan.ts, studios.test.tsx.
Stores existants réutilisés : arabicLearningStore, arabicPracticeStore, fahmLearningStore, statsStore. Aucun effacement ni changement de clé de préférence.

## Sources et périmètre
Texte coranique : src/lib/fahm/context-corpus.json existant, sans génération ni normalisation de ses caractères. Traduction et récitation : loadFahmVerse/getAudioUrl existants.
Analyses vérifiées sur Quranic Arabic Corpus : https://corpus.quran.com/wordbyword.jsp?chapter=112 ; chapitres 113 et 114 ; documentation de kāna, inna et des catégories grammaticales. Chaque mot ciblé possède un lien vers sa fiche de morphologie.
Explications et phrases pédagogiques rédigées pour Quran Coach. Aucun téléchargement de vidéos ni nouvelle police/donnée tierce. Les parcours ciblent une construction par verset ; ce ne sont pas des analyses grammaticales exhaustives ni un nouveau tafsir.

## Vérifications
- 52 tests réussis dans 9 fichiers : intégrité des segments, références des 15 versets, accords, variantes françaises, sélection des rappels et difficultés, durées, reprise, garde contre double validation, interactions de correction et réponse libre, régressions Fahm et progression.
- ESLint src/arabic : réussi.
- npm run build : TypeScript + Vite + génération PWA réussis.
- Navigateur local, viewport 390×844 : transformation de la chambre avec kāna, ouverture des segments, affichage des traductions 112:1 et 114:6, audio 112:1 réellement en lecture, séance de 5 minutes reprise à l’étape 2 après rechargement puis terminée.
- Aucun test sur iPhone physique ni validation complète hors ligne. Audio/traduction dépendent des services et caches existants. Reformulation libre bornée aux équivalents rédigés, sans jugement automatique ouvert.

## Publication
Vercel `dpl_6ELBnnNQ4cPwo3wCraat9LfJudqe` : Ready, alias www.quran-coach.fr confirmé. Domaine public : mise à jour via le bouton PWA « Mettre à jour » depuis /academy, six accès visibles sur /academy/arabic, puis ouverture du parcours de sourates avec le texte canonique et les commandes. Progression existante préservée après mise à jour.
Essais locaux supplémentaires : reconstruction de kāna au féminin validée avec les deux sélecteurs ; formulation française libre « La porte est ouverte. » reconnue dans le navigateur.

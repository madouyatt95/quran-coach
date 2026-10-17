# Arabe — deuxième niveau et progression (14 octobre 2026)

## Livraison
- 20 cours : 12 existants conservés, 8 nouveaux (accord, pronoms attachés, négation, interrogation, kāna, inna, impératif, passif). Trois développements par nouveau cours, exemple analysé, comparaison, prérequis libres, deux questions et application structurée.
- 40 questions de transfert distinctes des 40 questions de cours. La première révision propose la variante ; lorsque la banque est épuisée, elle est explicitement présentée comme déjà rencontrée. Aucune génération de questions ni certification de maîtrise.
- 12 analyses rédigées : nature, fonction, preuve et, en mode terminaisons, justification de la marque. Exemples pédagogiques distincts des versets. Les unités composées ne reçoivent pas un cas global artificiel.
- Diagnostic facultatif de six questions, recommandation du premier repère manquant et accès libre. Le profil déclaré ne remplace pas les réponses observées.
- Six exercices audio : sources Quran.com, lecture normale/0,75×, texte masqué avant réponse ou demande d’aide, deux paires de comparaison, arrêt au changement d’exercice/navigation. Pas de voix synthétique et pas de vidéos.
- Relecture sans effacer la validation ; reprise des exercices distincte, validation acquise conservée, sans double crédit de journée.
- Nouveau stockage additif qc-arabic-practice-v1 : assemblages, case active, indices, explications, comparaisons Sarf, diagnostic, analyses et réponses d’écoute. Le stockage historique qc-arabic-learning-v1 et le rappel Fahm sont conservés.

## Sources / limites éditoriales
Les explications et phrases d’entraînement sont rédigées pour le parcours. Références vérifiées : Quranic Arabic Corpus, documentation grammar, adjective, verb, verbkaana, particleinna, mood, imperative, particlealif, prepositionphrase et possessiveconstruction. Liens disponibles dans chaque cours/atelier. Il s’agit d’un parcours d’initiation et d’approfondissement ciblé, pas d’une couverture exhaustive du naḥw et du ṣarf ni d’une validation par un enseignant.
Le texte des exercices d’écoute provient du corpus canonique déjà livré (context-corpus.json). Les URL utilisent le résolveur mot/position du lecteur, et non le champ audio_url de l’API dont les décalages sont connus. Six fichiers vérifiés HTTP 200 audio/mpeg : 001_005_002, 001_005_004, 112_003_002, 112_003_004, 001_006_001, 001_001_001. Lectures distantes, sans nouveau téléchargement hors ligne. Disponibilité du fournisseur nécessaire. L’API verses/by_key était 403 dans ce contexte ; aucune dépendance à cet appel n’a été ajoutée.

## Vérifications locales
- 44 tests ciblés : cours, validations, sauvegardes, compatibilité des anciens brouillons, variantes, absence de double crédit, prérequis, intégrité des formes, analyses et identifiants audio, rappels Fahm et protection des mises à jour.
- ESLint ciblé et build TypeScript/Vite/PWA.
- Navigateur à 390 × 844 : analyse soumise et restaurée après rechargement, diagnostic repris au bon item, cours kāna complété puis relu avec validation conservée. Pas de débordement horizontal observé sur l’atelier d’analyse.
- Audio : lecture effective readyState 4 ; vitesse 0,75 puis 1, texte révélé après réponse, arrêt à la navigation. Vérification technique ; pas d’expertise phonétique de chaque enregistrement.
- Pas de test sur iPhone physique et pas de simulation hors ligne de cette livraison.

## Fichiers principaux
src/arabic/levelTwo.ts, analysisData.ts, AnalysisWorkshop.tsx, diagnosticData.ts, Diagnostic.tsx, listeningData.ts, ListeningPractice.tsx, reviewVariants.ts, ArabicReview.tsx, ArabicPage.tsx ; src/stores/arabicLearningStore.ts, arabicPracticeStore.ts. Les ateliers existants adoptent la sauvegarde additive.

## Publication
Déploiement production `dpl_2YGaW1XPJ5q4G5ZhTdoy3oK9ttGr`, état READY, alias `https://www.quran-coach.fr`, URL Vercel `https://quran-coach-bys12d5dj-yattas-projects.vercel.app`. Build distant réussi.
Vérification publique effectuée après activation du bouton « Mettre à jour » depuis /academy : carte « Découvrir les 20 leçons », programme à deux niveaux, quatre entrées d’ateliers, ouverture de /academy/arabic?atelier=endings. Les essais pédagogiques modifiant une progression ont été faits en local, pas sur la progression de production. Le format mobile a été réinitialisé après les contrôles.

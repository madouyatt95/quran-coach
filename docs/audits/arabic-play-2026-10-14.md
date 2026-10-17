# Apprentissage ludique — six évolutions

## Réalisation
1. Aventure Al-Ikhlas / Al-Falaq / An-Nas : 15 missions de cinq étapes (écouter ou lire, retrouver un mot, assembler une analyse, comparer une explication, répondre). Texte canonique inchangé. Progression déterminée par les actions, écran de réussite conservé jusqu’au choix de la suite. Rejouer ne double pas l’acquisition.
2. Transformation tactile : insérer kāna/inna/fī, toucher le mot et choisir sa forme ; trois exemples et neuf transformations. Glisser-déposer HTML facultatif, intégralité accessible au toucher/clavier. Toutes les formes sont vérifiées, y compris celles qui devaient rester inchangées. Vue précédente conservée dans un volet.
3. Quatre enquêtes pédagogiques : collecte d’indices sur les mots avant conclusion. Mauvaises interprétations explicitement présentées comme hypothèses ; aucun verset altéré.
4. Six duels : voix, négation, possession, phrase nominale, kāna, personne. Différences et traductions révélées après réponse. Réussite initiale et réponse corrigée distinguées, sans chronomètre.
5. Carnet : repères coraniques gagnés par mission et trois familles verbales gagnées par duel. Formes existantes de ṣarf, liens de lecture, segments lorsque disponibles. Défi dans un autre passage contenant exactement le même mot ou application à un autre exemple du cours.
6. Séances immersives : 5/10/20 minutes indicatives ; activités alternées, explications à déplier, retours avant de continuer. Le format 10 minutes comprend un duel et le format 20 minutes une enquête. Anciens plans conservés. Interface dans un portail avec fond inert, défilement propre, sortie persistante, progression, focus clavier et Échap. Animations désactivables et respect de prefers-reduced-motion ; vibrations facultatives via Capacitor natif ou API navigateur.

## Préservation et sources
Nouveau store additif qc-arabic-adventure-v1. Les clés existantes, cours, validations et brouillons restent conservés. Les missions ne valident pas artificiellement les leçons ni une rétention à distance.
Réutilisation du corpus canonique, des services audio et de traduction, des 15 analyses déjà sourcées, des formes de ṣarf et des cours existants. Phrases pédagogiques rédigées pour ces activités. Vérification des constructions via Quranic Arabic Corpus : https://corpus.quran.com/documentation/grammar.jsp ; verbkaana.jsp ; particleinna.jsp. Les fiches coraniques gardent le lien de source exact.

## Vérifications
- 61 tests / 10 fichiers : étapes non contournables dans le parcours normal, erreurs sans gain, dédoublonnage, reprise persistée, références et familles, collecte d’indices, correction tactile y compris le mot inchangé, carnet conditionnel, anciens tests de progression/Fahm. Régression ajoutée pour garder l’écran de réussite visible.
- ESLint ciblé sans erreur ni avertissement.
- Navigateur local 390 × 844 : mission 112:1 complète avec écoute effective puis fin audio, repérage, assemblage, comparaison et question finale ; apparition du mot dans le carnet. Séance 10 minutes, duel répondu puis rechargement à la même étape, résultat conservé, sortie d’immersion et restauration de la navigation.
- Vérification visuelle du cadre immersif : navigation recouverte, bouton de pause et progression visibles. Pas de test sur iPhone physique, vibrations natives ou hors ligne complet. Le premier chargement des médias reste dépendant des sources/caches existants.
- Build de production réussi. Déploiement Vercel prêt : https://quran-coach-dtklxxs4t-yattas-projects.vercel.app, alias https://www.quran-coach.fr.
- Site public vérifié après activation de la mise à jour PWA : accueil du programme avec aventure, duels, enquêtes et carnet ; ouverture du parcours Al-Ikhlas, mission 112:1, texte arabe et commandes présents. Les interactions complètes ont été testées en local ; aucune progression utilisateur ajoutée en production pendant cette vérification.

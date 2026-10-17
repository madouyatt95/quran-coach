# Académie : analyse ; invocations : correction audio

## Défaut corrigé

Les premières entrées des sélections matin/soir sont les identifiants locaux 94 (Ayat al-Kursi, Hisn 75) et 95 (les sourates 112, 113 et 114, Hisn 76). Elles n'avaient pas de correspondance dans le catalogue de récitations humaines. La branche coranique du service était réservée aux Rabbanā : ces deux entrées aboutissaient donc au TTS, dont l'endpoint Google non officiel accepte mal les longs textes et dont le secours dépend des voix de l'appareil.

Deux enregistrements complets OpenDua v0.0.2, récités par Muhammad Jumah, sont désormais inclus localement : OD-075 (83,72 s) et OD-076 (92,07 s). Les six associations matin/soir/chapitre Hisn sont explicites. Aucune nouvelle normalisation approximative n'est appliquée au catalogue : un fichier de correspondances relues contrôle les SHA-256 des textes local et source, et l'import contrôle les empreintes audio de l'archive. Le texte coranique affiché est inchangé.

OD-075 comporte une istiʿādha en introduction : cette différence est indiquée dans le lecteur. OD-076 comporte les trois sourates avec leurs basmala. Les découpages d'apprentissage aux pauses acoustiques couvrent tout le fichier (11 et 7 passages, sans alignement mot à mot revendiqué). Le niveau de détection de silence d'OD-076 est adapté à son bruit de fond. Les voies récitation, répétition, apprentissage, modèle/comparaison et téléchargement utilisent le catalogue existant.

Source : [OpenDua Downloads](https://opendua.org/downloads), consultée le 12 octobre 2026 : l'éditeur invite les applications à embarquer l'archive audio. Le README d'attribution de l'archive est conservé ; sa licence audio est distincte de la licence CC BY des données. Textes sources conservés dans le manifeste.

## Vérifications locales

- 27 tests réussis : associations, lecture enregistrée des deux entrées dans les trois catégories, cycles/pause/annulation existants, intégrité des plages et maintien du texte source.
- TypeScript, lint ciblé, compilation de production et diff sans erreur.
- Navigateur Chrome à 390 × 844 : les quatre lectures matin/soir démarrent effectivement, avancent dans le MP3, se mettent en pause et reprennent ; modèle de comparaison fonctionnel ; apprentissage enregistré des deux entrées. Pas d'appel à SpeechSynthesis dans ces scénarios et pas d'erreur JavaScript.
- Les deux MP3 correspondent aux empreintes du manifeste d'origine et sont décodables par FFmpeg. Pas de test sur iPhone physique ni de nouvelle validation exhaustive de toutes les autres invocations.

Publication `dpl_8mVEhNjChZ6odhfUq2TCfy37h4nf` confirmée READY sur https://www.quran-coach.fr (URL immuable : https://quran-coach-6bgbx1y3r-yattas-projects.vercel.app). Les mêmes scénarios de lecture, pause/reprise, arrêt et modèle des quatre entrées, ainsi que l'apprentissage des deux textes, ont tous réussi sur le domaine public après publication. Le scénario navigateur est sorti avec le code 0.

Le défaut de recherche Académie a également été reproduit dans le navigateur local avec « Makharij » : cliquer le résultat verrouillé efface la recherche et retourne au hub sans ouvrir de leçon ni expliquer le prérequis.

## Académie : existant et suggestions, sans modification

Examen de `AcademyHub`, `AcademyJunior`, `academyStore`, des données des deux niveaux, et aperçu mobile du hub. Déjà présents : neuf modules adultes en deux niveaux, quiz, reprise partielle, révisions par module, glossaire, pratique Tajwid et mode Junior. Le Junior ne contient qu'un module actif ; quatre cartes sont encore des parcours futurs verrouillés.

Propositions :

1. Une entrée « Ma séance de 5 minutes » et une reprise précise, avant le compteur de points ; progression visible par compétence.
2. Un atelier de prononciation avec sons humains contrôlés, lettres voisines, écoute lente et comparaison locale. Le helper actuel emploie SpeechSynthesis pour l'arabe et n'annule pas les minuteries des listes de lettres en quittant la page.
3. Appliquer chaque règle dans le Mushaf interactif, avec segment visé, écoute et retour à la leçon ; dépasser les QCM de reconnaissance déjà présents.
4. Un court diagnostic pour orienter le parcours selon le niveau et l'objectif, avec possibilité de refaire les bases.
5. Réviser les erreurs précises (lettre, règle, question), au lieu de rouvrir tout un module ; conserver les réponses et l'étape de quiz.
6. Enrichir les parcours adultes et ouvrir de vrais parcours Junior, avec explications sourcées, activités guidées et distinctions explicites lorsque les pratiques diffèrent.

Défauts constatés dans le code à traiter avec cette refonte : progression intermédiaire ramenée à zéro hors du module actif ; recul dans une leçon non sauvegardé ; index/réponses de quiz non persistés et certaines transitions non sauvegardées ; score calculé sur la tentative en mémoire ; recherche affichant les modules verrouillés mais `startModule` les ignore silencieusement. Ces problèmes ne sont pas annoncés comme corrigés dans ce correctif audio.

# Cours Naḥw et Ṣarf — approfondissement pédagogique

## Changements
1. Douze développements guidés : question initiale, trois étapes, comparaison, « Pourquoi ? », autre exemple et erreur fréquente. Les explications existantes sont conservées.
2. Huit constructions au toucher (deux par leçon de Naḥw) : fonctions à choisir, mots à placer, correction des relations, indices et remise à zéro. Pas de glisser-déposer requis. Les exemples sont hors verset.
3. Laboratoire de Ṣarf : trois racines (ك ت ب, ف ت ح, س م ع), trente formes verbales préparées, six participes, radicales colorées et ajouts soulignés, schèmes et comparaison. Actif : je, tu masculin, il, nous ; accompli et inaccompli indicatif. Passif : troisième personne masculine singulière explicitement indiquée. Aucune génération libre de formes arabes.
4. Quarante-huit explications distinctes pour les distracteurs des vingt-quatre questions, suivies de vingt-quatre exercices de transfert. Après réussite du transfert, l'élève réessaie la question initiale. Les révisions ne comptabilisent que la première réponse ; les tentatives corrigées restent de l'entraînement.

## Compatibilité
Clé de progression `qc-arabic-learning-v1` conservée. Champ optionnel `remedies` ajouté aux brouillons, sans effacement ni migration destructrice des résultats déjà acquis. Réponses de correction sauvegardées. Les constructions et comparaisons des ateliers sont des manipulations temporaires, réinitialisées lorsqu'on quitte leur écran. Correction supplémentaire : les ateliers acceptent plusieurs mots ayant la même catégorie/racine et n'affichent plus des options de catégorie en double.

## Sources et portée
Explications et exemples pédagogiques rédigés pour l'app ; pas de citation coranique générée, pas de modification du corpus ou des sept versets déjà analysés. Pas de vidéos. Notions contrôlées avec la documentation Quranic Arabic Corpus (grammar, verb, verbforms, phrasetags, possessiveconstruction, prepositionphrase). Formes et vocalisations comparées aux entrées lexicales Arabic de Wiktionary :
- https://en.wiktionary.org/wiki/كتب#Arabic
- https://en.wiktionary.org/wiki/فتح#Arabic
- https://en.wiktionary.org/wiki/سمع#Arabic
Les tables complètes et les définitions des ressources ne sont pas importées. Les formes lexicales sont saisies dans un inventaire borné ; les explications françaises sont originales. Chaque atelier renvoie à sa source. Pas de validation par un enseignant humain revendiquée.
La prononciation du nouveau laboratoire est indiquée en translittération ; aucun nouvel enregistrement audio n'est ajouté. Les verbes faibles, les autres personnes du passif et les autres modes verbaux ne sont pas couverts par ce laboratoire.

## Vérifications
- 37 tests ciblés passent (7 fichiers), dont 7 nouveaux tests : toutes les branches de correction référencées, conservation des 36 chaînes arabes et de leurs radicales, assemblage sans duplication, reprise des anciens brouillons, chemin erreur → transfert → nouvel essai, catégories équivalentes et assemblage réel avec React.
- ESLint ciblé, TypeScript et build Vite/PWA réussis.
- Navigateur local 390×844 : étapes de raisonnement, ouverture d'exemple, assemblage sujet/verbe/objet, liens de fonctions, erreur sujet–objet, succès de correction conservé après rechargement puis nouvel essai, choix de famille/personne/aspect/voix et comparaison actif/passif.
- iPhone physique et mode avion non testés. Aucun nouvel accès réseau requis pour les données pédagogiques elles-mêmes ; les passages coraniques continuent à utiliser le service existant.

## Publication
Déploiement `dpl_ju9BuJUrDu7vFoBxpY9MMYgP1LQT`, domaine public `https://www.quran-coach.fr`. Activation par le bouton « Mettre à jour » de l'Académie vérifiée ; cours `/academy/arabic/verbal` vérifié en production avec le raisonnement guidé, les comparaisons et les explications supplémentaires. Pas d'erreur console pendant le contrôle local du laboratoire ; document 384 px dans une fenêtre 390 px.

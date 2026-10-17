# Arabe : explications, lecture et renouvellement — 16 octobre 2026

## Réalisation
- Scène interactive dans les 20 cours : exemples pédagogiques originaux conservés, rôle au toucher ou avec Précédent/Suivant, apparition animée de l’explication, comparaison des constructions avec différences soulignées. Zoom sur la fin du mot pour les leçons de cas, alif de soutien du tanwīn inclus. Respect de la préférence d’animation et de prefers-reduced-motion.
- Liens de cours vers les occurrences des annotations existantes et des parcours Al-Ikhlas, Al-Falaq, An-Nas. Priorité au passage courant, au signet et aux cartes de révision. Ouverture silencieuse dans le mode choisi ; dans le Tajwid interactif, centrage et repère du mot précis. Retour au cours conservé.
- Fiche de mot du Tajwid interactif : « Comprendre sa construction », explication et lien vers le cours. Chargement différé ; aucune annotation déduite automatiquement. Vérification de l’identifiant et du texte normalisé avant affichage.
- 12 nouveaux duels et 8 nouvelles enquêtes : total 18 duels et 12 enquêtes. Choix par notion, autre exemple après erreur ou réussite, historique des exemples rencontrés, reprise conservée. Les séances quotidiennes privilégient un exemple encore non rencontré de la notion choisie. Les anciens identifiants et les plans de séance existants restent valides.
- Validation de niveau 1 : l’exploration d’un mot ne suffit plus ; un exemple distinct doit être réussi. Les anciennes leçons complètes sont préservées ; une application ancienne d’une leçon incomplète ne contourne pas la nouvelle vérification. L’exemple est marqué comme rencontré afin de ne pas être ensuite crédité comme transfert inédit sans aide.
- Messages de méthode et détails techniques déplacés dans des volets « Comment fonctionne ma progression ? », « Pourquoi cet exercice ? », « Précisions sur l’analyse » et « À propos des enregistrements ».

## Sources et limites
Le texte coranique est repris sans modification du corpus existant `context-corpus.json`. Les annotations sont celles de `data.ts` et `journeyData.ts`, avec liens mot à mot vers Quranic Arabic Corpus. Le périmètre annoté reste limité aux passages déjà étudiés : ce n’est pas une analyse grammaticale universelle de tous les mots du Coran.

Les nouvelles phrases sont des exemples pédagogiques français/arabe, explicitement présentés comme tels, pas des citations coraniques. Les constructions suivent les cours existants et leurs références. Vérification documentaire complémentaire :
- https://corpus.quran.com/documentation/verbkaana.jsp
- https://corpus.quran.com/documentation/verbforms.jsp

Les variantes sont une banque finie rédigée dans le code ; il n’y a pas de génération automatique de phrases. Les animations expliquent les exemples et les différences, sans narration vocale nouvelle.

## Vérifications
- Tests ciblés : progression, validation, conservation des acquis, corpus/positions, nouvelles variantes, changement après erreur, verrouillage des indices et centrage du mot dans le lecteur.
- ESLint ciblé et build TypeScript/Vite/PWA.
- Navigateur local 390 × 844 : scène kāna, sélection de l’attribut, comparaison, lecture des signes et absence de débordement horizontal ; cours prépositions vers 114:1 mot 3 ; repère exact visible ; ouverture de la fiche et lien vers le cours ; retour au cours.
- Tests automatisés des réponses et des tentatives sur stockage isolé. Le contrôle visuel local conserve les leçons déjà acquises.
- Pas de test sur iPhone physique, ni nouveau build natif distribué. Les données et composants suivent le cache PWA existant ; pas de validation exhaustive du hors ligne dans ce lot.

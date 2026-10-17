# Fahm — refonte et régularité (13 octobre 2026)

## Livré
- Hub violet et or, reprise, filtres par niveau, carnet personnel, séances indicatives de 5/10/20 minutes (1/2/4 versets).
- Huit parcours existants, cent étapes : étude verset par verset, texte canonique, traduction française, phonétique repliable, exégèse Al-Mokhtasar servie par QuranEnc avec attribution et lien source.
- Mot à mot français QUL et prononciation réutilisant le moteur vérifié du Mushaf/Hifdh. Audio flottant, vitesse, répétition et synchronisation lorsque le récitant fournit les positions.
- Découverte avant traduction, mots étudiés soulignés, exercices de vocabulaire exact, quatorze questions de sens rédigées, sélection d'une expression et reformulation personnelle comparée à la source. La reformulation est autoévaluée, pas corrigée par une IA.
- Révisions fondées sur les erreurs, notes et position persistées. Ouverture dans le Mushaf au verset exact et retour à la leçon.
- La simple ouverture d'une étape ne la termine plus. Les mots oubliés au niveau zéro restent à réviser. Les correspondances lexicales sont exactes ; les exemples incohérents sont masqués plutôt que présentés comme références fiables.
- Ancien panneau Fahm : mot à mot fiable, exégèse sourcée, suppression des pseudo-structures et des fréquences non vérifiées. Le pourcentage trompeur de compréhension devient un nombre de fiches étudiées.

## Régularité
L'ancien compteur restait à un et utilisait des dates UTC. Il est recalculé sur les jours locaux attestés par une activité : lecture qualifiée, écoute achevée, réponse d'apprentissage ou étude validée. Une ouverture de page ou une simple note ne compte pas. Plusieurs activités le même jour ne comptent qu'une fois ; une journée entièrement manquée interrompt la série. Le passage de minuit et le retour au premier plan rafraîchissent l'affichage. Les anciennes activités datées sont reprises, sans inventer les jours dépourvus de preuve. Les objectifs de pages demeurent distincts.

## Vérifications effectuées
- 40 tests ciblés réussis : régularité et dates locales/DST, raccordement des stores, apprentissage Fahm, sources et traduction, mot à mot, coach et Académie.
- Compilation TypeScript et build Vite/PWA réussis ; ESLint ciblé sans erreur.
- Navigateur local : chargement réel arabe/français/exégèse, mot exact 1:2:3 et prononciation, lecture de 1:2 (source Alafasy), vitesse 0,75 et répétition, exercice incorrect/correction puis validation, progression 1/7 et reprise au verset 1:2 après rechargement.
- Aller-retour leçon → Mushaf 1:2 page 1 → même leçon et position vérifié.
- Formats 390×844 et 320×740 : absence de débordement horizontal et lecteur flottant dans le viewport.

## Limites
- Pas de test sur iPhone physique ni de validation exhaustive hors ligne. Les services externes peuvent être indisponibles ; erreurs et relance prévues.
- Les cent étapes disposent d'explications sourcées et d'exercices communs ; seules quatorze références ont actuellement une question de sens spécifique rédigée. Les autres utilisent le vocabulaire exact et la reformulation guidée.
- Le lexique historique de mille fiches n'a pas fait l'objet d'une authentification éditoriale exhaustive ; les exemples proposés sont confrontés au texte réel.
- Les durées sont indicatives, pas une promesse chronométrée. Le carnet et la progression sont locaux au navigateur, selon les mécanismes de sauvegarde existants.

## Publication
Déploiement Vercel `dpl_5KGszF9226xCxm2GHHao2nMND2WG`, état READY, alias public https://www.quran-coach.fr. Vérification navigateur du nouveau hub après application du bandeau PWA, puis cours Al-Fatiha avec texte, mots interactifs, lecteur et liens sources. L'ancien cache peut nécessiter « Mettre à jour » avant de montrer la refonte.

Compléments vérifiés : lancement d'une séance personnelle de cinq minutes (un verset) ; en mode découverte, l'exégèse et les exercices restent masqués jusqu'à la comparaison avec la traduction. Vérification finale groupée : 40 tests, 9 fichiers, tous réussis.

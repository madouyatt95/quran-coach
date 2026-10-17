# Fahm — groupes de sens, écoute et rappel différé

## Périmètre livré
1. Groupes arabe/français synchronisés : 41 versets des sourates 1, 94, 97, 103, 108, 112, 113 et 114. Les plages sont éditoriales et confrontées au texte réel avant affichage. Les mots arabes proviennent du service existant ; le sens français conserve le mot à mot QUL, sans prétendre à un alignement automatique de la traduction littéraire de Hamidullah. Les autres passages conservent leur texte et leurs aides habituels.
2. Reconnaissance d'un mot dans un autre verset : corpus canonique des huit sourates et exemples du lexique existant. Candidats exacts, puis vérification du mot dans les données complètes du passage chargé. Aucun rapprochement morphologique approximatif. Trois suggestions maximum ; un seul passage est chargé au choix de l'utilisateur.
3. Questions de sens : 45 références, contre 14 auparavant. Les 31 ajouts couvrent intégralement les huit sourates guidées et comportent une correction explicitée.
4. Huit sourates guidées, question d'ouverture, parties cliquables, liaison entre parties et vue d'ensemble finale. La position est conservée et la reprise pointe vers la bonne route.
5. Écoute sans texte : entrée depuis le hub ou changement de mode dans une leçon. Audio lancé manuellement, réponse après lecture complète, aides arabe puis français. Questions de sens lorsque disponibles ; sinon reconnaissance du sens d'un mot exact du passage. En cas de données insuffisantes, accès au texte sans inventer d'exercice. Une écoute validée peut terminer la séance. Le mode et les aides sont conservés.
6. Carnet : Découvert, Retrouvé sans aide, À consolider. Un rappel différé vérifie une réponse précise, pas une maîtrise globale de la religion ou de tout le verset. Route dédiée /fahm/review pour mots, questions de sens et reconnaissance ; rappels audio depuis le carnet.

## Corrections
- Une réponse initiale ou corrigée immédiatement ne valide jamais la rétention. Minimum 24 heures après la tentative précédente et toute erreur/aide, échéance atteinte et réponse sans aide exigées. Une nouvelle erreur retire le statut retenu. Les réponses dans le cours après affichage des explications restent des entraînements assistés.
- Sauvegarde de l'étape de l'exercice, du mot demandé, des choix, de l'expression sélectionnée, de la comparaison et de la formulation. Reprise après rechargement vérifiée en étape 3. Refaire l'exercice conserve notes et preuves de rappel.
- Compatibilité avec le stockage existant : aucune réinitialisation ; pas de maîtrise rétroactive inventée pour les anciennes réponses.
- Mises à jour PWA différées pendant les nouveaux écrans d'apprentissage.

## Sources et limites éditoriales
- Textes arabes : réponses de l’API QuranEnc pour les huit sourates, collectées le 13 octobre 2026, puis comparaison aux mots Quran.com (mushaf 19). Sept variantes orthographiques ont été remplacées dans les données de comparaison par les chaînes exactes de cette seconde source ; le nombre et l’ordre des mots restent identiques. Pas de texte coranique généré.
- Exégèse consultée pour les ajouts : https://quranenc.com/api/v1/translation/sura/french_mokhtasar/{surah} et pages https://quranenc.com/fr/browse/french_mokhtasar/{surah}.
- Français mot à mot : ressource QUL 95, déjà intégrée (https://qul.tarteel.ai/resources/translation/95).
- L'interface renvoie vers les sources. Les questions et les cartes sont des aides pédagogiques rédigées à partir de ces textes, pas une nouvelle exégèse ni une authentification savante exhaustive.
- Les reformulations personnelles restent autoévaluées. Aucun service IA payant ajouté.
- Reconnaissance limitée aux occurrences exactes trouvées dans les ressources vérifiables ; aucune promesse d'exhaustivité sur tout le Coran.

## Vérifications
- 34 tests ciblés réussis : frontières des 41 versets, couverture des huit sourates, 45 questions, refus des mots altérés, occurrences exactes, seuil de rappel différé, aide/erreur/correction, hydratation des anciennes données et sauvegarde des étapes.
- TypeScript, ESLint ciblé et build Vite/PWA réussis.
- Navigateur local : navigation dans la carte de la sourate, groupes synchronisés 1:5, mot 1:1:4 retrouvé en 1:3, correction d'exercice, sélection d'expression et reprise complète à l'étape 3 après rechargement.
- Écoute réelle de 1:3 : bouton pause pendant lecture, réponses désactivées avant fin, aides progressives, réponse assistée et fin de séance 1/1.
- Vue mobile 390×844 : pas de débordement horizontal, lecteur et boutons vérifiés visuellement. Pas de test sur iPhone physique ni audit hors ligne exhaustif.

- Vérification réseau finale : 41/41 groupes de versets correspondent aux mots réels des sept pages Quran.com concernées ; aucune correspondance approximative acceptée.

## Vérification publique
- Première publication FYEheTgATMjTa8B7uTfECxNDCb5T : hub public Fahm avec les huit liens guidés et l’entrée audio, route /fahm/surah/1, exégèse chargée et sélection arabe/français synchronisée vérifiés dans le navigateur.
- Publication finale des sept variantes orthographiques : EHm9kHVczruPCDu2sdJzM5LMo5ev — READY, alias de production https://www.quran-coach.fr confirmé par Vercel. Build distant réussi.

## Correction complémentaire trouvée en production
- Le premier verset de certaines sourates incluait la basmala non numérotée dans la source du texte continu. Le chargement des mots, qui vérifie exactement le verset, rejetait alors cette différence. Fahm sépare maintenant uniquement ce préfixe reconnu au premier verset, hors Al-Fatiha et At-Tawba ; tous les mots restants passent toujours par le contrôle canonique existant.
- Al-Kawthar 108:1 : échec reproduit en production, puis trois mots interactifs et groupe de sens disponibles localement après correction. Test de non-régression ajouté (préfixe présent, absent, Al-Fatiha, At-Tawba et verset intermédiaire).

- Publication corrective finale : DsSfoQDESwH7XYgZoKxq3dv3ZP13, READY, alias https://www.quran-coach.fr. Après activation de la mise à jour PWA, 108:1 affiche en production ses trois mots interactifs et le panneau des groupes ; erreur de chargement résolue.

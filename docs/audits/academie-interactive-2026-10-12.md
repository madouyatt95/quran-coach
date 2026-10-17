# Académie interactive — 12 octobre 2026

## Demande et périmètre
Transformer les cours fournis par l’utilisateur en apprentissage actif. Les PDF ne constituent plus le parcours principal : chaque chapitre devient un module composé de notions reformulées, exercices et mise en situation. Les sources restent accessibles en approfondissement.

## Contenu livré
- 10 modules de Aqidah/Tawhid et 20 modules de Hadith.
- 90 séquences notionnelles, 90 questions d’association notion/explication, 30 situations évaluées avec correction.
- 14 activités de classement comportant plusieurs cartes, réponses et correction immédiate.
- Explications personnelles sauvegardées localement et comparables aux repères du cours ; aucune notation automatique du texte libre.
- 4 parcours Junior ouverts, avec 12 étapes : alphabet, premières sourates, invocations, prophètes. Le parcours existant est conservé.
- Orientation par niveau déclaré et objectif ; reprise, compétences et séances courtes. Les cinq minutes sont un objectif de séance, pas une durée chronométrée ou une certification de niveau.
- Révisions espacées à la question : priorité aux difficultés, cinq questions par séance, intervalle ajusté aux réponses.
- Atelier de prononciation : six lettres étudiées dans des mots coraniques enregistrés, vitesse 0,75×/1×, prise micro locale et comparaison. Ce n’est pas un catalogue des 28 lettres isolées ni un correcteur automatique de prononciation.
- Pont Tajwid vers les versets réels du lecteur et retour à la leçon.

## Sources et intégrité
Sources utilisateur : Tawhid_Masjid_Sabirin_Support_Premium_Corrige.pdf (75 pages) et Hadith_Masjid_Sabirin_Support_Premium_Bleu (1).pdf (66 pages), Masjid Sabirin, Abd-Allah Drame.
Les 141 pages extraites sont conservées avec leur texte brut, pagination et texte de consultation. Les PDF sont copiés sans modification. SHA-256 :
- Tawhid : 2be889c271702a254d59f1b4b9dc02c6aad2a04d8794d4fd5b73dfa7d745586d
- Hadith : 4fe0e905c87b728f5efbcffc38f7a3913cf88b740f7df526612d027b17f3f248

Les reformulations et situations pédagogiques sont distinctes des citations sources. La parole de Umar sur la Pierre noire est explicitement attribuée à Umar. L’import n’est pas une authentification indépendante et exhaustive des références religieuses. Aucun nouveau texte coranique arabe n’est généré pour ces cours. Les exemples audio et Tajwid réutilisent les données contrôlées du Mushaf.

## Architecture
- `data/courses/*.json` : documents, pages, limites de chapitres, provenance.
- `data/coursePedagogy.ts` : objectifs, notions, situations et corrections rédigés à partir des chapitres.
- `data/courseLibrary.ts` : modules utilisant le moteur existant.
- `CourseActivity`, `ConceptChallenge`, `AcademyReview`, `AcademyStart`, `PronunciationWorkshop`, `TajwidBridge` : interactions.
- `academyStore` conserve la clé historique, les acquis et XP ; ajoute réponses, curseur de quiz, classement, réflexion et révisions.
- `learning.ts` calcule la réussite sur tous les exercices, y compris après reprise. Une révision n’attribue pas plusieurs fois les XP.

## Ajouter les prochains cours
1. Lire et contrôler le PDF fourni, sa structure et ses références.
2. Ajouter une source avec un identifiant stable au script d’import ; vérifier les limites des chapitres.
3. Rédiger les objectifs, notions, distinctions et activités à partir du contenu réel ; ne pas se limiter à l’extraction de pages.
4. Garder les références des pages et les attributions ; signaler les références incertaines à la revue éditoriale.
5. Ajouter des contrôles du contenu, tester le parcours complet et la persistance avant publication.
Les cours Fiqh/Sira personnels seront intégrés à réception ; les modules existants restent accessibles.

## Vérifications locales
- 13 tests unitaires réussis : 30 modules/120 questions, 141 pages conservées, 12 étapes Junior, seuils de réussite, persistance, migration v2, XP, révisions et lecteur de comparaison.
- TypeScript et build Vite/PWA réussis. Avertissement Vite existant sur la taille de certains bundles.
- ESLint ciblé sur les nouveaux composants et données, Hub et store : réussi. Aucun résultat de lint global du dépôt revendiqué.
- Chrome réel en viewport mobile : classement, réflexion, reprise d’une leçon, réponse et curseur de quiz après reload ; audio modèle effectivement joué ; parcours Junior ; aucun débordement document à 320, 390, 430 px ni erreur JS sur ce scénario.
- Parcours Aqidah complet : trois associations évaluées + situation, 100 %, état terminé et 50 XP sauvegardés ; révision d’une question et replanification.
- Junior : leçon, trois associations, quiz et récapitulatif.
- Orientation, affichage des mots d’un exemple Tajwid, ouverture du Mushaf et retour à la leçon.
- Captures inspectées pour cours, atelier audio et Junior ; outils globaux séparés des titres pour supprimer le chevauchement.

## Limites de vérification
Pas de test sur iPhone physique ni d’écoute de prise micro humaine. La comparaison locale est couverte par les tests existants ; la permission micro, la qualité de capture et l’écoute comparative sur appareil restent à confirmer. Pas de promesse de disponibilité hors ligne des enregistrements distants. Les PDF complets sont des approfondissements et les modules travaillés sélectionnent les notions essentielles de chaque chapitre ; une revue pédagogique/religieuse humaine peut approfondir les exercices et contrôler chaque référence.

## Production vérifiée
Déploiement `dpl_AfkirBsjRtPCNzESqAjrq9ogAU4b`, état READY, alias `https://www.quran-coach.fr` confirmé le 12 octobre 2026.
Les scénarios navigateur ont été rejoués sur le domaine public : activité de classement, réflexion, reprise après reload, curseur et réponse de quiz, audio réellement joué, absence d’erreur JS et de débordement, module complet noté 100 % et sauvegardé, révision à la question, parcours Junior (leçon → associations → quiz → récapitulatif).
Les deux PDF publics répondent HTTP 200, application/pdf, avec SHA-256 identique aux originaux indiqués ci-dessus.

## Deuxième évolution interactive — parcours 1 à 6
- Les cours Aqidah et Hadith présentent une notion, une manipulation, une reformulation personnelle puis une synthèse, chacun sur un écran distinct. La suite du module s’ouvre une fois cette séquence parcourue. Position, choix et réponse sont restaurés après rechargement.
- Trente exercices éditoriaux propres aux trente chapitres alternent choix contextualisé, repérage d’erreur et remise en ordre. Les quatorze activités de classement antérieures restent disponibles comme approfondissement.
- Chaque option d’exercice reçoit une explication spécifique ; les quiz de notion présentent désormais des réponses courtes. Une mauvaise réponse est mémorisée pour une révision ciblée.
- Les vingt modules Hadith ont un atelier à cinq onglets : extrait textuel conservé du cours, rapporteur, expression, enseignement et application. Le contrôle de l’attribution distingue explicitement la parole de Umar (chapitre 12) de celles du Prophète. Les onglets sont accessibles au clavier.
- Après la validation, le statut est « Compris ». Une question de consolidation distincte du quiz de module devient disponible après au moins un jour ; une erreur la reporte d’un jour, une réussite donne « Consolidé ». Les acquis historiques et les XP sont préservés par migration de l’état v3 vers v4.
- Le carnet personnel comporte compréhension, distinction, exemple et point à revoir. Il récupère les formulations et les questions ratées du module lorsqu’elles existent, reste modifiable et se sauvegarde uniquement sur cet appareil.

Tests locaux du second lot : 18 tests Vitest réussis, TypeScript et lint ciblé réussis, build PWA réussi. Parcours mobile Chrome 320/390/430 px : scène, choix erroné et correction, ordre, rechargement, quiz complet, carnet, atelier Hadith 12, consolidation différée et absence d’erreur JavaScript. Les vingt chapitres Hadith possèdent tous un extrait provenant du document d’origine. La capture sur iPhone physique et la revue religieuse humaine de chaque référence restent à effectuer.

## Deuxième déploiement vérifié
Déploiement `dpl_4P1SQFanSUnADPUeCfbNTrrwDR6T`, état READY, alias `https://www.quran-coach.fr` confirmé le 12 octobre 2026. Les deux scénarios mobiles ci-dessus ont été rejoués avec succès sur le domaine public : parcours complet Aqidah et carnet, attribution du Hadith 12, remise en ordre, réponse retardée de consolidation, affichage sans débordement à 320, 390 et 430 px et aucune erreur JavaScript observée.

## Refonte en cours suivis après retour utilisateur

L'utilisateur a rejeté le découpage en petits modules et le manque d'explications. Les deux cours Sabirin présentent désormais un programme de 10 et 20 chapitres. La lecture de chaque chapitre est continue : introduction, objectif, sommaire, trois développements avec paragraphes explicatifs, synthèse, question personnelle, puis exercices. Les étapes obligatoires « comprendre/manipuler/reformuler » sont retirées du parcours de lecture.

- `courseExplanations.ts` : 30 introductions, 90 développements rédigés et 30 synthèses, adaptations pédagogiques des chapitres correspondants. Les reformulations sont distinguées des citations.
- `AcademyCourse.tsx` / CSS : cours lisible sans interruption, sommaire, sauvegarde de la section visible, reprise, retour au début d'un nouveau chapitre, question personnelle et accès au texte source complet.
- `courseReading.ts` : le récit initial de chaque hadith est extrait jusqu'au rapporteur, en conservant les dialogues, locuteurs, variantes et références présents. Le hadith de Jibrîl n'est plus réduit à sa première citation. La parole de Umar du chapitre 12 reste attribuée à Umar.
- `CourseSyllabus.tsx` : programme ordonné avec résumés des chapitres, reprise et état de validation.
- `AcademyHub.tsx` : exercices après le cours, rappel des explications pendant les questions, liens profonds actualisés, navigation de chapitre. Les réponses et les acquis conservent leurs identifiants et positions de blocs antérieurs ; aucune réinitialisation de progression.
- `AcademyStart.tsx` : présentation à son rythme, sans promesse artificielle de cinq minutes pour tous les cours.

Vérifications : 20 tests Vitest réussis, TypeScript et lint ciblé réussis ; build local réussi (avant le dernier ajustement de défilement, revérifié ensuite par TypeScript et navigateur ; build final effectué par Vercel). Parcours Chrome automatisé : cours entier, sommaire, reprise après reload, consultation des explications depuis les quiz, mise en pratique, validation, carnet conservant la question personnelle, récit de Jibrîl, attribution de Umar, programme de 20 chapitres, liens profonds et ouverture du chapitre suivant à son début. Largeurs 320/390/430/1280 px sans débordement ni erreur JavaScript. Captures visuelles inspectées.

Limites : pas de test sur iPhone physique, ni authentification humaine exhaustive des références religieuses. Le texte source complet conserve les formulations du document original ; une probable coquille (« chaîne de transmission faible » dans la définition de la Sunna, Tawhid p.14) n'est pas reproduite comme définition dans la réécriture pédagogique. Le fichier original est inchangé. L'avertissement Vite de chunk Académie volumineux subsiste (~936 Ko, ~213 Ko gzip).

### Publication des cours suivis
Déploiement final `dpl_5oSj2Qk55zPu5jqhaMefSv2qGt4f`, état READY, URL `https://quran-coach-bxp54ruin-yattas-projects.vercel.app`, alias `https://www.quran-coach.fr` confirmé. Le scénario complet `/tmp/qc-academy-courses-browser.cjs` a été rejoué avec succès sur le domaine public, y compris l’ouverture du chapitre suivant à son début. Résultats dans `/tmp/qc-academy-courses-public.log` : trois groupes de contrôles réussis, aucune erreur JavaScript. Cette validation ne vaut pas test sur iPhone physique.

## Références consultables depuis les cours
- Références coraniques explicites (2:177, « Sourate 18, verset 110 », plages) rendues cliquables et contrôlées contre le nombre exact de versets de chaque sourate. Une plage ouvre son premier verset dans le Mushaf. Retour au cours via `readerReturn`, avec reprise de la section.
- Hadiths identifiés par titre : fenêtre de consultation du récit intégral, dialogues et attributions préservés. Les vingt chapitres Hadith disposent aussi de leur récit dans un index de références.
- Une collection seule (Muslim/Bukhari) ou un rapporteur seul n'est pas transformé arbitrairement en référence exacte. Les mentions vagues restent textuelles. Pas de numéro ni d'authentification inventés ; source affichée = cours Sabirin fourni.
- Index « Consulter les textes cités » dédoublonné, liens dans les explications et les pages source, fenêtre modale accessible au clavier avec retour du focus et fermeture Échap. Pas de requête externe pour lire les hadiths déjà embarqués.
Vérifications : 19 tests Vitest, TypeScript, lint ciblé et build PWA réussis. Scénario Chrome : Jibrîl complet, focus/Échap, lien Mushaf 2:177 puis retour section 2, références du document original, attribution de Umar, index, absence de débordement à 320/390/430 px et d'erreurs JavaScript. Capture mobile inspectée. Pas de test iPhone physique.
Publication des références : `dpl_5vyqoy1zdqHBVUGEMnGmXmFnv6ra`, READY, `https://quran-coach-e5rwgvfio-yattas-projects.vercel.app`, alias public Quran Coach. Scénario de références rejoué sur `https://www.quran-coach.fr` avec succès : les trois groupes de contrôles passent, aucune erreur JavaScript observée (`/tmp/qc-academy-refs-public.log`).

## Exploration du cours — six améliorations approuvées

- Trente questions d’ouverture propres aux chapitres ; hypothèse personnelle, réponse à une situation et synthèse enregistrées dans un store séparé. Les anciennes validations et notes sont préservées.
- Schéma de trois notions reliées, explication sélectionnable et lien vers sa section. Le chapitre de Jibrîl propose une application aux dimensions d’une même prière.
- Deux décisions accompagnées d’explications, ou une décision puis un classement, conduisent à une conclusion personnelle. Les mauvaises pistes proposent un retour au cours ; le lecteur n’est pas bloqué par les activités. Il s’agit d’un parcours guidé à retours conditionnels, pas d’un moteur conversationnel.
- Narration française Kokoro/Siwis préparée en 90 fichiers pour les 30 chapitres, trois parties par chapitre. Le lecteur compact reste flottant ; texte de la phrase en cours, reprise en secondes, vitesse, retour de 15 s, réécoute, passage écrit et pause pour noter une question. MediaSession est réutilisé. Une absence de fichier affiche une erreur explicite ; aucun repli sur la voix système pour ce parcours.
- Exploration par « Pourquoi », distinction, exemple, références et synthèse, avec retour au cours et réécoute de la notion. Les explications proviennent des adaptations existantes ; ce ne sont pas des réponses libres générées à la volée. Les sources PDF et les références identifiables restent consultables.
- Fiche personnelle par notions, idée initiale et conclusion ; ajout au carnet sans écraser les notes, export texte. Explication orale via MediaRecorder, stockage local IndexedDB, téléchargement/suppression, grille d’autoévaluation sans score automatique. Arrêt micro au changement de page/masquage et après trois minutes.

Fichiers principaux : `courseExperience.ts`, `academyExperienceStore.ts`, `CourseDiscovery.tsx/CSS`, `CourseAudio.tsx`, `CourseOral.tsx`, `CourseProject.tsx`, intégrations dans `AcademyCourse.tsx` et `AcademyNotebook.tsx`. Le hook audio existant ne reçoit qu’une option de narration enregistrée obligatoire. Le script d’export des narrations inclut désormais les cours.

Vérifications initiales : 34 tests Vitest (corpus de 30 chapitres, progression isolée, références, progression existante, audio et absence de repli système), TypeScript et lint ciblé réussis. Chrome réel, viewport mobile : hypothèse/schéma/exploration/scénario/fiche, ajout au carnet et export, enregistrement avec entrée micro synthétique, lecture de la prise, récupération IndexedDB après reload puis suppression. Largeurs 320/390/430/1280 px sans débordement document ni erreur JavaScript. Captures et dimensions des paragraphes inspectées. Aucun test sur iPhone physique, aucune voix humaine enregistrée pour ces tests ; la qualité phonétique de toute la narration n’a pas été auditée humainement.

Corpus audio final : 90 nouvelles parties Académie, 77,3 minutes, environ 37,2 Mo au total, chargées à la demande. Vérification des 749 entrées du manifeste global par correspondance exacte de texte, SHA-256, durée ffprobe et positions croissantes des phrases : complète (277,1 minutes globales, narrations existantes conservées). Les narrations ne sont pas une lecture intégrale des PDF et leur voix reste synthétique ; attributions Kokoro/SIWIS et cours source complétées dans `public/audio/narration/ATTRIBUTION.md`.

Lecteur audio local : lecture MP3 réelle, phrase synchronisée, vitesse 1,25, seek à 20 s et reprise après reload, handlers MediaSession pause/play, réécoute à zéro, enchaînement vers la partie suivante, pause et focus du champ question, dock visible à quatre largeurs : contrôles réussis. Le test MediaSession utilise les handlers navigateur et ne constitue pas un test de l’écran verrouillé d’un téléphone. La narration n’a pas été téléchargée intégralement pour un essai hors ligne.

### Publication de l’exploration
Déploiement `dpl_9q2hVWgRxMXG3yMJzibDgvRkndBm`, READY, `https://quran-coach-od4p1tk5s-yattas-projects.vercel.app`, alias `https://www.quran-coach.fr`, confirmé le 12 octobre 2026. Build TypeScript/Vite/PWA final réussi ; avertissement de gros bundles existant conservé.

Parcours interactif rejoué avec succès sur le domaine public (`/tmp/qc-academy-six-public.log`) : choix, sauvegardes, carnet/export et capture micro synthétique/IndexedDB/suppression, quatre largeurs et aucune erreur JavaScript. Le premier contrôle audio public a dépassé son délai de démarrage ; sa réexécution complète a réussi (`/tmp/qc-academy-six-audio-diag.log`) : MP3 réel, synchronisation, vitesse, seek/reprise, MediaSession, réécoute et enchaînement, focus question et lecteur flottant. Contrôle direct : manifeste public HTTP 200 avec 749 entrées, premier MP3 Académie HTTP 206 et `audio/mpeg`. La cause du premier délai n’a pas été établie ; aucune garantie de démarrage immédiat sur toute connexion n’est donnée. Limites iPhone physique/écran verrouillé réelles et revue phonétique humaine inchangées.

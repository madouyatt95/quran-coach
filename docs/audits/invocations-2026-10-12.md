# Invocations — six améliorations et corrections, 12 octobre 2026

## Périmètre livré

1. Accueil : carte matin/soir suggérée selon l’heure de l’appareil, progression quotidienne issue des compteurs, accès après la prière/sommeil/favoris, reprise exacte. La bascule horaire d’interface (4 h–16 h pour le matin) n’est pas une prescription d’horaire religieux ; les deux séances restent accessibles.
2. Lecture guidée : une invocation à la fois, barre flottante au-dessus de la navigation, traduction et phonétique repliables/persistées. Modes récitation manuelle et apprentissage phrase par phrase. Les segments viennent uniquement de la ponctuation existante ; aucun texte arabe ni alignement phonétique n’est généré. Le mode apprentissage utilise une voix de synthèse, explicitement signalée, et laisse un délai réglable pour répéter.
3. Recherche : titres, arabe sans voyelles, phonétique sans accents, traductions, références et petits groupes de synonymes pour les situations. Résultats dédoublonnés par texte arabe, ouverture directe de l’entrée. Il ne s’agit pas d’un chatbot ni d’une recherche sémantique exhaustive.
4. Compréhension : sens existant, lexique de huit expressions, contexte du classement et provenance du compteur, lien source, accès au Mushaf et à la mémorisation pour les références coraniques identifiées. Accès aux récits pour les passages couverts par l’index éditorial.
5. Recueils : réutilisation du store de favoris et des collections existants. Création, ajout/retrait, réorganisation avec boutons accessibles, renommage/suppression, lancement/reprise, téléchargement des enregistrements disponibles. Les notes et autres types de favoris sont conservés. Pas de synchronisation distante.
6. Présentation : violet/doré et icônes emoji conservés, cartes compactes, grand texte de lecture, actions secondaires repliées, thèmes clair/sépia pris en charge.

## Corrections audio et compteurs

- Pause réelle sur enregistrement et voix système : ne réinitialise ni le clip ni la phrase en cours. Une porte de pause prend aussi en charge l’attente réseau et les intervalles entre les répétitions. Arrêter annule explicitement la séance ; naviguer vers une autre invocation l’annule également.
- L’écoute seule ne modifie jamais le compteur. Les répétitions audio et récitations personnelles sont deux commandes distinctes.
- Enchaînement audio facultatif des invocations après une action explicite. Aucun démarrage automatique lors d’un rechargement de page.
- Compteurs hors matin/soir désormais persistés ; annulation d’un comptage pour tous. Les compteurs matin/soir gardent leur store et leurs clés, avec le compteur journalier partagé existant.
- Objectifs personnels réglables, distincts des nombres liés à une entrée documentée. Les anciens objectifs hors références quotidiennes restent disponibles comme objectifs personnels ; ils ne deviennent pas des prescriptions.
- Partage corrigé vers le domaine courant, avec lien direct vers l’invocation ; copie disponible lorsque le partage natif n’existe pas.

## Audit éditorial et intégrité

Le catalogue conserve 501 entrées, y compris les mêmes textes accessibles dans plusieurs sélections. Elles ne représentent pas 501 invocations uniques.

- Le contenu auparavant défini dans `AdhkarPage.tsx` est extrait dans `adhkarCatalog.tsx`, sans réécriture du texte arabe.
- Le titre « Les 10 Du’as exaucées » est remplacé par « Invocations de confiance et d’espoir ». Les trois formules provenant de 21:87, 3:173 et 2:201 sont rattachées explicitement à leur passage ; les commentaires entre parenthèses mêlés à leur traduction sont retirés de la nouvelle présentation.
- Les références matin/soir 75–98 conservent les sources explicites du travail précédent. Consultation actuelle notamment de Hisn 75, 76, 78, 79, 83, 91, 95, 96, 97 et 98 sur Sunnah.com. Exemples : https://sunnah.com/hisn:76 (trois sourates, chacune trois fois), https://sunnah.com/hisn:96 (compteur journalier), https://sunnah.com/hisn:97 (formule du soir).
- Un lien vers une entrée de Hisn indique la provenance, pas une authentification indépendante de toutes ses chaînes ou variantes. Les libellés généraux « Bukhari », « Muslim », etc. ne sont pas convertis en numéros de hadith inventés. Leur référence précise reste à confirmer dans la fiche. Les anciens nombres non documentés sont signalés comme objectifs personnels.
- Doublon détecté dans `chap_130` : deux textes différents avaient l’ID 276. La seconde entrée reçoit l’ID technique 100276. Un favori ancien dont le texte correspond à la seconde entrée est migré avec son annotation. Le fichier audio 276, dont l’association est ambiguë, n’est utilisé pour aucune des deux entrées ; repli explicite vers la voix de synthèse. Aucune correspondance audio n’est devinée.
- Contrôle automatique des clés uniques, de la conservation des caractères arabes lors du découpage, des plages coraniques et des compteurs partagés.

Cette livraison n’est pas une authentification savante exhaustive de tout le corpus. Le lexique est une aide de lecture, pas un tafsir. La phonétique manquante est signalée, jamais inventée.

## Fichiers principaux

- `src/pages/AdhkarPage.tsx` et `.css`
- `src/components/Adhkar/{InvocationReader,InvocationCollections,InvocationUnderstanding}.tsx`
- `src/data/adhkarCatalog.tsx`, `src/lib/adhkarExperience.ts`
- `src/stores/adhkarExperienceStore.ts`, store quotidien existant
- `src/lib/{adhkarAudioService,playbackGate,mediaPlayback,ttsService}.ts`

## Vérifications et limites

- Tests ciblés : recherche multilingue, intégrité des clés et segments, références, persistance/annulation, objectifs modifiés, pause/reprise/arrêt de fichiers et voix système, attente entre boucles et annulation, non-régression du narrateur des récits.
- Chrome 390 × 844 local : recherche → entrée exacte ; progression/rechargement/annulation ; préférence phonétique ; recueil ajouté, deux invocations, réorganisation/rechargement/lancement ; lecture d’un MP3 réel et pause/reprise/arrêt sans incrémenter ; lien vers le récit d’Adam ; pas d’erreur JavaScript observée. Thèmes violet, clair et sépia contrôlés.
- Les données restent locales au navigateur. Les voix de synthèse peuvent dépendre du réseau et des voix installées ; elles ne font pas partie des packs audio téléchargeables.
- Aucun test sur iPhone physique ni validation d’arrière-plan iOS dans cette livraison.

- 36 tests ciblés réussis ; TypeScript et lint ciblé sans erreur ; build PWA réussi.
- Enchaînement réel : fin du MP3 14 → invocation 15 et lecture du MP3 15, sans comptage automatique. Mode apprentissage : voix réelle puis phase « À vous de répéter ».
- PWA construite : téléchargement explicite du pack « Au réveil », rechargement sans réseau et lecture réelle du MP3 mis en cache : réussi. Contrôle des largeurs 320, 390 et 430 px sans débordement horizontal.

## Publication et vérification publique

- Déploiement de production `dpl_9rMbXBWhufedxqt766T2ixPoHokW`, état `READY` confirmé par Vercel ; alias `www.quran-coach.fr` rattaché à ce déploiement, sans erreur d’alias. Construction distante : environ 100 secondes.
- Publication CLI avec l’équipe explicite `yattas-projects`. Base Git `5ce28987cc57f06adae273595bb4e689d3a0f70c` avec les modifications locales présentes : ce SHA seul ne représente pas le contenu livré.
- Parcours rejoués sur https://www.quran-coach.fr/adhkar dans un contexte Chrome isolé de 390 × 844 px : recherche par situation et ouverture exacte, comptages/rechargement/annulation, préférence phonétique, création et réorganisation persistée d’un recueil, lancement, MP3 réel avec pause/reprise/arrêt sans incrément automatique, réglage du délai d’apprentissage, compréhension et lien vers le récit d’Adam. Tous réussis ; aucune erreur JavaScript observée.
- Le contrôle hors ligne a été effectué sur le build PWA local ; le test public ci-dessus était connecté. Aucun essai sur iPhone physique.

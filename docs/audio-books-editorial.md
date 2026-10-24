# Les livres racontés — écriture et préparation

## Premier manuscrit livré

**Adam — Le commencement et le chemin du retour**, version `adam-conte-2026-10-23-v1`, trois chapitres :

1. Le savoir et le refus.
2. La promesse trompeuse.
3. Le chemin du retour.

Le manuscrit est consultable par l’administrateur dans `/admin/audio?book=adam&chapter=names`, onglet **Livres**. La vue **Lire le conte** présente le texte continu ; **Étudier les sources** ajoute les références de chaque paragraphe et les repères éditoriaux. Le livre peut être parcouru sans interruption, téléchargé en Markdown ou préparé chapitre par chapitre en brouillons dans le studio existant.

Les durées affichées sont des estimations de lecture fondées sur 135 à 165 mots/minute. Elles ne sont pas présentées comme des durées d’enregistrement. Le texte complet et le premier chapitre sont également disponibles dans [audio-books/adam.md](audio-books/adam.md) et [audio-books/adam-names.md](audio-books/adam-names.md).

## Les six changements éditoriaux

1. **Un livre plutôt qu’une succession de résumés courts.** Une progression en trois chapitres, avec des transitions. Pour les futures histoires, le nombre d’épisodes dépendra de la matière vérifiée ; aucune durée minimale ne justifie d’ajouter des événements.
2. **Une ouverture et une progression narratives.** Adam s’ouvre sur le refus d’Iblis, puis revient explicitement à l’annonce aux anges. L’épreuve du Jardin et la demande de pardon suivent. Les chapitres se terminent sur une étape réelle, sans fabriquer de suspense historique.
3. **Un enrichissement par les sources.** Les passages complémentaires d’Al-Baqarah, Al-A’raf, Taha et Sad sont identifiés. L’épisode de salutation provient de Sahih al-Bukhari 3326. Chaque paragraphe pointe vers son ou ses passages sources.
4. **Une écriture française destinée à l’oral.** Paragraphes courts, paroles rapportées au discours indirect, reprises limitées et transitions. Les notes de méthode, références et titres intermédiaires ne sont pas injectés dans les scripts de synthèse.
5. **Un épilogue séparé.** Les enseignements et la question personnelle sont consultables après le livre. Le court épilogue peut être ajouté à la préparation du dernier chapitre ; il n’interrompt pas les scènes.
6. **Une collection cohérente, relue avant production.** Identifiants de chapitres et version de manuscrit stables, reprise de lecture par lien de chapitre, rappel optionnel pour écouter un chapitre séparément et export du manuscrit. La qualité du premier livre doit être validée avant d’étendre cette édition au catalogue.

## Sources et vérification du premier livre

- Coran : 2:30-39, 7:12-25, 20:115-123 et 38:71-83. Les périmètres plus précis figurent dans les données et dans le dossier des chapitres.
- Texte arabe consulté sur Quran.com et, pour les versets non entièrement accessibles par la page, via les sourates publiques de l’API AlQuran Cloud : `https://api.alquran.cloud/v1/surah/2`, `/7` et `/38`.
- [Sahih al-Bukhari 3326](https://sunnah.com/bukhari:3326), chapitre de la création d’Adam : seul l’épisode du salut aux anges et de la réponse est adapté. Les autres thèmes de ce hadith ne sont pas développés.
- Les références ont été consultées le 23 octobre 2026. Le contrôle éditorial consiste à comparer les affirmations avec ces passages ; il ne constitue pas une nouvelle authentification des recueils ni une validation par un spécialiste religieux.
- La narration est un texte français original. Elle n’est ni une traduction littérale du Coran, ni un texte coranique, ni une récitation arabe. Aucun enregistrement arabe synthétique n’est préparé.

## Points contrôlés lors de la réécriture

- Iblis n’est pas présenté comme un ange. La supériorité du feu sur l’argile demeure sa prétention.
- Aucune jalousie ni désobéissance n’est attribuée aux anges.
- Aucun nom d’arbre, serpent, date, lieu d’arrivée sur terre ou détail visuel non établi n’est ajouté.
- La faute et la demande de pardon concernent les deux époux ; aucune culpabilité exclusive de l’épouse n’est introduite.
- L’épisode de salutation est distingué par sa source. Sa place dans le chapitre est pédagogique, sans chronologie affirmée par rapport aux noms ou à la prosternation.
- Les promesses liées à la guidance ne constituent pas une promesse d’absence d’épreuves dans la vie terrestre. Un repère d’étude le précise.
- Les comparaisons et applications personnelles sont identifiables comme lecture pédagogique ; les références et notes demeurent consultables hors narration.

## Préparation et limites de production

Le style du premier livre a été validé par le propriétaire, puis la continuation des lots autorisée dans un plafond cumulé explicite. Les enregistrements produits restent privés jusqu’à la décision de publication dans le studio. Le parcours habituel prévoit une écoute humaine. Le parcours distinct de publication directement autorisée par le propriétaire conserve les contrôles éditoriaux, de fichiers et de crédits et enregistre explicitement l’absence d’attestation d’écoute humaine. Le pilote de 33 secondes reste une version distincte ; il n’est jamais associé au nouveau texte par approximation.

La préparation utilise les routes existantes du studio. Chaque segment est enregistré avec `approve: false` et `approved_by: null`. Une reprise utilise les mêmes textes et empreintes, sans créer une seconde version identique. Aucune API ElevenLabs n’est appelée par l’atelier ou l’exporteur de manuscrits.

Pour les chapitres dépassant 4 000 caractères, le découpage respecte les paragraphes, puis les phrases et enfin les espaces si nécessaire. Les segments sont des tranches contiguës du texte original : leur concaténation restitue chaque caractère. Les titres et numéros de segments ne sont pas prononcés. La limite serveur de 4 000 caractères et l’ensemble des validations de production restent actifs.

Chaque production passe par un devis avec compte, voix et plafonds disponibles. Une autorisation du propriétaire peut couvrir plusieurs lots dans un plafond cumulé ; les réservations atomiques du serveur restent obligatoires. La génération est désactivée par défaut dans le dépôt et doit être refermée à la fin d’une session de production. L’atelier ne déduit jamais l’état d’un audio d’un texte statique : cet état provient du studio distant.

## Collection étendue

Le sélecteur **Livres** réunit les récits d’Adam, Nuh, Ibrahim, Yusuf, Musa, Maryam et Isa, Dawud et Sulayman, le voyage de Moussa et du serviteur instruit, les compagnons de la caverne, les biens et le cœur, Musa après la mer, les royaumes et la justice, Hud/Salih/Shuayb, un parcours de Sira, des voix dans l’épreuve et deux parcours pédagogiques : les conseils de Luqman et la parole qui préserve.

Les textes complets et les chapitres se trouvent dans `docs/audio-books/`. Les passages coraniques ont été comparés au texte arabe public des sourates concernées via l’API AlQuran Cloud et aux liens Quran.com du dossier. Les noms absents des passages, chronologies incertaines, conversations et décors non établis ne sont pas ajoutés. Chaque ouvrage donne ses limites dans sa note éditoriale. Les leçons et situations contemporaines sont annoncées comme applications pédagogiques.

Trois textes plus courts, adaptés au menu Invocations, expliquent en français la demande de Moussa avant sa mission (20:24-35), sa reconnaissance du besoin à Madyan (28:23-24) et la demande du bien dans les deux vies (2:201-202). Leurs scripts figurent dans [audio-books/invocations-sens.md](audio-books/invocations-sens.md). Ces capsules suivent les mêmes validations que les livres et ne synthétisent pas les formules arabes.

Les MP3 de production, reçus, identifiants privés et relevés du compte ne sont pas versionnés dans le dépôt. Ils restent dans R2/Supabase et dans les dossiers privés de vérification de la session. Les tests de structure et les contrôles techniques des fichiers ne remplacent pas l’écoute et la relecture religieuse avant publication.

## Vérifications reproductibles

```sh
node scripts/export-narrative-books.mjs
npx vitest run src/lib/narrativeBooks.test.ts src/lib/audioProduction.test.ts src/lib/storyChapters.test.ts src/lib/editorialJourneys.test.ts
npm run build
```

Les tests contrôlent la cohérence des références et des identifiants, les limites de production, l’absence de perte ou de coupure de mot, la séparation entre récit et notes et la création exclusive de brouillons. Ils ne prouvent pas à eux seuls l’authenticité religieuse du texte ni sa qualité d’interprétation audio.

## Deuxième collection — 24 octobre 2026

Dix-neuf manuscrits supplémentaires, avec 69 chapitres : Lout, Kaab ibn Malik, Aïcha, Le garçon et le roi, Les trois hommes et le rocher, Les trois hommes et le bienfait, La route du retour, Hajar et Ismail, L’Hégire, L’Ascension, Hudaybiyya, De Hira à la lettre, Abou Dharr, Donner à chaque droit sa place, Les portes de l’hospitalité, Ce que les apparences cachent, Ces gestes qui comptent, Jabir et Le bois confié à la mer.

Les références et limites de chaque version figurent dans son fichier de `audio-books/`. Les récits de hadith s’appuient sur les textes arabes anciens des recueils de Bukhari et Muslim, consultés sur Sunnah.com ; la narration française est originale et ne reprend pas les traductions modernes de ce site. Les paroles sont rapportées indirectement. Les épisodes d’une même vie sont distingués lorsqu’aucune chronologie relative n’est fournie. Les personnes, dates, dialogues et scènes manquants ne sont pas inventés.

Les liens d’origine raccordent les nouveaux livres aux fiches Lout, Ismail, Muhammad, Tabouk, Ifk, Isra/Miraj et aux gens du fossé. La fiche Hudaybiyya ouvre le récit détaillé du pacte. Les autres livres conservent un lien direct vers leur hadith source. Les premiers livres restent accessibles dans leur édition et leurs enregistrements inchangés.

Chaque livre possède des décors abstraits et des ambiances naturelles optionnelles selon les chapitres. Aucun personnage, événement de l’invisible ou voix historique n’est reconstitué. La reprise exacte, le carnet, les téléchargements et le passage entre texte et audio réutilisent le lecteur existant.

Trois guides courts « Après l’écoute » prolongent la collection : retrouver la source, choisir un acte concret et transmettre fidèlement. Leurs textes français originaux et leurs références sont conservés dans `audio-books/apres-ecoute-guides.json`. Ils sont classés dans Parcours et restent distincts des chapitres narratifs.

La publication de cette collection est autorisée directement par le propriétaire, sans préécoute. Les contrôles techniques comprennent empreinte SHA-256, taille R2, décodage intégral MP3, durée, texte exact, version et repères temporels fournis. L’événement de publication conserve `humanListened: false`. Ces contrôles ne constituent pas une écoute humaine ou une validation religieuse indépendante.

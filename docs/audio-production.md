# Bibliothèque et studio de narration

## État de livraison

- Bibliothèque `/listen/library` et studio `/admin/audio` implémentés.
- Catalogue importé : 749 narrations existantes (61 prophètes, 141 histoires, 90 Académie, 457 invocations), environ 277 minutes. Les MP3 existants restent servis par Quran Coach.
- Infrastructure distante : bucket privé R2, Workflow et Worker sur `https://quran-coach-audio.madouyatt95.workers.dev`. Les sept tables Supabase sont installées, RLS active et lecture refusée aux rôles anon/authenticated. Les clés restent en secrets Cloudflare ; l’accès studio est limité à l’administrateur autorisé.
- Un pilote puis des livres longs ont été produits réellement avec George. Les narrations restent privées en attente d’écoute ; elles ne sont pas publiées du seul fait de leur production. Le plafond de session a été autorisé explicitement par le propriétaire, avec un plafond de clé correspondant et les dépassements payants désactivés. Les coûts détaillés sont consultables dans le studio privé.
- La configuration du dépôt laisse la génération désactivée. L’état réel est donné par `/health` ; une session autorisée l’active temporairement puis la désactive à son terme.
- Le contrôle des références et droits de chaque script reste obligatoire : l'importation ne vaut pas validation religieuse ou autorisation de redistribution.

## Architecture

React → Worker Cloudflare (authentification Supabase + liste d'administrateurs) → Workflow → ElevenLabs.
Le Worker écrit les reçus et MP3 dans un bucket R2 privé et les métadonnées dans Supabase. Seuls les audios explicitement publiés sont accessibles par `/media/…`. La préécoute exige une session administrateur. Les tables et fonctions de production refusent les rôles `anon` et `authenticated`.

Le navigateur reçoit seulement l'URL publique `VITE_AUDIO_PRODUCTION_URL`. Les secrets `SUPABASE_SERVICE_ROLE_KEY`, `ELEVENLABS_ACCOUNTS` et la liste `AUDIO_ADMIN_IDS` restent dans les secrets du Worker. Aucun fichier `.dev.vars` ou `.env` réel ne doit être versionné.

## Installation opérateur

1. Installer `workers/audio` avec `npm ci`.
2. Appliquer `supabase/migrations/202610230001_audio_production.sql` dans une transaction. Cette migration crée uniquement les objets `qc_audio_*`. Ne pas la réexécuter si les tables existent.
3. Activer R2 dans le compte Cloudflare après lecture de ses conditions et de sa tarification, créer le bucket privé `quran-coach-audio-private`. Ne pas activer l'URL publique R2.
4. Configurer les secrets via `wrangler secret put` : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `AUDIO_ADMIN_IDS` (UUID Supabase séparés par virgules), `ELEVENLABS_ACCOUNTS` (objet JSON associant identifiant de compte et clé). Utiliser des clés ElevenLabs limitées aux permissions nécessaires et plafonnées ; désactiver les dépassements payants dans chaque compte.
5. Déployer avec `GENERATION_ENABLED=false`, vérifier `/health`, `/catalog`, refus de `/admin/state` sans session, refus d'un utilisateur non administrateur, et accès autorisé à son propre studio.
6. Configurer `VITE_AUDIO_PRODUCTION_URL` côté application puis reconstruire. Ajouter explicitement l'origine locale au Worker uniquement pour les essais locaux nécessaires.
7. Enregistrer une autorisation de compte (date de fin et plafond global), un profil vocal et un script relu avec références et droits.
8. Afficher et faire approuver un petit lot pilote. Activer la génération côté serveur seulement après cette validation. Le studio exige à nouveau une confirmation du devis exact avant chaque lot.
9. Écouter intégralement le résultat, contrôler la prononciation, le texte et les coupures. Publier explicitement. Vérifier la lecture sur iPhone réel et le téléchargement hors ligne avant production en série.

## Crédits et reprise

- Modèle : `eleven_multilingual_v2`, français, MP3 44,1 kHz / 128 kbit/s.
- Devis : texte × tarif de la voix, arrondi et réserve supplémentaire de 15 %. Le tarif doit être vérifié pour chaque voix ; cette marge n'est pas une garantie sur une facturation externe.
- Les réservations et la prise en charge d'une tâche sont atomiques dans Postgres. Une seule génération en cours par compte.
- Le budget du compte est un plafond de production cumulé, pas un compteur automatiquement remis à zéro au renouvellement ElevenLabs.
- Après réponse perdue, la tâche passe en vérification. Aucun nouvel appel TTS automatique. Récupérer le reçu R2 ou l'historique ElevenLabs ; la correspondance texte/voix/modèle/requête est vérifiée.
- Si l’identifiant a été perdu, le rapprochement lit l’historique dans la fenêtre de la requête et exige une correspondance unique du texte complet, de la voix, du modèle, des réglages et de l’heure. Il refuse les réponses ambiguës ou incomplètes. Une récupération n’appelle jamais la synthèse.
- Les lots sont parcourus par unités de trois tâches pour rester sous la limite de requêtes de l’offre Cloudflare existante. Le relais non payant peut être repris par identifiant déterministe. Les étapes payantes ne sont jamais relancées automatiquement, et les prises terminées sont ignorées lors d’une reprise.
- Les conversions binaires des MP3 utilisent les codecs natifs disponibles ou une boucle/chunks bornés, sans callback JavaScript par octet. Les alignements récupérés ne sont acceptés que s’ils correspondent au texte et à des horodatages cohérents.
- Le coût réel provient du fournisseur. S'il manque, le studio affiche « en cours de rapprochement » et conserve la réserve ; il ne remplace pas le réel par l'estimation.
- Le transfert vers un autre compte autorisé ne concerne que les tâches non commencées, reste en pause et exige une reprise explicite. Aucun contournement automatique de quota ou des conditions d'une offre étudiante.
- L'empreinte du texte et des réglages est indépendante du compte. Une production identique déjà réservée ou créée est refusée. Un audio rejeté exige un script ou des réglages corrigés pour une nouvelle production ; aucune régénération identique forcée n'est proposée.

## Bibliothèque

Recherche dans titre/texte/références, catégories, favoris, reprise, lecteur flottant persistant, vitesse, minuterie, commandes Media Session, texte et provenance. Les positions et favoris rejoignent la sauvegarde existante. Le studio peut lire les voix du compte, avec priorité aux aperçus français, et écouter leurs aperçus existants sans lancer de synthèse. Une mise à jour PWA attend la fin de la lecture ; la proposition d’installation est masquée dans la bibliothèque et le studio. Le téléchargement vérifie taille et SHA-256 avant de conserver le fichier. Il reprend par épisode entier, pas par octets. Les données du cache peuvent être supprimées par le système si l'espace manque.

Les narrations publiées remplacent les narrations existantes dans les lecteurs uniquement si le texte correspond exactement. Les scripts modifiés restent disponibles dans la bibliothèque ; ils ne sont jamais associés approximativement à un cours existant.

## Vérifications reproductibles

Depuis la racine :

```sh
npx vitest run src/lib/audioProduction.test.ts workers/audio/tests/production.test.ts src/lib/progressBackup.test.ts src/lib/ttsService.test.ts src/components/Journeys/useJourneyAudio.test.tsx
npm run build
npm run check --prefix workers/audio
node workers/audio/test-database.mjs
```

Les tests utilisent des réponses fournisseur simulées et une base Postgres PGlite locale. Ils vérifient les plafonds, doublons, réservations, reprise ambiguë sans nouvelle dépense, isolement des tables/fonctions, transfert et Range HTTP. Ils ne prouvent ni une génération réelle, ni la lecture sur iPhone verrouillé, ni les performances du service distant.

## Limites et sources

Pas de récitation arabe synthétique : blocage des caractères arabes et validation éditoriale humaine. La translittération reste à contrôler humainement. Pas de dictionnaire de prononciation dédié ni de régénération partielle dans cette première version. Pas de validation religieuse automatisée.

Références techniques à revérifier lors des évolutions du fournisseur :
- https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
- https://elevenlabs.io/docs/api-reference/history/get
- https://developers.cloudflare.com/workflows/
- https://developers.cloudflare.com/r2/pricing/
- https://supabase.com/docs/guides/database/postgres/row-level-security

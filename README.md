# Quran Coach

Application francophone de lecture, d’écoute, de mémorisation et d’apprentissage du Coran. Interface React/TypeScript, PWA installable et application iOS avec Capacitor.

Site public : [quran-coach.fr](https://www.quran-coach.fr).

## Fonctionnalités

- Mushaf Tajwid interactif : actions sur les mots et versets, prononciation, traduction française mot à mot, signets, lecture continue et sous-titres.
- Identification vocale et accompagnement de la récitation avec Tilawa.
- Écoute, récitateurs, parcours, listes d’écoute et commandes média.
- Mémorisation, répétitions, tests, révisions et progression du Khatm.
- Prières et mosquées, avec Adhan/Iqama/Jumu’a publiés lorsqu’ils sont disponibles.
- Académie, arabe (Nahw/Sarf), Fahm, quiz, récits et invocations.
- Sauvegarde par fichier et synchronisation facultative chiffrée des progrès.
- Projet iOS, widgets et pont audio ; les possibilités CarPlay restent soumises aux autorisations Apple et aux tests sur appareil.

## Démarrer en local

Installer une version récente de Node.js avec npm, puis :

```sh
npm ci
cp .env.example .env
npm run dev
```

Renseigner `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` avec l’URL et la clé publique anonyme du projet. Une clé `service_role`, une clé SMTP ou une clé privée ne doit jamais être placée dans une variable `VITE_`.

Le mot de passe local d’administration montré dans `.env.example` est une valeur d’exemple à remplacer, pas une protection serveur suffisante pour un espace sensible.

```sh
npm run build
npm run preview
```

Le `prebuild` télécharge au premier lancement les ressources Tilawa nécessaires, vérifie leurs empreintes puis prépare le runtime. Une connexion réseau est nécessaire pour ce premier téléchargement. Ces fichiers générés ne sont pas suivis dans Git.

## Synchronisation des progrès

La synchronisation est désactivée par défaut dans `.env.example`. Pour un autre environnement :

1. Appliquer uniquement la migration adaptée dans `supabase/migrations/202610170001_private_progress.sql` et contrôler ses politiques RLS. Ne pas appliquer aveuglément les migrations historiques sur une base existante.
2. Configurer un SMTP d’authentification dans Supabase. Le modèle `supabase/templates/progress-otp.html` est prévu pour les emails de première connexion et de reconnexion.
3. Exécuter le test transactionnel `supabase/tests/private_progress_isolation.sql` : ses comptes et données synthétiques sont annulés par `rollback`.
4. Activer `VITE_PROGRESS_SYNC_ENABLED=true` et reconstruire l’app.

L’utilisateur se connecte par code email et active explicitement l’envoi chiffré. La phrase de chiffrement reste en mémoire pendant la session ; elle est nécessaire sur chaque appareil et après rechargement. La synchronisation fonctionne lorsque l’app est ouverte et déverrouillée. Les systèmes mobiles peuvent suspendre les transferts en arrière-plan.

Les téléchargements audio, polices, coordonnées GPS et jetons de connexion ne font pas partie du fichier de progression. L’export manuel est un fichier personnel non chiffré à conserver dans un emplacement privé.

## Vérifications

```sh
npx tsc -b --pretty false
npm test
```

Les vérifications ciblées et leurs limites sont documentées dans `docs/releases/` et `docs/audits/`. Un build ou un test navigateur desktop ne valide pas le microphone, les notifications, CarPlay ou le fonctionnement sur un iPhone physique.

## iOS

```sh
npm run build
npx cap sync ios
npx cap open ios
```

Le contenu web doit être recompilé et synchronisé pour une nouvelle version native. Une publication Vercel met à jour le site et la PWA ; elle ne remplace pas le binaire App Store. Voir `docs/ios-carplay.md` pour les capacités, widgets et vérifications nécessaires.

## Sources et droits des ressources

Les ressources ont leurs propres conditions d’utilisation ; le dépôt ne leur attribue pas une licence unique.

- Tilawa : notices et licences préparées par `scripts/prepare-tilawa.mjs`. Le modèle Zipformer utilise NPL-1.2, avec restrictions à respecter.
- Mushaf et français mot à mot : provenance, pagination, droits et limites décrits dans `docs/audits/interactive-tajwid.md` ; les polices sont chargées depuis leurs sources autorisées.
- Audios : attributions dans `public/audio/adhan/`, `public/audio/invocations/opendua-v0.0.2/` et `public/audio/narration/`.
- Cours : conserver les références et attributions intégrées aux leçons et documents sources.

Les fichiers `.env`, clés de signature, caches de fournisseur, exports personnels, captures de contrôle et fichiers temporaires ne font pas partie de la livraison Git.

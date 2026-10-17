# Mushaf Tajwid interactif — prototype pages 1–3

## Audit préalable (10 octobre 2026)

- `ReadPage.tsx` choisit les lecteurs depuis `settingsStore` (Zustand persistant, clé conservée). Le suivi vocal continue à utiliser son lecteur texte existant.
- `MushafPage.tsx` est un flux de texte par sourate, sans composition de livre fixe.
- `TajweedImagePage.tsx` utilise des scans Dâr al-Ma‘rifa depuis Archive.org. Leur accessibilité ne vaut pas licence.
- `MadinahImagePage.tsx` utilise des pages graphiques avec zones d'interaction. Aucun des deux modes image ne sera remplacé.
- Réutilisation : `quranStore`, `settingsStore`, `readingBookmarkStore`, `favoritesStore`, `useMushafAudio`, `VerseActionBar`, `ReadingBookmarkControl`, services de traduction, routes Passage/Tafsir/Hifdh.
- Polices Unicode existantes : Amiri et Scheherazade New via Google Fonts, insuffisantes pour reproduire la composition QCF.
- PWA : `src/sw.ts`, Workbox injectManifest ; Capacitor embarque `dist`, sans serveur privé. Aucune clé ajoutée au client.

## Référence et droits

QuranFlash : https://app.quranflash.com/book/Tajweed?en#/reader/chapter/3
Le lecteur indique que ses scans sont fournis par Dâr al-Ma‘rifa. Aucune police ni table de coordonnées réutilisable de cette édition identifiée. Aucun scan, bordure ou fragment calligraphique de QuranFlash copié dans le produit.

Observation des pages 1–3 : premières pages avec cadre floral bleu, vert et rose, médaillons dorés ; page 3 plus sobre avec cadre vert/doré et commentaires latéraux. Page 1 : Al-Fatiha ; page 2 : 2:1–5 ; page 3 : 2:6–16. Les coupures de lignes de la page 1 diffèrent du QCF V4. Cela interdit de présenter QCF comme une reproduction exacte de Dâr al-Ma‘rifa.

Ressources examinées :

| Ressource | Résultat / droits | Utilisation |
| --- | --- | --- |
| https://github.com/MihrabHQ/Mihrab | AGPL-3.0 pour le code actuel ; NOTICE distingue les droits des polices/données | Étude uniquement, aucun code copié |
| https://github.com/NedaaDevs/quran-image-generator | MIT pour le code ; avertit que son rendu n'a pas été relu contre un Mushaf imprimé ; droits des polices distincts | Étude du principe, aucune image générée utilisée |
| https://github.com/quran/quran.com-frontend-next | README affiche MIT mais aucun fichier de licence racine trouvé dans l'arbre consulté ; ne pas en inférer les droits des données | Étude, aucun composant copié |
| https://qul.tarteel.ai/resources/font/240 | QPC V4, copyright KFGQPC ; le fichier examiné porte « All rights reserved », sans concession embarquée | Pas de redistribution d'un miroir GitHub |
| https://qul.tarteel.ai/resources/mushaf-layout/19 | Édition KFGQPC 1441H, 604 pages, lignes structurées ; page comporte un avertissement de relecture | Référence de composition indépendante, pas assimilation à QuranFlash |
| https://api-docs.quran.com/docs/tutorials/fonts/font-rendering/ | Fonts QCF V4 sur CDN officiel, glyphes `code_v2`, mushaf 19 ; cache/bundling conditionnés à un compte développeur actif et attribution | Chargement distant uniquement pour le prototype |
| https://api-docs.quran.com/docs/tutorials/fonts/page-layout/ | Pagination dépend de l'édition | Validation explicite des pages/versets/lignes |

L'utilisateur a confirmé ne pas avoir de compte Quran Foundation actif. Aucun fichier QCF n'est embarqué, aucun pack hors ligne de ces polices n'est proposé. Le cache HTTP normal du fournisseur n'est pas une garantie hors ligne. La livraison d'un téléchargement complet attend les droits requis. Attribution dans « À propos de cette édition ».

## Choix technique

Rendu React original : chaque mot est un glyphe de police vectorielle colorée, associé à sa référence sourate:verset:position et son texte Unicode accessible. Couleurs à l'intérieur des glyphes, aucune coloration arbitraire de mots entiers, aucune modification du texte ou des polices. Les signes et médaillons présents dans les glyphes sont conservés.

Composition limitée à 1–3 : sauts de ligne fournis avec `mushaf=19`, contrôle des limites et des références. Largeurs mesurées avec la police chargée ; positions numériques fixes dans une page de référence ; espacement calculé entre glyphes, sans `text-align: justify`, sans déformation horizontale et sans recomposition mobile. Le zoom redimensionne uniformément toute la page. Les espacements ne sont PAS des coordonnées physiques certifiées du livre Dâr al-Ma‘rifa.

Ornements SVG originaux, plus riches pour les deux pages d'ouverture, sobre cadre sur la page 3. Titres Unicode existants ; pas de copie du cartouche de l'éditeur. Les commentaires latéraux de QuranFlash ne sont pas reproduits.

Données : API publique Quran.com déjà utilisée par Quran Coach. Réponses contrôlées avant affichage, cache mémoire limité aux trois pages. API authentifiée future et droits de cache à traiter avant une généralisation. L'API publique est un point de dépendance et peut évoluer.

Traduction mot à mot : lors des essais, `language=fr` et `word_translation_language` renvoient encore `language_name: english`. Ne jamais afficher cette réponse sous une étiquette française. Afficher l'indisponibilité du mot et proposer la traduction française du verset existante. Ressource française identifiée dans QUL (https://qul.tarteel.ai/resources/translation/95), intégration et droits spécifiques restant à confirmer.

## Limites avant validation

- Seulement trois pages ; navigation hors périmètre conserve la position et propose un autre lecteur.
- Pas une reproduction exacte ni une édition certifiée QuranFlash/Dâr al-Ma‘rifa.
- Hors ligne complet non activé (conditions des polices non satisfaites).
- Validation sur iPhone physique et relecture religieuse spécialisée nécessaires avant extension.
- Ne pas étendre à 604 pages sans validation explicite.

## Vérifications exécutées

- TypeScript : `npx tsc -b --pretty false` réussi.
- Build PWA : `npm run build` réussi (Workbox génère `sw.js`). Avertissements de taille de bundles existants : ce build n'est pas une mesure de performance iPhone.
- ESLint ciblé sur le nouveau moteur et les nouveaux composants : réussi.
- 40 tests réussis : modèle et données réelles des trois pages (captures API d'audit temporaires), erreurs réseau et reprises, déduplication, rejet d'une lettre altérée via SHA-256, hors-périmètre, placement, signets y compris le nouveau mode, gestes longs et audio existant.
- Les instantanés complets d'API et polices utilisés pour la recherche restent dans `/tmp/qc-tajwid-research`, hors application. Seules les références de positions et empreintes de vérification sont conservées dans `verified-layout.json`.
- Navigateur local à 390 × 844 : trois pages visibles ; textes, signes de pause et couleurs rendus ; fiche du mot 2:2:4 ; translittération ; traduction française du verset 2:2 ; barre contextuelle ; entrées favoris, partage, compréhension ; légende centrée.
- Zoom par boutons : 125 %, page 3 conserve ses 15 lignes et 138 éléments (127 mots + 11 médaillons), zéro image de page dans le DOM. Réduction et retour à 100 % testés. Débordement de dernière ligne corrigé puis revu visuellement.
- Passage du nouveau lecteur vers Madinah puis retour : page 3 conservée. Page 4 : message de limite et retour possible au lecteur texte, aucune fausse page QCF.
- Prononciation déclenchée par action utilisateur ; URL audio du mot 2:2:4 répond HTTP 200, `audio/mpeg`. Écoute de page : passage visible à « Pause », puis arrêt manuel. Tests unitaires du moteur audio : répétition et bornes. Pas de certification auditive de toutes les récitations.
- Signets et favoris : persistance des signets testée dans un stockage de test ; les favoris/signets réels de l'utilisateur n'ont pas été écrasés pour ces essais.
- Erreur hors connexion : test automatisé du rejet réseau sans faux contenu ; pas de prétention à un pack PWA autonome, puisque la police n'est pas autorisée à être embarquée dans la configuration actuelle.
- Non testés physiquement : iPhone/Capacitor installé, geste de pincement à deux doigts sur appareil, reprise audio écran verrouillé, téléchargement hors ligne complet. Aucune certification typographique/religieuse exhaustive. Une relecture humaine des ligatures, harakat et couleurs demeure nécessaire avant généralisation.

Les captures mobiles sont dans `docs/audits/tajwid-preview/`.

- Contrôle supplémentaire à 320 × 693 : pas de débordement horizontal de l'application. La réglette des 30 juz est masquée uniquement dans le prototype à trois pages pour ne pas couvrir le zoom ; les lecteurs existants la conservent. Recherche et navigation par page restent disponibles.

## Extension complète et améliorations (10 octobre 2026)

L'utilisateur a explicitement validé « 1 à 7 plus version complète » : la limite de trois pages est levée. Les constats historiques ci-dessus décrivent le prototype, pas le périmètre actuel.

### Données et fidélité

- 604 pages auditées avec deux sources : réponses Quran.com (mots/codes Unicode/codes glyphes) et aperçus officiels QUL de l'édition 19 (lignes, titres, basmala, centrage).
- `scripts/audit-interactive-mushaf.py` : script original, deux workers au maximum, délai entre requêtes, reprises et captures temporaires hors application. Aucun code Mihrab ou du générateur d'images copié.
- Contrôle de 6 236 versets uniques, 6 236 médaillons, 114 titres de sourates ; absence de basmala à At-Tawba ; présence des trois titres sur la page 604.
- Des réponses `by_page` sont incomplètes ou utilisent des limites différentes malgré `mushaf=19` (ex. 5:77, pages 120–121, et certaines dernières sourates). Le service réconcilie uniquement les références de l'édition auditée, complète les manquants avec `by_key`, exclut les références d'une autre page puis contrôle l'empreinte intégrale. Aucune lettre n'est ajoutée ou réparée par heuristique.
- Les lignes proviennent de QUL, y compris lorsque `line_number` de l'API correspond à un autre découpage. Les glyphes multi-caractères et espaces de séparation des signes sont conservés.
- Le manifeste embarque références, positions de lignes et empreintes, pas les textes ou polices. Les métadonnées des sourates viennent de `/chapters?language=fr`.
- La traduction de verset utilise les services existants par sourate et identifiants globaux : aucune dépendance à une pagination française différente.
- Reste une édition QCF V4/KFGQPC ; ni reproduction exacte de QuranFlash/Dâr al-Ma‘rifa ni certification typographique/religieuse. Vérification automatisée de concordance ne vaut pas relecture religieuse.

### Améliorations livrées

1. Barre supérieure sur une rangée, options regroupées, immersion avec commandes flottantes (audio et microphone) ; retour par bouton ou toucher de marge.
2. Balayage horizontal en direction de lecture arabe ; zoom centré, double toucher, pincement, déplacement dans la page agrandie ; zoom persistant et transitions réduites selon la préférence d'accessibilité.
3. Fiche mot non modale en bas, navigation précédent/suivant et glissement ; prononciation, translittération, repères Tajwid. Traduction française du verset disponible. Le français mot à mot n'est toujours pas fourni par l'API et n'est pas inventé.
4. Audio continu entre pages et sourates, arrêt à la page 604, répétition de plusieurs versets d'une même sourate présents sur la page (1 à 20 répétitions). Surbrillance du mot seulement si minutages et tokenisation correspondent ; sinon suivi du verset.
5. Suivi vocal conserve cette édition. Le moteur Tilawa existant reste unique ; références de pages résolues avec le manifeste QCF, surbrillance alignée par les utilitaires existants. Aucune activation automatique du microphone ajoutée.
6. Réutilisation de `useKhatmReading`/compagnon, sans remonter le composant à chaque page. Les transitions de lecture ne sont pas des sauts de recherche ; lecture trop rapide, recherche, modal, arrière-plan et audio sont exclus du comptage automatique. Dernière page : validation manuelle proposée. Signet volontaire indépendant du dernier emplacement.
7. Papier clair, ivoire et nuit ; palettes officielles QCF 0/2/1, variante OT-SVG correspondante sur navigateur sans COLRv1. Cadres originaux adaptés, titres de toutes les sourates, légende et attribution.

### Performance et limites

- Préchargement d'une seule page voisine, déduplication, mémoire bornée à 12 pages de données et 15 fontes, délais d'expiration et reprise après erreur.
- Pas de pack QCF hors ligne ni de police embarquée : l'utilisateur n'a pas de compte développeur actif. Conditions officielles reconsultées : https://api-docs.quran.com/docs/tutorials/fonts/font-rendering/#font-caching-and-app-bundling . Connexion nécessaire ; les autres lecteurs gardent leur fonctionnement existant.
- Le téléchargement iOS natif, le pincement sur iPhone physique et la précision acoustique réelle de la voix ne sont pas certifiés par des tests jsdom ou un navigateur desktop. Aucun changement de modèle de reconnaissance.
- Le mode vocal reste limité à cinq minutes par session par le moteur existant.

### Résultats de vérification de la version complète

- 660 tests réussis sur 10 fichiers, dont 604 décodages/empreintes de réponses réelles, réconciliation d'une page partielle, contrôle de l'index complet, Khatm via le hook React, continuation audio sur une même sourate entre deux pages, pages multi-sourates, arrêt final, références de recherche et maintien du lecteur pendant le suivi vocal.
- TypeScript et ESLint ciblé réussis ; build de production et génération du service worker réussis (avertissements de taille de bundles préexistants).
- Navigateur local : fiche mot, thèmes ivoire/nuit, immersion, page 604 (trois titres et trois basmala), saut à la page 120 (5:71 à 5:77), passage à 121 (5:78 à 5:83), zoom 125 % conservé.
- Tests de Khatm exécutés dans un stockage isolé : aucun Khatm utilisateur modifié pour les vérifications.
- Les captures prouvent un affichage navigateur mobile, pas une validation sur iPhone physique. Le microphone réel et le geste de pincement sur appareil restent à vérifier.

## Polices hors ligne — 10 octobre 2026

- Compte Developer Console connecté, confirmé par l’utilisateur et vérifié dans la console (aucun secret nécessaire au CDN).
- Conditions relues : https://api-docs.quran.com/legal/developer-terms/ §3.1 et guide Font Caching. Attribution conservée dans le lecteur et le téléchargement.
- CacheStorage dédié `quran-coach-qcf4-fonts-2026-10-v1`, lecture via ArrayBuffer/FontFace, sans dépendance au service worker pour les polices (adapté à Capacitor). Version à incrémenter lors d’une mise à jour de la source ; les polices ne sont pas redistribuées via une API ni un fichier indépendant.
- Cache automatique des polices effectivement chargées ; pack explicite 604 COLRv1 ou 1812 OT-SVG pour les trois thèmes. Téléchargements séquentiels, pause/reprise, octets affichés, contrôle WOFF2, détection du cache incomplet, suppression du pack. Quota/stockage indisponible n’empêche pas la lecture en ligne.
- Test navigateur local réel : 604 polices COLRv1, 48,5 Mo, pause à 74 %, reprise à 100 %. Les tests unitaires simulent une perte de réseau avec police présente, un fichier invalide et un stockage refusé. Pas de test physique iPhone effectué.
- **Périmètre : polices uniquement**, clairement affiché. Le texte/positions doit passer par Content Sync pour un véritable pack de lecture hors ligne ; aucune copie persistante des réponses régulières n’a été ajoutée. Le compte ne comporte pas encore d’application/API de production.
- Français mot à mot : ressource QUL 95 identifiée, téléchargement protégé par connexion QUL distincte. En attente de connexion et de vérification des droits du fichier. Aucun texte généré ni traduction anglaise présentée comme française.

### Français mot à mot — fichier QUL intégré

- Connexion QUL confirmée dans l’onglet de l’utilisateur ; téléchargement du lien JSON officiel de la ressource 95, archive `french-wbw-translation.json.zip` (591 016 octets).
- Empreinte SHA-256 du JSON original : `c3848a99db082b7966b2ffcd3da7c747a173236dc8b576935fb75379e84dd554`.
- 77 429 entrées, 114 sourates. Comparaison exhaustive aux références des 604 réponses QCF auditées : 0 référence manquante, 0 référence supplémentaire, 0 texte vide, 0 balise HTML. Ce contrôle porte sur l’alignement, pas sur une validation savante des choix de traduction.
- Import reproductible : `python3 scripts/import-french-wbw.py <archive> --audit-dir <snapshots>` ; formulation et ponctuation de la source conservées. Chargement par sourate et affichage comme texte React, jamais comme HTML. Les médaillons ne reçoivent pas de traduction.
- Attribution/lien QUL dans chaque fiche mot et dans les crédits du lecteur. La traduction de verset Hamidullah reste distincte.
- Cadre d’usage : QUL présente ses téléchargements comme des ressources pour construire des applications et autorise l’usage de données dans des projets (FAQ). La fiche 95 et l’archive ne précisent pas de traducteur ; QUL crédite QuranWBW.com pour des traductions mot à mot (page Credits), mais la fiche 95 ne donne pas d’identifiant de licence propre au fichier. Ne pas attribuer à tort une licence MIT/GPL aux traductions ni revendiquer une authentification éditoriale complète. Conserver la provenance QUL et suivre ses notifications de corrections. Références : https://qul.tarteel.ai/resources/translation/95, https://qul.tarteel.ai/faq et https://qul.tarteel.ai/credits.

## Correctif de lisibilité mobile — 10 octobre 2026

- Retour utilisateur sur iPhone : le cadre et les commandes s’affichaient, mais les mots arabes apparaissaient comme des rectangles vides en thème Nuit.
- Rendu désormais choisi selon les formats couleur réellement annoncés par le navigateur : COLRv1 garde la palette de thème, OT-SVG conserve sa variante de couleur fournie, et les navigateurs sans ces formats affichent le texte arabe Uthmani exact au lieu de glyphes QCF privés invisibles. Un échec de chargement de la police bascule aussi sur le texte Unicode disponible.
- La recherche du Mushaf interactif utilise maintenant le même panneau dédié que les modes Madinah/Tajwid, avec navigation sourate, page et verset. La sélection du verset est remappée à la pagination de l’édition QCF pour ne pas ouvrir une page approximative.
- Vérifications automatisées : tests ciblés des polices, du rendu Unicode, de la composition et du chargement de page ; build de production réussi. La capture signale aussi une différence de recherche qui est corrigée dans le code.
- À confirmer après mise en ligne : rendu réel sur l’iPhone de l’utilisateur. La police Unicode dépend des polices arabes présentes sur l’appareil ; le texte demeure lisible et n’est plus dépendant des glyphes couleur QCF dans le chemin de secours.

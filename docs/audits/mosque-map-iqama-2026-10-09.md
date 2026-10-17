# Carte des mosquées et horaires publiés — 9 octobre 2026

## Réalisation

MapLibre GL JS 6.13, OpenFreeMap **Fiord** (comparé visuellement à Dark), marqueurs violets et favori doré, regroupement, attribution visible, liste accessible en parallèle et repli si WebGL échoue. Recherche par ville et nom/adresse, GPS explicite sans remplacer la ville enregistrée, rayon 5/15 km, filtres sur les Iqama réellement connues, fiche et itinéraires Apple/Google.

L’annuaire fusionne PrayerZone et OpenStreetMap/Overpass : noms normalisés, coordonnées et adresse, conservation des identifiants historiques, correspondances incertaines séparées. Atlas conserve Leaflet : ses fichiers TSX/CSS sont inchangés (empreintes vérifiées).

Pas de SDK MAWAQIT. Un adaptateur serveur indépendant lit uniquement le JSON `confData` des pages publiques de mosquée. Aucune exécution de JavaScript distant, aucun appel à une API privée, aucun jeton, aucun contournement d’un refus HTTP. URL limitée au domaine MAWAQIT, délais et taille plafonnés. Les calendriers publiés sont convertis selon le fuseau local ; les cinq Adhan/Iqama et jusqu’à trois prières du vendredi sont affichés lorsqu’ils existent. Un décalage n’est utilisé que s’il est explicitement publié ; absence d’Iqama = champ vide.

L’utilisateur associe un lien public après vérification de l’identité et des coordonnées. Un écart supérieur à 300 m interdit l’association ; une confirmation explicite reste nécessaire en dessous. Pas de collecte massive ni d’annuaire MAWAQIT automatique. Les fiches non associées affichent « Horaires d’Iqama non renseignés ».

La correction prépare un message à copier/partager au responsable : aucune correction n’est envoyée automatiquement et les données du fournisseur ne sont pas modifiées. Favori, calendriers personnels et préférences existantes conservés. La comparaison des départs et les rappels existants restent fondés sur les calendriers personnels confirmés.

## Sources examinées

| Projet | Licence constatée | Dernier commit consulté | Méthodes et décision |
|---|---|---|---|
| [mawaqit/mawaqit-js](https://github.com/mawaqit/mawaqit-js) | Apache-2.0 | 8 octobre 2026 | Recherche, fiche, calendriers ; API soumise à autorisation. SDK exclu à la demande de l’utilisateur. |
| [mawaqit/home-assistant](https://github.com/mawaqit/home-assistant) | Apache-2.0 | 8 octobre 2026 | Intégration Home Assistant, capteurs/calendrier, compte/jeton ; pas un adaptateur web réutilisé ici. |
| [maxencelobry/mawaqit](https://github.com/maxencelobry/mawaqit) | MIT déclaré dans package.json, pas de fichier LICENSE trouvé | 26 février 2026 | Lecture HTML/confData, Iqama/Jumu’a/calendrier ; ses méthodes API/recherche et collecte par pays ne sont pas reprises. Aucun code copié. |
| [mrsofiane/mawaqit-api](https://github.com/mrsofiane/mawaqit-api) | MIT, LICENSE.md | 3 juin 2026 | FastAPI, extraction HTML, prayer-times/calendar/calendar-iqama, Redis optionnel. Principe comparable, sans installer ni copier le service. |

La licence des logiciels ne vaut pas autorisation de réutilisation des données. Les [conditions MAWAQIT](https://www.mawaqit.net/fr/privacy-policy) restent restrictives et le [support indique que l’API est privée](https://help.mawaqit.net/fr/articles/11991838-puis-je-utiliser-votre-api). L’accès public observé ne permet pas de conclure à un droit général de redistribution. Aucun partenariat ni engagement de disponibilité n’est revendiqué.

[OpenFreeMap](https://openfreemap.org/quick_start/) : styles Dark et Fiord rendus dans le navigateur ; attribution OpenFreeMap/OpenMapTiles/OpenStreetMap conservée. [MapLibre](https://maplibre.org/maplibre-gl-js/docs/examples/create-and-style-clusters/) : regroupement GeoJSON natif.

## Cache et limites techniques

- Cache serveur borné : 120 entrées, déduplication des requêtes, six lectures simultanées au maximum par instance ; annuaire et pages publiques 15 min, Overpass 24 h.
- CDN : annuaire 15 min, pages publiques 5 min. Limitation 40 requêtes/min/client **par instance**, pas un quota distribué global.
- Cache local : annuaire 12 zones ; horaires 50 fiches. Repli annuaire hors ligne daté jusqu’à 7 jours. Les horaires de plus d’une heure sont exclus du filtre de prochaine Iqama.
- Worker MapLibre empaqueté par Vite ; API absolue en Capacitor et CORS limité aux origines localhost Capacitor. Attribution maintenue ; pas de téléchargement massif des tuiles.
- Une évolution HTML de MAWAQIT peut casser le parseur. Le système signale l’indisponibilité au lieu de fabriquer des heures. La date indiquée est celle de consultation, pas une date de mise à jour éditoriale non fournie par la source.

## Vérifications réalisées

- TypeScript et build Vite/PWA réussis après les dernières modifications.
- Suite ciblée initiale : 36 tests réussis / 10 fichiers. Après ajout du contrôle de slug/CORS : 12 tests réussis sur les trois fichiers concernés (un test supplémentaire).
- Dernière vérification après correction des imports ESM du serveur : ESLint ciblé sans erreur, TypeScript application et NodeNext API sans erreur ; 21 tests réussis sur quatre fichiers.
- Couverture : rapprochement/doublons, validation OSM/URL, parseur JSON inerte, absence d’Iqama, décalages publiés, minuit/DST, fraîcheur, API, persistance et moteur personnel existant.
- Navigateur local : Paris, 18 mosquées ; carte et regroupement affichés, sélection de marqueur, filtre par nom et état vide sans Iqama, fiche défilable. Viewport mobile 390 × 844 testé.
- Trappes : source publique Zawiya Tidjaniya répond en HTTP 200 avec calendrier et Iqama +0 effectivement publiées. Extraction API contrôlée. L’association à une autre mosquée distante de 1 497 m est bien refusée dans l’interface.
- Favori local choisi puis vérifié après rechargement et retiré après le test ; formulaire de correction et liens d’itinéraire contrôlés. Aucun message transmis à une mosquée.
- Overpass a répondu 504 lors du contrôle réseau ; repli PrayerZone et message de résultats partiels vérifiés. Le contrôle final en production a ensuite réussi avec les deux fournisseurs : HTTP 200, 31 lieux autour de Paris et aucune source indisponible.
- Pas de test sur iPhone physique, pas de recompilation/signature de l’application native, pas de validation GPS réel ou PWA installée hors ligne. Le build PWA et les points d’intégration Capacitor sont contrôlés ; cela ne prouve pas le comportement sur appareil.

## Fichiers principaux

`api/mosques.ts`, `server/mawaqitPublic.ts`, `server/mosqueProviders.ts`, `src/lib/mosques.ts`, `src/lib/mosqueDirectory.ts`, `src/lib/mosqueTimetables.ts`, `src/lib/locationService.ts`, `src/stores/mosqueDirectoryStore.ts`, `src/components/Prayer/MosqueMap.tsx`, `MosqueExplorer.tsx`, `MosquePublishedSchedule.tsx`, `MosquePlanning.tsx`, `PrayerExperience.css`, `src/pages/PrayerTimesPage.tsx`, `vite.config.ts`, `package.json` et verrouillage, tests associés.

## Contrôle de production

Le déploiement `dpl_CEmBkiCFD2bmUiWsv2rKWChFe8M5` est READY. API annuaire et horaires publics : HTTP 200 ; calendrier réel de Zawiya Tidjaniya contrôlé, sans Iqama inventée. Le premier déploiement avait une erreur d’import ESM serveur : corrigée par extensions `.js` et validée avec TypeScript NodeNext. Carte Fiord, pins et clusters visibles sur le site public à 390 × 844 ; capture jointe dans ce dossier. La vue initiale a été élargie de zoom 12.8 à 11.5 après ce contrôle pour faire apparaître les lieux sur mobile dès l’ouverture. Aucun contrôle exhaustif des logs/alertes ni test physique iOS.

Déploiement final avec cadrage mobile élargi : `dpl_9HmKr3kanJVt1LiV5j71CxY6tzhE`, READY, alias https://www.quran-coach.fr. Compilation distante application, PWA et API réussie sans erreur TypeScript serveur.

## Correction : détection automatique sans SDK (9 octobre, soir)

- Ajout de `server/mosqueDiscovery.ts` et de l’action API `automatic`. Le serveur utilise les liens MAWAQIT présents dans OpenStreetMap ou dans le site HTTPS public de la mosquée ; le client ne fournit pas d’URL arbitraire au serveur. Un lien unique et une distance inférieure ou égale à 300 m sont nécessaires pour rattacher un calendrier.
- Détection lancée à l’ouverture des fiches et, séquentiellement, sur au plus quatre lieux ayant une source potentielle dans la liste. Les Iqamas trouvées alimentent le filtre et les cartes. Le lien manuel demeure un recours facultatif.
- Réutilisation de la zone de recherche de l’annuaire afin d’éviter une nouvelle recherche Overpass pour chaque mosquée. Conservation du serveur Overpass standard ; le miroir private.coffee essayé a répondu 500.
- Protection des lectures de sites : HTTPS, IP publiques épinglées après résolution DNS, validation des redirections, limite de taille, délais, cache borné. Une indisponibilité temporaire n’est pas conservée quinze minutes côté serveur.
- Tests : 18 tests ciblés réussis, TypeScript application et API NodeNext, ESLint ciblé. Test réseau réel séparé réussi après la dernière correction : site de Bagnolet → lien public détecté → calendrier récupéré sans saisir de lien MAWAQIT. Les cinq couples Adhan/Iqama et deux Jumu’a sont présents dans la source testée. Le test réseau temporaire a été retiré de la suite courante.
- Limites : la chaîne complète dépend de la disponibilité de l’annuaire OSM et de ses liens de sites. Lors du contrôle local, Overpass standard a renvoyé 406 et son miroir 500 : le repli PrayerZone affiche les lieux, mais ne fournit pas les sites nécessaires à la détection. Le succès du parseur seul ne prouve donc pas la couverture automatique dans l’interface.
- L’endpoint de recherche utilisé par un wrapper communautaire MAWAQIT a répondu 401 ; aucune tentative de contourner l’authentification. Pas de SDK officiel, pas d’annuaire MAWAQIT complet, pas d’extraction PDF/OCR ni de navigation multi-pages.
- Autres fournisseurs examinés : TakbeerTime expose une API publique mais l’échantillon parisien consulté n’avait pas de calendriers utilisables ; Masjidi demande une clé. Aucun de ces deux fournisseurs n’est intégré ni présenté comme une couverture française acquise.
- Pas de test sur iPhone physique ; la publication web ne met pas à jour à elle seule un binaire iOS installé.

### Vérification finale en production de la détection automatique

Déploiement `dpl_4LRvsFQXyCBx3mYm3mrAvTkqx6Ni` READY, alias https://www.quran-coach.fr. Le premier appel CLI a refusé la publication ; l’équipe existante `yattas-projects` explicitement sélectionnée a permis la publication, sans changement de permissions. Build application/PWA et API réussi.

L’API publique `action=automatic` a répondu HTTP 200 / `found` pour Bagnolet. Contrairement au contrôle local, Overpass était accessible depuis la production et la chaîne complète a réussi. Dans le navigateur public, mise à jour PWA appliquée, recherche « Bagnolet », Iqama de Maghrib 19:16 affichée dans la liste ; fiche ouverte sans saisir de lien : source détectée automatiquement, Fajr 06:28/06:36, Dhouhr 14:00/14:08, Asr 16:37/16:45, Maghrib 19:16/19:16, Isha 20:36/20:44, Jumu’a 13:00 et 14:00 le 9 octobre. Capture `mosque-automatic-production-2026-10-09.png`. Ces heures proviennent du calendrier publié ; aucun décalage universel ajouté.

18 tests ciblés, ESLint ciblé, TypeScript application/API et build local réussis. Sommes de contrôle Atlas identiques. Couverture non exhaustive, pas de test sur iPhone physique. Les cartes de comparaison des calendriers personnels ne sont pas encore alimentées par les calendriers publics ; cela reste une amélioration proposée.

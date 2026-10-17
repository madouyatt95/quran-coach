# Annuaire direct des calendriers publics — 9 octobre 2026

## Problème confirmé
La découverte par les sites OSM, limitée à quatre sites préchargés, était trop peu couvrante. La présence de quelques horaires valides ne démontrait pas une expérience satisfaisante.

## Source trouvée et vérifiée
Le code de https://github.com/maxencelobry/mawaqit décrit deux méthodes distinctes : recherche textuelle et carte par pays. La recherche avait répondu 401 ; cela ne permettait pas de conclure que la carte par pays était également indisponible. Un seul GET anonyme sur https://mawaqit.net/api/2.0/mosque/map/FR a répondu 200 avec 1 680 fiches / 601 272 octets. Les identifiants exacts, coordonnées, noms et adresses permettent de retrouver les calendriers directement. Aucun SDK installé, aucune clé, aucun code du wrapper copié.

La disponibilité anonyme observée ne constitue pas un contrat de service ou une licence générale de redistribution. Les réserves sur les conditions MAWAQIT consignées dans l’audit précédent restent applicables. Si le point d’accès devient privé, le fournisseur échoue explicitement ; aucune tentative de contournement.

## Mesure reproductible
Sélection des trois fiches les plus proches de chacun des centres : Paris 48.86/2.35, Lyon 45.76/4.84, Marseille 43.30/5.37, Lille 50.63/3.06. Dans un rayon strict de 5 km, l’annuaire reçu compte respectivement 27, 22, 30 et 17 fiches. Elles ne sont pas toutes garanties uniques ni munies d’Iqama.

12 pages lues séquentiellement : les 12 calendriers fournissent cinq Adhan et cinq Iqama pour le 9 octobre 2026, 10 contiennent au moins une Jumu’a. Ceci est un échantillon, pas un audit des 1 680 lieux.

| Ville | Fiche | Adhan | Iqama | Jumu’a |
|---|---|---:|---:|---:|
| Paris | ali-paris | 5 | 5 | 0 |
| Paris | aipf-paris-75010-france | 5 | 5 | 2 |
| Paris | grande-mosquee-de-paris | 5 | 5 | 2 |
| Lyon | mosquee-abou-bark-essedik-lyon-69003-france | 5 | 5 | 3 |
| Lyon | aboubakr69003 | 5 | 5 | 2 |
| Lyon | mosaab-lyon | 5 | 5 | 1 |
| Marseille | masjid-al-imam-chafii-marseille-13002-france | 5 | 5 | 1 |
| Marseille | ikram-mosquee-marseille-13014-france | 5 | 5 | 1 |
| Marseille | mosquee-al-taqwa-marseille-13002-france | 5 | 5 | 1 |
| Lille | mosquee-al-tawhid-lille-59000-france | 5 | 5 | 0 |
| Lille | mosquee-el-moustafa-lille-59800-france | 5 | 5 | 1 |
| Lille | mosquee-badr-msjd-bdr-lille-59000-france | 5 | 5 | 1 |

## Implémentation
- `server/mawaqitDirectory.ts` : validation et adaptation du catalogue public, filtrage géographique avant toute lecture d’horaire.
- `server/mosqueProviders.ts` : priorité au catalogue français, cache six heures par instance et déduplication des appels ; calendriers individuels à la demande, cache quinze minutes et CDN existant. Pas de lecture en masse de tous les calendriers nationaux.
- `src/lib/mosqueDirectory.ts` : conservation des identités / alias et correspondances incertaines. Deux références MAWAQIT différentes ne sont pas fusionnées silencieusement.
- `src/stores/mosqueDirectoryStore.ts` : renouvellement du cache d’annuaire (v3) sans effacer les favoris ni les liens enregistrés.
- `MosqueExplorer.tsx` : huit calendriers initiaux, chargement séquentiel à l’approche des fiches visibles ; jusqu’à 24 candidats avec le filtre de prochaine Iqama. Fiches de calendriers d’abord, autres lieux toujours accessibles.
- Le comparateur de calendriers personnels a un libellé explicite ; il ne prétend plus que les mosquées publiques n’ont aucune Iqama.

## Limites
Le nouveau catalogue est français ; ailleurs les annuaires existants restent disponibles. Les horaires absents ne sont jamais calculés pour combler une Iqama. Les rapprochements de noms arabes/français peuvent laisser plusieurs fiches proches affichées. La disponibilité du fournisseur public peut changer. Pas de preuve physique iOS.

## Vérifications avant publication
21 tests ciblés réussis (validation de catalogue, périmètre, anciennes identités, conflits de calendriers, parseur, découverte et API), TypeScript app/API, ESLint ciblé, build PWA local. Annuaire local Paris : 27 références directes / 53 fiches après fusion. UI : huit premières Iqamas affichées automatiquement et filtre prochaines Iqamas fonctionnel.

## Production
Déploiement `dpl_36RRoHoKrBAHbHwAEMwjX4upFT6F`, READY, https://www.quran-coach.fr. L’API annuaire v3 renvoie 53 lieux dont 27 références directes autour de Paris et aucune source indisponible. La mise à jour PWA a été appliquée dans le navigateur public. Les premières Iqamas sont apparues automatiquement ; le filtre « Prochaine Iqama connue » a ensuite affiché 23 lieux avec horaire après chargement progressif. Capture `mosque-direct-directory-production-2026-10-09.png`. Atlas inchangé (sommes de contrôle). Aucun test sur iPhone physique.

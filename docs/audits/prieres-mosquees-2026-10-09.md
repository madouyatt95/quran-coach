# Prières et mosquées — 9 octobre 2026

## Livré

- Courbe indicative de la progression entre lever et coucher, ambiance nocturne, prochaine prière et navigation par date.
- Horaires placés avant les outils complémentaires ; contenu existant conservé.
- Onglet Mosquées : carte OpenStreetMap, liste, filtre, recherche à 5/15 km, attribution.
- Fiche : adresse disponible, itinéraire Apple/Google, favori local persistant, lien d'horaires enregistré par l'utilisateur, invocations en chemin/entrant/sortant.
- La sentinelle mentionne la mosquée choisie mais conserve les horaires calculés de la ville comme base de rappel.

## Sources et limites

- [PrayerZone](https://github.com/PrayerZone/prayer-times-api) : API publique documentée, sans clé à la date du contrôle. Dépôt MIT ; attribution visible du service conservée. Les réponses vérifiées autour de Paris donnent l'annuaire, les coordonnées et des horaires **calculés** avec méthode et fuseau ; aucune iqama ni horaire du vendredi dans la réponse testée. Aucune garantie d'exhaustivité ou de disponibilité permanente.
- [Mawaqit](https://help.mawaqit.net/fr/articles/11991838-puis-je-utiliser-votre-api) : API privée. Le support propose URL/widget de mosquée. Les wrappers GitHub non officiels ne constituent pas une autorisation d'accès ; aucun scraping intégré, aucun message envoyé au fournisseur.
- [Masjidbox](https://masjidbox.com/blog/mosque-digital-signage-the-complete-guide) : documentation indiquant l'absence d'API publique ; pas de synchronisation intégrée.
- [OSM](https://operations.osmfoundation.org/policies/tiles/) : tuiles interactives avec attribution ; pas de téléchargement massif ou hors ligne ajouté.
- Les délais +10 minutes et +5 pour Maghrib existent dans certains calendriers, par exemple [Nouméa](https://www.amnc.org/wp-content/uploads/2024/02/9-SEPTEMBRE-24.pdf). Ils ne sont pas appliqués universellement.

Les horaires calculés restent repliés et explicitement distingués des iqamas. Le lien saisi est un lien personnel enregistré, pas un horaire authentifié par l'application. La synchronisation d'iqamas, les rappels basés sur l'iqama et les horaires officiels du vendredi restent dépendants d'une source autorisée.

## Extensions 1, 2, 3, 5 et 6

- Saisie manuelle par mosquée des heures d'entrée, adhan et iqama, lien/source, fuseau IANA, date de validité (63 jours maximum), jusqu'à trois sessions du vendredi. Les champs inconnus restent vides. Il est possible d'appliquer explicitement le repère +10/+5 sur les adhans déjà saisis ; aucun délai n'est imposé par défaut. Toute modification invalide la confirmation précédente et demande de revérifier la source et les heures.
- Départ conseillé calculé depuis l'iqama, ou depuis la khutba pour les événements du vendredi, en ajoutant une durée de trajet et une marge manuelles.
- Mode Vendredi montrant les sessions disponibles, l'heure de khutba, la salat, un départ conseillé et les liens Al-Kahf / salawat. Aucune khutba n'est inférée à partir de Dhouhr.
- Comparaison des calendriers personnels valides (jusqu'à 12 mosquées) à 24 h, triée par possibilité de départ. L'annuaire seul ne renseigne pas les iqamas et n'entre pas dans cette comparaison.
- Frise jour par jour, avec curseur clavier et sélection à la souris/au doigt, affiche les repères de la ville et les heures renseignées de la mosquée choisie.
- Sentinelle d'application basée sur l'iqama confirmée par l'utilisateur. Pour une alerte hors application, un ICS individuel avec alarme au départ peut être ajouté au calendrier. L'événement doit être actualisé manuellement si les heures changent.
- Les heures ambiguës/inexistantes dues au changement d'heure sont refusées ; Isha après minuit est gérée. L'itinéraire et le trafic restent à la discrétion de l'utilisateur, aucun suivi GPS ni géolocalisation n'est transmis.

## Vérifications

- 28 tests ciblés réussis sur 8 fichiers : calculs et validité des plannings, proxy/annuaire, course solaire, persistance, éditeur d'horaires et sentinelle.
- Build Vite/TypeScript local réussi après la dernière correction de libellé « Départ maintenant » ; build de production Vercel réussi également.
- Navigateur local : 18 résultats à Paris ; fiche Grande Mosquée de Paris ; six horaires calculés ; saisie, trajet, session du vendredi et export calendrier contrôlés. Les données fictives de test ont été retirées.
- Viewport effectif 390 × 844 ; fiche entièrement défilable, aucun débordement horizontal observé. Pas de validation sur iPhone physique ni des notifications en arrière-plan.
- Après déploiement, la page publique `/prayers` a été actualisée et vérifiée : frise interactive, vues « Mes horaires »/« Mosquées », rendez-vous du vendredi, annuaire PrayerZone et navigation à cinq entrées visibles. Aucun horaire personnel fictif n'a été enregistré sur le site public.
- Le calcul local existant des heures de prière n'a pas été remplacé par PrayerZone.

## Exploitation

Production READY : `dpl_F2Ua5QeERmz5FhH7f8maguVo9Fse`, URL https://www.quran-coach.fr/prayers. Build distant réussi le 09/10/2026 ; alias de production confirmé. La page publique a été rechargée après publication et rend les nouvelles vues et le parcours annuaire. Aucun horaire personnel fictif n'a été enregistré sur le site public. Aucun audit global des logs, drains ou alertes n'a été réalisé.

Proxy GET limité au domaine pray.zone, validation des paramètres, délai d'attente de 12 secondes, cache CDN et cache local borné. Les données d'annuaire restent dépendantes du fournisseur ; le favori local et le moteur de calcul des horaires restent distincts de ce service.

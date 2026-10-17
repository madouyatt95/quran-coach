# Prophètes et Histoires — enrichissement du 11 octobre 2026

## Contenu livré

- 50 récits au lieu de 40. Dix ajouts : les messagers de la cité, la table des disciples, Harut et Marut, les plaideurs de Dawud, l’accueil dans Abasa, la plainte entendue, les trois et le repentir, la bonne parole, le grain du don, ceux qui quittèrent leurs demeures.
- 15 épisodes complémentaires pour 10 prophètes : Adam, Nuh, Ibrahim, Yusuf, Musa, Yunus, Ayyub, Sulayman, Isa, Muhammad.
- Les 25 fiches de prophètes et les 50 récits disposent d’un parcours : récit découpé sans suppression du texte initial, épisodes complémentaires éventuels, versets associés, réflexion personnelle.
- Six thèmes éditoriaux : espoir, colère, pardon, gratitude, justice et partage.
- Sept relations explicatives dans l’arbre. Les 25 prophètes restent accessibles. Le dessin n’est ni une généalogie exhaustive ni une chronologie datée.
- Correction de la vue « Tout » : Sira et Invocations y sont désormais présentes.

## Sources et limites éditoriales

Les nouveaux textes sont des synthèses pédagogiques françaises, pas des traductions du Coran. Aucun texte arabe ou verset n’a été généré pour ces ajouts. Les versets et leur traduction française proviennent des services coraniques déjà utilisés dans l’app. Les références ci-dessous ont été consultées sur Quran.com et sont liées dans l’interface.

### Nouveaux récits

| Récit | Passage |
| --- | --- |
| Messagers de la cité | [36:13–27](https://quran.com/36/13-27) |
| Table demandée par les disciples | [5:112–115](https://quran.com/5/112-115) |
| Harut et Marut | [2:102](https://quran.com/2/102) |
| Plaideurs de Dawud | [38:21–26](https://quran.com/38/21-26) |
| Accueil dans Abasa | [80:1–10](https://quran.com/80/1-10) |
| Plainte entendue | [58:1–4](https://quran.com/58/1-4) |
| Les trois et le repentir | [9:118](https://quran.com/9/118) |
| Bonne parole | [14:24–27](https://quran.com/14/24-27) |
| Grain du don | [2:261–263](https://quran.com/2/261-263) |
| Ceux qui quittèrent leurs demeures | [2:243](https://quran.com/2/243) |

### Épisodes et relations

Passages : 2:30–39, 11:25–31, 11:40–49, 6:74–83, 2:127, 12:89–93, 12:99–101, 20:25–36, 37:139–148, 21:83–84, 27:15–28, 19:27–36, 48:4. Relations supplémentaires : 37:112, 19:49 (avec son explication), 12:6, 27:16, 19:7.

Les textes des 40 récits et des 25 fiches préexistantes ont été conservés. Cette livraison ne constitue pas une authentification exhaustive des détails historiques ni des attributions anciennes à Ibn Kathir. Les anciens passages associés restent ceux qui étaient explicitement référencés, sans inventer une plage de versets. Les nouvelles plages sont développées intégralement. Les questions et actions du carnet sont des propositions personnelles facultatives.

## Fonctionnement

- Progression et carnet : stockage local dédié, sans compte et sans envoi des notes au service de narration. L’effacement des données du navigateur les efface ; pas de synchronisation entre appareils.
- Audio : narration française via le service TTS existant, suivie des versets par Mishary Alafasy, puis arrêt à l’étape de réflexion. Démarrage manuel.
- Reprise : à la phrase pour la narration, à la position audio sauvegardée pour la récitation. Pause lorsque la page devient masquée et annulation lors de la sortie du parcours.
- Le carnet ne marque pas automatiquement un récit comme terminé. L’utilisateur valide ses étapes ; l’audio ne valide que les étapes réellement achevées.
- Le bandeau d’installation PWA ne masque plus les commandes audio dans ces parcours.
- Pas de promesse d’audio entièrement hors ligne : la narration dépend du service TTS ou de la voix disponible sur l’appareil ; la récitation et les versets dépendent du cache et des services existants.

## Vérifications

- 13 tests unitaires ciblés : intégrité des 75 parcours, conservation du texte, références et plages valides, thèmes, sauvegarde/restauration/suppression, rejet d’état invalide, enchaînement audio, reprise, pause, erreur et annulation.
- TypeScript, lint ciblé des nouveaux modules et build production/PWA.
- Chrome, viewport 390 × 844 : 50 cartes, recherche du nouveau récit, thème espoir (4 récits), ouverture des épisodes, reprise après rechargement, carnet enregistré/rechargé/supprimé, épisode complémentaire d’Adam sans débordement horizontal, arbre de 25 nœuds et filtre Musa/Harun.
- Vérification audio réseau et ouverture du Mushaf : résultats finaux consignés ci-dessous après exécution.
- Pas de test sur un iPhone physique ni de validation exhaustive de toutes les voix système ; le viewport mobile ne les remplace pas.

### Résultats audio locaux

Chargement réel de 2:261, texte arabe affiché, lecture au-delà de 4 secondes, pause puis rechargement et reprise à une position supérieure à celle sauvegardée : vérifiés dans Chrome. Le bouton Mushaf ouvre `/read?surah=2&ayah=261`. Aucun `pageerror` sur ce scénario. L’enchaînement narration/récitation et la reprise à la phrase sont testés avec lecteurs simulés ; la qualité et le comportement des voix françaises sur iPhone restent à vérifier sur appareil.

## Publication et contrôle public

Déploiement `dpl_BokNWhoXu3j8C2CAKDzFfTJbd9Ue`, état READY, domaine https://www.quran-coach.fr. Vérification le 12 octobre 2026 : 50 récits, filtre espoir, nouveau récit, reprise après rechargement, carnet enregistré/rechargé/supprimé et épisode complémentaire d’Adam vérifiés sur le site public dans un profil Chrome isolé à 390 × 844. Aucun `pageerror` durant ce scénario. Aucun carnet utilisateur existant n’a été modifié.

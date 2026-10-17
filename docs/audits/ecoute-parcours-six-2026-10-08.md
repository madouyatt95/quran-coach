# Écoute : six évolutions du lecteur immersif

## Livré

1. Séances 5, 10 et 20 minutes avec cinq intentions (surprise, espoir, relations, gratitude, foi). La sélection tient compte de la durée estimée des passages, évite les parcours récemment proposés et reprend une progression existante. Les catalogues thématiques incluent maintenant des sourates assez longues pour les séances de 20 minutes.
2. Progression locale par parcours : position du verset, voix, versets réellement entendus (au moins 80 % du fichier), étapes terminées. Reprise après fermeture et bouton de remise au début. Une recherche manuelle dans l'audio ne valide pas un verset.
3. Lecteur immersif avec une seule barre de commandes fixe au-dessus de la navigation. Vitesse, arrêt, répétition, boucle A–B et arrêt restent dans « Réglages d’écoute ». Le mini-lecteur global réapparaît quand on quitte l'expérience.
4. Préchargement de la piste suivante via le miroir audio de même origine pour les 20 voix compatibles. Un seul verset est gardé en mémoire ; les fichiers locaux temporaires sont libérés quand on change de file.
5. Pack complet d'un parcours : audio de la voix choisie, texte arabe, traduction Hamidullah, explications françaises Mokhtasar, métadonnées des sourates. Contrôle de toutes les pièces avant l'état « disponible hors ligne », reprise d'un téléchargement partiel, accès depuis la bibliothèque hors ligne.
6. Préférences locales persistantes : voix, vitesse, taille du texte, traduction et intention de séance.

## Vérifications

- 298 tests sur 63 fichiers réussis avant le dernier ajustement ; les 5 tests ciblés repassent après correction de la durée. Les tests couvrent la variété, la durée minimale pour chaque thème, la reprise, la validation après écoute réelle, le préchargement, le pack partiel et la consultation hors réseau.
- Compilation TypeScript et build PWA réussis ; ESLint ciblé réussi.
- Test dans le navigateur à 390 px : séance « Famille et relations » sélectionne Hujurat puis Luqman ; écoute réelle d'Al-Fatiha enregistre 4/7 et une étape ; rechargement reprend au verset 5 à 0:05 ; taille 36 px, traduction masquée et vitesse 1,25× conservées ; aucun mini-lecteur en double.
- Packs Al-Fatiha téléchargés et reconnus comme complets avec Alafasy puis Al-Husary. Le pack est stocké dans le cache du navigateur ; l'effacement des données du site le supprime.
- Contrôle public : la première publication a révélé qu'une séance « 10 minutes » pouvait ne durer que 2 minutes. La sélection a été corrigée à partir de la durée estimée de chacun des 20 parcours. Le miroir audio Al-Husary répond en HTTP 200 `audio/mpeg` sur le domaine public.
- Version finale publiée le 8 octobre 2026 : déploiement `dpl_C2LskRpHKhhLKMREcEkBD7EA9Ea6`, bundle `/assets/index-CW6Y1BKi.js`. Après mise à jour de la PWA, « 10 minutes » ouvre « Luqman », 34 versets et environ 9 minutes, sur un viewport mobile 390 × 844. Capture : `ecoute-parcours-six-production-2026-10-08.png`.
- Les données et les voix des 20 récitations restent des sources externes. Un appareil physique iOS/Android et le basculement réseau réel n'ont pas été testés ici.

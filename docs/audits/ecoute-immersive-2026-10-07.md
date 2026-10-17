# Écoute immersive — 7 octobre 2026

## Livré

- Route `/listen/experience`, accessible depuis Écoute et depuis le mini-lecteur.
- Texte arabe et traduction française synchronisés **par verset**, par succession de fichiers audio identifiés. Pas de surlignage mot à mot et pas d'alignement supposé sur les MP3 intégraux du catalogue.
- 20 récitations correspondant à 17 récitateurs (trois variantes Mujawwad). Qualité propre à chaque édition, obtenue via AlQuran Cloud ; pas de repli silencieux sur Alafasy lorsqu'une autre voix est choisie.
- Séances 5, 10, 20 minutes : sélection avec estimation affichée et budget d'écoute réelle ; arrêt au terme du verset, pauses et chargement exclus. Une sélection peut se terminer avant le budget.
- Commandes Media Session : lecture, pause, précédent, suivant, déplacement, arrêt, métadonnées et position. Actions absentes du navigateur tolérées.
- Partage par lien avec sourate/verset/voix/seconde, ou source intégrale autorisée/seconde. Borne de fin provenant de la boucle A–B. Aucun envoi automatique ni export de note privée. Le destinataire lance lui-même l'audio.
- Comprendre : pause à la fin du verset, traduction et explication Al-Mokhtasar/QuranEnc, source, reprise au verset suivant. Le budget de séance est conservé.
- Parcours complets Al-Fatiha, Al-Kahf et Maryam ; étapes éditoriales avec références coraniques.
- Comparaison d'un passage choisi avec 2 à 6 récitations parmi les 20 proposées, lecture de la plage complète successivement pour chaque voix.
- Carnet local : texte, traduction, voix, note personnelle, relecture audio, retrait confirmé ; 200 entrées au plus.
- Deux séances thématiques supplémentaires : Les mots de l'invocation ; Revenir avec espoir. Repères rédactionnels, sans invocation de mérites religieux non sourcés.

## Sources

- Audio et texte : https://alquran.cloud/api ; https://alquran.cloud/cdn
- Éditions vérifiées : `https://api.alquran.cloud/v1/edition?format=audio&language=ar`
- Traduction du sens : édition `fr.hamidullah`.
- Explications : https://quranenc.com/en/home/api/ ; ressource `french_mokhtasar` déjà intégrée au projet.
- Références éditoriales liées dans l'interface : Coran 1, 18, 19 ; 2:200–202 ; 3:7–9 ; 20:24–36 ; 21:83–90 ; 39:53–61 ; 93 ; 94.
- Commandes système : https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler ; https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setPositionState

## Vérifications

- Suite complète : 287 tests, 60 fichiers, tous passés.
- Après ajustement du maintien du budget et des paramètres de partage : 15 tests ciblés passés.
- TypeScript et build de production passés ; lint ciblé et `git diff --check` passés.
- Fichiers audio du premier verset : HTTP 200 pour les 20 récitations, avec leurs débits respectifs. Cela ne constitue pas une vérification exhaustive des 6236 fichiers de chaque édition.
- Navigateur réel en 390 × 844 : lecture Al-Fatiha ; arrêt au bon verset et chargement de son explication ; reprise au suivant ; carnet et note ; comparaison Alafasy/Al-Husary/Sudais jusqu'à sa fin ; lien rouvrant 1:2 avec Sudais ; séance Al-Kahf de 36 versets estimée à 10 minutes ; cinq entrées de navigation présentes.
- La fenêtre d'explication est centrée, limitée à la hauteur d'écran et défilable.

## Limites vérifiées honnêtement

- Écran verrouillé et boutons d'écouteurs : gestionnaires testés automatiquement, pas encore testés sur iPhone/Android/écouteurs physiques.
- Les API de texte/explication et les fichiers audio demeurent des dépendances externes ; erreurs explicites et relance disponibles.
- Les introductions sont écrites et les explications lues à l'écran ; aucune voix artificielle n'a été ajoutée pour les réciter.
- Carnet enregistré sur l'appareil, sans synchronisation de compte.
- Partage d'un lien d'écoute, pas de génération d'un nouveau fichier audio/vidéo.

## Vérification publique

- Premier déploiement READY `dpl_DGzfKy5QNkt8Nj3V4umsfbzFz1A4`, domaine `https://www.quran-coach.fr`.
- Après le bouton Mettre à jour de la PWA : route immersive visible, vingt choix de récitation, audio Al-Fatiha chargé et lu puis mis en pause en production.
- Capture : `ecoute-immersive-mobile-2026-10-07.png`.
- Vérification finale de protection contre les mises à jour : route immersive protégée, y compris pendant les pauses ; six tests du module appUpdates passés.

Déploiement final READY : `dpl_5hhFuJ7Sa3Ji1SGhByCkKxb7nMqW` (`https://quran-coach-eg0b2y7ua-yattas-projects.vercel.app`), alias `https://www.quran-coach.fr`. Bundle public `/assets/index-Blt02uWx.js` contrôlé : route immersive et protection des séances présentes. Les avertissements de taille des chunks restent ceux de la compilation ; aucun blocage de build.

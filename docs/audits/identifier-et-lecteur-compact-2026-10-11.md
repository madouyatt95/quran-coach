# Identifier et lecteur Hifdh compact — 11 octobre 2026

## Réalisé
- Lecteur Hifdh fixe réduit à une rangée : écouter/pause, diminuer/augmenter les répétitions et compteur courant/total, réglages.
- Les commandes secondaires, vitesse et phonétique restent dans un panneau au-dessus. Le réglage des répétitions marque la séance comme modifiée et se sauvegarde ; une réduction ramène le compteur courant dans les limites.
- Identifier : fichiers audio/vidéo locaux, aperçu et découpe d’un extrait, analyse séquentielle dans Tilawa sans microphone ni téléversement.
- Propositions alternatives du moteur avec texte et différences de mots mises en évidence ; sélection explicite par l’utilisateur, sans confondre un candidat avec une reconnaissance confirmée.
- Historique local limité à 30 passages, dédoublonné lors de l’ajout et supprimable entrée par entrée.
- Écoute du verset reconnu par Alafasy, avec arrêt des autres lecteurs ; retour d’erreur et nouvel essai.
- Niveau micro visible en identification, résultat présenté avant les commandes de nouvelle recherche.

## Vérifications
- 38 tests ciblés : HifdhPage, VoiceSearchPage, service Tilawa, fichiers/historique. Ils couvrent notamment séquençage sans pertes, absence d’accès micro pour un fichier, annulation et résultat tardif, sauvegarde des répétitions, bornes des extraits, rééchantillonnage stéréo et vidéo avec piste audio plus courte.
- TypeScript/build PWA et lint ciblé des nouveaux composants et services.
- Chrome réel, viewport 390×844 : lecteur fermé haut de 68 px, répétitions accessibles sans réglages, panneau ouvert utilisable.
- Fichier MP3 public Alafasy (verset global 6222) : identification réelle 112:1 par le modèle local.
- MP4 H264/AAC généré à partir de ce même extrait, avec vidéo plus longue que sa piste audio : identification réelle 112:1 après correction de la découpe à la durée audio disponible.
- Lecture du résultat en état « Arrêter le verset », historique restauré après rechargement, suppression conservée après un second rechargement.

## Limites
- Vérifications navigateur à dimensions mobiles, pas de test sur iPhone physique dans cette session.
- Fichiers jusqu’à 40 Mo/5 minutes ; extrait jusqu’à 30 secondes. Compatibilité de décodage dépend du navigateur et du codec, avec message explicite en cas d’échec.
- Pack Tilawa d’environ 83 Mo nécessaire au premier usage ; traitement local. Les textes/traductions et l’audio du résultat nécessitent leurs ressources réseau/cache habituelles.
- L’identification dépend de la qualité et de la longueur de la récitation ; une proposition incertaine n’est pas automatiquement validée.
- Lint global non revendiqué : erreur préexistante de variable inutilisée dans VoiceSearch.tsx hors des composants modifiés.

## Production
- Déploiement `dpl_6MfPndzk7HzQmtf1zTknuTTNhgok`, état READY, alias https://www.quran-coach.fr.
- Vérifié sur le domaine public : lecteur 68 px, réglage direct de répétition 1/2, panneau de réglages visible.
- MP4 réellement importé et identifié 112:1 en production, aucune exception JavaScript observée pendant ce parcours.

# Narration et apprentissage — 12 octobre 2026

## Périmètre

Les cinq améliorations demandées concernent la narration française, l'apprentissage par passages, la séquence arabe/sens/silence, le rappel progressif et les séances de 2/5/10 minutes. La narration est aussi intégrée aux parcours Prophètes et Histoires et moralités. Le contenu religieux affiché, les références et les compteurs manuels sont conservés.

## Narration française

- 659 textes uniques du catalogue actuel : chapitres/résumés des prophètes et histoires, traductions françaises des invocations. Le manifeste vérifie le texte exact avant de choisir un fichier.
- Synthèse neuronale Kokoro-82M v1.0, voix française `ff_siwis`, produite localement à l'avance. **Ce n'est pas une narratrice humaine.** Aucun service payant par écoute ni modèle à télécharger sur le téléphone. L'hébergement des fichiers reste soumis aux limites de l'hébergeur.
- Lecture d'un chapitre entier avec repères temporels des phrases, pause et reprise au temps enregistré. Les fichiers ne sont pas découpés en appels vocaux successifs dans le navigateur.
- Sources/licences : `public/audio/narration/ATTRIBUTION.md` et copies des licences dans `public/audio/narration/licenses/` (Kokoro Apache-2.0, kokoro-onnx MIT, attribution du corpus SIWIS CC BY 4.0).
- Génération : `node scripts/export-narrations.mjs`, puis `scripts/generate-narrations.py` dans un environnement Python contenant kokoro-onnx 0.4.9, onnxruntime, soundfile et FFmpeg. Les modèles officiels sont attendus dans `/tmp/qc-narration-model`. `--worker` / `--workers` permet de répartir les fichiers entre processus. Les points de reprise évitent de tout refaire après interruption.
- `scripts/verify-narrations.py` interdit de finaliser un catalogue incomplet et contrôle correspondance texte, empreintes audio, durée MP3 et repères de phrases.
- Toute modification éditoriale ultérieure nécessite de régénérer les textes concernés. Un texte inconnu utilise le mécanisme vocal antérieur ; une narration connue dont le fichier échoue affiche une erreur.

## Récitations arabes et correspondances

- 127 fichiers humains inchangés, récités par **Muhammad Jumah**, couvrent 167 entrées actuelles, depuis l'archive officielle OpenDua v0.0.2.
- Correspondance stricte de la suite de lettres arabes après normalisation Unicode, diacritiques et ponctuation. Aucune association approximative par titre ou identifiant. Les cas multiples/ambigus ne sont pas importés.
- Les empreintes SHA-256 sont contrôlées contre le manifeste original. `src/data/invocationHumanAudio.json` conserve le texte de chaque côté et la provenance.
- Les plages d'apprentissage suivent les pauses acoustiques détectées. Le fichier source reste entier ; aucun alignement mot à mot n'est revendiqué.
- La page officielle https://opendua.org/downloads demande explicitement aux applications de distribuer l'archive pour un usage local. Les enregistrements relèvent d'un accord distinct du catalogue : **la licence CC BY 4.0 des données ne doit pas être attribuée à l'audio**. Attribution et README original inclus dans `public/audio/invocations/opendua-v0.0.2/`.
- Les entrées sans correspondance conservent leurs fichiers antérieurs ou la synthèse existante. La provenance humaine des anciens fichiers n'étant pas documentée, l'interface parle seulement d'« enregistrement » pour ceux-ci. L'ensemble des invocations ne bénéficie donc pas encore d'une récitation humaine identifiée.

## Expérience

- Options indépendantes arabe / sens français / silence, avec au moins une langue active.
- Rappel progressif : texte entier, indices, mémoire ; toucher un mot masqué le révèle. La phonétique et la traduction restent repliées pendant le rappel.
- « J'ai réussi » enregistre une marque d'apprentissage distincte du compteur de récitations. L'audio ne valide pas automatiquement une invocation.
- Séances 2/5/10 minutes : choix du thème, invocations entières, durée estimée tenant compte du débit et des options. Il s'agit explicitement d'une sélection, pas d'un remplacement du recueil complet du matin/soir.
- Les préférences et compteurs existants sont préservés lors de l'ajout des nouvelles options.
- Les nouveaux MP3 sont exclus du précache global. Les packs arabes utilisent le téléchargement existant ; la narration française est chargée à la demande et n'est pas présentée comme un pack hors ligne.

## Vérifications

Les résultats finaux de compilation, navigateur, hors ligne et publication sont consignés ci-dessous après exécution. Les contrôles de durée et de lecture ne constituent pas une écoute humaine exhaustive de 659 narrations, ni une authentification religieuse du corpus. Aucun essai sur iPhone physique n'est revendiqué.

- **Catalogue complet** : 659 fichiers, 195,2 minutes ; texte exact, SHA-256, durée décodée et repères temporels validés pour chaque fichier par `verify-narrations.py`.
- **Tests ciblés** : 39/39 réussis dans invocationLearning, adhkarAudioService, ttsService, useJourneyAudio et adhkarExperienceStore. Ils incluent les 167 correspondances arabes, l'absence de validation automatique, la migration des préférences et la reprise temporelle.
- **Qualité statique** : lint des 12 modules concernés réussi ; `npm run build` réussi, incluant TypeScript et construction du service worker. Avertissement existant sur la taille de certains chunks ; aucun échec de compilation.
- **Navigateur local, Chrome en viewport 390 × 844** : séance chronométrée conservée après rechargement sans lancement automatique ; mots masqués/révélés ; apprentissage distinct du compteur ; lecture réelle du MP3 humain ; narrations Adam et Gens de la Caverne avec pause/reprise ; aucune erreur JavaScript ni débordement horizontal.
- **Séquence réelle** : arabe Muhammad Jumah → français enregistré → silence ; pause/reprise de la narration ; mode français seul conservé après rechargement. Compteur inchangé.
- **Version compilée, hors ligne** : téléchargement du pack Au réveil, activation du service worker, coupure du réseau, rechargement et lecture réelle de OD-001.mp3 réussis. Pas de débordement horizontal à 320 et 430 px. Ce contrôle ne prouve pas le fonctionnement sur un iPhone physique, ni celui de tous les packs.

## Publication

Base Git `5ce28987cc57f06adae273595bb4e689d3a0f70c`, avec les modifications locales préexistantes conservées. Déploiement `dpl_HfU22jtRELhupiWzh3V73YmNvLgP`, projet Quran Coach de `yattas-projects`, état **READY**, alias https://www.quran-coach.fr. URL immuable : https://quran-coach-hpehfb8sx-yattas-projects.vercel.app.

Contrôles sur le domaine public après publication, Chrome 390 × 844 : séance persistée sans lecture automatique, rappel progressif, compteur manuel préservé, lecture réelle de l'enregistrement humain, narrations Adam et Gens de la Caverne avec reprise temporelle, absence d'erreur JavaScript et de débordement horizontal. Séquence arabe → français → silence, pause/reprise du français et persistance des langues validées également. Le contrôle hors ligne mentionné plus haut a été effectué sur la version compilée locale ; aucun test iPhone physique n'a été réalisé.

# Narration française Quran Coach

Les fichiers `fr-v1/*.mp3` sont des narrations synthétiques produites à l’avance sur les textes éditoriaux et traductions déjà présents dans Quran Coach. Ce ne sont pas des enregistrements d’un récitant humain. Les récitations coraniques et les enregistrements arabes existants ne sont pas générés par ce moteur.

- Modèle : **Kokoro-82M v1.0**, hexgrad, licence Apache-2.0 : https://huggingface.co/hexgrad/Kokoro-82M
- Voix : **ff_siwis** (français). La fiche des voix mentionne le corpus **SIWIS**, University of Edinburgh, sous **CC BY 4.0** : https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md ; https://datashare.ed.ac.uk/handle/10283/2353 ; https://creativecommons.org/licenses/by/4.0/
- Adaptation ONNX : **kokoro-onnx**, thewh1teagle, MIT : https://github.com/thewh1teagle/kokoro-onnx
- Export de modèle : https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1

Traitement : synthèse française, débit 0,97, pauses de 320 ms entre phrases, 480 ms aux questions et 600 ms aux paragraphes (version 2), normalisation du niveau et encodage MP3 mono 24 kHz. Le texte affiché reste inchangé. Les symboles conventionnels de bénédiction sont développés uniquement dans la version prononcée.

Les ressources de calcul restent sur la machine de production des fichiers ; aucun modèle vocal n’est téléchargé par le téléphone de l’utilisateur.

La version 2 adapte uniquement les formes parlées de certains noms (par exemple Yunus → Younous, Musa → Moussa) pour la voix française. Le texte affiché et les références restent identiques. Ces adaptations ne constituent pas une validation exhaustive de la prononciation arabe. Les futures corrections peuvent cibler une phrase dans `scripts/narration-editorial.json` puis régénérer seulement le chapitre concerné.

Les 90 parties audio de l’Académie accompagnent les 30 chapitres des cours de Tawhid et de Hadith de Masjid Sabirin, fournis par l’utilisateur (Abd-Allah Drame). Elles racontent les adaptations pédagogiques affichées dans le cours ; elles ne sont pas la voix de l’auteur, ni une lecture intégrale des PDF. Les citations et attributions sont accessibles dans le texte source du chapitre.

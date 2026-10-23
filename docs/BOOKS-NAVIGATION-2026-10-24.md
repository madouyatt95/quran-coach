# Livres et retours — 24 octobre 2026

## Livres
- Correspondance paragraphe/audio basée sur le texte exact de chaque segment et les repères de phrases fournis. Aucun minutage extrapolé ; action désactivée si le repère manque.
- Passage audio → texte, avec arrêt de la narration et mise en évidence ; paragraphe → écoute au repère enregistré.
- Carnet de passages : texte, édition, chapitre, références, segment audio, secondes et note personnelle. Déduplication par édition/paragraphe. Inclus dans le registre existant de sauvegarde et synchronisation volontaire chiffrée.
- Références dans une boîte de dialogue native : Coran arabe/français via les services existants, récitation humaine Alafasy. Narration mise en pause puis reprise au point conservé si elle était en cours.
- Hadith utilisé dans Adam : arabe intégral de Bukhari 3326 collationné avec https://sunnah.com/bukhari:3326 (texte ancien du domaine public). Source et degré conservés. Pas de nouvelle traduction française intégrale : le résumé est explicitement distingué du texte.

## Navigation générale
- Mémoire de défilement par entrée d’historique et destination, y compris les deux panneaux du pupitre et le lecteur de livres immersif.
- Restauration différée pendant le chargement des pages ; la première intervention de l’utilisateur interrompt la restauration.
- Recherche, filtres et onglets conservés dans Écoute, Bibliothèque audio, livres, Prophètes, Hadiths, Fahm, Invocations, Thèmes, vocabulaire et Prières. Recherche et niveau de l’Académie conservés ; cours classiques désormais adressables par URL.
- Mémorisation : onglet, étape, sélection et index du verset conservés dans la session ; le micro et la lecture ne redémarrent pas automatiquement au retour.
- Boutons Retour : historique interne prioritaire et destination de secours pour un lien direct (livres, récitateurs, listes d’écoute, Tafsir, favoris, prières/réglages, Qibla, défis, cercle, Atlas, vocabulaire, thèmes, Académie/arabe, Fahm et écoute guidée).
- Suppression du retour forcé en haut du Quiz ; position conservée par vue interne.
- Le Mushaf conserve son mécanisme propre de positionnement. Le retour depuis une entrée ciblée réutilise l’index d’historique d’origine lorsqu’il est disponible.
- Les mémoires d’interface restent dans la session locale ; elles ne sont pas envoyées à un service.

## Vérification
- 46 tests ciblés dans 10 fichiers : navigation, erreurs de stockage, liens directs, lecteurs, correspondance des 17 manuscrits, carnet, sauvegardes, références et reprise audio.
- Audit du catalogue public : 69 segments avec repères, correspondant aux 17 livres ; chaque paragraphe possède un repère audio.
- Compilation TypeScript et build PWA réussis.
- Aperçu visuel non vérifié : le contrôle automatique du navigateur a refusé l’ouverture locale. Les tests DOM utilisent JSDOM ; ils ne prouvent ni le rendu Safari ni le son sur un iPhone physique.
- Les défilements s’appuient sur la même mise en page ; une rotation ou un changement de taille peut déplacer le contenu.
- Les minuteries de parties compétitives et les connexions multijoueurs ne sont pas figées par cette mémoire de navigation.
- Ces modifications web ne changent pas l’état de validation Apple de la version iOS précédemment envoyée.

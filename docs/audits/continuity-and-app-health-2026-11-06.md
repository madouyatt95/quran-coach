# Continuité, chapitres et état de l’application — 6 novembre 2026

Périmètre accepté : points 3 à 6. Les dimensions, styles et interactions du Mushaf ne sont pas modifiés.

## Résultat

- Navigation partagée : positions isolées par espace familial, prise en compte du conteneur principal et des panneaux internes. Restauration retentée lors des changements de taille et du chargement des images, interrompue immédiatement par un geste de l’utilisateur. Le lecteur `/read` conserve sa propre navigation.
- Recherche : catégorie, filtre « déjà étudié » et nombre de résultats affichés conservés dans l’onglet. Le retour ne rouvre plus le clavier automatiquement.
- Livres : trois actions au bas des chapitres intermédiaires, continuer dans le même mode, consulter uniquement les sources de ce chapitre, annoter le carnet du livre. La conclusion existante du dernier chapitre est conservée. Aucun nouveau contenu religieux inventé.
- Réglages : version du contenu issue du build, contrôle manuel de la version web, état de connexion, dernière synchronisation confirmée, dernier export préparé et présence des fichiers audio de livres. Aucun effacement ni recharge forcée pendant une écoute. La vérification native renvoie à l’App Store.
- Accueil : une carte de reprise sélectionne la dernière activité datée parmi lecture, récitation, mémorisation, livre et cours inachevé. Le livre reprend son passage ou sa seconde audio ; le temps restant n’est annoncé que pour un audio connu. Les choix manuels et les autres rubriques d’accueil sont préservés. Les données détaillées des cours ne sont chargées que si un cours est à reprendre.

## Vérifications

- 45 tests réussis dans 9 fichiers : navigation/retour/chargement différé/interruption utilisateur, sélection de reprise, identifiants de passages, sauvegarde, sources de chapitre, état de l’application, mises à jour protégées, recherche et synchronisation.
- ESLint ciblé : aucune erreur ni avertissement sur les composants et fonctions nouveaux, HomeResume, NavigationMemory et CoachPage.
- TypeScript, build de production et synchronisation Capacitor : voir journal `/tmp/qc-followup-build.log`.
- Aucun secret ajouté. Les métadonnées de version sont publiques ; les dates de sauvegarde sont locales et propres à chaque espace.

## Limites

- Contrôle navigateur indisponible (`browser.user is unavailable`) : pas de vérification visuelle mobile de cette livraison ni de test physique iPhone.
- La restauration générale est bornée à cinq secondes ; elle ne garantit pas un retour exact après des contenus distants bloqués plus longtemps ou une transformation complète de la mise en page.
- Les dates antérieures de synchronisation n’étaient pas persistées : elles apparaîtront après la prochaine réussite. Un export préparé ne prouve pas que le fichier a été conservé par l’utilisateur.
- Le compteur de présence concerne les livres audio, sans constituer un essai en mode avion de toutes les ressources. Le centre de stockage demeure la référence pour les packs de sourates et de polices.
- La synchronisation Capacitor prépare les ressources iOS ; elle ne constitue pas une installation physique ou une soumission Apple.

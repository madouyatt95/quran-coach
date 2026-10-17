# Récits et invocations — six améliorations du 12 octobre 2026

## Changements réalisés

1. **Écoute des récits** : suppression de la pause imposée au passage en arrière-plan ; même élément audio conservé entre chapitres et versets ; Media Session (lecture, pause, recul/avance et position) ; recul de 15 secondes ; vitesse ; arrêt à la fin du chapitre ou dans 5/10/15/30 minutes. La pause et les déplacements temporels conservent l'endroit exact. Le lecteur Coran au repos ne peut plus écraser les commandes système du récit. Quitter le parcours arrête son lecteur.
2. **Comparaison locale** : microphone activé uniquement au clic, MediaRecorder avec détection du format pris en charge, référence entière ou passage acoustique disponible, écoute modèle → prise personnelle, reprise de prise et suppression. Aucun téléversement ; la prise est gardée en mémoire seulement, supprimée au départ de la page, et limitée à 3 minutes. Les pistes micro sont arrêtées à la fin, à la fermeture, en cas d'erreur ou si l'autorisation arrive après le départ. Pas de note ni reconnaissance automatique.
3. **Pauses adaptées** : durée du passage divisée par la vitesse, puis marge de 1,5 seconde ; option plus lente à 140 %. Pour les sources sans durée connue, estimation d'après la longueur du texte. L'ancien choix de pause fixe reste conservé pour les utilisateurs existants. Les nouveaux utilisateurs disposent du mode adapté par défaut.
4. **Révisions** : autoévaluation Facile / Avec hésitation / À retravailler ; échéances persistées, intervalle progressif plafonné à 90 jours ; priorité aux difficultés ; séance de cinq entrées au maximum dont la liste reste stable ; report au lendemain sans effacement. Aucun incrément du compteur de récitations par l'audio ou l'autoévaluation.
5. **Édition audio** : formes parlées françaises de douze noms dans `scripts/narration-editorial.json`, pauses modulées selon ponctuation/paragraphes. Le texte religieux affiché n'est pas changé. Une correction future peut viser une phrase avec contrôle du texte source puis `--key` pour ne régénérer que son chapitre. Chaque nouveau fichier reçoit une URL liée à sa version audio ; les anciennes URL sont conservées pour les clients et packs précédents. Le signalement sélectionne la phrase exacte et prépare un message partageable : **il n'existe pas d'envoi automatique vers un serveur de signalements**. Le partage reste volontaire et explicite ; les vingt derniers brouillons au maximum sont stockés localement.
6. **Récit → Coran → invocation** : cinq associations éditoriales explicites, réutilisées dans neuf parcours : Younous (21:87), Adam et son épouse (7:23), Ibrahim et Ismaïl (2:127), jeunes de la caverne (18:10), Moussa et Haroun (20:45). Navigation au verset ou directement à l'apprentissage de l'invocation et retour vers les récits avec leur reprise existante. Aucune association religieuse déduite automatiquement.

## Hors ligne et compatibilité

Le pack d'un récit utilise le store de téléchargements existant : toutes ses narrations françaises, ses récitations coraniques et ses sourates arabe/français. Son identité dépend des URL audio réelles : une nouvelle édition n'est pas présentée comme déjà téléchargée si seul l'ancien pack est présent. Les caches prennent en charge les requêtes Range audio ; les nouveaux MP3 restent exclus du précache global de la PWA.

La configuration Capacitor iOS ajoute le mode audio en arrière-plan et la catégorie AVAudioSession playback sans activer l'audio au lancement. Ces modifications natives nécessitent une future compilation/distribution de l'app iOS ; un déploiement web ne met pas à jour un binaire installé. Aucun verrouillage sur iPhone physique n'a été testé. Le résultat PWA dépend encore des règles du navigateur/OS.

Documentation technique consultée : [Media Session](https://developer.mozilla.org/en-US/docs/Web/API/MediaSession/setActionHandler), [formats MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/isTypeSupported_static), [configuration audio Apple](https://developer.apple.com/documentation/avfoundation/configuring-your-app-for-media-playback).

## Voix et validation éditoriale

Kokoro / Siwis reste une voix **synthétique française**, pas une narratrice humaine. Attribution et licences conservées dans `public/audio/narration/`. La version 2 comporte 659 fichiers, environ 199,8 minutes, vérifiés pour le texte associé, la durée, les repères et le SHA-256. La normalisation des noms vise le moteur français ; elle ne constitue pas une vérification auditive exhaustive de tous les fichiers, ni une validation savante de la prononciation arabe. L'audio arabe demeure issu des sources précédemment documentées.

## Vérifications

- 60 tests ciblés réussis, incluant 12 tests du lecteur de parcours, 3 tests de consentement/libération du microphone, les transitions audio, les pauses adaptées, les révisions, les associations coraniques et la composition des packs.
- TypeScript et lint ciblé réussis. Compilation de production réussie ; avertissement existant de taille des chunks conservé. Info.plist validé par plutil.
- Chrome en viewport mobile : maintien de la lecture au changement de visibilité, commandes Media Session, recul de 15 secondes, vitesse, arrêt au chapitre ; signalement structuré et lien Younous → apprentissage ; microphone fictif avec vraie capture MediaRecorder locale, comparaison, libération des pistes et suppression ; révisions après rechargement sans modifier les compteurs. Aucun débordement horizontal à 320/390/430 px et aucune erreur JavaScript.
- Les tests de verrouillage restent des contrôles de handlers/visibilité dans un navigateur de bureau. Ils ne prouvent pas le comportement d'un téléphone physique.

Les résultats de téléchargement hors ligne et publication sont ajoutés après exécution.

## Vérification hors ligne et visuelle

Le pack Adam a été réellement téléchargé depuis la version compilée. Après activation du service worker, coupure du réseau et rechargement : narration française, texte arabe, traduction française et lecture du verset 2:31 disponibles. Contrôle aux largeurs 320/430 px. La vérification visuelle a révélé un doublon d'article au changement de chapitre (clé React identique pour le chapitre et le formulaire de signalement) : corrigé avec des clés distinctes, puis ajout d'une assertion de chapitre unique au scénario navigateur.

Dernier contrôle de la version compilée corrigée : pack Adam **17 ressources / 4 409 370 octets**, narration et verset après coupure réseau/rechargement, traduction française présente, un seul chapitre affiché, aucune erreur JS ni débordement à 320/430 px. Les 16 tests des modules retouchés en finition (lecteur, Media Session, microphone) ont été repassés avec succès après la suite globale ciblée de 60 tests. Lint final et `git diff --check` sans erreur.

Base de publication : HEAD `5ce28987cc57f06adae273595bb4e689d3a0f70c` avec les changements locaux préexistants conservés. Identifiant et vérifications publiques à compléter après l'état READY.

Finition micro supplémentaire : une demande d'autorisation encore en attente est annulée si la page passe en arrière-plan ; une autorisation arrivant ensuite libère immédiatement les pistes sans commencer la prise. Quatrième test de ce composant réussi, portant le total des tests ciblés distincts à **61**. Vérifications TypeScript et lint réussies après cette correction. Le premier déploiement `dpl_AVH6NAdj3ZFKWq45PmEDPpJfTGaR` est remplacé par une publication de cette finition avant la validation publique finale.

Finition de coordination audio : commencer un enregistrement ou une comparaison met aussi en pause le lecteur Coran principal ; reprendre le lecteur Coran libère les contrôles de narration et arrête celle-ci. Les 6 tests concernés ont été repassés, ainsi que TypeScript et lint. La publication finale inclut cette finition.

## Publication finale et contrôles publics

Déploiement `dpl_9HaqSR23LYtTdxXFXMGXRizFrjgL` confirmé READY et rattaché à https://www.quran-coach.fr. Version immuable : https://quran-coach-1v5i6suul-yattas-projects.vercel.app.

Les scénarios navigateur ont été repassés avec succès sur le domaine public après cette publication : maintien de lecture au changement de visibilité et commandes système, recul, vitesse, arrêt au chapitre et article unique ; signalement de phrase et passerelle vers l'apprentissage ; activation manuelle, capture locale avec microphone fictif, comparaison, libération et suppression ; révisions conservées au rechargement sans mutation des compteurs ; absence d'erreur JavaScript et de débordement horizontal. Un scénario public distinct confirme qu'une autorisation micro tardive après passage en arrière-plan libère les pistes sans créer d'enregistreur. Ces contrôles restent réalisés avec un navigateur de bureau automatisé et ne remplacent pas un essai sur iPhone physique.

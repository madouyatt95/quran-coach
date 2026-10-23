# Quran Coach sur iOS et CarPlay

## Version native

La cible `ios/App/App.xcodeproj` embarque le résultat de `npm run build` après `npx cap sync ios`.
La mise à jour native préparée le 23 octobre est `1.5 (12)` et requiert iOS 17 ou plus, conformément au paquet Swift généré par Capacitor 8. Le site ajouté à l’écran d’accueil est une PWA distincte : une compilation Xcode ne la met pas à jour.

Utiliser `npm run prepare:ios` pour reconstruire et synchroniser les ressources natives avec la bibliothèque audio publiée et la synchronisation des progrès activées. La configuration ne contient que des paramètres publics ; les secrets restent sur les serveurs. Le catalogue audio utilise directement le Worker HTTPS dans Capacitor, car le proxy web `/book-audio` n’y existe pas.

La PWA vérifie maintenant immédiatement la présence d’une nouvelle version à son ouverture puis lorsqu’elle redevient visible. Elle l’applique automatiquement sur les écrans où aucune séance audio, récitation ou apprentissage actif ne risque d’être interrompu. La version précédente peut encore nécessiter une dernière validation de sa bannière « Mettre à jour » avant de recevoir ce comportement.

La reconnaissance vocale du paquet `@capacitor-community/speech-recognition` est compilée directement dans la cible App, car ce paquet ne fournit pas de `Package.swift` à Capacitor. Le fichier reste dans `node_modules` et le petit adaptateur `SpeechRecognitionCapacitor8.swift` expose son API au pont Capacitor 8. Après une mise à jour de cette dépendance, vérifier à nouveau le build iOS et les fonctions micro.

## Prières sur le trajet

`PrayerWidget` lit les prochaines heures partagées par l’application dans l’App Group `group.com.qurancoach.app`. L’Adhan vient du calendrier publié de la mosquée sélectionnée lorsqu’il est disponible, sinon du calcul existant. L’Iqama vient uniquement d’un horaire publié encore frais ou d’un horaire personnel explicitement enregistré. Aucune Iqama n’est déduite de l’Adhan.

Le widget se met à jour quand l’application est ouverte et indique qu’il faut actualiser lorsque la dernière synchronisation dépasse 24 heures. Sur iPhone, son toucher ouvre `/prayers` dans l’application native. Dans CarPlay, l’affichage est possible ; l’interaction tactile vers l’application exige une intégration CarPlay autorisée par Apple. Il ne remplace pas une synchronisation serveur permanente en arrière-plan.

Le pont `QuranCoachCar` publie les métadonnées de la récitation ou de l’Adhan en cours dans Now Playing et relie les commandes lecture/pause/suivant/précédent aux commandes audio existantes. Les commandes CarPlay dépendent du comportement du système et doivent être validées sur un véhicule ou un simulateur CarPlay. Le widget CarPlay dépend d’iOS 26 et de sa disponibilité sur l’écran du véhicule.

Une véritable icône d’application audio dans CarPlay, avec navigation native dans les sourates, nécessite la capacité CarPlay Audio accordée par Apple. Elle n’est pas déclarée dans les entitlements tant que cette autorisation n’a pas été obtenue.

## Vérification et livraison

1. `npm run build`
2. `npx cap sync ios`
3. `xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build`
4. Tester sur un iPhone réel : micro, notifications Adhan, lecture en arrière-plan, commandes des écouteurs, widget et changement de mosquée.
5. Configurer l’App Group sur le profil de signature Apple avant distribution, puis créer une archive signée et livrer par TestFlight/App Store.

Une validation de build et un lancement sur simulateur ne prouvent ni le fonctionnement dans une voiture ni la distribution sur l’iPhone de l’utilisateur.

## Mise à jour du 16 octobre 2026

- Alignement sur l’équipe de la fiche App Store existante (A3PR55X9BY), version publiée 1.3.4 (8), nouvelle version 1.4 (9).
- Extension conservée sous son identifiant existant com.qurancoach.app.QuranCoachWidgets ; conservation des kinds PrayerWidget et HadithWidget pour les widgets déjà installés.
- Correction des anciennes écritures de widget : Preferences.configure ne sélectionne pas une suite App Group dans cette version du plugin ; le pont Swift écrit désormais explicitement dans UserDefaults(suiteName:). Le texte et la référence du hadith proviennent de l’accueil, sans citation de secours inventée.
- Snapshot Prières : événements réels futurs sur 24 heures, timeline de bascule à chaque horaire et compte à rebours natif. Données expirées masquées ; Iqama publiée ou personnelle uniquement.
- Manifeste des API nécessaires UserDefaults dans les deux cibles (raisons CA92.1 et 1C8F.1).
- Correction de l’URL de transcription en mode Capacitor : service public HTTPS, au lieu d’une route API locale inexistante.
- Demande CarPlay Audio : l’utilisateur a accepté le contrat et la page Apple confirme « Thank you for your submission ». L’autorisation reste en attente de traitement ; aucune capacité CarPlay Audio non accordée n’est ajoutée au binaire.

## Livraison signée 1.4 (9)

Archive signée et export App Store Connect réussis. Envoi Xcode confirmé le 16 octobre 2026 à 11:50, puis build 1.4 (9) visible dans App Store Connect en cours de traitement. Fiche App Store 1.4 créée ; nouveautés, description (sans chatbot), URL et instructions de vérification enregistrées.

Dossier de livraison : `../../outputs/ios-1.4-9/` (IPA, archive avec symboles et empreinte SHA-256). L’app et l’extension ont le même numéro 1.4 (9). Le fichier HTML d’entrée est identique au build web local validé. Aucun serveur de développement n’est embarqué dans la configuration Capacitor.

19 tests ciblés réussis (bridge widgets, Adhan et mises à jour), compilation web, archive signée et export réussis. Les trois sons locaux Adhan sont des CAF PCM de 28 secondes. La recherche vocale possède une ancienne variable catch `_err` inutilisée signalée par le lint ciblé ; compilation et comportement ne sont pas affectés.

L’iPhone connecté possède l’ancienne version App Store 1.3.4 (8), préservée. Aucune installation de développement ne remplace cette version. Le nouveau build nécessite encore le traitement Apple puis l’activation dans TestFlight / la soumission à la vérification App Store. La demande CarPlay Audio n’est pas une autorisation accordée.

## Correction du contrôle Apple — build 10

Le build 9 a reçu l’avertissement 90683 : NSLocationAlwaysAndWhenInUseUsageDescription absent. La clé, requise par le SDK @capacitor/geolocation, a été ajoutée avec un texte explicatif en français. Aucun mode de localisation en arrière-plan n’est ajouté. Le build final à distribuer est 1.4 (10), afin de ne pas soumettre le build 9 avec cet avertissement.


## TestFlight avant publication — build 10

Envoi confirmé le 16 octobre 2026 à 11:58 CEST, traitement Apple terminé et build 10 présent dans TestFlight. Informations de bêta et consignes de test enregistrées. Le testeur demandé existe déjà dans le groupe externe ; aucun doublon n’est créé. Les réponses du questionnaire de chiffrement reposent sur le code : pas d’algorithme de chiffrement embarqué autre que les mécanismes système ; le SHA-256 des ressources est un contrôle d’intégrité.

L’archive, l’IPA signé et son empreinte sont conservés dans `../../outputs/ios-1.4-10/`. Le build 9 est remplacé. La version App Store 1.4 reste un brouillon : les tests TestFlight précèdent toute demande de publication publique.

Le build 1.4 (10) est désormais lié au groupe externe existant « yattaaaaa », soumis au contrôle TestFlight et affiché « En attente de vérification ». Notification automatique activée après approbation. Le testeur demandé existait déjà. Aucune soumission de la version publique App Store n’a été effectuée.


## Installation sur l’iPhone par câble

Le 16 octobre 2026, à la demande de l’utilisateur, un build Release 1.4 (10) a été signé pour l’iPhone 15 Pro Max connecté par USB. Les profils de l’app et des widgets incluent désormais cet appareil et ont été contrôlés avant l’installation. La version 1.3.4 (8) a été mise à jour sur place, sans désinstallation. La version 1.4 (10) installée, son lancement et la présence persistante de son processus ont été confirmés par devicectl. Le point d’entrée web est identique à celui de l’archive TestFlight.

Ces contrôles confirment l’installation et le démarrage ; ils ne remplacent pas les essais visuels, audio, notifications et widgets de l’utilisateur. Le rapport est conservé dans `../../outputs/ios-1.4-10/INSTALLATION-CABLE.md`. Aucune donnée personnelle de l’application n’a été inspectée ou exportée. L’IPA de livraison reste signé pour App Store Connect, distinct de la signature de développement utilisée par câble.

## Trois nouveaux widgets et soumission publique — build 11

Le build 1.4 (11) ajoute Reprendre ma lecture, Invocations du moment et Ma mémorisation, en formats petit, moyen et rectangulaire d’écran verrouillé. Les widgets Prières et Hadith conservent leurs identifiants. Les instantanés sont partagés dans l’App Group local ; les liens résolvent les données courantes sans lancer automatiquement de micro ni d’audio. Les compteurs suivent les données existantes et les échéances des révisions suivent le calendrier SRS existant.

28 tests TypeScript ciblés et 20 contrôles Swift ont réussi, ainsi que la compilation web, la synchronisation Capacitor, l’archive et l’export signés. L’installation par câble du build 11 a réussi ; l’iPhone est ensuite devenu indisponible, empêchant de confirmer son lancement et les interactions visuelles après l’installation. La demande CarPlay Audio reste en attente et aucun test en véhicule n’a été réalisé.

Après accord explicite de l’utilisateur, la politique publiée et la fiche de confidentialité Apple ont été corrigées pour refléter les services déjà utilisés par l’application. Le build **1.4 (11)** a été soumis à la vérification publique App Store le **16 octobre 2026 à 13:57 (Paris)**. L’état affiché est **« En attente de vérification »**. Identifiant : `baecc5f6-93b3-4884-b5a2-aaa8f20d7045`. Publication automatique après approbation configurée. Le build 10 reste l’historique de la demande TestFlight précédente ; il n’est plus le build de la soumission publique.

Livraison et preuve : `../../outputs/ios-1.4-11/` (IPA, archive, journaux, empreinte et capture de la soumission). L’approbation Apple et la publication effective restent à venir.

## Mise à jour 1.5 (12) — 23 octobre 2026

Les dernières ressources web sont embarquées : livres à lire et écouter, décors et ambiances optionnelles, quiz enrichis et modes pupitre/côte à côte dans les écrans compatibles. La synchronisation facultative est activée. Le catalogue audio a été raccordé directement au Worker public pour Capacitor ; son contrôle HTTP confirme 69 enregistrements et l’autorisation de l’origine native.

32 tests TypeScript ciblés et 20 contrôles Swift réussis. Compilation web, synchronisation, archive, export et vérification des signatures réussis ; app et widgets portent 1.5 (12), sans serveur de développement. Envoi App Store Connect confirmé par Xcode le 23 octobre à 16:12:21 (Paris). Le transfert ne vaut pas approbation ni disponibilité TestFlight. Dossier : `../../outputs/ios-1.5-12/`.

L’iPhone associé est indisponible : les interactions, notifications, widgets et audio en arrière-plan de ce build restent à valider physiquement. Le pupitre est sélectionnable manuellement ; aucune détection automatique de pliure non vérifiée sur iOS n’est promise. La capacité CarPlay Audio reste inchangée.

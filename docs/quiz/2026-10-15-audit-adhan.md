# Vérification des audios Adhan

## Résultat : le choix de voix n'est pas relié à une lecture audio

- `PrayerSettingsPage.tsx` affiche Mecque, Médine, Al-Aqsa, Égypte, Turquie, Maroc. Le seul effet de chaque bouton est `setAdhanSound(sound)`.
- `notificationStore.ts` conserve cette chaîne dans les préférences. Aucun consommateur ne résout cette préférence vers un fichier ou une URL audio.
- `notificationService.ts` programme les notifications Capacitor avec `sound: 'default'`.
- `prayerNotificationScheduler.ts` utilise également le son système pour ses notifications natives. Ce service concerne les fenêtres avancées, pas un lecteur Adhan.
- Aucun catalogue audio Adhan ni fichier de notification associé aux six voix n'a été trouvé dans les ressources.
- Contrôle sur le site public `/prayer-settings` : choisir Médine modifie le bouton actif, sans lecteur ni lecture déclenchée. Préférence initiale Mecque rétablie après le contrôle. Notifications et autres réglages non modifiés.

Ce contrôle ne valide donc ni un aperçu Adhan, ni un déclenchement Adhan automatique. Il confirme que ces fonctions ne sont pas branchées. Les notifications système n'ont pas été déclenchées sur un téléphone physique.

## Contraintes techniques à distinguer lors d'une intégration

La lecture manuelle dans l'application et le son d'une notification lorsque l'application est fermée sont deux chemins différents. L'API Web `showNotification` ne fournit pas de propriété standard pour choisir un fichier audio : https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification . Apple impose aux sons personnalisés des notifications des fichiers compatibles de moins de 30 secondes : https://developer.apple.com/documentation/usernotifications/unnotificationsound . Une publication Vercel seule ne peut pas livrer un nouveau son natif inclus dans le binaire iOS.

Les sources GitHub explorées ne sont pas importées dans cette livraison. Une bibliothèque de fichiers de muezzins ne suffit pas à établir leurs droits de redistribution. Aucun fichier n'a été substitué sous un nom de mosquée sans attribution vérifiée.

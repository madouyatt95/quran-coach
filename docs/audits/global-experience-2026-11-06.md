# Expérience transversale — 6 novembre 2026

## Implémentation

- Séance de 5/10/15/20 minutes : Mushaf, révision, cours, livre, puis Fahm selon le budget. Étapes conservées jusqu’à validation volontaire. L’ancienne séance coranique reste accessible dans un volet dédié. Aucune modification des dimensions du Mushaf.
- Bibliothèque personnelle : favoris existants, livres/audio, cours enregistrés et passages du carnet. Collections et annotations réutilisées ; liens précis vers les chapitres/passages.
- Révision : questions existantes de l’Académie et autoévaluation des leçons des livres, à partir du lendemain ; les difficultés reviennent après un jour, les réponses retrouvées après un délai croissant. Lien vers les révisions Fahm existantes.
- Centre hors ligne : livres entiers ou chapitre en cours, estimation réelle du volume, téléchargement séquentiel, pause/reprise des fichiers complets, contrôle de présence, retrait, polices et packs de sourates existants.
- Espaces familiaux locaux : données Zustand et principaux enregistrements historiques isolés par profil, réutilisation sans migration du profil principal ; accès Junior et aperçu de progression. Les fichiers téléchargés restent communs à l’appareil.
- Trois App Intents iOS 18+ : reprendre le dernier livre audio, ouvrir le Khatm, afficher les horaires de la mosquée. Routage commun aux widgets, y compris démarrage à froid.
- Recherche : manuscrits actuels et passages précis, carnet personnel, exclusion des anciens récits publics doublonnés. Index des livres construit une seule fois, progrès personnels relus à chaque recherche.

## Contrôles

- 42 fichiers / 202 tests réussis : stores, profils, budgets de séance, sauvegarde/synchronisation, recherche, reprise audio et planification des révisions.
- TypeScript et build Vite de production réussis ; synchronisation Capacitor effectuée.
- Compilation iOS Debug signée réussie avec les App Intents.
- ESLint des nouveaux composants/services : réussi.
- Navigateur : création d’un espace enfant, passage dans Junior, retour au profil principal avec la séance conservée ; affichage mobile du programme et du stockage ; ajout d’un cours à la bibliothèque et vérification du lien de reprise.
- Catalogue public vérifié : 502 enregistrements dont les quatre segments d’Adam. Le serveur refuse les origines localhost non autorisées ; aucun assouplissement CORS effectué.

## Limites explicites

- Les profils ne sont pas des comptes ni une barrière de sécurité/contrôle parental. Synchronisation cloud et studio restent réservés au profil principal ; chaque espace peut sauvegarder ses progrès par fichier.
- Les révisions des livres sont des autoévaluations ; aucune certification religieuse ou pédagogique n’est produite.
- Les polices ne constituent pas un téléchargement intégral du Mushaf interactif : les données de pages demandent encore une connexion. Les cours et textes des livres doivent avoir été ouverts ; les sources externes restent en ligne. Les packs « semaine » ciblent un chapitre, pas sept journées de cours.
- Aucun essai vocal Siri, bouton Action ou fonctionnement complet en mode avion sur iPhone physique dans cette livraison. Compilation ne signifie pas distribution App Store ; aucune nouvelle soumission Apple effectuée ici.

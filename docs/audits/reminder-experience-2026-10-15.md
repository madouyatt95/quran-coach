# Rappels compacts — 15 octobre 2026

## Périmètre
Les cinq améliorations initiales (actions directes, statut utile, menu avec annulation, priorisation, thèmes) et les deux ajouts retenus (vendredi évolutif et créneau personnel).

- Accueil : cartes horizontales sans titre de section visible ; actions et menu ⋯ indépendants ; sortie animée discrète avec respect du mouvement réduit.
- Invocations : premier compteur inachevé, ordre personnel conservé, remise à zéro quotidienne prise en compte ; lien vers l’invocation exacte, sans lecture audio forcée.
- Actions : déjà fait, plus tard de 30 minutes, pause du thème précis pendant sept jours, annulation immédiate.
- Classement : rappels actuels prioritaires, au maximum deux rappels futurs sur l’accueil dans les prochaines 24 heures, exclusions après expiration.
- Préférences : choix des familles, paramètres existants conservés ; stockage additionnel `quran-coach-reminder-experience-v1`.
- Vendredi : préparation jeudi soir, reprise d’Al-Kahf vendredi, départ lorsque Jumu’a et trajet sont connus. Données publiées fraîches ou horaires personnels identifiés ; aucune Iqama ni durée de trajet inventée.
- Créneaux : ce soir, demain, date personnalisée dans les 90 jours, route exacte conservée, suppression possible. Les rappels reviennent dans l’application, pas par notification système. Les rappels expirables ne peuvent pas être reportés après leur échéance.

## Vérifications réalisées
- 30 tests ciblés réussis : hook, sélection, vendredi, invocations, stockage/rechargement, préférences, affichage des cartes et stores existants.
- TypeScript `tsc -b` réussi ; ESLint sans erreur sur les neuf fichiers de production ciblés.
- Build Vite/PWA réussi (avertissements de découpage de bundles existants).
- Navigateur local, viewport 390 × 844 : cartes horizontales, menu, déjà fait/annuler, créneau demain, conservation après rechargement, retrait, thème désactivé après rechargement puis réactivation.

## Limites
- Aucun test sur iPhone physique ou notifications d’arrière-plan.
- Consultation du texte et compteurs ne prouvent pas à eux seuls l’accomplissement religieux.
- Le départ du vendredi dépend d’un horaire disponible et d’un trajet saisi ; aucune nouvelle requête massive aux fournisseurs.
- Les préférences et créneaux sont conservés sur l’appareil, sans synchronisation entre appareils.

## Publication
- Vercel `dpl_HweCnJNni7T36miRUZUE9M53SQ9t` : READY, production, alias https://www.quran-coach.fr.
- Domaine public : bundle `index-6d37SDZQ.js` confirmé.
- Cache PWA : ancienne version au premier chargement, bannière « Mettre à jour », application de la mise à jour réussie sans effacer les préférences.
- Navigateur public 390 × 844 : cartes, menu ⋯, compteur matin 0/23, limite de deux rappels futurs vérifiés. Le bouton du matin ouvre directement Ayat al-Kursi en mode de récitation (`/adhkar?cat=morning&dua=morning%3A94`).
- Capture : `/tmp/quran-coach-rappels-public-2026-10-15.png`.

# Mushaf interactif — lecture et apprentissage (10 octobre 2026)

## Changements

1. Glissement à zoom > 100 % : le déplacement consomme d’abord le défilement horizontal ; seul le mouvement supplémentaire au bord peut tourner la page. Retour visuel suivant le doigt, entrée orientée, mouvements réduits respectés.
2. Une ligne de commandes, détails repliables, cadrages page entière et confort à 120 %, zoom fin, préférences existantes préservées.
3. Fiche compacte/dépliable, glyphe et palette de la page, français QUL, sélection maintenue au-dessus de la fiche, mots enregistrés localement dans Mes mots à revoir. Le verset est ajouté à la file SRS existante, sans évaluation automatique.
4. Règles issues exclusivement des balises source des mots. Segment source souligné ; descriptions existantes de l’Académie pour les règles prises en charge. Les règles sans fiche pédagogique restent identifiées et écoutables, sans explication inventée. Boucle de prononciation.
5. Récitateur, vitesse, verset et compteur de répétitions ; passage continu chargé une seule fois par sourate et suivi à travers les pages. Annulation d’un chargement devenu obsolète. États chargement/lecture/erreur/réessai pour les mots.
6. Me tester : masque sans recomposition ; révélation d’un mot ou d’une ligne ; aide audio via la fiche ; ajout explicite des versets de la page à la file SRS. Aucun score, statut mémorisé ou Khatm validé automatiquement pendant l’exercice.

## Vérifications

- TypeScript + build Vite + service worker PWA : réussite.
- 34 tests ciblés : lecture/répétition et annulation interpages, erreurs audio, arrêt/changement de mot, boucle, calcul du glissement au bord, révélation sur lignes exactes, persistance des mots, préférences et modèle coranique.
- Les 604 tests optionnels nécessitant les captures API d’audit ne sont pas exécutés dans cette passe. Les données de texte, de glyphes et le manifeste de pagination ne sont pas modifiés.
- Navigateur local, viewport 390 × 844 : barre compacte, dépliage, glyphe coloré, explication ghunnah, révélation de la première ligne seule, papiers ivoire et nuit.
- Glissement réel avec zoom 115 % : page 4 → 5.
- Audio réseau réel : Al-Baqarah 16 → 17, page 3 → 4 ; contrôles affichant 2:17, répétition 1/1. Arrêt manuel vérifié.
- Aucun test sur iPhone physique/Capacitor pendant cette passe. Les gestes pincés et l’audio de fond sur appareil restent à confirmer.
- Le pack complet hors ligne (proposition 7) n’est pas inclus. Les dépendances réseau existantes restent inchangées.

## Publication

- Production READY : `dpl_3UCBaZV7HWQkephSysCM8kT9WkiB`.
- Domaine attribué : https://www.quran-coach.fr.
- Déploiement CLI du répertoire de travail (base Git `5ce2898`, modifications locales incluses).
- Vérification HTTP publique : `/read` et module `InteractiveTajweedPage-DOdjfPlf.js` disponibles ; nouvelles commandes et entraînement présents dans le module servi.
- Reconnexion CLI nécessaire après refus d’authentification ; publication réussie après reconnexion. Aucun mot de passe ni jeton ajouté au dépôt.

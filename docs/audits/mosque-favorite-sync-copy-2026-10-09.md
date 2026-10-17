# Synchronisation de la mosquée favorite — 9 octobre 2026

## Cause
La fiche mosquée lisait les calendriers publiés, mais les cartes « prochaine prière », « rendez-vous du vendredi » et la frise utilisaient uniquement les calendriers saisis personnellement. Une mosquée disposant de Jumu’a pouvait donc apparaître sans horaires dans ces cartes.

## Correction
- Adaptateur commun des calendriers publiés vers les événements de prière : `src/lib/mosqueScheduleEvents.ts`.
- Chargement et actualisation de la source de la favorite même après un retour sur la page : `src/hooks/useFavoriteMosqueSchedule.ts`.
- Prochaine prière, vendredi, frise et comparaison alimentés par les données publiées fraîches, avec repli sur la saisie personnelle.
- Préférences personnelles de trajet conservées ; aucune Iqama ni khutba inventée. En l’absence d’Iqama, l’Adhan est explicitement présenté comme Adhan.
- Textes simplifiés sur les cartes Prières, la recherche de mosquées, Identifier, certains panneaux de mémorisation, le parcours du compagnon et Sentinelle. Sources, fraîcheur des horaires et informations utiles de confidentialité restent accessibles.

## Vérifications locales
- 17 tests ciblés réussis : MosquePlanning, mosquePlanning, mawaqitPublic, MosquePlanEditor.
- TypeScript, ESLint sur les fichiers touchés, et build de production PWA réussis.
- Navigateur : sélection réelle de la Grande Mosquée de Paris sans calendrier manuel ; prochaine Iqama Isha 20:51, Jumu’a 13:50 et 14:30.
- Tests couvrant aussi le chargement depuis un cache vide, le refus de données périmées et l’absence de fabrication d’Iqama.
- Pas de validation sur iPhone physique. La disponibilité des horaires reste dépendante des calendriers publiés par chaque mosquée.

## Compte à rebours et publication
- Ajout du compteur heures/minutes/secondes sur la carte de la prochaine prière de la mosquée, alimenté par les instants publiés et l’horloge existante de la page (une seconde).
- Bascule automatique vers le prochain événement ; aucun compteur Iqama lorsque seule l’heure d’Adhan est connue.
- 18 tests ciblés désormais réussis, dont décrémentation et bascule exacte à l’heure de la prière. ESLint et build PWA réussis après cet ajout.
- Version finale : dpl_rckZCHqsuoUzdCouUjEUiTaLzTRW, READY, production https://www.quran-coach.fr.
- Première mise à jour vérifiée publiquement : sélection de la Grande Mosquée de Paris → Isha 20:51 et Jumu’a 13:50 / 14:30. Favori absent avant ce test.
- Affichage mobile du compteur vérifié à largeur 390 dans le navigateur ; aucun test iPhone physique.
- Version finale vérifiée dans le navigateur public après « Mettre à jour » : compteur Iqama actif (01h01min24s puis 20s puis 16s), Isha 20:51, Jumu’a 13:50/14:30. Capture `mosque-favorite-countdown-production-2026-10-09.png`.
- Favori de test retiré ensuite pour restaurer l’état initial du navigateur public ; largeur temporaire réinitialisée. Préférences du navigateur local conservées pour l’aperçu.
- Atlas : sommes de contrôle inchangées.

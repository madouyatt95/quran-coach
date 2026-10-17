# Verset sélectionné à l’entrée du Mushaf Tajwid

Le lecteur connaissait le verset courant, mais ne consommait pas la demande `scrollToAyah` pour le rendre visible et appliquait seulement une couleur très discrète.

Ajout de `useVerseEntry` : attendre que le verset exact soit rendu, traiter la demande explicite une seule fois, surligner tous ses mots et faire défiler le viewport vers son début (dans les limites du défilement disponible). Aucun déclenchement audio ni ouverture de fenêtre. Le repère s’efface lorsque le verset ou la page courants changent. Les couleurs Tajwid restent intactes. Le mode de suivi vocal garde son rendu.

Tests : 10 tests ReadPage/useVerseEntry, dont chargement différé, changement de verset sur la même page, lecteur persistant masqué et cible absente. Lint du hook réussi, build PWA réussi.

Vérification navigateur : Chrome en 390×844, lien 2:25 ouvert page 5 de l’édition, uniquement les mots 2:25 marqués, aucune fenêtre ouverte. Pas de test sur iPhone physique.

## Audit des menus éditoriaux (propositions seulement)
Prophètes : fiches avec résumés, versets clés, invocations, leçons, miracles, arbre, compagnons et renvoi Atlas. Histoires : catégories, recherche dans les textes, moralités, narration TTS, passages associés et Atlas. Pas de progression de lecture structurée ni de parcours par épisodes dans ces pages.

Points concrets : partage utilisant https://qurancoach.com au lieu du domaine public actuel ; filtre de recherche non transmis au graphe des prophètes ; liens de l’arbre non typés explicitement dans l’interface ; fiches sous forme de div superposées sans gestion complète de focus/clavier.

Production : déploiement dpl_DkkAr7EuqBZrEnMPjUMBwWGArLwH READY. Parcours réel depuis un résultat de l’historique Identifier 2:25 → « Ouvrir dans le Mushaf » → URL /read?surah=2&ayah=25 : sélection exclusivement 2:25, zéro dialogue ouvert, vérifié sur www.quran-coach.fr.

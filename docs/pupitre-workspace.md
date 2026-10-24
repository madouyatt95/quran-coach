# Pupitre : console, étude et jeu face à face

## Livraison du 24 octobre 2026

Implémentation des propositions 1, 2, 3, 5 et 6, avec les deux corrections de disposition. Aucun nouveau contenu religieux ni enregistrement synthétique n’est produit dans cette évolution.

- Console à trois onglets dans le Mushaf interactif et les livres : commandes principales fixes, panneaux secondaires défilants, quatre raccourcis personnalisables au maximum. Les panneaux restent montés quand on change d’onglet.
- Étude du Mushaf dans le second espace : français mot à mot et prononciation existants, traduction du verset, exégèse Mokhtasar à la demande via le service QuranEnc déjà présent. Une explication peut rester épinglée lors d’un changement de page. L’appui simple conserve la lecture continue et l’appui long conserve l’ouverture de la fiche du mot.
- Navigation illustrée par scènes dans les livres : texte canonique du manuscrit, paysages SVG existants et départs audio tirés uniquement des repères de phrases enregistrés. Sans repère disponible, la scène reste lisible et le départ audio est désactivé ; aucun temps n’est estimé.
- Jeu local `/quiz?table=1`, accessible depuis Quiz & défis et Duel : vocabulaire, associations, vrai/faux et questions existantes de l’Académie. Deux espaces tournés vers les joueurs, réponse masquée après validation, correction après les deux réponses, passage à la manche suivante quand les deux sont prêts. Partie conservée sur cet appareil, pause à la mise en arrière-plan. Aucun résultat de ce jeu ne valide automatiquement un cours.
- Disposition, répartition et préférences de console séparées par activité. Migration des préférences antérieures conservant le choix existant. En l’absence de segments physiques détectés, le partage est réglable entre 35 et 70 % par curseur, séparateur ou clavier. Si les segments sont disponibles, leurs limites sont prioritaires.
- Continuité : conservation des composants audio et de l’état de l’activité, repère sémantique pour les mots du Mushaf et les paragraphes des livres, restauration après changement de disposition ou de dimensions. Les sections de cours possèdent également des repères. Les fenêtres du Mushaf suivent les dimensions réelles de la zone de commandes.

## Vérifications

66 tests ciblés dans 15 fichiers réussis : migration et isolation des préférences, restauration d’un passage après redistribution du texte, interaction des deux joueurs et comptage unique des points, repères audio des scènes, épinglage d’une explication, lecture des mots, fermeture et développement de la fiche intégrée, conservation du carnet et références, pages tournées et navigation du lecteur. Le lot de 65 contrôles a été exécuté ensemble, puis les quatre contrôles des deux fiches d’étude ont été rejoués après le dernier correctif (dont un contrôle supplémentaire).

Compilation TypeScript et Vite réussie. Vérifications HTTPS à 669 × 867 : lecture du Mushaf, console, étude du mot, conservation du verset 2:17 épinglé en passant de la page 4 à la page 5, partage à 60 % et fenêtre de répétition entièrement contenue dans la zone de commandes. Jeu face à face : réponse du premier joueur masquée, révélation commune et scores confirmés. Les contrôles visuels complémentaires sont conservés dans `../../outputs/pupitre-workspace-2026-10-24/`.

## Limites

- Les départs d’une scène suivent un repère de phrase enregistré, pas nécessairement le premier phonème de la scène. L’absence de catalogue ou de repères est affichée sans inventer d’horaire.
- Le catalogue distant autorise les domaines publics et l’origine Capacitor. Un domaine de prévisualisation peut donc ne pas charger les audios du serveur ; les vérifications du catalogue doivent être effectuées aussi sur le domaine public.
- Le choix manuel est disponible sans API de pliure. La détection Safari reste conditionnée à la disponibilité des API expérimentales de segments ; aucune détection automatique sur appareil physique n’est attestée.
- Xcode installé : 26.3, SDK iOS 26.2. Une recompilation avec le SDK 27.1 et des essais dans le simulateur Duo puis sur appareil restent nécessaires pour valider l’exploitation complète de l’écran natif. Les captures promotionnelles ne constituent pas cette validation.
- Les ressources web peuvent être synchronisées dans le projet Capacitor ; cela ne modifie pas le binaire 1.5 (16) déjà soumis à Apple. Une nouvelle archive est nécessaire pour distribuer ces évolutions dans l’application native.

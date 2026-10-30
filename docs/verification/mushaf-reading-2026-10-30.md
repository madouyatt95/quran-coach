# Mushaf — sous-titres, feuilletage et séances (30 octobre 2026)

## Fonctionnement
- La bande « Mots » regroupe les traductions françaises QUL 95 par références consécutives. Elle utilise exclusivement les segments du fichier de récitation joué (API Quran.com by_ayah). Elle ne prétend pas aligner la prose de Hamidullah sur l’arabe. La traduction complète Hamidullah reste accessible au toucher, avec explication de la différence de source.
- Horodatages absents/incomplets, traduction manquante : traduction complète consultable par glissement manuel, sans cadence proportionnelle inventée. Texte QUL conservé, y compris ses annotations ; sa formulation est parfois littérale. Les groupes sont adjacents et limités par la largeur, pas une analyse grammaticale.
- Le lecteur interactif préfère le fichier audio associé à ses segments, y compris après changement de verset. Préparation limitée à cinq secondes, retour à la source audio habituelle si nécessaire. Stop/pause invalident les préparations dépassées ; la reprise ne rejoue pas l’ancien verset.
- Appui long sur le numéro de page (classique, immersion, pupitre) : aperçu avec trois pages réelles, différé de 220 ms pour éviter les chargements à chaque mouvement. Déplacement de lecture uniquement au relâchement du curseur, Entrée ou « Ouvrir ». Fermeture/annulation sans changement de page. Accès explicite dans Outils et Aller à une page.
- Séance « 5 pages » (page courante incluse, plafonnée à 604) ou fin de sourate : destination persistée localement, trait doré sous le médaillon final, indication compacte. Confirmation « J’ai terminé » puis bilan sans popup. Aucun appel au store Khatm ; arriver ou feuilleter ne certifie pas une lecture.

## Vérifications
- 53 tests ciblés cumulés : sous-titres, audio continu/pause/annulation/reprise, modèle de séance/persistance, aperçu/annulation/appui long, traduction complète, géométrie et animation de page.
- Compilation TypeScript et build Vite/PWA réussis. Avertissements existants de chunks/imports mixtes.
- Navigateur intégré, 390 × 844 : miniatures réelles, aperçu page 5 sans quitter page 4, fermeture, appui long, séance 4–8, accès à « J’ai terminé » à l’arrivée, bande discrète en immersion. Récitation réelle 2:17 avec bande QUL et pause stable.
- Aucun essai sur iPhone physique. Couverture des segments dépend du récitateur et du verset ; pas de garantie de synchronisation complète des 604 pages. La nouvelle séance est locale à cet appareil.

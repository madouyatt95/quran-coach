# Identifier : stabilité des propositions

## Correction
Le composant remplaçait la liste à chaque événement `verse_candidate`. La liste conserve maintenant les premières propositions affichées, dans le même ordre, pour une même recherche (trois propositions provisoires maximum). Une réponse finale différente reste ajoutée, même lorsque ces trois places sont occupées.

Une confirmation cohérente avec l’unique proposition, ou une identification sans propositions préalables, reste automatique. Si la réponse finale contredit les passages déjà proposés, le micro/moteur est arrêté et le choix reste manuel. Les réponses tardives ne peuvent remplacer ce choix. Une nouvelle recherche remet la liste à zéro. Le suivi en récitation libre est inchangé.

Ce changement stabilise l’interface et protège le choix de l’utilisateur ; il ne prétend pas améliorer la précision acoustique du modèle ni rendre les candidats certains.

## Vérifications
- 29 tests : VoiceSearchPage (15), service Tilawa (14).
- Trois régressions ajoutées : propositions contradictoires conservées/choix explicite protégé ; résultat cohérent accepté automatiquement puis figé ; quatrième proposition finale conservée et remise à zéro au nouvel essai.
- Lint des deux composants modifiés et build PWA réussis.
- Tentative de scénario synthétique dans le navigateur local non concluante (injection du callback non atteinte). Le scénario contradictoire est vérifié par les tests de composants, pas par une récitation réelle sur téléphone.
- Déploiement production READY : dpl_AJT6Tw4mFf99YcREqVy4EaN34XbH.
- Vérification réelle sur le domaine public, Chrome viewport 390×844 : import MP4 Alafasy identifié automatiquement 112:1 après déploiement. Aucun test sur téléphone physique.

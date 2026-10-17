# Chatbot Quran Coach : comparaison avec Qaf et proposition

Date : 7 octobre 2026. Audit local et essais publics ; aucun nouveau moteur intégré ou déployé.

**Note ultérieure :** le chatbot a été retiré de l'application à la demande de l'utilisateur. Ce rapport et les résultats JSON sont conservés comme historique ; le moteur et le script d'audit cités ci-dessous ont été supprimés. Les propositions d'intégration sont abandonnées.

## Conclusion

Priorité : construire une recherche documentaire traçable, puis une réponse conversationnelle fondée sur les passages retrouvés. Le chatbot actuel assemble des contenus par mots-clés. Agrandir sa FAQ ne suffira pas à traiter des questions variées, leurs nuances et les relances.

Qaf montre une expérience de consultation convaincante, mais nos essais ne permettent pas de certifier son exactitude générale. Une discordance entre l'ouvrage annoncé et la référence ouverte a été observée.

## Ce qui a été vérifié

- Lecture de `src/lib/chatbotEngine.ts`, `src/components/Coach/ChatbotView.tsx` et de son CSS.
- Exécution de 12 questions sur le moteur local, enregistrées dans `chatbot-baseline-2026-10-07.json`. Reproduction depuis la racine du dépôt : `node scripts/audit-chatbot.mjs`.
- Trois questions identiques envoyées successivement dans une conversation Qaf en mode invité. La quatrième, sur 2:255, a déclenché la limite invité : aucun résultat Qaf attribué à cette question ou aux huit restantes.
- Une citation du premier échange ouverte jusqu'au livre sur Turath ; une autre citation du troisième échange examinée dans le panneau Qaf.
- Aucun score global de fiabilité religieuse ou de rapidité : échantillon trop petit, pas de chronométrage instrumenté ni de validation savante exhaustive.

### Comparaison des trois questions communes

| Question exacte | Quran Coach local | Qaf observé |
| --- | --- | --- |
| Comment faire les ablutions selon l’école malikite ? Donne les références précises des ouvrages utilisés. | Fiche générale, références vagues et contenus supplémentaires sans rapport direct. L'école demandée ne modifie pas la réponse. | Réponse structurée selon l'école demandée, ouvrages nommés et citations ouvrables. |
| Et si je manque d’eau ? Réponds brièvement avec une référence. | Retrouve une fiche sur le tayammum. Ne reçoit toutefois aucun historique et ne conserve donc pas le contexte malikite. | Conserve explicitement le contexte malikite et cite des ouvrages liés à la question. |
| Donne-moi la source exacte | Affiche une histoire de Job/Ayyoub, sans lien avec la réponse précédente. | Fournit des extraits arabes et leur traduction, mais une référence présente une discordance détaillée ci-dessous. |

Les 12 essais locaux donnent 5 réponses de repli explicites, 19 références affichées dont 9 munies d'un lien. Ces liens peuvent viser une rubrique entière. Ces nombres mesurent la couverture apparente, pas l'exactitude : plusieurs réponses sans message de repli sont hors sujet, notamment la demande d'aide pour un signet et la vérification d'une attribution de hadith.

### Contrôle des citations Qaf

La première citation consultée ouvre [Al-Khulasa al-Fiqhiyya, sur Turath](https://app.turath.io/book/6190?page=4). Le passage consulté correspond au sujet des obligations des ablutions. L'index de page informatique et la pagination imprimée diffèrent : ces deux valeurs devront être conservées dans notre modèle de référence.

Au troisième échange, une section annonce *Al-Muqaddimah al-‘Izziyyah* et Abu al-Hasan ash-Shadhili, tandis que la citation associée ouvre *Tafsir Ayat al-Ahkam* de Muhammad Ali al-Sayis. C'est une discordance observable d'attribution ; elle ne permet pas, seule, de juger l'ensemble de l'avis religieux. Capture : `qaf-citation-2026-10-07.jpg`.

Conversation test : https://qaf.ai/chat/01a11352-0029-707f-8840-74d202b82603 (session invitée ; persistance et partage non garantis).

## Sources envisageables et conditions à résoudre

| Source | Usage proposé | État de vérification |
| --- | --- | --- |
| Tanzil | Texte arabe coranique canonique | Reproduction fidèle avec attribution, lien et notice ; ne pas modifier le texte. Les traductions ont leurs propres droits. [Licence](https://tanzil.net/docs/Text_License). |
| Quran Foundation | Versets, traductions et tafsirs identifiés | Accès API avec identifiants. Les conditions distinguent recherche documentaire et entraînement ; règles de conservation et synchronisation à intégrer, notamment la limite ordinaire d'une semaine de cache. Vérifier chaque ressource. [Conditions](https://api-docs.quran.com/legal/developer-terms/), [API](https://api-docs.quran.com/docs/api-reference/). |
| Sunnah.com | Hadiths avec identifiants et références précises | API partielle sur demande de clé ; accès, champs disponibles et modalités de réutilisation à confirmer avant intégration. Aucun accès demandé pendant cet audit. [Développeurs](https://sunnah.com/developers?country=US). |
| Turath | Livres de fiqh, commentaires et sources arabes | Lecture publique constatée. Conditions d'accès automatisé, quotas et droits de réutilisation du corpus à confirmer. La licence d'un SDK ne couvre pas celle des livres. |
| Données propres à Quran Coach | Aide sur les gestes et parcours de l'app | Référentiel séparé, relié aux routes et fonctions réelles, pour répondre correctement aux questions sur signets, mémorisation ou lecture. |

Qaf annonce 8 500 livres, fournis via Turath. Ce chiffre vient de sa présentation et n'a pas été audité. Aucune API publique de Qaf intégrable n'a été identifiée dans les pages examinées. [Présentation des sources](https://qaf.ai/sources).

Le [SDK Nusus](https://github.com/mwijanarko1/nusus) illustre des fonctions de recherche et de localisation dans Turath. C'est un outil tiers, pas une autorisation d'exploitation du service. Ne pas en faire une dépendance de production avant clarification.

## Architecture recommandée

1. **Contexte de conversation** : garder les derniers échanges, le verset concerné et l'école explicitement demandée. Ne pas inférer une appartenance religieuse de l'utilisateur.
2. **Orientation de la question** : distinguer explication de verset, hadith, fiqh, aide dans l'app et programme de mémorisation. Résoudre directement une référence comme 2:255.
3. **Recherche des passages** : recherche lexicale et sémantique en français/arabe dans les corpus autorisés ; filtrage par ouvrage, école et thème lorsque pertinent. Aucun avis généré avant d'avoir trouvé les passages nécessaires.
4. **Registre de sources côté serveur** : identifiant stable, titre, auteur, édition, chapitre, page imprimée, index technique, extrait original, URL, provenance de traduction et conditions de conservation.
5. **Rédaction fondée sur les passages** : réponse courte par défaut, développable ; opinions attribuées et divergences expliquées quand documentées. Si la recherche est insuffisante, le dire sans transformer cette absence en preuve d'inexistence.
6. **Contrôle des références** : le modèle choisit des identifiants de passages fournis ; titres, liens et citations sont rendus depuis le registre. Refuser les identifiants inconnus. Vérifier séparément que chaque passage justifie effectivement la phrase : une référence existante ne prouve pas sa pertinence.
7. **Actions de l'app** : ouvrir le verset exact, écouter, enregistrer une source ou préparer une séance de mémorisation avec validation de l'utilisateur avant modification de son programme.

Les appels au modèle et les clés restent côté serveur. Limiter les volumes, traiter les documents comme des données non fiables, contrôler les liens rendus et éviter d'envoyer l'historique personnel complet à un prestataire. Les questions personnelles ne doivent pas alimenter un cache partagé. Prévoir expiration, suppression de conversation et budget maximal côté serveur.

## Interface proposée

- Conserver la palette et les icônes actuelles ; conversation plus aérée et champ multiligne adapté au clavier mobile.
- Réponse brève, puis « Approfondir », « Sources » et « Avis des écoles » seulement quand les contenus correspondants existent.
- Numéros de références près des affirmations ; panneau de lecture avec extrait original, traduction identifiée, auteur, livre et localisation.
- Historique conservé après changement d'onglet, suppression accessible et reprise fiable.
- Afficher la recherche en cours puis la rédaction ; annuler une requête lors d'une remise à zéro et empêcher les réponses de s'afficher dans le désordre.
- Séparer les références documentaires des actions telles que « Ouvrir dans le Mushaf » ou « Préparer ma séance ».

## Coût indicatif, avec gratuité pour les utilisateurs

Hypothèse illustrative : 8 000 tokens en entrée et 1 000 tokens en sortie totale, raisonnement compris, un appel par réponse. Prix standard USD, hors taxes, relevés sur la [page officielle Google](https://ai.google.dev/gemini-api/docs/pricing).

| Candidat de chiffrage | Entrée / million | Sortie / million | 1 000 réponses | 10 000 réponses |
| --- | ---: | ---: | ---: | ---: |
| Gemini 3.1 Flash-Lite | 0,25 $ | 1,50 $ | 3,50 $ | 35 $ |
| Gemini 3.5 Flash | 1,50 $ | 9 $ | 21 $ | 210 $ |

Calcul : `(8 000 × tarif entrée + 1 000 × tarif sortie) / 1 000 000` par réponse. Ces candidats n'ont pas été testés pour la qualité religieuse ; ce tableau ne justifie pas un choix de moteur. Recherche, hébergement, index, licences, appels supplémentaires et réponses plus longues s'ajoutent. Un second appel au même volume doublerait cette composante.

Gratuité pour l'utilisateur compatible avec un budget financé par l'éditeur, des limites d'usage raisonnables et un cache des seules réponses documentaires génériques. Le niveau gratuit du fournisseur ne doit pas constituer l'hypothèse de viabilité en production. Google indique des règles d'utilisation des données différentes entre ses niveaux gratuit et payant.

## Ordre de réalisation proposé

**Lot 1 — fondations vérifiables.** Registre des références, panneau des sources, historique, annulation des requêtes, correction du champ et de la hauteur mobile. Documenter les contenus déjà disponibles et leurs droits.

**Lot 2 — pilote documentaire.** Corpus limité explicitement couvert, API serveur et fournisseur configuré, budget plafonné. Comparer les moteurs sur les mêmes passages avant sélection. Étendre ensuite aux ouvrages de fiqh lorsque l'accès et la réutilisation sont clarifiés.

**Lot 3 — intégration complète.** Actions dans le Mushaf et mémorisation, extension du corpus, évaluation de charge et déploiement après validation du pilote.

### Critères de validation du pilote

- Jeu d'au moins 50 cas : questions directes, relances, arabe/français, versets exacts, attributions douteuses, demandes par école, aide dans l'app et sources absentes.
- Chaque lien ouvre le passage annoncé ; aucune référence inventée tolérée dans le jeu de validation.
- Relecture des attributions, traductions et rapports entre affirmation et preuve par une personne compétente ; distinguer ce contrôle des tests logiciels.
- Essais de coupure réseau, expiration de session, limite de budget, remise à zéro pendant une réponse et changement d'onglet.
- Vérification sur mobile du clavier, des longs extraits arabes, du panneau de sources et de la reprise d'historique.
- Mesurer coût réel, latence médiane et au 95e percentile avant d'annoncer un niveau de service.

## Livraison de cet audit

Rapport, script reproductible, résultats locaux et capture Qaf. Aucun abonnement activé, corpus massif importé ou moteur substitué. Les accès aux sources et le budget du fournisseur restent des paramètres à établir pour une intégration réelle.

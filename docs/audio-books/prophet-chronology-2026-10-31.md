# Le Prophète : parcours chronologique en 30 étapes

Le parcours `/prophet` va du contexte mecquois aux derniers jours du Messager. Il relie 26 manuscrits dédiés et quatre livres existants (voyage nocturne, Hégire, épreuve de la calomnie et Hudaybiyya). Les livres réutilisés conservent leurs identifiants, leur progression et leurs enregistrements : aucun doublon de production n’est nécessaire.

## Édition et sources

- Rédaction française originale, conçue pour une lecture continue et une narration. Ce n’est pas une lecture intégrale des PDF fournis.
- *Le Nectar cacheté*, de Safi ar-Rahman al-Mubarakfuri, sert de cadre chronologique secondaire. Les références de pages sont celles du PDF fourni, et non une pagination universelle de toutes les éditions.
- Coran et hadiths sont référencés au niveau des passages ; les liens et les numéros sont consultables dans le lecteur. Les chroniques et les explications du narrateur restent distinguées des textes primaires.
- Pas de dialogues ou de pensées inventés. Les dates discutées ne sont pas artificiellement tranchées. Les scènes tirées de témoignages différents ne sont pas fusionnées en une citation unique.
- Les scans et les traductions françaises des ouvrages modernes ne sont pas distribués. Les notices des sources précisent leur usage bibliographique.
- Les quatorze thèmes complémentaires du plan éditorial initial restent hors de cette livraison. Le parcours chronologique ne prétend pas couvrir chaque détail des deux livres.

## Lecture et audio

`src/data/prophetCollection.ts` définit l’ordre. `bookNextSteps` présente la période suivante ; `nextAudioBook` ne la lance que si tous ses segments sont présents. Il ne saute pas un épisode incomplet et ne revient pas au début après l’épisode 30. La production utilise la version exacte du manuscrit : un ancien enregistrement ne doit pas être présenté comme la narration d’un texte modifié.

Les segments de production sont des découpes techniques contiguës, sans perte de caractère. Ils ne changent pas le découpage visible du récit. La récitation coranique synthétique est exclue : la narration est française.

## Vérifications

Les tests des manuscrits, des références structurées, des découpes, des origines et des transitions couvrent les trente étapes. Une vérification des fichiers publiés compare les octets et le SHA-256 aux métadonnées, décode le MP3 entier, contrôle la durée et la réponse HTTP 206 pour la reprise partielle.

Ces contrôles techniques ne constituent pas une écoute humaine intégrale ni une expertise indépendante d’authentification religieuse. La publication directe est consignée conformément à l’autorisation du propriétaire, sans fausse attestation d’écoute. Les essais dans le navigateur ne remplacent pas un essai sur iPhone physique.

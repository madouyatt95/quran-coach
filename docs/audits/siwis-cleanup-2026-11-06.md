# Retrait des narrations Siwis remplacées — 6 novembre 2026

## Inventaire et décision

Le catalogue local contenait 749 narrations Kokoro/Siwis. Le catalogue public du serveur audio contient 502 enregistrements George, dont certaines éditions antérieures. Aucun remplacement n'a été décidé par simple ressemblance de titre ou de texte : aucun texte Siwis ne correspondait exactement à un texte George.

153 narrations anciennes ont une destination éditoriale vers 27 livres actuels entièrement disponibles avec George. Pour chaque livre, tous les segments attendus ont été reconstruits depuis son manuscrit actuel, puis comparés aux textes et références du catalogue publié. Les 113 fichiers George distincts correspondants ont tous répondu à une requête HEAD avec un type audio et une taille conformes aux métadonnées. Cela ne constitue pas une réécoute intégrale.

Les 153 entrées Siwis ont été retirées de `public/audio/library.json` et du manifeste de narration. Leurs 306 MP3 (version référencée et ancienne variante) ont été supprimés : **99 600 024 octets**, soit 99,6 Mo / 95,0 Mio. Aucun fichier encore référencé par une narration conservée n'a été supprimé.

## Contenus conservés

596 narrations n'ont pas de remplacement George complet confirmé :

| Catégorie | Narrations conservées |
| --- | ---: |
| Sens français des invocations | 457 |
| Cours Académie | 90 |
| Histoires et moralités | 39 |
| Prophètes | 10 |

La liste détaillée est dans `siwis-retained-2026-11-06.csv`. Des mentions ponctuelles d'une personne ou d'un événement dans un autre livre ne prouvent pas un remplacement complet.

## Livres de remplacement vérifiés

Adam ; Aïcha ; L’appel et la mesure ; L’Ascension ; Les biens et le cœur ; Les compagnons de la caverne ; Croire au milieu des siens ; Le garçon et le roi ; Hajar et Ismail ; Hudaybiyya ; Ibrahim ; Kaab ibn Malik ; Moussa et le serviteur instruit ; Les conseils de Luqman ; Lout ; Maryam et Isa ; Musa ; Moussa — Après la mer ; Nuh ; Le Prophète — Le retour dans La Mecque ; La responsabilité devant le don ; Les royaumes et la justice ; La Sira — Tenir dans l’épreuve ; Dawud et Sulayman ; Une parole entendue ; Des voix dans l’épreuve ; Yusuf.

## Intégration

- Six anciens récits sont désormais reliés explicitement à leur bon chapitre : messagers de la cité, table servie, accueil de l'aveugle, plainte entendue, repentir des trois, conquête de La Mecque.
- Les favoris des narrations retirées deviennent des favoris des livres correspondants. Leurs anciennes secondes ne sont jamais transférées à un texte réécrit.
- Un lien `/listen/library?audio=ancien-identifiant` ouvre le livre et chapitre de remplacement.
- Un catalogue ou manifeste ancien mis en cache ne réintroduit pas les entrées retirées.
- Les scripts de génération, vérification et export respectent le registre `src/data/retiredSiwis.json` et ne régénèrent pas ces narrations.
- Les téléchargements déjà présents sur d'autres appareils ne sont pas effacés à distance. Aucune donnée personnelle n'est supprimée.

## Reproductibilité et réversibilité

`node scripts/audit-siwis-replacements.mjs /chemin/catalogue-public.json --media` vérifie à nouveau les remplacements, sans génération ni consommation ElevenLabs.

Preuves et sauvegarde locale dans `outputs/siwis-cleanup-2026-11-06/` : `audit.json`, `media-check.json`, `siwis-before-removal.tar.gz`. Ce dossier est exclu du dépôt public. Les fichiers restent également récupérables dans l'historique Git.

Vérifications : TypeScript, tests du catalogue, des liens, des favoris et migrations, des manuscrits et du lecteur. Deux clés de session obsolètes des tests BookPage ont été actualisées au préfixe de profil `default` ; les quatre échecs étaient reproductibles avant le nettoyage et disparaissent avec ces fixtures corrigées. Les vérifications ne remplacent pas un essai physique iPhone.

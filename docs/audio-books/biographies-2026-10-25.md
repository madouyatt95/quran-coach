# Dix biographies de Compagnons — édition du 25 octobre 2026

## Périmètre éditorial

Dix biographies françaises originales : Hamza, Jafar, Talha, Az-Zubayr, Abd ar-Rahman ibn Awf, Abu Ubayda, Abdullah ibn Masud, Hafsa, Umm Sulaym et Nusayba. Six chapitres par livre, des origines aux dernières étapes connues, suivis d’un épilogue. Les manuscrits canoniques sont dans `src/data/narrativeBooks/` et leurs exports lisibles dans ce dossier.

Les anciens liens des portraits ouvrent le livre correspondant. Chaque livre conserve son identifiant de personne, sa couverture symbolique originale, ses références et les fonctions communes du lecteur : texte, narration, reprise, ambiance, téléchargement et dispositions adaptées. Aucun enregistrement d’une édition différente ne doit être présenté comme sa narration.

## Sources et droits

Les faits historiques proviennent principalement des notices arabes anciennes de **Siyar a‘lam an-nubala’** d’adh-Dhahabi. Pour Nusayba, **Al-Bidaya wa-n-nihaya** d’Ibn Kathir et **Usd al-ghaba** d’Ibn al-Athir complètent et précisent l’identification. Les témoins des recueils de hadiths sont référencés individuellement et accessibles depuis chaque chapitre. Le degré des traditions hors des deux Sahih est indiqué avec l’auteur de l’évaluation consultée.

Ces œuvres anciennes sont dans le domaine public. Les faits ont été reformulés en français original ; aucune traduction moderne, transcription Wikisource, présentation de site ou texte d’article de Sirayassira n’est reproduit. Le site proposé par le propriétaire a servi de piste de recherche, pas de manuscrit à recopier. Les ornements des couvertures sont des SVG originaux sans personnages.

Les transitions et rapprochements pédagogiques appartiennent à la narration. Aucun dialogue, sentiment intérieur, scène de foule, détail sonore ou geste historique supplémentaire n’est inventé pour allonger les biographies. Aucun texte arabe coranique n’est envoyé à ElevenLabs.

## Points de prudence conservés

- Hamza : scène de conversion identifiée comme tradition biographique ; témoignage de Wahshi distinct ; âge au décès non fixé ; pas de description graphique des mutilations.
- Jafar : parole devant le Négus suivie au discours indirect ; deux émigrations et mort à Muta référencées séparément ; nombres de blessures non cumulés.
- Talha : explications divergentes de l’absence à Badr ; sommes de dons non converties en richesse moderne ; auteur du tir final non imposé comme certain.
- Az-Zubayr : âge à la conversion discuté ; récit de retrait non transformé en dialogue certifié ; témoignage du fils sur les dettes distingué des chroniques militaires.
- Abd ar-Rahman : pas de récit légendaire de réussite ni d’affirmation sur une entrée au Paradis à partir de traditions faibles ; prière et consultation rattachées à leurs témoins.
- Abu Ubayda : épisode controversé du père à Badr non affirmé ; cadre des campagnes syriennes distinct du témoignage de Sargh ; lettres historiques non présentées comme hadiths authentifiés.
- Ibn Masud : désaccords sur le travail des mushafs reconnus sans extrapolation sur l’intégrité du texte ; détails tardifs discutés non fusionnés en scène certaine.
- Hafsa : collecte, garde et copie des feuillets distinguées ; détails familiaux non développés à partir de versions discutées ; variantes de décès signalées.
- Umm Sulaym : prénoms variables ; date de décès non inventée ; deuil non transformé en obligation de dissimulation ou promesse de remplacement d’un enfant.
- Nusayba : longs récits militaires et chaînes passant par al-Waqidi signalés ; identité de la narratrice Umm Umara discutée par Ibn al-Athir ; nombres de blessures et date de mort non fixés.

La recherche éditoriale ne constitue pas une authentification exhaustive de chaque tradition historique. Une relecture religieuse spécialisée reste distincte des contrôles de production.

## Production

Le compte `biographies_compte_4` est limité à **130 000 crédits cumulés**, sans dépassement payant, avec une clé serveur limitée à sept jours. La première clé non raccordée a été désactivée ; sa remplaçante conserve les mêmes droits. Son secret a été transmis directement au Worker Cloudflare, sans fichier local de clé. Aucune ancienne clé n’a été récupérée ou remplacée.

Préparation uniquement :

```
node scripts/prepare-companion-production.mjs --out=/chemin/de/production --credit-ceiling=130000 --verified-rate=0.5 --books=hamza-protection,jafar-deux-rivages,talha-engagement,zubayr-fidelite,abdurrahman-confier,abu-ubayda-confiance,ibn-masud-parole,hafsa-depositaire,umm-sulaym-maison,nusayba-presence
```

L’option `--books` rejette les identifiants inconnus ou répétés. La préparation ne contacte pas ElevenLabs. Les devis réels, réservations, consommations et états sont enregistrés dans le studio. Les appels payants ambigus ne doivent jamais être relancés à l’aveugle.

La publication directe autorisée par le propriétaire utilise la validation documentaire et technique existante. Elle conserve **humanListened: false** ; aucune écoute humaine intégrale n’est attestée.

Les lots de cette production sont limités à 18 segments pour rester sous le budget de sous-requêtes du Worker gratuit. Un seul appel facturable peut être actif par compte : les lots sont enchaînés après la fin du précédent, sans supprimer cette protection contre les doubles dépenses.

Avant publication, une formulation trop affirmative sur la durée des suites des blessures de Nusayba a été remplacée. Seul son sixième chapitre est régénéré. Le premier fichier est conservé à l’état `rejected`, avec une trace de correction éditoriale sans attestation d’écoute ; son coût reste inclus dans le total réel. Les cinq autres chapitres sont réutilisés à texte strictement identique.

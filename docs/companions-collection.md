# Compagnons et compagnes — collection du 24 octobre 2026

## Contenu et remplacement

La collection `/companions` remplace les 22 anciennes biographies courtes par 42 portraits originaux, chacun associé à ses témoignages. Les 22 identifiants déjà utilisés sont conservés ; vingt personnes sont ajoutées. Les anciennes descriptions non documentées, dont la porte arrachée à Khaybar et la citation sur la cité du savoir, ne sont plus utilisées par les fiches ni les quiz générés.

Dix nouveaux livres comprennent chacun trois chapitres : Abu Bakr, Umar, Uthman, Ali, Bilal, Musab, Zayd ibn Thabit, Khadija, Asma et Umm Salama. Le texte préparé pour la narration est exactement celui du lecteur, avec l’épilogue au dernier chapitre. Il ne contient aucune récitation coranique arabe synthétique.

Quatre livres sur Aicha, Abu Dharr, Kab et Jabir reçoivent une édition révisée v2, avec de nouvelles ouvertures de chapitres et les mêmes identifiants pour les repères personnels. Les remplacements sont préparés dans le studio. Leur activation dans le lecteur est conditionnée à la vérification de tous les nouveaux enregistrements, via `activeCompanionEditions.json`. Jusque-là, la lecture et l’écoute déjà publiées restent ensemble dans leur édition actuelle. Le récit sur l’équilibre des droits conserve sa place dans Histoires et moralités. La règle de correspondance exige le titre, la version du manuscrit et le chapitre. Une ancienne version connue ne peut pas réapparaître comme un épisode autonome.

## Sources et rédaction

[Sirayassira](https://www.sirayassira.com/blog-categories/compagnons-prophete-islam) sert de piste de sujets et de références. Aucun de ses articles, visuels ou scripts n’est redistribué. La narration française est une rédaction originale à partir des témoignages anciens arabes référencés, et non une reproduction de traductions modernes.

Le contrôle porte sur les épisodes effectivement présentés, et ne transforme pas les récits en biographies exhaustives. Les titres sont éditoriaux ; les quiz ne les présentent plus comme des surnoms historiquement transmis. Les dates, effectifs, dialogues et pensées non attestés ne sont pas ajoutés. Les références des paragraphes et les notes de méthode se trouvent dans chaque manuscrit, dans l’atelier Livres du studio.

Exemples de références contrôlées :

- Abu Bakr : [Bukhari 3856](https://sunnah.com/bukhari:3856), [3653](https://sunnah.com/bukhari:3653), [3661](https://sunnah.com/bukhari:3661), [3667](https://sunnah.com/bukhari:3667).
- Umar : [Bukhari 3700](https://sunnah.com/bukhari:3700).
- Uthman : [Bukhari 3698](https://sunnah.com/bukhari:3698), [2778](https://sunnah.com/bukhari:2778), [Muslim 2401](https://sunnah.com/muslim:2401).
- Ali : [Bukhari 3701](https://sunnah.com/bukhari:3701), [4416](https://sunnah.com/bukhari:4416), [5361](https://sunnah.com/bukhari:5361).
- Bilal : [Bukhari 3754](https://sunnah.com/bukhari:3754), [604](https://sunnah.com/bukhari:604), [595](https://sunnah.com/bukhari:595), [1149](https://sunnah.com/bukhari:1149).
- Musab : [Bukhari 3925](https://sunnah.com/bukhari:3925), [1276](https://sunnah.com/bukhari:1276), [1275](https://sunnah.com/bukhari:1275).
- Zayd : [Bukhari 7195](https://sunnah.com/bukhari:7195), [4986](https://sunnah.com/bukhari:4986), [4987](https://sunnah.com/bukhari:4987).
- Khadija : [Bukhari 3](https://sunnah.com/bukhari:3), [3820](https://sunnah.com/bukhari:3820), [3821](https://sunnah.com/bukhari:3821).
- Asma : [Bukhari 3907](https://sunnah.com/bukhari:3907), [2620](https://sunnah.com/bukhari:2620), [5224](https://sunnah.com/bukhari:5224).
- Umm Salama : [Muslim 918a](https://sunnah.com/muslim:918a), [920a](https://sunnah.com/muslim:920a), [Bukhari 2731–2732](https://sunnah.com/bukhari:2731).

Les fiches supplémentaires renvoient également à leurs passages précis. La vérification éditoriale des références ne constitue pas une certification religieuse par un spécialiste ni une attestation d’écoute humaine des futures productions.

## Navigation et expérience

- Accès direct depuis le menu, les collections de l’accueil et la bibliothèque.
- Anciennes URL `/prophets?companion=…` et `/prophets?tab=companions` conservées par redirection.
- Couvertures et paysages vectoriels originaux, sans représentation des personnes.
- Recherche française/arabe et variantes de noms, filtres par ensemble et enseignement.
- Favoris compatibles avec ceux des livres, état des filtres conservé au retour.
- Portraits dans une boîte de dialogue native avec gestion du focus et verrouillage de l’arrière-plan.
- Lecteur de livre existant réutilisé : texte, sources, carnet, reprise, immersion, pupitre, ambiances et téléchargement des enregistrements publiés.

## Production et budget

La nouvelle autorisation est un plafond de **100 000 crédits sur le nouveau compte**, sans dépassement payant ni changement automatique de compte. Un autre compte ne remet pas à zéro le budget d’un compte précédent.

Préparer les scripts sans appel payant :

```sh
node scripts/prepare-companion-production.mjs --out=/tmp/qc-companions-production
```

Le manifeste contient les textes exacts, leurs empreintes, les références et les tailles. Le tarif est laissé vide tant qu’il n’a pas été vérifié sur le nouveau compte. Une option `--verified-rate=…` permet un calcul préparatoire ; seul le devis du serveur et le coût fournisseur rapproché font foi. La préparation ne crée ni clé, ni autorisation serveur, ni tâche payante.

Le raccordement d’un nouveau compte exige une clé limitée conservée uniquement dans le Worker. Le quota disponible, l’éligibilité du compte, les dépassements désactivés et l’autorisation datée doivent être vérifiés avant génération. Les contrôles atomiques, la déduplication et la reprise sans répétition d’un appel ambigu restent ceux du studio existant.

**Au stade de cette livraison, les nouveaux manuscrits sont lisibles ; aucun nouvel enregistrement ElevenLabs n’a été lancé.** Le navigateur connecté est signalé mais son contrôle n’est pas disponible dans cette session, ce qui empêche de raccorder le nouveau compte. Les livres hors de ce remplacement conservent leurs audios ; les quatre remplacements attendent leurs nouveaux enregistrements avant activation.

## Vérification

Les tests ciblés couvrent les 42 identités, les anciens liens, les correspondances de version et de chapitre, le texte découpé sans perte, les catégories, la recherche et les quiz. Le contrôle visuel automatisé utilise un navigateur isolé ; il ne constitue pas un essai physique sur iPhone ou iPhone pliable. La génération réelle et le coût du nouveau compte restent non testés tant que son accès serveur n’est pas configuré.

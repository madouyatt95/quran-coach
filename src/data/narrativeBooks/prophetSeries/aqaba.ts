import {defineBook} from '../defineBook';
import {nectar,sahih} from './sources';
const history=nectar('nectar-aqaba','PDF fourni, pages 194–218 : premiers contacts avec Yathrib, Musab et les engagements de Aqaba.');
const buath=sahih('bukhari','3777','Aïcha rappelle les divisions et les pertes de Buath avant l’arrivée du Prophète.');
const pledge=sahih('bukhari','18','Ubada ibn as-Samit transmet les exigences de la foi et de la conduite dans l’engagement reçu.');
const teaching=sahih('bukhari','3925','Al-Bara témoigne de l’enseignement du Coran par Musab et Ibn Umm Maktum avant l’arrivée du Prophète.');
export const prophetAqabaBook=defineBook({id:'prophete-aqaba',version:'prophete-aqaba-2026-10-31-v1',title:'Le Prophète · Yathrib ouvre une voie',subtitle:'Des premières rencontres à l’engagement de protéger le Messager',category:'prophet',checkedAt:'2026-10-31',scope:{kind:'episode',description:'Les rencontres de Aqaba, la mission de Musab et la préparation de l’accueil à Yathrib.'},note:'Les étapes et nombres traditionnels viennent de la Sira, distingués des témoignages de Bukhari. Le hadith 18 atteste le contenu moral de la bayaa et identifie Ubada comme participant de Aqaba, sans fournir à lui seul toute la datation des rencontres. Pas de dialogues reconstitués, de cri attribué à un démon ni de conversion simultanée de toute la ville. Les femmes de la seconde rencontre sont nommées selon le cadre biographique : Nusayba bint Kab et Asma bint Amr.',chapters:[{id:'accueil',title:'Yathrib ouvre une voie',sections:[
{title:'Une ville marquée par ses propres épreuves',refs:[history,buath],text:`Au nord de La Mecque se trouve Yathrib, l’oasis qui sera connue comme Médine. Des familles y vivent de leurs terres, de leurs palmeraies, de leurs échanges et des relations qui les unissent. La ville ne forme pas une communauté sans divisions. Les Aws et les Khazraj y ont connu des affrontements, auxquels se mêlent des alliances avec des groupes juifs.

La bataille de Buath a laissé des morts et des blessures parmi les chefs. Aïcha rappellera plus tard que cette situation avait préparé un contexte dans lequel l’appel du Prophète pouvait être accueilli. Cela ne rend pas la guerre heureuse pour ceux qui l’ont subie. Le témoignage regarde, depuis la suite de l’histoire, comment une société éprouvée a rencontré une autre possibilité.

Lorsque des habitants de Yathrib viennent dans la région de La Mecque, ils ne sont donc pas des visiteurs sans passé. Ils portent les rivalités de leur ville et l’expérience de ce qu’elles coûtent. Entendre un appel capable de rassembler autour d’Allah peut ouvrir une perspective différente.

Cette perspective ne se réalise pas en un jour. Le Prophète doit rencontrer des personnes, leur exposer le message et les laisser repartir avec ce qu’elles ont entendu. Avant l’émigration et l’accueil public, il y a ce commencement plus modeste : quelques hommes qui écoutent et retournent chez eux.`},
{title:'Une première réponse',refs:[history],text:`La tradition biographique situe une première rencontre décisive avec un petit groupe de Khazraj. Ils entendent le Prophète et répondent à son appel. Le retour vers Yathrib ne clôt pas cette rencontre ; il en prolonge l’effet.

Chez eux, ils parlent de ce qu’ils ont découvert. L’islam commence à être connu dans d’autres maisons. Il ne dépend plus seulement de la présence physique du Messager devant chaque auditeur. Ceux qui l’ont entendu deviennent des témoins auprès des leurs.

Le changement est important après les refus reçus ailleurs. Une possibilité existe désormais au-delà de La Mecque. Mais il serait trop tôt pour imaginer toute une ville prête à recevoir les émigrés. Une poignée de croyants ne peut pas, à elle seule, garantir les choix de chaque famille ni effacer les anciennes querelles.

C’est pourquoi la suite passe par la durée. Il faut revenir, apprendre davantage, préciser ce que l’on accepte et ce que l’on promet. Le lien entre La Mecque et Yathrib se construit à travers des voyages. Les saisons de pèlerinage, qui réunissent des hommes de différentes régions, deviennent aussi des occasions de retrouver le Prophète. La mission trouve un chemin dans des déplacements qui existaient déjà, mais auxquels la foi donne désormais un autre sens.`},
{title:'Un engagement qui touche la conduite',refs:[history,pledge],text:`Lors de la rencontre suivante, un groupe plus nombreux s’engage auprès du Prophète. La Sira désigne cette étape comme la première bayaa de Aqaba et y compte traditionnellement douze hommes. Le mot bayaa signifie ici un engagement reçu, qui lie la reconnaissance de la mission à une conduite.

Ubada ibn as-Samit, qui a participé aux événements de Aqaba, transmet les exigences rappelées par le Prophète : n’associer personne à Allah, ne pas voler, ne pas commettre de relations sexuelles illicites, ne pas tuer ses enfants, ne pas répandre une accusation mensongère et ne pas désobéir dans ce qui est convenable.

Ce contenu mérite que l’on s’y arrête. L’appel ne demande pas seulement de prononcer une appartenance. Il touche la vie des familles, la sécurité des personnes, les biens et la réputation. La communauté qui commence à se former doit apprendre ce que la foi change dans ses actes.

Le Prophète rappelle également la responsabilité devant Allah, la possibilité du pardon et le jugement qui Lui appartient. L’engagement est sérieux sans prétendre que ceux qui le prennent deviendront incapables de faute. Il leur donne une orientation et une obligation de fidélité. Avant même que la nouvelle cité accueille le Messager, ses futurs habitants apprennent ainsi que le lien religieux comprend des devoirs envers les autres.`},
{title:'Envoyer quelqu’un pour enseigner',refs:[history,teaching],text:`Les croyants de Yathrib ont besoin d’un enseignement qui accompagne leur retour. Le Prophète envoie Musab ibn Umayr. Ce jeune homme a connu l’opposition de sa famille à La Mecque et l’expérience de la foi vécue sans les facilités de son ancienne condition.

Sa mission ne consiste pas à réciter une liste de consignes puis à repartir. Il doit enseigner le Coran, expliquer l’islam et rencontrer les personnes qui souhaitent comprendre. La tradition biographique le place auprès de Asad ibn Zurara, qui l’accueille et l’aide dans ses démarches.

Al-Bara ibn Azib, un habitant de Médine, gardera le souvenir de Musab et de Ibn Umm Maktum enseignant le Coran avant l’arrivée du Prophète. Lui-même connaissait déjà la sourate Al-Ala et d’autres sourates lorsque le Messager entra dans la ville.

Ce témoignage rend l’apprentissage visible. La préparation de l’accueil n’est pas seulement politique. Des personnes apprennent déjà à réciter, à prier et à reconnaître le message. La voix du Coran précède l’arrivée de celui qui le transmet.

Musab participe ainsi à un changement qui ne se mesure pas uniquement au nombre de conversions. Il rend possible une compréhension partagée. Les futurs accueillants ne recevront pas un homme dont ils ne savent rien : ils auront commencé à vivre selon la révélation qu’il apporte.`},
{title:'Des maisons où l’on accepte d’écouter',refs:[history],text:`La Sira rapporte plusieurs rencontres de Musab avec des hommes influents de Yathrib, notamment Usayd ibn Hudayr et Saad ibn Muadh. Ils ne viennent pas d’abord tous avec l’intention de rejoindre les croyants. L’enseignement se fait dans une ville où chaque nouvelle initiative peut toucher les équilibres entre familles.

Le récit biographique retient qu’ils acceptent d’écouter, puis embrassent l’islam. Nous pouvons suivre ce mouvement sans reconstruire chaque réplique ni décrire comme certaines des expressions de visage rapportées dans les versions développées.

La place sociale de ces hommes donne à leur choix une portée au-delà de leur seule personne. Des proches qui hésitaient regardent autrement ce qui est enseigné. L’appel entre dans d’autres relations. Pourtant, la conversion d’un chef ne transforme pas mécaniquement toutes les consciences de son groupe.

Yathrib reste diverse. Certains répondent, d’autres attendent ou refusent. Cette diversité doit rester dans notre récit, car elle sera encore présente après l’Hégire. L’installation du Prophète ne se fera pas dans une ville devenue uniforme avant son arrivée.

Ce qui grandit, c’est un noyau assez solide pour envisager davantage qu’une écoute occasionnelle. Des croyants commencent à se demander ce qu’ils peuvent faire pour celui qui les a guidés. Ils ne veulent plus que leur lien avec lui se limite à des rencontres lointaines pendant les saisons de pèlerinage.`},
{title:'Une rencontre dans la nuit',refs:[history],text:`Lors d’une nouvelle venue à La Mecque, les musulmans de Yathrib conviennent d’une rencontre discrète avec le Prophète à Aqaba. La tradition biographique rapporte la présence de plus de soixante-dix hommes et de deux femmes, Nusayba bint Kab et Asma bint Amr.

La discrétion répond au danger. Les opposants mecquois n’accueilleraient pas avec indifférence un accord permettant au Messager de trouver ailleurs une protection durable. Ceux qui viennent doivent mesurer ce qu’ils s’apprêtent à promettre.

Al-Abbas, l’oncle du Prophète, est présent dans le récit de cette rencontre. Il souligne le poids de la responsabilité. Protéger Muhammad ne sera pas seulement lui souhaiter la bienvenue. Cela pourra exposer les habitants de Yathrib à ceux qui le combattent déjà.

Les récits de la Sira conservent les questions posées et les engagements pris. Leur mouvement général est celui d’une décision réfléchie : les accueillants acceptent de défendre le Prophète comme ils défendent les leurs. Ils ne reçoivent pas la promesse d’une vie sans épreuve.

Cette nuit donne donc une autre dimension à leur foi. Les hommes et les femmes qui ont appris à suivre le message consentent à en accueillir le messager au milieu de leurs maisons. Une relation d’enseignement devient aussi un engagement de protection, avec les conséquences matérielles et humaines que cela suppose.`},
{title:'Des responsables, puis des départs',refs:[history],text:`La rencontre ne se termine pas par une émotion laissée sans suite. La tradition rapporte le choix de douze représentants parmi les accueillants. Ils doivent porter une responsabilité auprès des leurs. L’accord se traduit ainsi par une organisation, à l’échelle d’une communauté encore en formation.

Puis chacun doit regagner son groupe et reprendre la route. Les récits rapportent l’inquiétude de Quraysh lorsque la nouvelle de l’engagement circule. Une sortie de La Mecque ne serait plus une émigration isolée vers un souverain lointain : elle pourrait conduire à la formation d’une communauté dans une ville du Hijaz.

Pour les croyants mecquois, la possibilité devient concrète. Il existe désormais des personnes prêtes à les recevoir. Cela ne signifie pas que partir sera facile. Les biens, les familles et les dépendances demeurent à La Mecque. Certains devront quitter presque tout ; d’autres rencontreront des obstacles dressés par leurs proches.

Le Prophète n’efface pas ces difficultés par une annonce générale de succès. L’Hégire se prépare à travers des décisions individuelles, des départs successifs et des précautions. Ce qui a commencé par quelques visiteurs qui écoutent ouvre maintenant une route que des foyers entiers devront emprunter.`},
{title:'Ce que signifie accueillir',refs:[[59,8,9],history,teaching],text:`Le Coran honorera ceux qui ont été chassés de leurs demeures et de leurs biens, puis ceux qui les ont accueillis avec amour. Ces derniers seront appelés les Ansar, les auxiliaires. Ce nom gardera la mémoire d’une action : ils ont apporté un soutien quand il fallait un lieu où vivre la foi.

L’accueil n’est pas achevé au moment où l’on promet. Il faudra ensuite partager l’espace, aider les nouveaux arrivants, permettre à ceux qui ont perdu leurs moyens de retrouver une activité et construire une vie commune. La promesse de Aqaba ouvre ce travail ; elle ne l’accomplit pas à la place des habitants.

Avant de suivre la route de l’Hégire, retenons la succession qui l’a rendue possible. Des hommes ont écouté. Ils sont revenus chez eux. Un enseignant les a accompagnés. D’autres maisons ont entendu le Coran. Puis des croyants ont accepté de protéger le Messager.

Aucun de ces gestes ne suffit seul à raconter tout le changement. Ensemble, ils montrent comment une possibilité devient un engagement. La ville qui portait encore les blessures de ses rivalités se prépare à recevoir une communauté nouvelle. Le Prophète n’y est pas encore arrivé. Mais des personnes l’attendent désormais, et cette attente va changer le sens de son prochain départ.`},
]}],epilogue:'Yathrib a donné une réponse. Il reste maintenant à quitter La Mecque, à traverser le danger et à rejoindre ceux qui ont promis d’accueillir.',lessons:['Un accueil durable se prépare par l’enseignement et des engagements concrets.','Une société peut apprendre à dépasser ses anciennes rivalités.','Protéger implique de mesurer les responsabilités avant de promettre.'],question:'Qu’est-ce qui transforme une bonne intention d’accueil en un soutien réellement fiable ?'});

import {defineBook} from '../defineBook';
import {nectar,sahih} from './sources';
const history=nectar('nectar-enfance','PDF fourni, pages 81–89 : famille, naissance, nourrices et protection familiale');
const monday=sahih('muslim','1162e','Le lundi, jour de sa naissance, évoqué à propos du jeûne.');
const chest=sahih('muslim','162c','Rapport d’Anas sur l’ouverture de la poitrine durant l’enfance.');
const mother=sahih('muslim','976b','La visite à la tombe de sa mère et les larmes du Prophète.');
const shepherd=sahih('bukhari','2262','Il a gardé les moutons des habitants de La Mecque contre une rémunération.');

export const prophetChildhoodBook=defineBook({
 id:'prophete-enfance',version:'prophete-enfance-2026-10-31-v1',title:'Le Prophète · L’enfant recueilli',subtitle:'Amina, Halima et les maisons qui l’accueillent',category:'prophet',checkedAt:'2026-10-31',
 scope:{kind:'episode',description:'Deuxième étape chronologique : naissance, enfance et premiers moyens de subsistance.'},
 note:'La naissance un lundi est attestée par Muslim. Le jour du mois n’est pas fixé ici. Les âges de six et huit ans et les étapes familiales proviennent de la synthèse biographique. Aucun dialogue de Halima, signe dans les palais, détail du moine Bahira ou sentiment intérieur de l’enfant n’est reconstruit. Le passage sur la tombe de sa mère est annoncé comme un retour bien plus tardif.',
 chapters:[{id:'enfance',title:'L’enfant recueilli',sections:[
 {title:'Un enfant parmi les Banu Hashim',refs:[history,monday],text:`Après la ville et ses routes, notre récit se rapproche d’une famille. Abdullah appartient aux Banu Hashim. Son épouse Amina est issue des Banu Zuhra. Leur fils grandira à La Mecque, au milieu de ces liens de parenté qui situent chacun dans la cité. Il portera le nom de Muhammad. Mais, dès les premières lignes de son histoire, une absence apparaît : celle de son père.

Le récit biographique le plus couramment retenu situe la mort d’Abdullah avant la naissance de son fils. D’autres datations ont été transmises ; nous suivons ici la première, sans transformer une divergence ancienne en une précision imaginaire. Abdullah meurt à Yathrib, la ville que l’on connaîtra plus tard sous le nom de Médine. Avant même de devenir le lieu de l’émigration, elle appartient ainsi à l’histoire familiale du Prophète.

Sa naissance est traditionnellement située dans l’année de l’Éléphant. Quant au lundi, le renseignement vient de sa propre parole, rapportée dans Sahih Muslim à propos du jeûne. Le jour exact du mois ne fait pas l’objet du même accord. Retenir le lundi et laisser le reste à la discussion des historiens ne retire rien à cette naissance. Cela nous permet simplement de commencer avec les repères que nous pouvons soutenir.

L’enfant naît donc dans une famille connue, mais il ne connaît pas la présence de son père. Amina est là. Son grand-père Abd al-Muttalib est là aussi. La vie qui commence n’est pas sans entourage ; elle est déjà marquée par la différence entre avoir des proches et avoir encore ses deux parents.`},
 {title:'La parenté du lait',refs:[history],text:`Les premières années ne se déroulent pas uniquement auprès d’Amina. Les biographies nomment plusieurs femmes qui prennent part à l’allaitement du Prophète. Parmi elles se trouvent Thuwayba et Halima. Cette dernière appartient aux Banu Saad, et c’est auprès d’elle qu’une partie de son enfance se déroule, loin du foyer mecquois.

Confier un jeune enfant à une nourrice extérieure à la ville est une pratique connue dans ce milieu. Elle met en relation des familles qui ne partagent pas le même toit ni toujours le même mode de vie. L’enfant reçoit des soins dans un autre foyer, puis retrouve sa famille. Pour suivre cette histoire, il faut donc garder ensemble plusieurs lieux et plusieurs personnes, au lieu de chercher une seule maison où se serait passée toute son enfance.

Le nom de Halima est resté particulièrement attaché à ces années. Les ouvrages de biographie développent son voyage, les difficultés de sa famille et les bénédictions qu’elle aurait constatées. Tous les détails de ces récits n’ont cependant pas été retenus dans notre narration. Nous conservons l’étape essentielle : Muhammad est confié à cette nourrice, chez les Banu Saad, et y passe une partie de ses premières années.

Cette présence compte dans la suite d’une biographie. Autour de l’enfant se tissent des liens qui ne sont pas seulement ceux de la naissance. Les familles de lait ont leur place dans la société et, plus tard, dans les règles de parenté enseignées par l’islam. Ici, avant d’être une question de droit, ce sont des personnes qui accueillent et nourrissent un enfant.`},
 {title:'Un événement transmis par Anas',refs:[chest,history],text:`Un événement de cette période est rapporté dans Sahih Muslim. Muhammad joue avec d’autres enfants lorsque Jibril vient à lui. Le rapport décrit l’ouverture de sa poitrine, l’extraction de son cœur et le retrait d’un caillot, puis son lavage avec l’eau de Zamzam et sa remise en place. Les enfants courent prévenir sa nourrice, croyant qu’il a été tué. On le retrouve vivant, le teint changé. Anas, qui transmet ce récit, mentionne la trace qu’il avait vue sur sa poitrine.

Le texte nous laisse ainsi deux plans : l’événement extraordinaire lui-même et la réaction de ceux qui se trouvent autour de l’enfant. Nous nous arrêtons à ce qu’il transmet. Il ne donne pas de paroles à Muhammad dans cette scène, et nous ne lui en attribuons pas. Les biographies situent ensuite son retour auprès d’Amina après cette période chez la nourrice.

Notre chemin revient donc à La Mecque et à sa mère. Les années de la nourrice ne sont pas toute son enfance ; elles en constituent une étape. Amina retrouve auprès d’elle un enfant qui a grandi, tandis que son histoire familiale garde encore l’empreinte de la mort d’Abdullah.`},
 {title:'Le voyage avec Amina',refs:[history],text:`Vers l’âge de six ans, selon la chronologie biographique habituelle, Muhammad accompagne sa mère à Yathrib. Umm Ayman fait partie de ce voyage. Son nom, également transmis comme Baraka, restera associé aux premières années du Prophète. Nous la rencontrons ici au moment où la famille se déplace entre deux villes dont les noms reviendront tout au long de la Sira.

Le séjour à Yathrib précède un retour vers La Mecque. Mais Amina n’achève pas ce retour. Elle tombe malade et meurt à Al-Abwa, sur le chemin entre les deux villes. La biographie rejoint alors un fait simple et lourd : l’enfant a perdu sa mère, après avoir déjà perdu son père.

Il n’est pas nécessaire d’inventer la dernière conversation entre eux pour saisir ce changement. Aucun dialogue d’adieu n’est placé dans notre récit. Ce qui peut être dit suffit : celle avec laquelle il était parti ne revient pas avec lui. Les personnes qui l’entourent doivent désormais poursuivre son accueil et sa protection sans elle.

En entrant dans cette partie de sa vie, nous rencontrons un enfant dont les attaches changent plusieurs fois. La ville reste La Mecque, la parenté reste présente, mais le foyer n’est plus celui d’Amina. La mort ne supprime pas les liens ; elle oblige ceux qui demeurent à porter une responsabilité nouvelle. C’est vers son grand-père que le récit se tourne maintenant.`},
 {title:'Chez son grand-père',refs:[history],text:`Abd al-Muttalib prend soin de son petit-fils. Il occupe une place reconnue parmi les siens et dans la vie du sanctuaire. Pour l’enfant, cette figure familiale devient le principal appui après la disparition d’Amina. La biographie décrit l’attention particulière qu’il lui porte et la proximité qu’il lui accorde.

Nous ne transformons pas cette attention en une enfance sans manque. Être accueilli n’efface pas une perte. Cela signifie qu’une personne prend le relais, ouvre sa maison et reconnaît une responsabilité. Dans une société où la protection du groupe compte beaucoup, ce geste donne aussi à l’enfant une place clairement soutenue au milieu de sa parenté.

Mais cette période est courte. Le récit traditionnel situe la mort d’Abd al-Muttalib lorsque Muhammad a environ huit ans. Un autre adulte qui le protégeait disparaît donc. La continuité de son accueil doit à nouveau être assurée. Avant sa mort, son grand-père le confie à Abu Talib, l’un des frères d’Abdullah.

À travers ces noms, une succession se dessine : Amina, puis Abd al-Muttalib, puis Abu Talib. Ce ne sont pas trois versions concurrentes de son enfance. Ce sont des étapes. Les retenir dans cet ordre nous aidera à comprendre la place de chacun lorsque les souvenirs familiaux et les fidélités anciennes reviendront dans les années de la mission.`},
 {title:'La maison d’Abu Talib',refs:[history],text:`Muhammad grandit désormais auprès d’Abu Talib. Son oncle l’accueille parmi les siens. La relation qui se construit à cette époque durera bien au-delà de l’enfance. Lorsque la mission commencera et que l’hostilité augmentera, Abu Talib sera encore celui dont la protection compte dans la cité. Cette histoire de soutien a donc commencé longtemps avant les affrontements publics.

Pour l’instant, il s’agit de grandir. Les premières années ne sont pas encore celles des discours adressés à Quraysh ni des départs des croyants vers d’autres terres. Muhammad vit dans la société que nous avons découverte au chapitre précédent, avec ses familles, ses échanges et ses obligations. Il y sera connu avant que la révélation ne lui soit confiée.

Les biographies racontent aussi des voyages de jeunesse. Certaines scènes, devenues très célèbres, comportent des détails dont la transmission est discutée. Nous ne les utilisons pas pour remplir les années dont nous connaissons moins de choses. Une vie réelle n’est pas conservée jour après jour dans les sources. Le silence entre deux faits n’est pas un espace où le narrateur peut placer ce qu’il souhaite.

Ce que nous pouvons suivre est déjà important : l’enfant orphelin devient un jeune homme au sein de cette famille. La protection reçue ne le dispense pas d’une vie de travail. Nous disposons, sur ce point, d’un témoignage direct qui nous fait quitter les seuls récits familiaux pour rencontrer une activité concrète.`},
 {title:'Garder les troupeaux',refs:[shepherd],text:`Dans Sahih al-Bukhari, le Prophète évoque le fait que les prophètes ont gardé des moutons. Interrogé à son propre sujet, il confirme avoir gardé ceux des habitants de La Mecque, contre une rémunération. Ce souvenir nous présente un jeune homme qui travaille, reçoit une charge et en tire de quoi vivre.

Le récit ne précise pas ses journées ni les parcours de ses troupeaux. Nous n’avons donc pas à imaginer une scène particulière pour lui donner du relief. Garder les animaux d’autrui est déjà une responsabilité intelligible : on ne dispose pas librement de ce qui a été confié, et l’activité se rapporte à une personne qui en attend le soin.

Plus tard, nous le rencontrerons dans le commerce, puis dans sa vie familiale avec Khadija. Avant cela, ce témoignage rappelle que sa jeunesse comprend un travail rémunéré. La mission prophétique ne fera pas disparaître ce passé de sa mémoire ; il en parlera lui-même à ses compagnons.`},
 {title:'Une absence qui n’est pas oubliée',refs:[mother,[93,6,11]],text:`Pour mesurer la place d’Amina, avançons un instant bien au-delà de l’enfance. Muslim rapporte qu’une fois devenu Prophète, il visite la tombe de sa mère. Il pleure, et ceux qui l’entourent pleurent aussi. Le récit rapporte les limites de l’autorisation reçue concernant cette visite et rappelle que les tombes ramènent à la pensée de la mort. Nous n’en faisons pas une scène de ses six ans : elle appartient à une période ultérieure de sa vie.

Ce retour plus tardif laisse apparaître une continuité. La mission, les responsabilités et les années écoulées n’ont pas rendu sa mère étrangère à son histoire. La biographie ne commence pas seulement à la première révélation. Les personnes qui l’ont accueilli, et celles qu’il a perdues, appartiennent pleinement à la vie que nous cherchons à connaître.

La sourate Ad-Duha rappellera également au Prophète sa condition d’orphelin et l’accueil qu’Allah lui a accordé. Le rappel est suivi d’exigences envers l’orphelin et celui qui demande. Ce regard rétrospectif relie un bienfait reçu à la manière de traiter autrui. Il ne réduit pas la révélation à une explication psychologique de l’enfance ; il donne à cette mémoire une place dans l’enseignement.

Nous pouvons maintenant reprendre le fil du temps. L’enfant a grandi. Des personnes lui ont offert leur protection, un travail a fait partie de sa jeunesse, et il avance vers l’âge adulte. La prochaine étape nous conduira vers Khadija, vers le foyer qu’ils construiront et vers la confiance que son entourage lui reconnaît avant même de l’entendre annoncer sa mission.`},
 ]}],epilogue:'Après les maisons qui l’ont accueilli vient le foyer qu’il fonde. C’est auprès de Khadija que se poursuivra notre récit.',
 lessons:['Situer les étapes de l’enfance sans inventer les souvenirs manquants.','Reconnaître le rôle d’Amina, de Halima, du grand-père et d’Abu Talib.','Distinguer la chronologie biographique des témoignages des recueils authentiques.'],question:'Quelle personne de son enfance souhaitez-vous mieux connaître ?',
});

import {defineBook} from '../defineBook';
import {nectar,sahih} from './sources';
const history=nectar('nectar-uhud','PDF fourni, pages 338–394 : Uhud et les lendemains de la bataille.');
const archers=sahih('bukhari','4043','Al-Bara rapporte la consigne donnée aux archers, leur départ et le retournement de la bataille.');
const wounds=sahih('bukhari','4075','Sahl rapporte les blessures du Prophète et les soins apportés par Fatima et Ali.');
const musab=sahih('bukhari','4047','Mort de Musab ibn Umayr et pauvreté de son linceul.');
const hamza=sahih('bukhari','4072','Wahshi rapporte la mort de Hamza.');
const pursuit=sahih('bukhari','4077','Des compagnons répondent après leurs blessures, dont Abu Bakr et az-Zubayr.');
export const prophetUhudBook=defineBook({id:'prophete-uhud',version:'prophete-uhud-2026-10-31-v1',title:'Le Prophète · Uhud, traverser la blessure',subtitle:'Le revers, les absents et la révélation qui relève',category:'prophet',checkedAt:'2026-10-31',scope:{kind:'episode',description:'Uhud en l’an 3 de l’Hégire et ses suites immédiates.'},note:'Récit sans reconstitution sanglante ni paroles inventées. Les soins historiques ne constituent pas des conseils médicaux. Les détails et dates secondaires relèvent de la Sira ; les enseignements sont rattachés à Al Imran.',chapters:[{id:'uhud',title:'Uhud, traverser la blessure',sections:[
{title:'Une montagne devant Médine',refs:[history,[3,121,122]],text:`Une armée mecquoise se rapproche de Médine. Depuis Badr, Quraysh a préparé sa revanche. Cette fois, la communauté sait qu’une confrontation importante se présente. Le Prophète consulte ses compagnons sur la manière de faire face.

Rester dans la ville ou sortir à la rencontre de l’adversaire : la décision engage les habitants, leurs familles et ceux qui combattront. La tradition historique rapporte le désir de plusieurs compagnons de sortir, notamment parmi ceux qui n’avaient pas participé à Badr. Le Prophète se prépare finalement à conduire les hommes hors de Médine.

La montagne de Uhud se trouve au nord de la cité. Elle va donner son nom à une journée dont le souvenir ne sera pas celui d’une victoire comparable à Badr. Pourtant, ceux qui se mettent en marche ne connaissent pas encore la suite. Ils portent leurs espérances, leur foi et leurs limites.

En chemin, une partie des hommes se retire. La troupe qui poursuit la marche se trouve réduite. Le Prophète continue et organise les positions. Le Coran gardera la mémoire de ce départ et des cœurs éprouvés avant même le combat. L’épreuve commence déjà dans la manière de tenir un engagement lorsque le danger se rapproche.`},
{title:'Une consigne qui protège tous les autres',refs:[archers,history],text:`Le Prophète confie un poste à un groupe d’archers sous la responsabilité de Abdullah ibn Jubayr. Leur mission est précise : ils doivent rester en place. La consigne ne dépend pas de ce qu’ils penseront voir du déroulement du combat.

Al-Bara rapporte cette instruction en soulignant sa force. Même si les musulmans paraissent victorieux, les archers ne doivent pas abandonner leur position. Même si la situation tourne contre eux, ils ne doivent pas quitter le poste pour rejoindre le reste des hommes.

Cette responsabilité peut sembler moins visible que celle de ceux qui affrontent directement l’adversaire. Pourtant, elle protège l’ensemble. La sécurité d’un groupe dépend parfois d’une tâche dont l’importance devient surtout perceptible lorsqu’elle n’est plus remplie.

Le combat s’engage et les musulmans prennent d’abord l’avantage. Le camp adverse recule. Pour certains archers, le danger paraît passé. Les biens abandonnés attirent leur attention et ils envisagent de rejoindre ceux qui les recueillent.

Abdullah ibn Jubayr rappelle la consigne. Mais une partie du groupe quitte le poste malgré son rappel. Le récit ne présente pas ce départ comme une simple erreur d’observation sans responsabilité. Il conserve le commandement reçu, la discussion et la décision qui va exposer les autres combattants.`},
{title:'Le retournement',refs:[archers,history,[3,152,153]],text:`La situation change brutalement. La position abandonnée permet à la cavalerie adverse de peser de nouveau sur le combat. Les musulmans se trouvent menacés alors qu’une victoire leur avait paru proche. L’ordre se défait et la confusion gagne les rangs.

Le Coran évoque les hommes qui s’éloignent pendant que le Messager les appelle. Il rappelle aussi la discussion, la désobéissance et la diversité des intentions. Certains désiraient les biens de ce monde, d’autres l’au-delà. Cette parole ne laisse pas la communauté expliquer son revers uniquement par la force de l’ennemi.

La rumeur de la mort du Prophète circule. Elle ajoute une inquiétude immense à une situation déjà bouleversée. Des compagnons restent auprès de lui et le défendent. Le Messager est vivant, mais il est blessé.

Cette journée met à nu une vérité difficile : avoir connu le secours à Badr ne dispensait pas d’écouter à Uhud. La communauté ne possède pas une garantie qui rendrait sans conséquence chacune de ses décisions. Elle est appelée à agir, à répondre de ses choix et à apprendre.

Le récit n’a pas besoin de rendre chaque instant spectaculaire. Le contraste suffit : quelques heures plus tôt, la victoire semblait proche ; maintenant, il faut préserver les vies, retrouver les hommes et empêcher que le désordre ne devienne un effondrement.`},
{title:'Auprès du Messager blessé',refs:[wounds,history],text:`Le Prophète a reçu des blessures au visage et une dent a été brisée. Son casque a également été endommagé. Sahl ibn Saad rapporte les soins qui lui sont apportés, et les noms de ceux qui sont auprès de lui.

Fatima lave la blessure de son père. Ali verse de l’eau à l’aide d’un bouclier. Lorsque l’eau ne suffit pas à arrêter le saignement, Fatima emploie les cendres d’un morceau de natte brûlé. Le témoignage conserve cette manière ancienne de soigner, sans qu’elle doive être prise comme une recommandation médicale pour aujourd’hui.

La scène rapproche le lecteur de la réalité humaine du Messager. Il souffre, il saigne et il reçoit l’aide des siens. Sa mission ne le place pas à l’abri de la douleur. Ceux qui l’aiment ne peuvent supprimer ce qui vient de se produire ; ils peuvent être présents et lui porter secours.

Autour de lui, la communauté tente de se rassembler. La priorité immédiate n’est pas de donner une explication complète de la journée, mais de tenir, de protéger et de soigner. L’enseignement viendra aussi dans la révélation. Pour l’instant, les gestes de Fatima et de Ali rappellent que la fidélité se manifeste parfois dans une proximité silencieuse, au plus près d’une blessure.`},
{title:'Les visages qui manqueront',refs:[musab,hamza,history],text:`Hamza ne reviendra pas. L’oncle du Prophète, qui l’avait soutenu à La Mecque et avait combattu à ses côtés, est tué à Uhud. Wahshi racontera lui-même, des années plus tard, comment il l’a atteint. Le récit authentique permet de nommer cette perte sans développer une scène sanglante.

Musab ibn Umayr est également parmi les morts. Il avait été envoyé à Yathrib pour enseigner le Coran et avait contribué à préparer l’accueil du Messager. Sa vie relie les premières difficultés de La Mecque à l’installation médinoise.

Khabbab se souvient de son ensevelissement. Le tissu disponible est trop court pour couvrir à la fois sa tête et ses pieds. Le Prophète demande que sa tête soit couverte et que des herbes soient placées sur ses pieds. Cette simplicité marque durablement la mémoire de ceux qui l’entourent.

Les morts ne sont pas seulement un nombre dans le bilan d’une bataille. Ils ont enseigné, voyagé, accueilli et aimé. Certains ont quitté une vie aisée ; d’autres ont longtemps supporté la persécution. À Uhud, leurs compagnons doivent leur faire une dernière place dans la terre et apprendre à poursuivre sans eux. La communauté porte désormais des absences qui ne disparaîtront pas avec le retour à Médine.`},
{title:'Une révélation qui ne cache pas la faute',refs:[[3,139,144],[3,152,159]],text:`La sourate Al Imran accompagne la communauté dans l’après-Uhud. Elle ne raconte pas la défaite en effaçant ce qui l’a rendue possible. Elle nomme les hésitations et les fautes, mais elle n’abandonne pas les croyants à la honte.

Le Coran rappelle que les blessures atteignent aussi les adversaires et que les jours de succès se succèdent entre les hommes. Il appelle à ne pas perdre courage. Il affirme également que Muhammad est un messager, précédé par d’autres messagers. Sa mort ne saurait devenir une raison de revenir sur la foi.

Cette parole répond à la secousse provoquée par la rumeur. L’attachement au Prophète est immense, mais l’adoration appartient à Allah. La mission du Messager conduit vers Lui ; elle ne doit pas devenir une dépendance qui s’effondrerait devant la mortalité de l’homme aimé.

La révélation réunit ainsi lucidité et relèvement. Elle n’enseigne ni le déni de la responsabilité ni le désespoir. Les croyants doivent comprendre, demander pardon et continuer. Le revers n’est pas transformé en preuve qu’ils auraient été définitivement abandonnés. Il devient une épreuve à travers laquelle leur foi, leur obéissance et leurs intentions sont interrogées. La communauté reçoit de quoi se regarder avec vérité sans renoncer à l’avenir.`},
{title:'Pardonner et consulter encore',refs:[[3,159,159],pursuit,history],text:`Un verset adresse au Prophète une orientation particulièrement forte après ces événements. Il rappelle la douceur par laquelle les compagnons restent autour de lui, puis lui demande de leur pardonner, d’implorer leur pardon et de les consulter dans les affaires.

La consultation n’est donc pas supprimée parce qu’une épreuve a révélé des fautes. Le Messager ne doit pas transformer la blessure en dureté permanente envers ceux qu’il conduit. Il lui faut décider et faire confiance à Allah, tout en maintenant un lien qui permette à la communauté de se relever.

Cette fidélité se manifeste aussi dans l’action. Craignant que l’armée mecquoise ne revienne, le Prophète appelle des hommes à suivre sa trace. Aicha rapporte que Abu Bakr et az-Zubayr sont parmi ceux qui répondent après les blessures de Uhud.

Ils ne sont pas redevenus indemnes. Leur réponse ne signifie pas que la douleur a disparu. Elle montre qu’un engagement peut continuer au milieu de ses conséquences. Le Coran mentionne ceux qui répondent à Allah et au Messager après avoir été atteints.

Ce mouvement empêche Uhud de devenir la dernière parole de l’histoire. La communauté revient meurtrie, mais elle n’est pas dissoute. Elle doit maintenant reconstruire sa confiance à partir de la vérité de ce qu’elle a traversé.`},
{title:'Revenir avec une mémoire différente',refs:[history,[3,139,159]],text:`Le retour à Médine n’a pas la couleur de celui de Badr. Des familles attendent des hommes qui ne reviendront pas. Les blessés portent les marques de la journée. Le Prophète lui-même revient avec la perte de proches et la douleur de ses blessures.

Pourtant, la vie ne peut être suspendue. Il faut soigner, soutenir les familles et continuer l’enseignement. La communauté doit apprendre à raconter Uhud sans en faire seulement une humiliation à oublier, ni une suite de scènes héroïques qui effacerait les erreurs commises.

Ce qu’elle conserve est plus exigeant : la mémoire d’une consigne négligée, celle de compagnons restés fidèles, celle des morts et celle d’une révélation qui corrige tout en ouvrant un chemin. Chaque élément empêche les autres de devenir une simplification.

Le Prophète continue d’accompagner ces hommes. Sa douceur n’est pas une absence de direction ; sa fermeté ne consiste pas à enfermer chacun dans sa faute. La suite de sa vie montrera une communauté encore capable d’agir, d’apprendre et de recevoir des épreuves nouvelles.

Uhud reste ainsi une montagne dans la mémoire musulmane : le lieu où une blessure a enseigné que la foi ne se mesure pas seulement à la joie de gagner, mais aussi à la manière de reconnaître ses erreurs et de se relever sans perdre son lien avec Allah.`},
]}],epilogue:'À Uhud, la communauté a perdu des hommes et des certitudes trop faciles. La révélation lui apprend à unir responsabilité, pardon et persévérance.',lessons:['Une responsabilité discrète peut protéger tout un groupe.','Reconnaître une faute ne signifie pas renoncer à l’avenir.','La douceur et la consultation gardent leur place après une crise.'],question:'Comment corriger une erreur sans réduire une personne à ce qu’elle a mal fait ?'});

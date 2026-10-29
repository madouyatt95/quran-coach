import {chapterNarrative,type NarrativeBook,type NarrativeScene} from '../../../lib/narrativeBooks';
import {moralVolumes,moralChapterId} from '../../moralBookEditions';

interface Edition {subtitle:string;opening:string;bridges:string[];ending:string;lessons:string[];question:string}
const editions:Record<string,Edition>={
'or-et-intention':{
 subtitle:'Du trésor enfoui aux jardins de Saba · six récits sur ce qui nous est confié',
 opening:`Un trésor peut se trouver sous une terre que l’on vient d’acheter. Une richesse peut aussi se présenter sous la forme d’un champ fertile, d’une dette que l’on pourrait réclamer, d’une offrande que l’on apporte. Que se passe-t-il ensuite ? C’est là que commencent les histoires de ce livre.

Nous allons suivre six récits distincts. Les trois premiers nous conduisent auprès de personnes qui choisissent de rendre, de donner ou d’alléger. Puis le regard s’élargit. Il rejoint les jardins de Saba, une cité au bord de la mer et deux frères devant leur offrande. Les mêmes objets ne passent pas d’une main à l’autre : chaque histoire garde son lieu dans les sources et son propre dénouement. Mais une question nous accompagne d’un chapitre au suivant. Ce que nous recevons nous rend-il plus attentifs, ou nous fait-il oublier les droits qui nous entourent ?

La réponse ne se réduit pas au montant d’une fortune. Elle apparaît dans une décision, parfois discrète, parfois irréparable. Pour commencer, deux hommes se font face. Ils ont conclu une vente. L’un d’eux revient pourtant vers l’autre, avec une découverte qu’il refuse de garder pour lui.`,
 bridges:[`Les trois premières rencontres nous ont appris à regarder ce qu’un homme décide de faire de son bien. Nous changeons maintenant d’échelle. Les passages qui suivent sont coraniques ; ils ne prolongent pas la vie du marchand. Ils nous placent devant une communauté qui reçoit de quoi vivre, voyager et demeurer en sécurité.

Il est facile de reconnaître la valeur d’un trésor lorsqu’il surgit au milieu d’un champ. Il est parfois plus difficile de voir celle d’un jardin qui porte chaque année, d’un chemin que l’on parcourt sans crainte, d’une ressource dont l’absence ne s’est pas encore fait sentir. La gratitude commence aussi là : dans ce qui semble tellement disponible que l’on cesse de le remarquer.

Dans la suite de ce livre, le don ne sera donc pas seulement de l’argent. Ce sera une terre, une possibilité de subsister, puis l’offrande présentée par deux frères. Nous retrouverons la même responsabilité, mais sous des formes nouvelles.`],
 ending:`Au début de ce livre, un homme avait trouvé de l’or et cherchait à le rendre. À la fin, un homme regarde ce que son geste a détruit et apprend d’un corbeau ce qu’il ne savait pas faire. Entre ces deux scènes, nous avons rencontré des dons mal compris, des dettes allégées, des jardins perdus et un avertissement que certains continuaient de porter.

Ces récits n’ont pas tous la même issue. Leur réunion ne doit pas effacer cette différence. Certains montrent la générosité ; d’autres, les conséquences de la transgression. Aucun ne nous laisse traiter l’autre comme un simple obstacle à notre avantage. Le vendeur a des droits. Le débiteur a une difficulté réelle. Une communauté reçoit des bienfaits. Le frère possède une vie que l’on ne peut prendre.

En quittant ces pages, on peut choisir une action précise : rendre ce que l’on retient injustement, accorder un délai possible, cesser de gaspiller un bien partagé, demander de l’aide avant qu’une colère ne devienne dangereuse. Il n’est pas nécessaire de découvrir une jarre pour avoir quelque chose à faire. Une part de ce qui nous est confié se trouve déjà entre nos mains.`,
 lessons:['Rendre un droit même lorsque personne ne le réclame.','Ne pas humilier celui que l’on aide.','Reconnaître les biens et les limites qui accompagnent notre vie.'],question:'Quel bien confié peux-tu mieux préserver, rendre ou partager ?'},
'aimer-sans-paraitre':{
 subtitle:'Neuf rencontres où l’attention change tout · aimer, voir et enseigner avec douceur',
 opening:`Une visite peut n’avoir rien à réclamer. Une mère peut partager ce qu’elle s’apprêtait à manger. Une personne peut entretenir un lieu fréquenté par tous, puis manquer à ceux qui ne s’étaient guère arrêtés sur sa présence. Ces gestes et ces absences nous invitent à regarder autrement les vies qui passent près de nous.

Ce livre suit trois mouvements. Nous rencontrerons d’abord une affection qui ne cherche pas à se faire valoir. Nous nous approcherons ensuite de personnes injustement accusées, peu remarquées ou malades. Enfin, nous verrons comment une erreur, une brusquerie ou une parole déplacée peuvent recevoir une réponse qui enseigne sans humilier.

Il ne s’agit pas d’une seule histoire avec les mêmes personnages. Ce sont neuf rencontres rapportées dans les recueils authentiques, réunies autour d’un fil : quelle place faisons-nous réellement à l’autre ? Le voyageur de la première rencontre nous donne une manière simple d’entrer dans cette question. Il se rend chez un frère. Ce déplacement a une raison, mais cette raison n’est ni une dette à récupérer ni un avantage à obtenir.`,
 bridges:[`Nous avons suivi une visite désintéressée, la discrétion d’Uways et le partage d’une mère. Aucun de ces gestes ne demandait à être placé au centre des regards. Mais que devient notre attention lorsque quelqu’un subit une accusation, lorsqu’un service quotidien cesse ou lorsqu’un enfant tombe malade ?

Les trois rencontres suivantes déplacent le point de vue. Nous ne regarderons plus seulement celui qui donne ; nous regarderons celui que l’on risque de ne pas voir. L’attention peut alors commencer par un refus : refuser de condamner trop vite, de tenir une présence pour négligeable, de laisser une différence nous rendre indifférents à une souffrance. L’histoire qui vient nous est transmise par Aïcha. Elle concerne une femme et une pièce de cuir rouge dont la disparition va peser sur elle.`,
 `Après l’accusation injuste, l’absence remarquée et la visite au malade, une autre difficulté se présente. Comment agir lorsque quelqu’un fait réellement quelque chose qu’il faut corriger ? Voir la dignité de l’autre ne signifie pas que tout geste soit acceptable. Mais la manière de répondre peut permettre d’apprendre ou ajouter une humiliation à l’erreur.

Les trois derniers chapitres se déroulent autour du Prophète. On y rencontre une faute dans la mosquée, une demande accompagnée de brusquerie et une parole pendant la prière. Les situations ne sont pas identiques, et les réponses ne sont pas un automatisme. Elles nous invitent à observer le moment choisi, le geste accompli et ce qui est expliqué. Pour enseigner, il faut encore que la personne puisse entendre.`],
 ending:`Une route, une maison, une mosquée, une visite auprès d’un enfant : les lieux de ces rencontres ne sont pas tous les mêmes. Pourtant, une même exigence nous a suivis. Ne pas laisser notre intérêt, notre impatience ou nos habitudes décider seuls de la valeur d’une personne.

Le visiteur n’attend pas un service en retour. Umar accepte de demander une invocation à Uways. La mère partage sa part. Une accusation est démentie. Une absence compte. Une erreur devient l’occasion d’un enseignement. Cette diversité nous empêche de réduire la bonté à un tempérament agréable. Elle peut demander du temps, une attention courageuse ou la maîtrise de sa première réaction.

Il reste à laisser ces rencontres éclairer les nôtres. Qui rend possible une partie de notre quotidien sans être remercié ? À qui pourrions-nous expliquer une erreur plus calmement ? Quelle visite serait un don de présence plutôt qu’une obligation expédiée ? Ce sont des questions pour notre propre conduite, sans prétendre connaître le rang des personnes auprès d’Allah. Une vie peut être discrète et compter beaucoup. Apprendre à la voir change aussi la nôtre.`,
 lessons:['Entretenir un lien sans le transformer en dette.','Ne pas réduire une personne à son statut ou à une accusation.','Corriger de manière à permettre la compréhension.'],question:'Qui pourrais-tu mieux écouter, remercier ou accompagner ?'},
'portes-de-misericorde':{
 subtitle:'Six récits pour traverser la peur, le retour et la peine',
 opening:`Il arrive qu’une image nous aide à entendre ce qu’une formule, à elle seule, ne nous avait pas fait saisir. Une mère serre un enfant. Un voyageur retrouve la monture dont dépend sa survie. Un homme redoute de comparaître devant son Seigneur. Dans chacune de ces histoires, la peur, l’attachement et l’espérance prennent une forme que l’on peut suivre.

Nous commencerons par trois récits qui ouvrent le regard sur la miséricorde. Puis nous approcherons des épreuves qui ne disparaissent pas simplement parce que l’on croit : la maladie, le deuil, la séparation d’avec un enfant. Le passage d’une partie à l’autre est essentiel. L’espérance ne nous oblige pas à nier la douleur, et la douleur ne signifie pas que toute espérance nous serait retirée.

Les sources ne donnent pas à toutes ces vies une suite que nous pourrions raconter. Elles nous confient des rencontres, des paroles et des gestes. Nous prendrons le temps de les entendre dans leur ordre, sans faire de la souffrance un spectacle. Le premier récit commence au milieu de captifs. Une femme y cherche un enfant.`,
 bridges:[`La mère qui retrouve un enfant, le voyageur qui retrouve sa monture, l’homme rassemblé après avoir voulu disperser ses cendres : ces récits nous ont appris à ne pas enfermer la miséricorde dans la mesure de nos propres craintes. Mais l’écoute serait incomplète si nous en concluions qu’une vie croyante ne connaît plus la peine.

Nous entrons à présent dans des rencontres où la difficulté reste présente. Une femme demande une invocation à cause de ce qu’elle endure. Une autre pleure auprès d’une tombe. Puis nous entendrons le récit des larmes du Messager lorsque son fils Ibrahim meurt.

Ces histoires demandent de la délicatesse. Elles ne nous donnent pas une phrase à imposer à toute personne en souffrance. Elles nous invitent à écouter une demande particulière, à distinguer les larmes du désespoir et à voir ce que la patience peut signifier dans un moment précis. La miséricorde ne nous détourne pas des personnes éprouvées. Elle nous appelle à nous tenir auprès d’elles avec davantage d’attention.`],
 ending:`Nous avons commencé par une mère et son enfant. Nous terminons avec les larmes d’un père. Entre ces deux scènes, le livre n’a pas promis une existence où l’on ne perdrait rien, où l’on ne tremblerait jamais, où la maladie serait toujours retirée. Il nous a permis d’entendre ensemble la grandeur de la miséricorde et la réalité de la peine.

L’espérance peut rendre possible un retour. Elle peut aussi soutenir une personne dont l’épreuve dure encore. La patience n’exige pas un visage sans larmes ; elle ne donne pas aux autres le droit d’écourter une souffrance par un reproche. Et chercher des soins, du secours ou une présence n’est pas une défaite de la foi.

Si l’une de ces histoires rejoint une blessure que tu portes, il n’est pas nécessaire d’en tirer immédiatement une réponse. Tu peux simplement garder une parole, revenir à sa source et prendre le temps dont tu as besoin. Si elle te fait penser à quelqu’un, une aide concrète ou une présence respectueuse sera parfois plus juste qu’un long discours. L’écoute devient alors une attention offerte à une autre vie.`,
 lessons:['Garder l’espérance sans nier la responsabilité.','Respecter la demande particulière d’une personne éprouvée.','Ne pas confondre les larmes et l’absence de patience.'],question:'Quelle présence ou quelle aide concrète pourrais-tu offrir à une personne éprouvée ?'},
'juger-liberer-proteger':{
 subtitle:'Neuf récits sur la décision, le discernement et les limites du pouvoir',
 opening:`Détenir un pouvoir ne dit pas encore ce que l’on en fera. Un captif peut être relâché. Un jugement peut être réexaminé. Une arme peut placer un homme devant un danger immédiat. Puis d’autres épreuves apparaissent : une parole utile prononcée par quelqu’un de trompeur, un ordre auquel il ne faut pas obéir, une victoire qui n’efface pas une faute.

Ce livre avance de la décision visible vers le discernement intérieur. Nous suivrons d’abord trois situations où une vie dépend de ce qui sera fait. Nous écouterons ensuite trois avertissements qui empêchent de confondre autorité, vérité et orgueil. Enfin, trois récits de signes nous rappelleront que ni la puissance ni le secours ne deviennent des possessions dont l’homme pourrait disposer à sa guise.

Chaque chapitre garde sa source et sa place. Nous ne fabriquerons pas une histoire commune à ces personnages. Leur rapprochement nous aide à poser une même question sous plusieurs angles : comment reconnaître la juste limite au moment où l’on pourrait agir autrement ? À Médine, cette question nous conduit d’abord auprès d’un homme attaché à un pilier de la mosquée.`,
 bridges:[`Nous venons de voir une liberté rendue, un jugement éprouvé par la réaction d’une mère et un homme face à une épée. Ces moments nous rappellent que l’issue ne dépend pas toujours de celui qui semble disposer de tous les moyens.

Mais il existe des épreuves moins immédiatement visibles. Une parole peut être juste alors que celui qui la prononce cherche à tromper. Une apparence peut nourrir l’orgueil. Un chef peut donner un ordre que son autorité ne rend pas légitime. Les trois rencontres suivantes nous demandent donc de ne pas arrêter notre jugement à un titre, à un vêtement ou à une affirmation. Le discernement suppose d’écouter, de vérifier et parfois de refuser.

La première de ces histoires se déroule pendant trois nuits. Abou Hourayra garde des provisions confiées. Quelqu’un vient y puiser, et la même rencontre semble recommencer.`,
 `Les trois nuits auprès des provisions, l’orgueil de l’homme satisfait de son apparence et l’ordre devant le feu ont montré combien le premier regard peut être insuffisant. Nous arrivons maintenant à des récits où un signe extraordinaire intervient. Ce changement ne nous dispense pas de l’attention portée aux actes.

Dans le premier, une victoire n’autorise pas à garder ce qui a été soustrait. Dans le suivant, le récit d’un tronc de palmier accompagne le changement d’un lieu d’enseignement. Dans le dernier, la pluie demandée sera suivie d’une nouvelle demande lorsque ses effets deviennent difficiles.

Il faut entendre ces scènes telles qu’elles sont transmises, sans promettre que nous pourrions les reproduire. Elles rappellent une dépendance, non une technique. Le secours reçu ne transforme pas l’homme en maître de ce qui lui a été accordé.`],
 ending:`Le captif libéré au début du livre et la pluie de ses dernières pages semblent appartenir à des mondes très différents. Pourtant, les récits traversés nous ont constamment ramenés aux limites de ce que l’on croit tenir : la force, le jugement, le savoir, la réputation, les moyens d’agir.

Une autorité peut se tromper. Une vérité exige d’être reconnue sans faire confiance à tout ce qui l’entoure. Une victoire ne rend pas honnête ce qui a été pris injustement. Un bienfait appelle encore la mesure. Voilà pourquoi ces histoires ne se terminent pas par une invitation à se croire plus puissant, mais par une invitation à devenir plus attentif.

Dans une décision ordinaire, cette attention peut prendre une forme très simple : vérifier avant d’accuser, demander conseil, refuser de faire du mal sous prétexte d’obéir, rendre ce qui n’est pas à soi. Nous n’avons pas à chercher une situation extraordinaire pour exercer ce discernement. Il commence dans la manière dont nous répondons de ce que nous savons et de ce que nous faisons.`,
 lessons:['Ne pas confondre l’autorité et le droit de faire du mal.','Examiner une parole sans se laisser séduire par l’apparence.','Recevoir un secours sans oublier ses responsabilités.'],question:'Dans quelle décision as-tu besoin de ralentir pour mieux discerner ?'},
'croire-parmi-les-siens':{
 subtitle:'Onze étapes, des voix entendues aux images du Coran',
 opening:`Un homme prend la parole au milieu des gens de Pharaon. Une femme invoque son Seigneur au sein d’une maison injuste. Ailleurs, une plainte est entendue, un homme venu apprendre reçoit une place, et un lieu qui semble destiné à la prière est dévoilé dans son intention de division. Ces passages posent une question commune : que valent les apparences lorsque l’on regarde la vérité d’une personne ou d’un acte ?

Nous avancerons en trois temps. D’abord, des exemples où la foi ne se confond pas avec l’entourage. Ensuite, des passages où une parole, une demande ou une intention est mise en lumière. Enfin, des paraboles : le feu, l’orage, le mirage, la mer, l’écume et les jardins. Ces dernières ne racontent pas des vies historiques ; elles enseignent par des images que le Coran nous donne à méditer.

Le chemin de ce livre va ainsi d’une parole courageuse vers un regard à former. Il ne s’agit pas de deviner les secrets des autres. Il s’agit d’apprendre à ne pas donner au prestige, à la parenté ou à l’apparence d’un geste le dernier mot. Entrons d’abord dans le récit d’un croyant qui avait jusque-là caché sa foi.`,
 bridges:[`Ces premiers exemples ont distingué la personne de son entourage. Une proximité avec le pouvoir ne dit pas toute une foi ; une proximité familiale avec un prophète ne remplace pas une responsabilité personnelle. Nous allons maintenant écouter des passages qui déplacent encore notre attention.

La plainte d’une femme ouvre une sourate. La démarche d’un homme qui vient apprendre donne lieu à un rappel. Une demande de signe appelle une responsabilité. Un bâtiment destiné en apparence à la prière ne suffit pas à rendre bonne l’intention de ceux qui l’ont établi.

Le fil ne se rompt donc pas lorsque nous quittons les exemples liés à Pharaon. Il se précise : ce que l’on voit en premier n’est pas toujours ce qui doit compter le plus. Les versets nous apprennent à écouter ce qui risquerait d’être négligé et à ne pas nous laisser rassurer trop vite par une façade.`,
 `Nous avons écouté des personnes et suivi des demandes. Dans les derniers chapitres, le Coran enseigne par des images. Ce passage aux paraboles change notre manière d’écouter : il ne faut pas chercher le nom d’un voyageur devant un mirage ni l’adresse d’un jardin. L’image nous est donnée pour comprendre.

Une lumière peut disparaître. Un éclair peut permettre un pas sans offrir une orientation durable. Ce qui ressemble à de l’eau peut ne rien désaltérer. Ce qui couvre la surface peut s’en aller tandis que ce qui est utile demeure. Un jardin peut illustrer la fécondité d’un don, ou sa fragilité lorsque l’intention est corrompue.

Prenons ces images l’une après l’autre. Leur force tient à leurs différences autant qu’à leur rencontre. Elles ne forment pas une énigme à résoudre rapidement : elles nous invitent à examiner ce qui éclaire réellement nos décisions et ce que nos actes laisseront après leur passage.`],
 ending:`Au terme de ce parcours, nous revenons à la question qui l’ouvrait. Que valent les apparences ? Elles peuvent nous informer, mais elles ne suffisent pas à décider de tout. Le croyant au milieu des gens de Pharaon, l’épouse de Pharaon, la femme qui se plaint et les images des dernières pages nous ont conduits à regarder au-delà d’une première impression.

Ce regard ne nous autorise pas à prétendre lire les cœurs. Il nous rend plus prudents dans nos jugements et plus exigeants envers nos propres intentions. Nous pouvons chercher à entendre une demande, respecter une personne sans la réduire à son milieu, donner sans rappeler avec blessure ce que nous avons donné, vérifier ce qui nourrit vraiment notre conduite.

L’écume s’en va ; ce qui profite demeure. Gardons cette image en refermant le livre, sans en faire une formule pour mesurer la valeur des autres. Qu’est-ce qui, dans nos propres gestes, mérite de rester ? Une parole juste, une aide sincère, un savoir transmis avec soin peuvent nous donner un commencement de réponse.`,
 lessons:['Distinguer la personne de son entourage.','Écouter une demande avant de la classer selon les apparences.','Lire les paraboles comme un appel à examiner sa propre conduite.'],question:'Quelle image de ce livre t’aide à examiner ton intention ?'},
};
function scene(id:string,title:string,text:string,sources:string[]):NarrativeScene{return {id,title,paragraphs:text.split(/\n\s*\n/u).map(text=>({text,sources})),studyNote:'Ouverture, transition ou conclusion pédagogique originale ; les faits et les images renvoient aux sources du volume.'};}
/** Recomposition éditoriale : originaux conservés pour audit, cinq éditions publiques seulement. */
export function longMoralEditions(originals:NarrativeBook[]):NarrativeBook[]{return moralVolumes.map(volume=>{
 const members=volume.members.map(id=>{const book=originals.find(b=>b.id===id);if(!book)throw Error(`Manuscrit manquant : ${id}`);return book;});
 const first=members[0],edition=editions[volume.id],sources=[...new Map(members.flatMap(b=>b.sources).map(s=>[s.id,s])).values()];
 const chapters=members.flatMap((member,part)=>member.chapters.map((original,i)=>{
  const chapter=structuredClone(original);chapter.id=moralChapterId(member.id,chapter.id);delete chapter.audioVersion;
  for(const section of chapter.scenes)for(const paragraph of section.paragraphs){
   paragraph.text=paragraph.text
    .replace('Revenons aux trois histoires de ce livre.','Revenons sur ces trois premières histoires.')
    .replace('Nous refermons ces pages sans avoir besoin','Nous poursuivons notre chemin sans avoir besoin')
    .replace('Les trois récits de ce livre se répondent','Ces trois premières rencontres se répondent')
    .replace('Lorsque nous refermons le livre, la question','Avant de poursuivre, la question')
    .replace('Les trois chapitres de ce livre ne donnent','Ces trois rencontres ne donnent')
    .replace('Le troisième récit nous conduira auprès','La prochaine rencontre nous conduira auprès');
  }
  for(const section of chapter.scenes){
   const administrative=section.paragraphs.filter(p=>p.text.startsWith('Nous ne produisons pas ici de récitation'));
   if(administrative.length){section.studyNote+=' '+administrative.map(p=>p.text).join(' ');section.paragraphs=section.paragraphs.map((p,index)=>({...p,id:p.id||`${chapter.id}:${section.id}:${index}`})).filter(p=>!p.text.startsWith('Nous ne produisons pas ici de récitation'));}
  }
  // Keep old scene identifiers and existing paragraph indices for saved passages.
  if(i===0){const text=part===0?edition.opening:edition.bridges[part-1];chapter.scenes.unshift(scene(`${chapter.id}-ouverture`,part===0?'Entrer dans le récit':'Le fil se poursuit',text,member.sources.map(s=>s.id)));}
  const oldText=chapterNarrative(original)+(i===member.chapters.length-1?'\n\n'+member.epilogue.text:'');
  const newText=chapterNarrative(chapter)+(part===members.length-1&&i===member.chapters.length-1?'\n\n'+edition.ending:'');
  // Reuse only an identical complete chapter, including any recorded epilogue.
  if(chapter.id===original.id&&oldText===newText){chapter.audioVersion=original.audioVersion||member.version;chapter.audioTitle=member.title;}
  return chapter;
 }));
 return {...first,version:`${first.id}-long-2026-10-29-v2`,subtitle:edition.subtitle,scope:{kind:'anthology',description:'Édition longue en chapitres : récits distincts réunis par un fil narratif, ouvertures et transitions originales, sources consultables.'},sources,chapters,
 editorialNote:members.map(b=>b.editorialNote).join('\n\n'),
 epilogue:{text:edition.ending,lessons:edition.lessons,question:edition.question,sources:sources.map(s=>s.id)}};
});}

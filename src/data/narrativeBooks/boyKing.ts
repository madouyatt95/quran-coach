import {defineBook} from './defineBook';
import type {HadithNarrativeSource} from '../../lib/narrativeBooks';
const account:HadithNarrativeSource={id:'muslim-3005',type:'hadith',collection:'Sahih Muslim',number:'3005',url:'https://sunnah.com/muslim:3005',grade:'Sahih — recueil de Sahih Muslim',description:'Le garçon, le moine et le roi, d’après le récit de Souhayb. Texte arabe ancien ; adaptation française originale, sans descriptions graphiques.',checkedAt:'2026-10-24'};

export const boyKingBook=defineBook({
 id:'garcon-et-roi',title:'Le garçon et le roi',subtitle:'Une foi que le pouvoir ne possède pas',category:'story',checkedAt:'2026-10-24',
 note:'Le récit suit Muslim 3005, sans nommer le roi, le garçon, le pays ni une époque. Les mises à mort sont évoquées sans description graphique. Les événements rapportés ne deviennent pas des consignes d’action, d’exposition au danger ou de refus de soins. Le lien thématique avec les persécutions religieuses n’est pas utilisé pour identifier des personnes ou pays actuels.',
 chapters:[
  {id:'chemin',title:'Deux enseignements sur un même chemin',sections:[
   {title:'Celui que le roi fait instruire',refs:[account],text:`Le magicien du roi a vieilli. Il demande qu’un garçon lui soit confié afin de lui transmettre son art. Un enfant est envoyé auprès de lui. Sa place semble décidée : il recevra un savoir destiné à servir le pouvoir qui l’a choisi. Mais sur le chemin de cet apprentissage se trouve un moine. Le garçon s’assied auprès de lui, écoute sa parole et s’y attache.

Il continue de passer par le moine lorsqu’il se rend chez le magicien. Ses retards lui valent des coups. Il s’en plaint, et le moine lui indique comment expliquer son retard selon qu’il craint la colère du magicien ou celle de sa famille. Le récit nous montre un garçon pris entre des attentes opposées. Ce qui l’intéresse désormais sur le chemin ne correspond pas à ce pour quoi le roi l’a fait venir.

Ce n’est pas encore un affrontement devant une foule. Il y a d’abord une parole écoutée et une question qui grandit. Un jour, une grande bête bloque le passage des gens. Le garçon y voit l’occasion de savoir laquelle des deux voies est meilleure. Il prend une pierre et demande à Allah, si l’enseignement du moine Lui est plus aimé que celui du magicien, de faire périr l’animal pour que les gens puissent passer.

Il lance la pierre. La bête est tuée et le passage est rendu aux gens. L’invocation a précédé son geste. Le signe qu’il vient de recevoir ne lui est pas rapporté comme un pouvoir qu’il posséderait par lui-même. Cette distinction va demeurer au centre de toute l’histoire. À mesure que les événements le rendront visible, il devra rappeler de qui vient réellement le secours.`},
   {title:'Le maître sait reconnaître ce qui lui échappe',refs:[account],text:`Le garçon rejoint le moine et lui raconte ce qui s’est passé. Celui-ci ne cherche pas à garder pour lui une supériorité de maître. Il lui dit qu’il est désormais meilleur que lui, puis l’avertit qu’il sera mis à l’épreuve. Si cela arrive, il lui demande de ne pas le désigner. L’enseignement ne se termine donc pas sur la promesse d’une place enviable. Il ouvre sur la perspective d’un danger.

Le garçon soigne des malades. Des personnes privées de la vue et d’autres atteintes de maladies viennent à lui. Parmi ceux qui entendent parler de lui se trouve un proche du roi, devenu aveugle. Cet homme apporte de nombreux cadeaux et lui promet de les lui donner s’il lui rend la vue. Ce qui était jusqu’alors un chemin entre deux enseignements va ainsi atteindre l’entourage même du souverain.

Le garçon refuse de se présenter comme celui qui guérit par lui-même. C’est Allah qui guérit. Si l’homme croit en Allah, il L’invoquera pour lui. L’homme croit, le garçon invoque et Allah lui rend la vue. Les cadeaux ne sont pas devenus le prix d’un pouvoir vendu par l’enfant. Ce qui s’est passé porte au contraire une parole que l’homme va bientôt prononcer devant le roi.

La guérison le ramène à sa place habituelle auprès du souverain. Le roi remarque ce changement et demande qui lui a rendu la vue. La réponse ne désigne ni le magicien ni le roi : elle nomme son Seigneur. L’histoire a quitté le chemin où un garçon s’arrêtait pour écouter. Elle entre dans un lieu où reconnaître une autre autorité que celle du souverain va devenir dangereux.`},
  ]},
  {id:'cour',title:'Celui qui guérit et celui qui exige',sections:[
   {title:'La question du roi',refs:[account],text:`Le roi s’étonne que son proche parle d’un Seigneur autre que lui. L’homme affirme qu’Allah est son Seigneur et celui du roi. La réponse ne se contente pas de raconter une guérison : elle remet à sa place le pouvoir qui prétend décider de tout. Le souverain fait saisir l’homme et le soumet à la torture. Sous la contrainte, celui-ci révèle le garçon.

L’enfant est amené. Le roi lui parle comme s’il avait atteint un degré exceptionnel dans la magie. Il attribue les guérisons à ce que le garçon aurait appris au service de son pouvoir. Mais l’enfant tient la même parole qu’auprès du malade : il ne guérit personne par lui-même. C’est Allah qui guérit. Le roi tente ainsi de ramener le signe dans le cadre qu’il connaît ; le garçon refuse cette attribution.

À son tour, il est torturé et finit par désigner le moine. Celui-ci est amené et reçoit l’ordre de renoncer à sa religion. Il refuse. Le roi le fait tuer. Le proche qui avait retrouvé la vue refuse lui aussi de renier sa foi et est mis à mort. Le récit rapporte ces violences ; nous n’avons pas besoin d’en prolonger les détails pour comprendre ce que le pouvoir exige de ceux qu’il veut soumettre.

Le garçon avait entendu le moine lui annoncer une épreuve. Cette parole n’avait pas promis qu’il suffirait de croire pour que toute souffrance visible disparaisse. Nous venons de voir deux hommes mourir pour avoir refusé de renoncer. La fidélité ne se mesure donc pas seulement au signe d’une guérison ou à la survie immédiate. La menace du roi porte maintenant sur l’enfant lui-même.`},
   {title:'Une foi que l’on ne peut obtenir par ordre',refs:[account],text:`Le souverain lui demande à son tour d’abandonner sa religion. Il refuse. Des hommes reçoivent alors l’ordre de l’emmener sur une montagne. Si le garçon renonce à sa foi, ils doivent le laisser ; sinon, ils doivent le précipiter. Le pouvoir déplace la même exigence. Il ne s’agit plus d’enseigner un art à un enfant, mais d’obtenir de lui une parole contraire à ce qu’il croit.

Le garçon est conduit jusqu’à la montagne. Il invoque Allah et Lui demande de le protéger contre eux de la manière qu’Il veut. Il ne dicte pas le moyen du secours. La montagne tremble, les hommes tombent et le garçon revient à pied auprès du roi. Quand celui-ci demande ce qu’ils sont devenus, l’enfant lui répond qu’Allah l’en a protégé.

La scène renvoie le roi à ce qu’il avait tenté de maîtriser. L’ordre avait été donné, les hommes avaient emmené le garçon, et pourtant l’issue ne lui a pas appartenu. Mais ce retour ne change pas son exigence. Une autre tentative va suivre. Le récit ne nous demande pas d’imaginer ce qu’il ressent entre les deux ; sa décision suivante suffit à montrer qu’il poursuit son projet.

L’enfant, lui, ne revient pas annoncer qu’il serait désormais invulnérable. Il rapporte le secours reçu. Le nom d’Allah demeure dans sa réponse, comme dans la parole qu’avait prononcée l’homme guéri. C’est toujours le même point que le roi ne veut pas accepter : sa puissance n’est pas celle du Seigneur du garçon.`},
  ]},
  {id:'retours',title:'La montagne, puis la mer',sections:[
   {title:'La deuxième tentative',refs:[account],text:`Le roi confie le garçon à d’autres hommes. Ils doivent le conduire au large sur un bateau. Là encore, la condition est la même : s’il refuse de renoncer à sa religion, ils le jetteront dans l’eau. Après la montagne vient la mer. Le lieu change, la volonté de contraindre demeure. Le souverain cherche un moyen d’obtenir ce que ni l’ordre ni la menace n’ont encore produit.

Emmené sur l’embarcation, le garçon invoque Allah. Il Lui demande de le protéger contre ces hommes. Le bateau se renverse, ils se noient et l’enfant revient à pied auprès du roi. Le récit nous donne le renversement et le retour sans expliquer une technique de survie. Nous ne lui ajoutons pas une traversée, un rivage ou des gestes qu’il ne décrit pas. Le secours est attribué à Allah.

Le roi lui demande ce qui est arrivé à ceux qui l’accompagnaient. La réponse demeure la même : Allah l’en a protégé. Les deux retours se répondent. Le garçon a été placé sous la garde d’hommes chargés de le faire mourir, et il se trouve de nouveau devant celui qui avait donné l’ordre. La répétition ne rend pas la violence du roi plus légitime. Elle montre les limites auxquelles son projet s’est heurté.

À ce point du récit, l’enfant prend la parole sur ce que le roi ne peut accomplir. Il ne pourra le tuer qu’en suivant une indication qu’il va lui donner. Nous entrons dans un événement particulier raconté dans le hadith. Il ne doit pas devenir pour l’auditeur une consigne de s’exposer au danger ou de provoquer sa propre mort. L’histoire rapporte ce qui s’est passé ; elle ne nous confie pas la connaissance des mêmes issues.`},
   {title:'Le nom que la foule entendra',refs:[account],text:`Le garçon demande au roi de réunir les gens dans un même lieu et de l’attacher à un tronc. Il devra prendre une flèche de son carquois, la placer sur l’arc et invoquer Allah, le Seigneur du garçon, avant de tirer. Ces indications déplacent le centre de la scène. Devant les gens, le roi sera conduit à prononcer lui-même le nom de Celui dont il refusait de reconnaître la seigneurie.

Le souverain rassemble la foule et accomplit ce qui lui a été indiqué. Il tire la flèche. Le garçon est atteint et meurt. Nous nous arrêtons aux faits nécessaires pour suivre le récit. Il n’est pas besoin d’ajouter au moment de sa mort un discours, une vision ou une scène d’adieu. Le hadith nous conduit immédiatement à la réponse des gens qui viennent de voir ce qui s’est passé.

Ils affirment leur foi dans le Seigneur du garçon. La parole que le roi avait voulu faire disparaître est désormais portée par ceux qu’il a lui-même rassemblés. Ses proches lui font remarquer que ce qu’il redoutait vient précisément d’arriver. Le garçon n’est plus en vie, mais tuer l’enfant n’a pas donné au souverain le pouvoir d’éteindre la foi de la foule.

La scène ne se mesure donc pas à la victoire apparente de celui qui a tiré. Le roi dispose d’un arc, d’un ordre exécuté et d’un enfant attaché. Pourtant, ce qui s’entend après le tir n’est pas une reconnaissance de sa puissance. C’est la foi dans le Seigneur que le garçon n’a cessé de nommer. Le souverain va tenter encore de répondre par la contrainte.`},
  ]},
  {id:'foule',title:'Lorsque d’autres voix se lèvent',sections:[
   {title:'Ce que le feu ne peut faire croire',refs:[account],text:`Le roi ordonne que des fossés soient creusés aux entrées des voies et qu’on y allume le feu. Ceux qui ne renonceront pas à leur religion devront y être jetés. La violence qui avait visé le moine, l’homme guéri et le garçon s’étend maintenant à ceux qui ont affirmé leur foi. La foule n’est plus seulement appelée à regarder. Chaque croyant se trouve sous une menace.

Le hadith suit alors une femme venue avec son enfant. Elle hésite devant l’épreuve. L’enfant lui parle et l’invite à tenir ferme, car elle est sur la vérité. Le récit lui donne cette parole sans nommer sa mère, préciser leur histoire ou décrire ce qui aurait précédé leur venue. Nous gardons ce qu’il rapporte : une hésitation réelle, une parole de réconfort et une vérité qui ne dépend pas de l’ordre du roi.

La peur n’est pas effacée par la fidélité. La femme hésite, et le récit n’a pas besoin de lui retirer ce mouvement pour faire entendre la force de sa foi. Le réconfort reçu prend place au milieu du danger. Nous ne connaissons pas chacun des visages de ceux qui ont été menacés. Nous savons que le pouvoir a voulu imposer un reniement et que des croyants ont refusé.

Le garçon avait commencé par écouter, au bord du chemin, une parole que le roi n’avait pas choisie pour lui. À la fin de l’histoire, d’autres personnes affirment cette foi. Entre ces deux moments, il y a eu une guérison, des menaces, des mises à mort et des secours qu’Allah a accordés. Aucune de ces scènes ne donne au souverain la propriété des consciences qu’il voulait posséder.`},
   {title:'Recevoir le récit sans s’en attribuer les pouvoirs',refs:[account],text:`Ce récit nous est transmis par le Prophète, que la paix et les bénédictions soient sur lui. Il nous parle de gens qui ont vécu avant nous. Les noms du pays, du souverain et du garçon ne sont pas nécessaires à ce qu’il veut nous faire entendre. La question qui traverse l’histoire est plus précise qu’une légende de puissance : à qui attribuer la guérison, auprès de qui demander secours, et que peut réellement obtenir la contrainte ?

Le garçon n’a pas vendu les bienfaits reçus comme un art dont il serait le propriétaire. Il a ramené la guérison à Allah. Le moine a reconnu ce qu’Allah avait accordé à son élève, sans retenir pour lui le premier rang. L’homme guéri a dit devant le roi qui lui avait rendu la vue. Chaque fois, une parole vraie a résisté à la place que le pouvoir voulait lui imposer.

Pour notre vie, recevoir cette histoire ne signifie pas rechercher une épreuve ou attendre de reproduire ses signes. Il est possible de demander une protection, de prendre soin des personnes en danger et de respecter les moyens de soin disponibles. La confiance en Allah ne nous donne pas la certitude d’un secours identique à celui qui fut accordé au garçon. Le récit nous apprend à reconnaître de qui vient le bienfait, sans nous déclarer maîtres de l’invisible.

Gardons enfin la première scène : un enfant prend le temps d’écouter. La suite ne se réduit pas à cet arrêt sur le chemin, mais il est le commencement que le récit nous donne. Une parole reçue avec attention peut changer une direction. Et lorsque l’histoire se referme, ce ne sont plus seulement les mots du garçon que nous entendons. D’autres voix ont affirmé leur foi dans son Seigneur.`},
  ]},
 ],
 epilogue:'Reconnaître un bienfait, demander un secours et respecter la conscience d’autrui sont des responsabilités concrètes. Cette histoire ne commande pas de chercher le danger. Elle invite à la fidélité, à la gratitude et à la protection des personnes que la violence voudrait réduire au silence.',
 lessons:['Attribuer à Allah les bienfaits reçus sans s’en faire le propriétaire.','Ne pas confondre contrainte et conviction.','Chercher protection et aide sans provoquer le danger.'],
 question:'Quel bienfait peux-tu reconnaître aujourd’hui sans chercher à en tirer une supériorité sur quelqu’un ?',
});

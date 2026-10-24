import {defineBook} from './defineBook';
import type {HadithNarrativeSource} from '../../lib/narrativeBooks';
const first:HadithNarrativeSource={id:'bukhari-3-revelation',type:'hadith',collection:'Sahih al-Bukhari',number:'3',url:'https://sunnah.com/bukhari:3',grade:'Sahih — recueil de Sahih al-Bukhari',description:'Aïcha rapporte les commencements de la révélation, le retour auprès de Khadija et la rencontre avec Waraqa. Narration française originale du texte arabe ancien.',checkedAt:'2026-10-24'};
const letter:HadithNarrativeSource={id:'bukhari-7-lettre',type:'hadith',collection:'Sahih al-Bukhari',number:'7',url:'https://sunnah.com/bukhari:7',grade:'Sahih — recueil de Sahih al-Bukhari',description:'Récit d’Abou Soufyan à Ibn Abbas sur l’entretien avec Héraclius et la lettre ; le complément d’Ibn al-Natour est identifié comme tel. Narration originale du texte arabe.',checkedAt:'2026-10-24'};

export const revelationBook=defineBook({
 id:'revelation-lettre',title:'De Hira à la lettre',subtitle:'Une parole reçue, une parole qui voyage',category:'story',checkedAt:'2026-10-24',
 note:'Deux récits de Bukhari, séparés dans le temps, sont présentés comme deux étapes et non comme une séquence immédiate. Aucune date de nuit ou durée de l’interruption de révélation n’est fixée. L’entretien avec Héraclius n’établit pas sa conversion. Le complément d’Ibn al-Natour est distingué du témoignage d’Abou Soufyan ; son évocation de l’astrologie n’est pas employée comme preuve ni comme pratique à suivre. La narration française est originale et ne reproduit pas de traduction moderne.',
 chapters:[
  {id:'hira',title:'L’événement que l’on ne s’attribue pas',sections:[
   {title:'Les nuits de retraite',refs:[first],text:`Aïcha raconte que les commencements de la révélation se manifestent par des rêves véridiques. Ce qui est vu se réalise avec une clarté qu’elle compare à celle du jour naissant. Puis la retraite est rendue aimable au Prophète, que la paix et les bénédictions soient sur lui. Il se rend à la grotte de Hira, où il demeure plusieurs nuits pour adorer Allah.

Il emporte des provisions pour ce séjour. Lorsqu’il revient auprès de Khadija, il en prépare pour d’autres nuits. Ce va-et-vient appartient au récit des commencements. La retraite ne signifie pas qu’il n’a plus de maison, plus de proches ni de besoins. Le temps à Hira et le retour auprès des siens se succèdent, jusqu’à un événement qu’il ne décide pas de produire.

L’ange vient alors qu’il se trouve dans la grotte. Il lui demande de lire. Le Prophète répond qu’il n’est pas lecteur. L’ange le serre jusqu’à la limite de ce qu’il peut supporter, puis le relâche et renouvelle sa demande. La réponse revient. Une deuxième fois, il le serre puis le relâche. Une troisième demande est suivie du même événement, puis viennent les premières paroles rapportées de la sourate Al-Alaq.

Nous n’ajoutons pas à cette scène la forme d’un visage, une couleur de lumière ou une heure que le texte ne transmet pas. Ce qui est déjà raconté suffit à mesurer sa force. Le Prophète n’a pas composé une parole qu’il viendrait ensuite présenter. Il reçoit une révélation. La difficulté éprouvée et son retour bouleversé font partie de la manière dont Aïcha nous transmet ce commencement.`},
   {title:'Lire au nom de Celui qui crée',refs:[first,[96,1,5]],text:`Les premiers versets appellent à lire au nom du Seigneur qui a créé. Ils évoquent la création de l’être humain, la générosité du Seigneur, le calame et l’enseignement de ce que l’homme ne savait pas. La narration de Bukhari que nous suivons cite le début de ce passage. Le texte coranique complet reste accessible dans le lecteur pour celui qui souhaite le lire et l’écouter en récitation.

Le Prophète revient avec ce qui lui a été révélé, le cœur tremblant. Il entre auprès de Khadija et demande qu’on le couvre. On le couvre jusqu’à ce que l’effroi se dissipe. Le premier retour après la rencontre nous conduit donc dans une maison où il peut dire son besoin. Avant une explication longue, il y a ce geste simple : accueillir et couvrir celui qui vient d’arriver.

Il raconte ensuite à Khadija ce qui s’est passé et lui confie sa crainte pour lui-même. Le hadith ne lui retire pas cette parole pour rendre sa mission plus grande. Nous n’avons pas à confondre la solidité d’un engagement avec l’absence de trouble au moment d’un événement immense. La révélation reçue ne transforme pas celui qui la porte en une personne sans émotions ni besoins.

Khadija va lui répondre. Elle ne prétend pas avoir vécu la rencontre à sa place. Elle connaît cependant sa conduite parmi les personnes, et c’est à partir de ce qu’elle sait qu’elle va le rassurer. Le livre nous laisse un instant auprès de celui qui vient de demander qu’on le couvre, avant d’entendre une parole dont la confiance se fonde sur toute une vie partagée.`},
  ]},
  {id:'khadija',title:'La maison où l’on peut raconter sa crainte',sections:[
   {title:'Ce que Khadija connaît de lui',refs:[first],text:`Khadija lui affirme qu’Allah ne l’humiliera pas. Elle rappelle qu’il entretient les liens de parenté, porte le poids de ceux qui sont faibles, aide celui qui manque, accueille l’invité et soutient dans les épreuves où le secours est juste. Sa réponse ne consiste pas à diminuer l’événement qu’il vient de raconter. Elle lui remet devant les yeux les actes qu’elle connaît de lui.

Le portrait est fait de relations. Il concerne la famille, le besoin, l’hospitalité, la responsabilité envers celui qui traverse une difficulté. Aïcha ne rapporte pas ici une liste de réussites qui rendraient une personne indépendante des autres. Elle transmet la manière dont Khadija reconnaît une conduite tournée vers eux. Cette reconnaissance devient une parole de réconfort au moment où elle est nécessaire.

Puis Khadija l’accompagne auprès de son cousin Waraqa ibn Nawfal. C’est un homme âgé, devenu aveugle, qui avait adopté le christianisme avant l’islam et connaissait les Écritures. Le récit le situe par ce qu’il a étudié. Khadija lui demande d’écouter celui qu’elle conduit auprès de lui. L’accueil dans la maison se prolonge ainsi dans la recherche d’une personne capable de comprendre ce qui est raconté.

Waraqa pose une question : qu’a-t-il vu ? Le Prophète lui rapporte la rencontre. Celui qui écoute ne commence pas par remplir le récit de sa propre imagination. Il reçoit d’abord le témoignage. Nous pouvons retenir cette succession : rassurer à partir de ce que l’on sait, accompagner, puis laisser la personne raconter ce qu’elle a vécu devant quelqu’un qui peut l’éclairer.`},
   {title:'L’appui et l’épreuve annoncée',refs:[first],text:`Waraqa reconnaît dans l’événement la venue de celui qui avait été envoyé à Moussa. Il souhaite être assez jeune et encore vivant lorsque le peuple du Prophète le chassera. Cette annonce surprend celui qui l’entend. Le Prophète lui demande s’ils vont réellement le faire sortir. Waraqa confirme que ceux qui sont venus avec un message semblable ont rencontré l’hostilité.

Il lui promet son soutien s’il vit jusqu’à ce moment. Nous entendons donc, dans une même rencontre, une reconnaissance et l’annonce d’une épreuve. Le message reçu à Hira ne sera pas seulement gardé dans la grotte. Il devra être porté parmi les personnes. Certaines l’accueilleront, d’autres le refuseront. Waraqa ne dissimule pas cette difficulté derrière la joie d’avoir reconnu ce qui vient de se produire.

Il meurt peu après, et la révélation connaît une interruption dont ce récit ne fixe pas la durée. Nous n’en inventons pas les journées. Ce chapitre s’arrête là où la version suivie s’arrête. Le soutien qu’il a offert demeure rapporté, même s’il ne sera pas lui-même présent dans toutes les étapes qu’il a annoncées.

Bien des événements sépareront ensuite les commencements de la lettre que nous allons rencontrer. Il y aura l’appel, l’opposition, le départ de La Mecque et la constitution d’une communauté à Médine. Nous ne sautons pas ces années pour faire croire que les deux scènes se suivent. Nous changeons de récit afin de regarder une autre manière dont la vérité d’une mission est reconnue, cette fois dans les réponses d’un homme qui lui est encore hostile.`},
  ]},
  {id:'temoin',title:'Un adversaire doit répondre',sections:[
   {title:'Des marchands devant Héraclius',refs:[letter],text:`Abou Soufyan voyage avec des marchands de Quraych dans la région du Cham. Une trêve existe alors entre Quraych et le Prophète. Héraclius fait venir ce groupe à Ilya. Autour de lui se trouvent les dignitaires des Romains. Un interprète transmet ses questions. Il cherche parmi les voyageurs celui dont la parenté avec Muhammad est la plus proche.

Abou Soufyan se désigne. Héraclius le fait approcher et place ses compagnons derrière lui. Il annonce qu’il va l’interroger et demande aux autres de le contredire s’il ment. Dans le récit qu’il rapportera ensuite à Ibn Abbas, Abou Soufyan reconnaît ce qui le retient : il ne veut pas qu’ils transmettent de lui un mensonge. Son hostilité ne peut donc pas s’exprimer en inventant librement les réponses.

Les premières questions portent sur la famille du Prophète et sur l’existence d’un précédent semblable dans son peuple. Abou Soufyan reconnaît sa noblesse de lignée. Personne avant lui n’a tenu la même prétention, et aucun roi ne se trouve parmi ses ancêtres. Héraclius poursuit. Qui le suit ? Des puissants, ou des personnes faibles ? Leur nombre grandit-il, ou diminue-t-il ?

À chaque réponse, quelque chose se précise. Abou Soufyan dit que les faibles le suivent et que leur nombre augmente. Les personnes qui ont embrassé sa religion ne l’abandonnent pas ensuite par aversion pour elle, dans le témoignage qu’il fournit. La scène se construit par des questions successives. L’interprète les porte d’un homme à l’autre, tandis que ceux qui pourraient dénoncer un mensonge demeurent derrière le répondant.`},
   {title:'La réputation avant l’annonce',refs:[letter],text:`Héraclius lui demande si Muhammad était accusé de mentir avant d’annoncer sa mission. Abou Soufyan répond que non. Puis vient la question de la trahison. Il dit encore que non, mais ajoute qu’une trêve est en cours et qu’ils ne savent pas ce qu’il fera. Il expliquera n’avoir trouvé que cette réserve pour introduire quelque chose qui lui soit défavorable.

On l’interroge aussi sur les combats. Il répond que les succès passent d’un camp à l’autre. Le récit n’organise pas sa déposition comme une victoire militaire déjà totale qui aurait contraint toutes ses réponses. Il reconnaît des faits sur une personne dont son groupe combat encore la mission. C’est précisément ce décalage qui rend sa parole remarquable dans la scène.

Enfin, que leur ordonne Muhammad ? Abou Soufyan rapporte l’appel à adorer Allah seul, sans Lui associer quoi que ce soit, et à délaisser les pratiques héritées qui s’y opposent. Il nomme la prière, la vérité, la chasteté et le maintien des liens. La réponse revient à la conduite concrète, comme les paroles de Khadija nous y avaient conduits au début du livre, dans un autre contexte et avec une autre intention.

Héraclius va maintenant reprendre ses questions pour expliquer comment il comprend l’ensemble. Le lecteur n’a pas besoin de transformer cet entretien en un tribunal qui contiendrait toute la vie du Prophète. Il peut observer un phénomène plus précis : l’hostilité d’un homme ne lui a pas permis d’effacer ce qu’il savait de la fidélité à la parole et de l’appel entendu parmi les siens.`},
  ]},
  {id:'lettre',title:'Ce que le message demande',sections:[
   {title:'Relier les réponses',refs:[letter],text:`Héraclius expose à l’interprète ce qu’il a compris. La lignée, l’absence d’un précédent à imiter et celle d’un royaume ancestral à revendiquer écartent pour lui certaines explications. Il revient ensuite à la réputation de vérité. Comment un homme qui ne mentait pas sur les personnes se mettrait-il à mentir sur Allah ? Il considère aussi les personnes qui suivent l’appel et la croissance de leur nombre.

Il rattache ces réponses à ce qu’il connaît des messagers. Leur fidélité aux engagements fait partie de ce qu’il souligne. Les ordres transmis par Abou Soufyan occupent également une place dans son raisonnement : adorer Allah seul, prier, dire vrai et préserver la chasteté. Le message ne peut pas être réduit à la seule prise d’une place politique.

Héraclius dit qu’il connaissait l’annonce de la venue d’un prophète, sans s’attendre à ce qu’il apparaisse parmi eux. Il exprime le désir de le rencontrer s’il pouvait parvenir jusqu’à lui. Nous rapportons ici ses paroles, sans prétendre qu’elles constituent à elles seules une conversion. La suite du même hadith nous demandera de garder cette distinction.

Il fait alors apporter la lettre du Messager d’Allah. Dihya l’avait confiée au dirigeant de Bousra, qui l’a transmise à Héraclius. Les mots ont parcouru des relais avant d’être lus dans cette assemblée. À Hira, le Prophète avait reçu une révélation qu’il ne s’était pas attribuée. Ici, il adresse une invitation à un souverain éloigné, et la lettre rend cette invitation présente devant lui.`},
   {title:'Une invitation portée au-delà des proches',refs:[letter,[3,64,64]],text:`La lettre désigne Muhammad comme serviteur d’Allah et Son messager, puis s’adresse à Héraclius, dirigeant des Romains. Elle donne la salutation à celui qui suit la guidée et l’invite à l’islam. Elle évoque une récompense doublée s’il répond et une responsabilité s’il se détourne. Le texte cité poursuit avec l’appel coranique aux gens du Livre à une parole commune : n’adorer qu’Allah et ne rien Lui associer.

Le livre ne met pas dans la bouche du narrateur une récitation coranique artificielle. Celui qui souhaite entendre le verset peut ouvrir sa référence dans Quran Coach et écouter la récitation. Nous suivons ici le sens de l’invitation telle que le hadith rapporte sa lecture devant Héraclius. La portée du message rejoint ainsi celle d’un appel déjà adressé aux personnes proches, puis transmis plus loin.

Après la lecture et les explications, les voix s’élèvent dans l’assemblée. Les marchands sont conduits dehors. Abou Soufyan dit à ses compagnons que la cause de Muhammad a pris une telle importance que le roi des Romains lui-même s’en préoccupe. Il reliera ensuite ce moment à la conviction qui grandit en lui jusqu’à son entrée dans l’islam.

Le récit ne situe pas cette entrée dans la salle où la lettre vient d’être lue. Il distingue la reconnaissance d’un fait, le cheminement qui suit et la décision plus tardive. Pour nous aussi, lire une histoire avec attention demande de conserver ces étapes. Une parole qui marque un auditeur peut commencer un changement sans que toute sa vie ait déjà changé à cet instant.`},
  ]},
  {id:'pouvoir',title:'Reconnaître et répondre',sections:[
   {title:'Le complément du récit',refs:[letter],text:`Le hadith transmet ensuite un autre témoignage, celui d’Ibn al-Natour, au sujet d’Héraclius. Ce complément n’est pas une nouvelle scène qu’Abou Soufyan aurait lui-même observée dans l’entretien précédent. Il raconte notamment la préoccupation du souverain, des informations échangées et sa correspondance avec une personne de Rome qui partage ses connaissances.

La mention de ses observations astrologiques appartient à ce portrait. Nous ne l’employons ni pour prouver la mission prophétique ni pour proposer une manière de connaître l’avenir. Le lecteur peut consulter le texte source complet et distinguer ce qu’un récit rapporte des pratiques d’un personnage de ce qu’il donne à suivre. Le présent chapitre retient surtout la scène de Homs où une décision est mise devant les dignitaires.

Héraclius les réunit dans une enceinte dont il fait fermer les portes. Il leur propose de suivre ce prophète s’ils souhaitent la réussite, la direction juste et la durée de leur pouvoir. Ils se précipitent vers les portes et les trouvent fermées. Voyant leur refus, il les fait revenir, puis affirme qu’il voulait seulement éprouver leur attachement à leur religion.

Ils l’acceptent et se prosternent devant lui. C’est sur ce repli que le témoignage clôt cet épisode. Nous ne lui ajoutons pas une profession de foi secrète pour rendre la fin plus rassurante. Le contraste demeure entre ce qu’il a reconnu dans ses paroles, l’invitation qu’il a présentée et la manière dont il réagit à l’opposition de ceux qui l’entourent.`},
   {title:'Deux formes d’accueil',refs:[first,letter],text:`Revenons au chemin de ce livre. Dans la première maison, Khadija accueille un homme qui lui confie sa crainte. Elle le rassure en rappelant sa conduite et l’accompagne vers quelqu’un qui peut écouter son témoignage. Dans l’assemblée d’Héraclius, les questions permettent de reconnaître des signes, mais la réponse à l’appel rencontre aussi le poids du pouvoir et le refus du groupe.

Ces deux récits ne donnent pas aux personnes les mêmes places. Ils nous permettent cependant de regarder comment on reçoit une parole. La connaissance peut conduire à un appui, comme chez Khadija et dans la promesse de Waraqa. Elle peut aussi rester devant une décision que l’on ne prend pas. Nous n’en déduisons pas le secret des cœurs ; nous observons ce que les textes nous ont transmis des actes et des paroles.

Il est possible de connaître un bien et de le laisser attendre, parce que les conséquences inquiètent ou parce que l’entourage refuse. Il est possible aussi de soutenir quelqu’un avant de savoir toutes les difficultés qui viendront. La question que ces scènes nous laissent ne consiste pas à nous comparer aux personnages. Elle porte sur la place que nous faisons à ce que nous savons être vrai lorsque cela demande une réponse.

À Hira, une révélation a été reçue. Dans une maison, elle a été racontée et accueillie. Bien plus tard, une lettre a voyagé jusqu’à un autre peuple et a été lue devant ceux qui le dirigeaient. Le chemin n’est pas seulement celui d’un écrit porté au loin. Il est celui d’une responsabilité : recevoir, transmettre avec fidélité et ne pas remplacer la réponse par la seule admiration de ce que l’on a entendu.`},
  ]},
 ],
 epilogue:'Une parole reçue appelle parfois une écoute, parfois une recherche, parfois une décision qui coûte. Khadija a accueilli et accompagné. Waraqa a écouté et offert son appui. Abou Soufyan a dû reconnaître des faits. Le livre nous invite à joindre à la connaissance du bien un geste qui lui donne une place dans notre vie.',
 lessons:['Accueillir la crainte d’une personne avant de vouloir tout expliquer.','Distinguer une reconnaissance verbale d’un engagement réellement pris.','Transmettre ce que l’on sait sans laisser l’hostilité déformer les faits.'],
 question:'Quel bien clairement reconnu attend encore de devenir, pour toi, un geste ou une décision ?',
});

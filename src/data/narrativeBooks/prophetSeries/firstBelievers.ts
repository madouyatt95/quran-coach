import {defineBook} from '../defineBook';
import {nectar,sahih} from './sources';
const history=nectar('nectar-premiers','PDF fourni, pages 106–131 : premiers croyants, appel public, opposition et maison d’Al-Arqam.');
const hira=sahih('bukhari','3','Soutien de Khadija dès la première révélation.');
const safa=sahih('bukhari','4770','Appel sur Safa, témoignage des Quraysh et réaction d’Abu Lahab.');
const family=sahih('muslim','206a','Avertissement adressé aux proches : la parenté ne dispense pas de répondre à Allah.');
const amr=sahih('muslim','832','Rencontre de Amr ibn Abasa avec le Prophète à La Mecque.');
const dharr=sahih('bukhari','3861','Recherche d’Abu Dharr, accueil par Ali, conversion et protection par Al-Abbas.');
const fatima=sahih('bukhari','520','Agression pendant la prière et intervention de Fatima.');
const defense=sahih('bukhari','3856','Abu Bakr intervient pour dégager le Prophète agressé par Uqba ibn Abi Muayt.');
const patience=sahih('bukhari','3852','Khabbab demande le secours d’Allah ; annonce d’un avenir de sécurité.');
export const prophetFirstBelieversBook=defineBook({
 id:'prophete-premiers-croyants',version:'prophete-premiers-croyants-2026-10-31-v1',title:'Le Prophète · Les premiers qui répondent',subtitle:'Des premières confidences à l’appel public, une communauté prend forme',category:'prophet',checkedAt:'2026-10-31',
 scope:{kind:'episode',description:'Cinquième étape : premiers croyants, Safa, enseignement et premières persécutions à La Mecque.'},
 note:'Le cadre suit le Nectar, p.106–131. Pas de classement absolu des premières conversions ni de conversion de tous les proches le même jour. L’appel discret est une période, non une clandestinité totale datée au jour près. Les épisodes de Amr et Abu Dharr sont rapprochés thématiquement sans ordre relatif affirmé. Dar Al-Arqam relève de la tradition biographique, non d’un hadith des Sahih. Les réunions familiales détaillées p.111, la formule du soleil et de la lune p.123 et les supplices individuels non vérifiés sont omis. Les confusions Abu Lahab/Abu Jahl du PDF p.125–129 ne sont pas reprises. Ni détails physiques inventés ni dialogues reconstitués.',
 chapters:[{id:'premiers',title:'Les premiers qui répondent',sections:[
 {title:'Une parole confiée aux proches',refs:[history,hira],text:`L’ordre de transmettre a été reçu. Pourtant, lorsque la mission commence, aucune foule de disciples n’entoure Muhammad. Il est encore au milieu des siens, dans la ville où il a grandi. La révélation n’a pas fait disparaître les maisons, les liens de parenté ou les amitiés. C’est à travers ces liens que l’appel trouve ses premiers auditeurs.

Khadija est déjà là. Elle a accueilli son époux au retour de Hira et l’a accompagné auprès de Waraqa. Son soutien se poursuit. Celle qui connaissait sa conduite avant la révélation est aussi la première à croire en lui. Dans la maison, la confiance conjugale accompagne désormais une foi partagée.

Parmi les premiers qui répondent figurent également Ali, son jeune cousin, Zayd ibn Haritha et Abu Bakr. Leurs situations sont différentes. Ali a grandi auprès de Muhammad. Zayd est son affranchi et lui est profondément attaché. Abu Bakr est un homme libre, connu dans la cité, lié à lui par l’amitié. La communauté naissante ne réunit donc pas des personnes arrivées toutes par le même chemin.

Pour chacun, croire implique de reconnaître une mission nouvelle chez un homme déjà connu. Celui que l’on rencontrait comme parent, protecteur ou ami annonce maintenant qu’il est le messager d’Allah. La proximité permet d’entendre ; elle ne répond pas à la place de celui qui écoute.

Ces premières réponses n’ont pas encore le visage d’une force publique. Elles se donnent à l’échelle d’une maison, d’une rencontre, d’une relation. Mais elles changent la suite de l’histoire. La révélation reçue à Hira commence à être portée par d’autres mémoires et vécue dans d’autres existences.`},
 {title:'Les liens par lesquels l’appel se propage',refs:[history],text:`Abu Bakr ne garde pas pour lui ce qu’il a reconnu. Il parle à des hommes qui le connaissent, qui le fréquentent et lui font confiance. La tradition biographique rattache à son appel plusieurs des premières conversions : celles de Uthman ibn Affan, de Zubayr ibn Al-Awwam, de Abd ar-Rahman ibn Awf, de Saad ibn Abi Waqqas et de Talha ibn Ubaydillah.

Ces noms deviendront importants dans l’histoire musulmane. À ce moment, ils désignent surtout des personnes qui s’engagent alors que l’issue de la mission n’est pas visible. Ils ne rejoignent pas un pouvoir établi. Aucun État ne les protège au nom de leur foi. Ils répondent à un appel dont les conséquences vont bientôt toucher leurs relations, leurs habitudes et parfois leur sécurité.

D’autres hommes et femmes les rejoignent. On compte parmi les premiers croyants Bilal, Khabbab, Ibn Masud, Al-Arqam, Saïd ibn Zayd et son épouse Fatima, sœur de Umar. Les appartenances familiales se croisent. Une même famille peut compter quelqu’un qui croit et quelqu’un qui refuse ; un homme sans richesse peut partager la foi d’un commerçant reconnu.

Le nom d’un clan ne suffit donc plus à dire où se trouve chacun. Une solidarité nouvelle apparaît, sans effacer les obligations envers les proches. Elle rassemble autour d’Allah des personnes que la société ne plaçait pas au même rang.

Abu Bakr a utilisé ses relations pour ouvrir un chemin vers le Prophète. D’autres rendront possible une rencontre, transmettront une parole ou accueilleront un croyant. L’histoire avance aussi grâce à ces gestes discrets, moins visibles qu’un discours devant une assemblée, mais décisifs pour ceux qui en bénéficient.`},
 {title:'Apprendre avant de pouvoir se montrer',refs:[history,[74,1,7]],text:`Les premiers croyants ont besoin d’apprendre. Reconnaître le messager n’achève pas leur chemin : il leur faut découvrir la révélation, comprendre ce qu’elle demande et donner à la foi une place dans leur vie. Le Prophète les enseigne. La prière accompagne ces commencements, bien avant l’étape où les cinq prières quotidiennes seront prescrites lors du voyage nocturne.

L’apprentissage se fait dans une ville où l’on ne peut pas tout montrer sans risque. Les rencontres discrètes protègent ceux qui viennent. La prudence ne rend pas le message insignifiant ; elle permet de continuer à l’entendre. Plus tard, lorsque la pression devient forte, la maison d’Al-Arqam occupe une place particulière dans la mémoire de cette formation.

Le Coran donne des mots pour penser autrement l’existence. Il rappelle la grandeur d’Allah, la responsabilité des actes, le retour vers Lui. La réussite d’une vie ne se mesure plus seulement à la fortune conservée ou au rang reconnu par la cité. Un jugement que les puissants ne contrôlent pas est annoncé.

Ces changements touchent autant les gestes ordinaires que les convictions. Se tourner vers Allah, tenir sa parole, reconnaître une responsabilité envers le faible : la foi engage celui qui la reçoit. Elle ne lui offre pas seulement un nom nouveau.

Pendant ce temps, l’appel circule. La discrétion ne signifie pas que personne ne sait rien. Des nouvelles sortent du cercle initial et parviennent à des hommes qui ne vivent pas dans le foyer de Muhammad. Certains veulent comprendre ce qui se dit à La Mecque. Ils prennent la route.`},
 {title:'Un voyageur pose ses questions',refs:[amr],text:`Amr ibn Abasa entend parler d’un homme qui apporte un message à La Mecque. Il vient le chercher. Il trouve un prophète que l’hostilité de son peuple oblige à se protéger.

Amr l’interroge sur sa mission. La réponse unit l’adoration d’Allah seul, le rejet des idoles et le maintien des liens familiaux. Puis le visiteur demande qui l’a suivi. Le Prophète évoque un homme libre et un esclave ; le témoignage nomme Abu Bakr et Bilal.

Amr veut rester auprès de lui. Mais le Prophète lui fait considérer la difficulté de la situation et lui conseille de retourner chez les siens, puis de revenir lorsque les circonstances auront changé. Amr suivra ce conseil.

Cette rencontre nous montre une attention concrète à la personne qui arrive. Recevoir sa foi n’impose pas de l’exposer aussitôt au danger. Le lien peut se maintenir à distance. Des années plus tard, Amr retrouvera le Prophète à Médine. Pour l’instant, il repart avec ce qu’il a appris.`},
 {title:'Le chemin discret d’Abu Dharr',refs:[dharr],text:`Abu Dharr cherche lui aussi à savoir. Il envoie d’abord son frère, puis vient personnellement à La Mecque. Étranger dans la ville, il hésite à demander ouvertement où trouver le Prophète.

Ali le remarque et l’accueille. Après plusieurs rencontres, Abu Dharr lui confie la raison de sa venue. Ali organise alors un trajet prudent et le conduit auprès de Muhammad. Abu Dharr écoute et embrasse l’islam.

Le Prophète lui demande de retourner informer les siens. Avant de partir, Abu Dharr proclame pourtant publiquement sa foi. Des hommes le frappent. Al-Abbas intervient pour le protéger, en rappelant aux agresseurs que leurs routes commerciales traversent le territoire de Ghifar, son peuple.

La scène met côte à côte la force d’une conviction et la réalité du danger. L’hospitalité d’Ali a permis la rencontre ; l’intervention d’Al-Abbas empêche que l’agression se poursuive. Ceux qui répondent à l’appel ne marchent pas tous au même pas, et leur protection exige parfois l’action d’un autre.`},
 {title:'L’appel sur Safa',refs:[history,safa,[26,214,215]],text:`Vient l’ordre d’avertir les proches. Sur Safa, le Prophète appelle les branches de Quraysh. Les hommes se rassemblent. Certains de ceux qui ne peuvent venir envoient quelqu’un pour savoir ce qui se passe. Cette fois, l’annonce se fait devant une assemblée.

Muhammad leur soumet une situation qu’ils peuvent comprendre : s’il les avertissait qu’une troupe de cavaliers menace la vallée, le croiraient-ils ? Ils reconnaissent sa véracité. Ils n’ont pas l’expérience d’un homme qui leur ment. Il leur annonce alors qu’il les avertit d’un châtiment grave.

Abu Lahab réagit avec hostilité et lui reproche de les avoir réunis pour cela. Celui qui s’oppose ainsi est son oncle. La parenté qui rassemble l’assemblée contient donc aussi le refus.

Le mouvement de la scène est saisissant. L’homme dont on vient de reconnaître la sincérité demande que cette confiance accueille un avertissement religieux. La difficulté n’est plus seulement de connaître celui qui parle. Elle est de consentir à ce que son message change.

Le discours sur Safa n’efface pas les conversations personnelles. Il élargit la portée de l’appel. La parole ne concerne plus seulement celui que l’on a rencontré à l’écart ou dans une maison. Les proches ont été publiquement avertis. Désormais, l’opposition peut elle aussi prendre un visage plus visible.`},
 {title:'Ce que le nom de famille ne peut pas donner',refs:[family,[111,1,5],[26,214,215]],text:`Dans l’avertissement adressé à ses proches, le Prophète nomme des membres de sa famille. Al-Abbas, Safiyya et Fatima sont appelés à prendre leur propre responsabilité devant Allah. Il peut leur apporter une aide matérielle ; il ne leur promet pas un salut automatique fondé sur la parenté.

Cette distinction est profonde dans une société où le clan peut défendre un membre menacé. La protection humaine et le jugement d’Allah ne sont pas la même chose. Le lien familial reste digne de soin, mais il ne dispense pas de croire et d’agir.

La sourate consacrée à Abu Lahab rappelle également que la richesse et les acquis ne suffisent pas à protéger celui qui s’oppose. L’oncle du Prophète ne bénéficie pas d’une exception qui annulerait ses choix.

Ainsi, l’appel atteint la maison même de celui qui le transmet. Il n’annonce pas aux étrangers une exigence dont il dispenserait les siens. Ceux qu’il aime sont eux aussi concernés. La proximité avec lui rend l’avertissement plus personnel ; elle ne le rend pas moins nécessaire.`},
 {title:'L’hostilité entre dans les gestes',refs:[history,fatima,defense],text:`La résistance ne reste pas une discussion. Elle prend la forme de moqueries, de pressions et d’agressions. Tous les croyants n’ont pas les mêmes moyens de se défendre. Les protections familiales comptent, et ceux qui en sont privés se trouvent particulièrement exposés.

Un jour, près de la Kaaba, le Prophète prie tandis qu’un groupe de Quraysh est réuni. Uqba ibn Abi Muayt apporte des restes d’un chameau abattu et les dépose entre ses épaules alors qu’il est prosterné. Les hommes rient. Fatima, encore jeune, vient retirer ce qui pèse sur son père et s’adresse aux agresseurs.

Dans un autre témoignage, Uqba serre un vêtement autour du cou du Prophète pendant sa prière. Abu Bakr intervient, le repousse et proteste contre l’idée de tuer un homme parce qu’il affirme qu’Allah est son Seigneur.

Ces épisodes montrent que la violence atteint le Prophète lui-même. Être connu dans la cité, appartenir à une famille importante et bénéficier d’une protection n’empêche pas toute agression. La prière peut devenir le moment choisi pour l’humilier.

Fatima et Abu Bakr ne remplissent pas ici un rôle abstrait. L’une enlève ce qui a été jeté ; l’autre dégage celui qu’on étrangle. Leur fidélité se traduit par un geste immédiat. Au milieu de l’hostilité, des personnes s’avancent pour que le Prophète ne soit pas laissé seul.`},
 {title:'La demande de Khabbab',refs:[history,patience],text:`Khabbab vient trouver le Prophète à l’ombre de la Kaaba. Celui-ci est appuyé sur son manteau. Les musulmans souffrent alors durement des persécutions. Khabbab demande qu’il invoque Allah pour eux.

Le Prophète se redresse. Il rappelle les épreuves terribles subies par des croyants des générations antérieures, puis annonce un avenir où un voyageur pourra aller de Sanaa au Hadramawt sans craindre les hommes.

À cet instant, le contraste est immense. Khabbab parle depuis la détresse présente. Le Prophète lui ouvre la perspective d’une sécurité qui n’est pas encore celle de leur quotidien. L’hostilité de La Mecque ne sera pas la mesure définitive de l’avenir.

Nous ne sommes pourtant pas encore au dénouement. Les coups, les menaces et les restrictions continuent de peser sur la communauté. L’espérance accompagne l’épreuve ; elle ne la rend pas imaginaire. Ceux qui reçoivent cette parole doivent encore se protéger, s’entraider et chercher comment vivre leur foi.`},
 {title:'La maison où l’on continue d’apprendre',refs:[history,[15,94,99]],text:`La maison d’Al-Arqam devient un lieu où les croyants peuvent se réunir auprès du Prophète. La tradition biographique la situe près de Safa. La cité connaît l’appel, mais les personnes qui l’ont accueilli ont toujours besoin d’un espace protégé pour être enseignées.

Il serait facile de ne retenir de cette période que les agressions. Pourtant, pendant que l’opposition s’organise, l’apprentissage continue. Le Prophète transmet la révélation. Les croyants découvrent ce qu’elle demande et se soutiennent. Une communauté ne se maintient pas seulement parce qu’elle survit aux attaques ; elle se forme aussi par ce qu’elle apprend ensemble.

La fin de la sourate Al-Hijr associe l’ordre de proclamer le message, la réalité de la peine causée par les paroles hostiles et la persévérance dans l’adoration. Le chagrin n’est pas ignoré. Il est accompagné d’une orientation : revenir vers Allah et poursuivre ce qui a été confié.

Safa et la maison d’Al-Arqam appartiennent ainsi à la même histoire. L’un rappelle la portée publique de l’avertissement ; l’autre, le soin apporté à ceux qui le reçoivent. La mission doit atteindre les hommes, et les croyants doivent pouvoir grandir sans être abandonnés à ceux qui leur font du mal.

Mais la protection offerte par une maison a ses limites. Pour certains, vivre à La Mecque devient de plus en plus difficile. Il va falloir chercher un refuge au-delà des frontières habituelles, traverser la mer et demander l’hospitalité d’un souverain d’une autre terre. La prochaine étape nous conduira vers l’Abyssinie.`},
 ]}],epilogue:'L’appel a trouvé ses premiers témoins. Quand la ville devient trop dangereuse pour eux, une autre question apparaît : où pourront-ils vivre leur foi en sécurité ?',lessons:['La foi rassemble des personnes d’origines et de conditions différentes.','La protection des croyants accompagne la transmission.','La parenté ne remplace pas la responsabilité personnelle devant Allah.'],question:'Quel geste de soutien, dans ces commencements, souhaitez-vous retenir ?',
});

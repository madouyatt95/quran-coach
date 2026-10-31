import {defineBook} from '../defineBook';
import type {HadithNarrativeSource} from '../../../lib/narrativeBooks';
import {nectar,sahih} from './sources';
const history=nectar('nectar-abyssinie','PDF fourni, pages 131–138 : départs vers l’Abyssinie et audience auprès du Négus.');
const court:HadithNarrativeSource={id:'ahmad-1740',type:'hadith',collection:'Musnad Ahmad',number:'1740',url:'https://dorar.net/h/1HxXQnPW?osoul=1',description:'Témoignage d’Umm Salama : refuge, envoyés de Quraysh, réponse de Jafar et protection du Négus.',grade:'Isnad jayyid — al-Albani, Silsila as-sahiha, 7/578 ; évaluation de la chaîne, non attribution aux deux Sahih.',checkedAt:'2026-10-31'};
const asma=sahih('bukhari','4230','Asma bint Umays rappelle à Umar les difficultés de l’exil en Abyssinie.');
const migrations=sahih('bukhari','4231','Le Prophète reconnaît aux gens du bateau le mérite de deux émigrations.');
export const prophetAbyssiniaBook=defineBook({
 id:'prophete-abyssinie',version:'prophete-abyssinie-2026-10-31-v1',title:'Le Prophète · Un refuge au-delà de la mer',subtitle:'L’Abyssinie, la parole de Jafar et la protection du Négus',category:'prophet',checkedAt:'2026-10-31',
 scope:{kind:'episode',description:'Sixième étape : les départs de La Mecque vers l’Abyssinie ; ouverture finale, explicitement ultérieure, sur la reconnaissance des émigrants.'},
 note:'Le cadre des deux départs vient du Nectar, p.131–138. L’audience est confrontée au texte arabe d’Ahmad 1740 rapporté par Umm Salama, chaîne jugée jayyid par al-Albani (Silsila as-sahiha 7/578, notice Dorar liée), sans le présenter comme un récit des Sahih. Les décomptes controversés, les dates au jour près, les descriptions de traversée, la rumeur de conversion collective et les gharaniq sont omis. Aucun texte coranique n’est récité par la voix synthétique. La scène d’Asma est un regard vers l’avenir et ne date pas l’audience du Négus. L’audience ne devient pas une affirmation sur la foi personnelle de tous les dignitaires. Le portrait de l’ancienne société est attribué à Jafar, non à chaque Mecquois sans exception.',
 chapters:[{id:'refuge',title:'Un refuge au-delà de la mer',sections:[
 {title:'Chercher un endroit où vivre sa foi',refs:[history,court],text:`La maison d’Al-Arqam permet aux croyants de se retrouver. Elle ne suffit pas à mettre toutes leurs vies à l’abri. Hors de ce lieu d’apprentissage, les pressions continuent. Un homme peut être soutenu par les siens ; un autre, livré à ceux qui le dominent. Pour certains, rester à La Mecque signifie subir encore les violences destinées à les détourner de leur foi.

Le Prophète leur indique une possibilité : l’Abyssinie. De l’autre côté de la mer se trouve un royaume gouverné par le Négus, un souverain auprès duquel on espère être protégé de l’injustice. Muhammad ne leur promet pas une maison retrouvée à l’identique. Il leur ouvre une route pour ne pas être contraints de renoncer à ce qu’ils ont reconnu.

La décision est importante. Les croyants ne partent pas parce que le message aurait cessé de compter à La Mecque. Ils partent pour pouvoir continuer à le vivre. La mission se poursuit dans la ville, tandis qu’une partie de ceux qui y ont répondu doit s’en éloigner.

Le Prophète reste. Ceux qui émigrent quittent donc aussi sa présence quotidienne. Ils emportent ce qu’ils ont appris, sans savoir quand ils pourront de nouveau l’entendre directement. La distance devient une épreuve supplémentaire, mais elle offre une chance de sécurité.`},
 {title:'Une communauté sur une autre rive',refs:[history,court],text:`Un premier groupe quitte La Mecque. La tradition biographique y compte notamment Uthman ibn Affan et Ruqayya, la fille du Prophète. Des hommes et des femmes prennent part à ce départ. L’émigration concerne des foyers, des liens de mariage, des personnes dont la vie ne peut pas être réduite à une liste de voyageurs.

D’autres départs suivront. Le groupe installé en Abyssinie devient plus nombreux. Il faut éviter de confondre tous ces déplacements en un seul voyage où chacun serait parti et revenu ensemble. Les parcours des émigrants ne se termineront pas tous au même moment.

Umm Salama nous a transmis le souvenir de l’accueil reçu. Elle décrit une situation où les musulmans peuvent adorer Allah sans subir les atteintes qu’ils redoutaient. Le changement essentiel est là : leur foi n’est plus, chaque jour, le motif d’une agression à laquelle ils seraient abandonnés.

Ils n’ont pas établi un pouvoir sur cette terre. Ils y sont accueillis sous la protection d’un souverain qui n’appartient pas à leur peuple. Leur sécurité dépend de l’hospitalité qui leur est accordée et du respect de cette protection.

L’histoire de la communauté musulmane ne se déroule donc plus seulement dans les rues de La Mecque. Une autre rive est entrée dans son histoire. Mais la nouvelle de ce refuge arrive aussi jusqu’à ceux qui voulaient faire céder les croyants.`},
 {title:'La poursuite prend la forme d’une ambassade',refs:[court],text:`À La Mecque, les responsables de Quraysh apprennent que les émigrants vivent en sécurité. Ils décident d’envoyer deux hommes auprès du Négus : Amr ibn Al-As et Abdullah ibn Abi Rabia. À ce stade de leur vie, ils représentent ceux qui veulent obtenir le retour des musulmans.

Leur mission ne repose pas sur une armée. Ils apportent des présents destinés au souverain et aux dignitaires de sa cour. Parmi ces cadeaux figurent des objets de cuir venus de La Mecque. Ils commencent par chercher l’appui des hommes qui entourent le roi.

Leur présentation des réfugiés est calculée. Ils les décrivent comme des jeunes gens qui ont abandonné la religion de leur peuple sans adopter celle du royaume qui les accueille. Ils demandent qu’on les renvoie à leurs familles, présentées comme les mieux placées pour connaître leurs fautes et décider de leur sort.

La demande cherche surtout à obtenir une décision avant que les intéressés puissent s’expliquer. Si les émigrants sont remis aux envoyés sans être entendus, le refuge peut prendre fin sans que leur voix ait atteint le souverain.

Certains dignitaires soutiennent la requête. Les présents ont été distribués, les arguments exposés, et les hommes de Quraysh peuvent maintenant demander au Négus de leur livrer les musulmans. Ceux qui avaient traversé la mer pour échapper aux persécutions se trouvent de nouveau menacés par une décision prise à leur sujet.`},
 {title:'Le souverain veut les entendre',refs:[court],text:`Le Négus refuse de remettre immédiatement les réfugiés à leurs poursuivants. Des personnes ont choisi sa terre et sa protection : il veut les faire venir et entendre leur réponse avant de décider.

Ce refus change le cours de la démarche. Les envoyés espéraient parler à la place des émigrants ; ils ne seront pas les seuls à exposer la situation. Le souverain fait appeler les compagnons du Prophète.

À la réception de cette convocation, les musulmans se réunissent. Ils doivent décider ce qu’ils diront. Le témoignage d’Umm Salama rapporte leur engagement à expliquer ce qu’ils savent et ce que leur prophète leur a enseigné, quelles que soient les conséquences.

Ils ne peuvent pas compter sur la force d’un clan qui imposerait sa volonté au roi. Ils ont cependant la possibilité de parler. Leur réponse ne consistera pas à nier leur foi pour conserver un abri, mais à la présenter à celui qui veut comprendre.

Devant le Négus et les dignitaires réunis, la question leur est posée : quelle est donc cette religion qui les a séparés des leurs, sans les faire entrer dans celle de leur pays d’accueil ? Jafar ibn Abi Talib prend la parole. Le frère d’Ali devient, dans cette audience, celui qui explique le chemin de la communauté.`},
 {title:'Jafar raconte ce qui a changé',refs:[court],text:`Jafar commence par évoquer la condition dont ils sont sortis. Il parle de l’adoration des idoles, des ruptures entre proches, du mauvais traitement des voisins et d’un ordre où les forts pouvaient écraser les faibles. Il ne présente pas leur départ comme une fantaisie de voyageurs. Il explique une transformation de leur manière de croire et de vivre.

Puis il évoque le messager qu’Allah leur a envoyé. Cet homme vient de leur peuple. Ils connaissent son origine, sa véracité, sa fidélité à ce qui lui est confié et sa conduite. L’appel reçu ne leur demande pas seulement de changer d’appartenance. Il les invite à adorer Allah seul et à renoncer aux idoles.

Jafar décrit également des exigences qui touchent les relations humaines : dire vrai, restituer les dépôts, préserver les liens de parenté, respecter le voisinage, s’abstenir de l’injustice et de l’atteinte aux innocents. Il rappelle l’interdiction de s’emparer du bien de l’orphelin et de lancer de fausses accusations.

La réponse rassemble ainsi la croyance et les actes. Le roi entend ce que l’appel a demandé aux réfugiés, puis ce qu’ils ont subi après y avoir répondu. Jafar explique que leurs proches les ont persécutés pour les ramener à l’adoration des idoles. La pression a fini par les empêcher de pratiquer leur religion en sécurité.

C’est pour cette raison qu’ils ont choisi la terre du Négus. Ils espéraient ne pas y être victimes d’injustice. Leur présence n’est pas une attaque contre le royaume : elle est une demande de protection. Le souverain dispose maintenant d’une autre version que celle apportée par les hommes de Quraysh.`},
 {title:'La révélation entendue loin de La Mecque',refs:[court,[19,16,36]],text:`Le Négus demande à Jafar s’il peut lui faire entendre une part de ce que le messager a reçu. Jafar répond qu’il le peut. Il récite alors le commencement de la sourate Maryam.

La scène porte loin de La Mecque une révélation d’abord transmise à une petite communauté menacée. Dans cette assemblée, les mots ne sont pas un argument inventé pour plaire au souverain. Jafar présente ce que les croyants ont reçu et appris.

Le témoignage d’Umm Salama rapporte les larmes du Négus et de ceux qui l’entourent. Le souverain reconnaît une parenté entre ce qu’il entend et la révélation antérieure. Il refuse de livrer les musulmans aux deux envoyés.

Cette décision ne signifie pas que toutes les différences religieuses de la cour auraient disparu, ni que chaque personne présente aurait adopté la foi des réfugiés. Elle signifie d’abord que la demande de leur remise a échoué. Leur parole a été entendue et leur protection maintenue.

Pour les émigrants, le résultat est décisif. Ils peuvent demeurer sur cette terre. Mais les hommes venus de La Mecque ne renoncent pas tous deux de la même manière. Amr ibn Al-As prépare une nouvelle démarche. Cette fois, il compte faire porter la discussion sur ce que les musulmans disent de Jésus.`},
 {title:'Une nouvelle question, le lendemain',refs:[court,[19,30,36],[4,171,171]],text:`Amr annonce qu’il reviendra auprès du roi pour l’interroger sur la croyance des réfugiés au sujet de Jésus, fils de Marie. Abdullah ibn Abi Rabia exprime une réserve et rappelle leurs liens de parenté. Amr maintient son intention.

Le lendemain, les musulmans sont de nouveau convoqués. La question touche une figure vénérée dans la religion de leur pays d’accueil. Umm Salama rapporte combien cette nouvelle épreuve leur paraît grave. Après le soulagement de la première audience, leur situation redevient incertaine.

Ils se concertent encore. Leur réponse restera celle qu’ils ont apprise du Prophète. Ils ne donneront pas au souverain une déclaration composée pour l’occasion et contraire à leur foi.

Jafar explique que Jésus est le serviteur et le messager d’Allah. Sa naissance miraculeuse, annoncée à Marie, manifeste la puissance d’Allah ; elle ne fait pas de lui une divinité. Cette réponse s’inscrit dans la parole coranique qui honore Jésus et sa mère tout en maintenant l’adoration d’Allah seul.

Le Négus prend alors un petit morceau de bois et affirme que Jésus ne dépasse pas ce qui vient d’être dit de la mesure de ce morceau. Des dignitaires manifestent leur désapprobation. Le souverain ne revient pourtant pas sur la protection qu’il accorde.

Les réfugiés n’ont donc pas conservé leur sécurité en cachant l’essentiel de leur croyance. Le récit nous montre une parole tenue sous la pression, et un souverain qui refuse de laisser cette pression décider à sa place.`},
 {title:'Les présents repartent avec les envoyés',refs:[court],text:`Le Négus confirme que les musulmans peuvent vivre en sécurité sur sa terre. Il ne veut pas que l’un d’entre eux soit maltraité. Puis il ordonne que les cadeaux soient rendus aux envoyés de Quraysh.

La mission se termine à l’inverse de ce qu’ils espéraient. Ils avaient apporté des présents pour obtenir des hommes et des femmes. Ils repartent avec leurs présents, sans les réfugiés. La protection ne s’est pas laissée acheter.

Umm Salama revient alors à ce qui compte pour ceux qui restent : ils peuvent continuer à vivre auprès de ce souverain sans subir l’injustice qu’ils ont fui. Le récit ne transforme pas cette vie en vacances ni en installation sans difficultés. Il reconnaît un bien concret au milieu de l’exil : la possibilité d’adorer Allah en sécurité.

Le Prophète est toujours loin. La révélation continue de descendre et l’histoire de La Mecque se poursuit sans que tous les émigrants en soient les témoins directs. L’accueil reçu les protège, mais il ne supprime ni la séparation ni l’attente.

Cette attente sera longue pour certains. Tous ne retourneront pas à La Mecque avec le même groupe. Une partie rejoindra plus tard le Prophète à Médine. Pour comprendre la place que cet exil gardera dans leur vie, il faut maintenant regarder brièvement vers ces retrouvailles encore lointaines.`},
 {title:'Un mérite que l’éloignement n’a pas effacé',refs:[asma,migrations],text:`Bien plus tard, à Médine, Asma bint Umays rencontre Umar dans la maison de Hafsa. Umar évoque l’antériorité de leur émigration auprès du Prophète. Asma refuse que cette comparaison fasse oublier ce que les gens d’Abyssinie ont traversé.

Elle rappelle qu’ils vivaient loin du messager, sur une terre étrangère, tandis que d’autres pouvaient être enseignés et accompagnés par lui. Leur départ avait pourtant été accompli pour Allah et Son messager. Elle veut rapporter l’échange au Prophète et connaître sa réponse.

Lorsqu’elle le fait, il reconnaît aux gens du bateau le mérite de deux émigrations. La distance n’a pas retiré leur place dans la communauté. Le temps passé ailleurs n’a pas rendu leur sacrifice invisible.

Asma racontera la joie de ceux qui viennent entendre cette réponse et la lui demandent encore. Ce souvenir donne à l’exil une lumière particulière. Ils avaient dû partir pour se protéger ; leur fidélité dans l’éloignement est reconnue.

Revenons maintenant à La Mecque, au temps où le refuge d’Abyssinie existe mais où la pression n’a pas cessé. Le Prophète continue d’appeler et d’enseigner. Des hommes jusque-là extérieurs au cercle des croyants vont bientôt lui apporter une force nouvelle. Les noms de Hamza et de Umar entreront dans cette étape de la mission.`},
 ]}],epilogue:'Une mer a séparé les croyants du Prophète, sans rompre leur fidélité. Leur histoire garde la mémoire de ceux qui ont accueilli, de ceux qui ont parlé avec vérité et de ceux qui ont tenu loin des leurs.',lessons:['Chercher une protection peut permettre de préserver la foi.','Entendre les personnes concernées empêche de décider seulement sur l’accusation de leurs adversaires.','L’éloignement ne rend pas une fidélité moins réelle.'],question:'Dans ce refuge, quel geste de justice ou de fidélité vous marque le plus ?',
});

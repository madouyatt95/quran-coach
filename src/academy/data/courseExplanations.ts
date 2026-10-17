/** Explanations adapted from the matching chapters of the supplied Sabirin courses.
 * These are teaching paraphrases, never new quotations or hadith authentication. */
export interface ChapterTeaching {
  introduction: string;
  developments: [string, string, string];
  takeaway: string;
}
const chapter = (introduction: string, developments: ChapterTeaching['developments'], takeaway: string): ChapterTeaching => ({ introduction, developments, takeaway });
export const TAWHID_TEACHING: ChapterTeaching[] = [
chapter('Avant de mémoriser des termes, il faut comprendre ce que l’on étudie. Ce premier chapitre répond à trois questions : qu’est-ce qu’une croyance, sur quoi porte la foi et pourquoi cela change-t-il notre manière d’agir ?', [
`Le mot « croyance » ne désigne pas ici une simple information entendue. On peut connaître une phrase sans y adhérer, comme on peut répéter une définition sans la comprendre. La Aqîdah concerne ce que l’on tient pour vrai dans son cœur. L’image du nœud, utilisée dans le cours pour expliquer l’origine du mot, aide à comprendre cette idée d’attachement ferme.

Il faut ensuite distinguer la force d’une conviction et son fondement. Être très sûr de soi ne suffit pas à prouver qu’une idée est juste. L’étude porte donc aussi sur les raisons de croire : les textes, leur sens et leur explication. C’est ce qui prépare le chapitre suivant, consacré aux sources.

Le support emploie plusieurs noms pour cette science, notamment la foi, l’unicité et les fondements de la religion. Ces noms mettent en valeur différents aspects d’un même apprentissage. Au début, l’essentiel est de comprendre l’objet de l’étude, plutôt que de réciter tous les noms.`,
`Les six éléments répondent chacun à une question différente. Croire en Allah concerne Celui que l’on adore. Croire en Ses anges concerne des créatures dont la révélation nous informe. Croire en Ses livres et en Ses messagers concerne la guidance transmise aux êtres humains. Croire au Jour dernier concerne la résurrection et le jugement. Croire au destin concerne ce qui arrive, sans supprimer l’effort demandé au croyant.

Ces éléments se comprennent ensemble. Par exemple, on ne peut pas étudier les livres révélés sans parler des messagers qui les transmettent. Et la foi au Jour dernier donne un sens à la responsabilité de nos actes. On apprend donc les liens entre les éléments, pas seulement leur ordre dans une liste.

Le chapitre s’appuie sur les passages coraniques 2:177 et 2:285 et sur le hadith de Jibrîl rapporté dans Sahîh Muslim. Ces références servent à établir le contenu de la foi. Elles ne sont pas de simples citations décoratives : elles répondent à la question « d’où vient cette liste ? ».`,
`Le cours relie la croyance à l’adoration. Une œuvre ne se définit pas seulement par son apparence : il faut aussi se demander à qui elle est vouée et selon quel enseignement elle est accomplie. La note qui accompagne le verset 18:110 explique ainsi deux repères : la sincérité envers Allah et la conformité à l’enseignement du Messager.

Prenons un exemple d’apprentissage. Une personne sait que la prière est importante. Comprendre pourquoi elle prie, à qui elle s’adresse et comment elle apprend à prier donne de la cohérence à son action. La connaissance de la règle, la conviction et la pratique ont chacune leur place.

Enfin, le chapitre présente la croyance comme une réponse aux questions du sens de la vie et du retour vers Allah. Ce point doit conduire à réfléchir à sa propre pratique. Il ne donne pas accès aux convictions intérieures des autres : apprendre les fondements de la foi n’est pas apprendre à juger les personnes.`
], 'Une croyance s’apprend par son sens, ses fondements et ses effets. Savoir nommer les six éléments de la foi est un début ; savoir les expliquer et les relier est l’objectif.'),
chapter('Après avoir défini la croyance, une question devient centrale : sur quoi s’appuie-t-elle ? Ce chapitre apprend à distinguer une source, une explication et une opinion.', [
`Une source est ce à quoi l’on revient pour établir un enseignement. Dans ce cours, le Coran occupe cette place parce qu’il est présenté comme la révélation d’Allah. Pour travailler un sujet, on commence donc par identifier le passage concerné, puis ce qu’il affirme réellement.

Citer une référence et expliquer une preuve sont deux étapes différentes. Une personne peut donner le numéro d’un verset sans montrer son lien avec la question. L’apprentissage consiste à faire ce lien : quel mot ou quelle idée répond au sujet, et quelle précision apporte le contexte ? Une traduction aide à accéder au sens, mais ne remplace pas toutes les explications du texte.`,
`La Sunna désigne l’enseignement transmis du Prophète. Il ne suffit donc pas qu’une phrase commence par « le Prophète a dit » : son attribution doit être établie. Dans ce parcours, on garde la référence donnée par le support et l’on distingue cette indication d’un travail personnel de vérification des transmissions.

Le consensus désigne un accord des savants dans le sens étudié par le cours. Ce n’est ni un sondage, ni le fait que plusieurs personnes de notre entourage soient du même avis. Une affirmation de consensus doit elle-même être documentée. Pour un débutant, le bon réflexe est de demander où cet accord est rapporté et comment il est expliqué.`,
`La saine nature, ou fitra, renvoie dans ce chapitre à la disposition originelle de l’être humain. La raison permet de réfléchir, de comprendre une explication et de comparer des arguments. Le cours leur donne une place, mais ne les confond pas avec un texte révélé.

Dans une discussion, sépare donc trois niveaux : « voici le texte », « voici son explication » et « voici mon impression ». Cette distinction évite de donner à une intuition personnelle le statut d’une preuve. Si une question dépasse ce que tu as étudié, garde-la dans ton carnet pour demander une explication ; laisser une question ouverte est préférable à fabriquer une réponse.`
], 'Chercher une source, vérifier ce qui lui est attribué, puis comprendre son rapport avec la question : ces trois gestes précèdent la conclusion.'),
chapter('Avoir une référence ne suffit pas toujours : il faut aussi savoir la comprendre. Ce chapitre expose une méthode de lecture qui réunit les textes et respecte leur langue et leur transmission.', [
`Un sujet peut être expliqué à plusieurs endroits. Un passage énonce une règle et un autre en précise la portée. Si l’on ne garde que la première phrase rencontrée, on risque de tirer une conclusion plus large que ce que les textes permettent.

Réunir les textes signifie donc chercher les précisions utiles avant de conclure. Ce travail n’est pas une compétition entre citations : il cherche à comprendre comment elles s’éclairent. Une difficulté apparente devient une question d’étude, et non une raison d’écarter immédiatement l’un des passages.`,
`Les compagnons ont reçu l’enseignement prophétique et occupent une place particulière dans la méthode présentée. Revenir à leur compréhension aide à ne pas donner à un texte un sens construit seulement à partir de nos habitudes actuelles.

Pour apprendre, distingue le texte cité, l’explication qui en est transmise et le commentaire pédagogique que tu lis aujourd’hui. Ils n’ont pas le même statut. Cette distinction permet aussi de poser une question précise : est-ce la référence, le sens d’un mot ou l’application que je ne comprends pas ?`,
`Un mot arabe peut avoir plusieurs usages. Son sens dans une phrase dépend de ce qui l’entoure et du sujet traité. Traduire mécaniquement un mot par un autre ne suffit donc pas toujours à expliquer un passage.

Tu n’as pas besoin de maîtriser toute la langue avant de commencer. Apprends les termes du chapitre avec leur définition, puis consulte une explication lorsque le sens reste difficile. La démarche est progressive : repérer le mot, lire son contexte, puis vérifier l’explication retenue.`
], 'La méthode réunit les textes, tient compte de la compréhension transmise et vérifie le sens des mots.'),
chapter('Ce chapitre étudie des obstacles à la compréhension. Il s’agit d’abord de reconnaître ces mécanismes dans sa propre manière d’apprendre.', [
`L’ignorance peut porter sur une définition, une preuve ou la manière de la comprendre. Elle n’est pas corrigée par l’assurance avec laquelle on parle. Le premier progrès consiste à pouvoir dire précisément ce que l’on ne sait pas encore.

Par exemple, connaître le nom du Tawhîd sans pouvoir le définir révèle un besoin d’explication. Revenir à une leçon de base est alors une démarche utile. Le chapitre met également en garde contre les discours trompeurs : multiplier les contenus écoutés ne garantit pas que l’on progresse.`,
`Il faut distinguer apprendre auprès d’une personne compétente et considérer qu’une personne appréciée ne peut jamais se tromper. Dans le premier cas, on cherche à comprendre ce qu’elle enseigne. Dans le second, l’attachement à la personne remplace l’examen de ce qui est dit.

Cette difficulté peut aussi venir d’une habitude familiale ou d’une idée répétée depuis longtemps. Pour la travailler, demande quelle preuve est avancée et comment elle est expliquée. Le respect dans la discussion et la recherche d’une justification peuvent aller ensemble.`,
`Exagérer, c’est dépasser la place qui convient à une chose ou à une personne. Le cours applique cette mise en garde aux personnes vertueuses : les aimer et apprendre de leur exemple ne revient pas à leur attribuer ce qui appartient à Allah.

Le chapitre mentionne aussi les passions et l’orgueil. Dans l’apprentissage, ils peuvent apparaître lorsque l’on refuse une correction uniquement parce qu’elle déplaît. Le repère est de revenir au fond de la question : qu’est-ce qui est établi, et quelle partie ai-je encore besoin de comprendre ?`
], 'Identifier un obstacle permet de choisir un remède : apprendre ce que l’on ignore, demander des preuves et accepter d’être corrigé.'),
chapter('Les difficultés du chapitre précédent appellent des réponses. Ici, on apprend à transformer la recherche de la science en une pratique régulière et structurée.', [
`Apprendre n’est pas seulement accumuler des phrases. Une notion est mieux acquise lorsque l’on peut la définir, expliquer sa raison et reconnaître un exemple qui l’illustre. Si l’une de ces étapes manque, il reste un point à travailler.

Prends les chapitres dans un ordre qui facilite la compréhension. La définition précède les distinctions, puis les applications. Une question notée et reprise avec une personne compétente permet souvent d’avancer davantage que plusieurs lectures rapides sans retour sur les difficultés.`,
`S’appuyer sur les preuves suppose de garder le lien entre une affirmation et son fondement. Une référence sans explication peut rester incomprise ; une explication sans référence peut être difficile à vérifier. L’apprentissage réunit les deux.

Lorsque plusieurs discours te semblent incompatibles, commence par formuler exactement le désaccord. Vérifie ensuite s’ils parlent du même sujet et dans le même sens. Le cours invite à revenir aux textes et à leurs explications plutôt qu’à choisir selon l’impression la plus forte.`,
`Mettre en pratique commence parfois par une petite habitude : vérifier avant de partager, réserver un moment à l’étude ou reformuler une notion sans regarder le texte. Ce sont des façons concrètes de faire vivre la méthode apprise.

Reviens sur une difficulté du chapitre précédent et associe-lui une réponse. Face à l’ignorance : apprendre. Face au suivi aveugle : demander le fondement. Face à l’orgueil : accepter de revoir une conclusion. Ce lien rend les voies protectrices plus faciles à retenir et à utiliser.`
], 'Une voie protectrice devient utile lorsqu’on sait quelle difficulté elle traite et comment l’appliquer.'),
chapter('Le Tawhîd est au centre du cours de croyance. Pour comprendre sa place, on étudie son sens puis la relation entre la conviction, la parole et l’adoration.', [
`Le sens d’unifier ne suffit pas, à lui seul, à expliquer le terme religieux. Le cours précise ce qui est réservé à Allah : ce qui Lui appartient dans Sa seigneurie, Son adoration, Ses noms et Ses attributs. Les catégories seront développées plus loin.

Cette définition répond à deux questions complémentaires : que reconnaît-on au sujet d’Allah, et vers qui dirige-t-on l’adoration ? Il faut garder ces deux questions ensemble pour ne pas réduire le Tawhîd à une simple affirmation de l’existence d’un créateur.`,
`La langue exprime une conviction, mais les mots ne sont pas étudiés comme des sons séparés de leur sens. Apprendre une formule comporte donc une explication : ce qu’elle affirme, ce qu’elle exclut et ce qu’elle engage dans la pratique.

Le cours rapproche ainsi l’intérieur et l’extérieur. Une conviction peut être exprimée par une parole, et la parole doit être comprise. Cette relation aide à voir pourquoi l’apprentissage ne peut pas se limiter à une récitation mécanique.`,
`L’adoration donne une dimension concrète au sujet. On ne demande plus seulement « quelle définition sais-je réciter ? », mais « à qui cet acte est-il voué ? ». La sincérité et le suivi de l’enseignement prophétique redeviennent alors des repères de travail.

Le chapitre présente aussi la place du Tawhîd dans l’appel des messagers et ses effets sur la vie du croyant. Il faut distinguer ces bienfaits de la définition elle-même : la définition dit ce qu’est le Tawhîd ; les bienfaits expliquent pourquoi son étude et sa mise en pratique comptent.`
], 'Comprendre le Tawhîd relie ce que le cœur croit, ce que la langue affirme et ce que les actes expriment.'),
chapter('Les récits des messagers sont différents, mais le cours y retrouve un appel commun. Ce chapitre apprend à ne pas confondre cette unité avec l’identité de toutes les prescriptions.', [
`Le point commun étudié est l’appel à adorer Allah seul. Les exemples de messagers ne sont donc pas une simple suite de biographies : ils permettent de retrouver ce même message dans plusieurs contextes.

Pour lire un exemple, distingue le messager, les personnes auxquelles il s’adresse et le contenu de son appel. Tu peux ensuite comparer les récits sans effacer leurs différences. C’est le message commun, et non l’identité des circonstances, qui constitue le fil conducteur.`,
`Un même terme peut être employé dans un sens général ou dans un sens plus particulier. Ici, le cours explique l’Islam au sens de la soumission à Allah dans les récits des messagers. Il faut donc regarder dans quel contexte le mot est utilisé.

Cette précision évite une confusion de lecture : rencontrer ce terme dans le récit d’un messager antérieur ne signifie pas que toutes les prescriptions détaillées étaient identiques. Le mot met ici en valeur la soumission et l’adoration d’Allah.`,
`La législation concerne les prescriptions enseignées à une communauté. Le cours distingue cette dimension de la base commune de la religion. Une même finalité générale ne permet donc pas de déduire que chaque règle détaillée est la même.

L’exercice consiste à pouvoir formuler les deux idées sans les opposer : les messagers appellent à l’adoration d’Allah seul ; leurs législations peuvent comporter des différences. Une explication complète conserve les deux parties.`
], 'Le message commun concerne l’adoration d’Allah seul ; il ne signifie pas que toutes les législations sont identiques.'),
chapter('Ce chapitre explique la construction de l’attestation et propose des catégories pour organiser l’étude du Tawhîd. Deux distinctions sont à apprendre séparément avant de les relier.', [
`La négation écarte l’adoration de ce qui est autre qu’Allah. Elle ne dit pas simplement que rien n’existe : elle porte sur le droit d’être adoré. Identifier ce sur quoi porte la négation est indispensable pour comprendre la formule.

Une négation seule laisserait le raisonnement inachevé. Il faut ensuite savoir à qui l’adoration est réservée. C’est pourquoi le cours étudie les deux parties de l’attestation ensemble, au lieu d’en retenir une moitié isolée.`,
`L’affirmation réserve l’adoration à Allah. Elle complète la négation : on écarte l’adoration d’autre qu’Allah et on la Lui voue. Cette construction permet de comprendre le sens de l’exclusivité.

Pour vérifier ta compréhension, reformule avec deux verbes : écarter et réserver. Si ton explication ne contient que l’un des deux, une partie du sens manque. Ce travail porte sur la signification de l’attestation, avant la mémorisation de son vocabulaire technique.`,
`Les trois catégories organisent des questions différentes. La seigneurie concerne notamment la création, la royauté et l’administration. L’adoration concerne les actes voués à Allah. Les noms et attributs concernent la manière dont Allah est nommé et décrit dans les textes.

Ces catégories ne désignent pas trois réalités indépendantes. Elles permettent d’étudier distinctement ce qui est reconnu au sujet d’Allah et ce qui est accompli par le croyant. Dire qu’Allah crée et dire que l’on adore Allah ne répond pas à la même question, même si les deux affirmations sont liées.`
], 'L’attestation réunit négation et affirmation. Les catégories du Tawhîd aident ensuite à organiser ce que l’on étudie.'),
chapter('Reconnaître Allah comme Créateur et Lui vouer l’adoration sont liés, mais ces expressions ne disent pas la même chose. Ce chapitre explique cette différence et ses conséquences.', [
`Reconnaître la seigneurie répond à une question sur Allah : qui crée, possède et administre ? Le chapitre rappelle que cette reconnaissance doit être distinguée de la question des actes d’adoration.

Cette distinction est importante dans un raisonnement. On ne doit pas remplacer une proposition par une autre simplement parce qu’elles se ressemblent. Reconnaître un fait au sujet du Créateur et diriger une adoration vers Lui sont deux éléments à expliquer.`,
`Vouer l’adoration répond à la question : à qui s’adresse cet acte ? Le cours explique que la reconnaissance de la seigneurie appelle l’adoration d’Allah seul. Le lien entre les deux a donc une portée pratique.

Pour apprendre la différence, formule deux phrases : « Je reconnais qu’Allah… » puis « Je Lui voue… ». La première décrit ce qui est reconnu ; la seconde décrit l’orientation de l’acte. Ce repère de vocabulaire aide à éviter de confondre les deux catégories.`,
`Les effets sur la foi ne sont pas une liste séparée du sujet. Ils découlent de la reconnaissance de la seigneurie. Le cours les développe avec des passages coraniques ; il invite ainsi à relier une connaissance à ce qu’elle produit chez le croyant.

Quand tu étudies un effet, explique le cheminement : quelle conviction est en jeu, comment est-elle justifiée et quel comportement éclaire-t-elle ? Cette méthode est plus utile que de mémoriser uniquement le titre d’un bienfait.`
], 'Reconnaître la seigneurie et vouer l’adoration sont deux idées distinctes que le cours met en relation.'),
chapter('Le cours présente trois familles d’arguments. Le but est de comprendre le rôle de chaque famille et de distinguer une preuve citée d’une illustration destinée à l’expliquer.', [
`La fitra est présentée comme la disposition naturelle originelle. Dans ce chapitre, elle constitue une première entrée dans la question de la reconnaissance du Créateur. Son étude s’appuie sur les textes et les explications du support.

Il faut distinguer cette notion d’une simple préférence personnelle. Dire « cela me plaît » et parler de la disposition originelle ne revient pas au même. On apprend d’abord la définition du terme, puis les raisons pour lesquelles le cours le mobilise.`,
`L’exemple du bateau invite à réfléchir au lien entre un ordre observé et ce qui l’explique. L’objectif n’est pas d’apprendre une histoire pour elle-même, mais d’identifier le raisonnement qu’elle rend plus facile à suivre.

Une illustration pédagogique n’est pas automatiquement un récit historique établi. Il faut donc la présenter comme un exemple de raisonnement, puis distinguer les références coraniques utilisées par le cours. Le lecteur sait ainsi quel statut donner à chaque élément de l’explication.`,
`Le chapitre classe ici les réponses aux invocations et les miracles rapportés dans les récits prophétiques. Ce classement aide à comprendre comment le support organise ses arguments ; il ne transforme pas toute impression personnelle en preuve de même nature.

Pour réviser, prends un exemple du cours et explique pourquoi il appartient à cette famille plutôt qu’à celle de la réflexion. L’important est de reconnaître la démarche utilisée et ce qui est précisément affirmé, sans ajouter au récit des détails absents de la source.`
], 'Nature originelle, réflexion et ressenti : il faut savoir les distinguer et identifier le statut des exemples employés.')
];
export const HADITH_TEACHING: ChapterTeaching[] = [
chapter('Le hadith utilise l’image d’une construction. Avant de retenir la liste, cherchons ce que cette image explique : la place des fondations dans l’ensemble de la pratique.', [
`Un pilier porte une construction. Dans le hadith, cette image montre la place des cinq éléments cités. Les attestations expriment l’adoration d’Allah seul et la reconnaissance du Messager ; la prière, la zakat, le jeûne et le pèlerinage sont des actes fondamentaux de la pratique.

Le cours met en relation plusieurs formes d’adoration : la parole, l’engagement du corps et les biens. La liste ne sert donc pas seulement à compter jusqu’à cinq. Elle montre que la pratique engage différents aspects de la vie.`,
`Les fondations et ce qui complète une construction n’ont pas la même place, mais les deux comptent. Le hadith ne signifie donc pas que tous les autres enseignements deviennent inutiles. Il met en relief les piliers sur lesquels la pratique repose.

Le support évoque aussi des divergences sur le délaissement de certains piliers. Pour cette première étude, retiens la distinction entre connaître la place d’un acte et porter un jugement sur une personne. Le second ne se déduit pas d’un questionnaire de débutant.`,
`Nommer un pilier n’est pas encore savoir l’accomplir. Ce chapitre donne une vue d’ensemble ; l’étude détaillée de la prière, de la zakat, du jeûne et du pèlerinage demande ensuite leurs cours propres.

Pour faire le lien avec ta pratique, choisis un pilier et identifie ce que tu sais déjà, puis une question précise à approfondir. Par exemple : savoir nommer la prière est un acquis ; apprendre ses conditions et son déroulement est une autre étape.`
], 'Les cinq piliers sont les fondations présentées par le hadith. Les connaître permet d’organiser la suite de son apprentissage.'),
chapter('Dans le hadith de Jibrîl, les questions construisent une véritable leçon. Lis le dialogue pour comprendre comment Islam, foi et excellence sont distingués puis reliés.', [
`Le récit met en scène quelqu’un qui interroge le Prophète en présence de ses compagnons. À la fin, l’identité de Jibrîl et le but de sa venue éclairent l’ensemble : il est venu leur enseigner leur religion. La forme du dialogue fait donc partie de l’enseignement.

Une question précise permet une réponse précise. Le chapitre commence par l’Islam, puis la foi et l’excellence. Ce mouvement aide le lecteur à organiser les notions au lieu de mémoriser une suite de listes sans comprendre à quoi chacune répond.`,
`Dans les réponses du récit, l’Islam est expliqué par les cinq piliers. La foi est expliquée par les six éléments : Allah, Ses anges, Ses livres, Ses messagers, le Jour dernier et le destin. L’excellence concerne la qualité de l’adoration, accomplie avec la conscience qu’Allah voit le croyant.

Ces trois explications ne décrivent pas trois religions différentes. Elles montrent des dimensions liées de la même religion : ce qui est pratiqué, ce qui est cru et la qualité avec laquelle on adore. Les distinguer permet de mieux comprendre leur relation.`,
`Prends l’exemple de la prière. Son accomplissement relève de la pratique ; les convictions du croyant lui donnent son sens ; la conscience de se tenir devant Allah concerne la qualité de l’adoration. Un même acte permet ainsi de relier les trois notions étudiées.

Le récit enseigne aussi à reconnaître les limites de son savoir. À la question sur l’Heure, la réponse n’invente pas une date. Cette attitude est un modèle d’apprentissage : dire que l’on ne sait pas peut être une réponse juste.`
], 'Islam : les piliers de la pratique. Foi : les convictions enseignées. Excellence : la qualité de l’adoration. Le dialogue apprend à les relier.'),
chapter('Le hadith des intentions demande de regarder ce qui motive une action. Il faut apprendre à distinguer l’acte visible et le but recherché, sans prétendre connaître le cœur des autres.', [
`L’intention répond à la question « pourquoi est-ce que je fais cela ? ». Elle donne une orientation à l’acte. Le récit illustre cette idée avec l’émigration : un déplacement peut être extérieurement semblable tout en étant accompli pour des buts différents.

Il ne s’agit donc pas d’ajouter une formule mécanique à chaque geste. Le cours attire l’attention sur ce que la personne recherche réellement. Comprendre le hadith, c’est pouvoir expliquer ce lien entre l’action et sa finalité.`,
`Un observateur voit le geste, mais n’accède pas directement à l’intention. Deux dons du même montant peuvent avoir des motivations différentes. Inversement, la modestie apparente d’un geste ne permet pas de mesurer la sincérité de celui qui l’accomplit.

La distinction entre habitude et adoration est également travaillée dans le cours. Le même type d’action peut être envisagé différemment selon son objectif. Cette leçon invite d’abord à examiner sa propre intention, plutôt qu’à attribuer des intentions aux autres.`,
`Avant une action, formule simplement le bien que tu recherches. Pendant l’action, remarque si ton attention se déplace uniquement vers le regard des autres. Après, évite de réduire sa valeur à ce qui a été publiquement remarqué.

Cet examen ne remplace pas la connaissance de la manière correcte d’agir. Le chapitre sur la conformité des œuvres complétera cette idée : la sincérité et la conformité sont deux questions distinctes, qui doivent être étudiées ensemble.`
], 'Le geste visible ne révèle pas à lui seul l’intention. L’apprentissage commence par la clarification de son propre objectif.'),
chapter('Le hadith rassemble une parole, une action utile et une disposition intérieure. Cette diversité aide à comprendre pourquoi la foi ne se réduit pas à une seule forme d’expression.', [
`La notion de branche permet de relier des éléments différents à un même ensemble. Le hadith cite la parole du Tawhîd, le retrait d’une nuisance du chemin et la pudeur. Ces exemples ne sont pas choisis pour leur ressemblance extérieure.

Ils montrent au contraire que la foi engage plusieurs dimensions de la personne. Une parole peut exprimer une conviction ; un acte peut rendre service ; une disposition intérieure peut orienter le comportement.`,
`Écarter une nuisance du chemin est une action concrète dont d’autres bénéficient. La pudeur concerne une disposition qui peut empêcher de faire ce qui est blâmable. La parole citée, elle, exprime le Tawhîd.

Pour comprendre le hadith, associe chaque exemple à ce qu’il met en lumière. Il ne suffit pas de dire « tout est pareil » : le lien entre les branches n’efface pas leur différence. C’est cette diversité ordonnée que la leçon invite à retenir.`,
`Cherche une occasion accessible de rendre un lieu plus sûr ou plus agréable, sans t’exposer à un danger. L’intérêt de cet exemple est de voir que l’utilité d’une action ne dépend pas de sa visibilité.

Puis explique le rapport avec le texte : tu ne choisis pas une bonne action au hasard, tu reconnais dans le quotidien un type d’acte mentionné par le hadith. Ce lien entre texte et situation rend l’apprentissage concret.`
], 'La diversité des branches relie paroles, actes et dispositions intérieures dans un même apprentissage de la foi.'),
chapter('Le récit de Muâdh montre comment transmettre dans un ordre compréhensible. L’objectif est de comprendre la progression, les priorités et l’attention portée aux destinataires.', [
`Le Prophète prépare Muâdh à rencontrer des personnes dont il lui précise la situation. L’enseignement n’est donc pas présenté sans tenir compte de ceux qui vont le recevoir. Comprendre le destinataire aide à choisir ce qu’il faut expliquer en premier.

Le cours étudie l’ordre des demandes dans ce récit. Cet ordre a un sens : une base prépare ce qui vient ensuite. Il ne s’agit pas de réciter toutes les obligations sans vérifier que les fondements ont été compris.`,
`Enseigner progressivement ne veut pas dire supprimer ce qui paraît difficile. Cela signifie choisir un ordre où chaque étape rend la suivante intelligible. Une explication trop chargée peut empêcher le débutant de reconnaître l’essentiel.

On distingue ainsi la totalité du programme et la première chose à enseigner. Le récit invite aussi à la justice dans la mise en pratique, notamment dans les indications relatives aux biens prélevés. Le contenu et la manière de transmettre vont ensemble.`,
`Si tu expliques une notion à quelqu’un, commence par une définition, puis un exemple, et seulement ensuite une précision supplémentaire. Vérifie ce que la personne a compris en lui demandant de reformuler.

Cet exemple pédagogique illustre la progression étudiée ; il n’ajoute pas une règle au récit. Il montre comment retenir sa méthode : partir d’une base comprise, respecter le destinataire et avancer sans l’écraser sous les détails.`
], 'La progression organise l’enseignement : comprendre les destinataires, établir les bases, puis expliquer la suite.'),
chapter('Ce chapitre explique la réponse donnée aux insinuations évoquées dans le hadith. Il distingue ce qui traverse l’esprit de ce que l’on choisit d’affirmer.', [
`Le récit décrit un enchaînement de questions qui finit par dépasser son objet. Le conseil donné associe la demande de protection auprès d’Allah et le fait de cesser de suivre cette chaîne. Les deux éléments font partie de la réponse étudiée.

Il faut donc lire la situation et la conduite ensemble. Retenir seulement les questions sans apprendre la réponse ferait perdre le but de la leçon.`,
`Une pensée peut surgir sans être voulue. Le fait qu’elle apparaisse ne signifie pas que la personne l’adopte comme conviction. Le cours aide à distinguer l’insinuation et l’adhésion ; cette distinction évite de conclure trop vite sur soi-même.

Cela ne revient pas non plus à interdire toute question d’apprentissage. Une question posée pour comprendre et une chaîne d’insinuations que l’on entretient sans fin ne sont pas décrites de la même manière dans cette leçon.`,
`La réponse apprise doit pouvoir être retrouvée simplement : demander la protection d’Allah et ne pas poursuivre l’enchaînement décrit. Le but n’est pas de fabriquer toujours plus de réponses à chaque nouvelle insinuation.

Si un point du cours reste obscur, écris une question précise pour l’étudier calmement. Cette leçon religieuse explique le texte ; elle ne permet pas à l’application de diagnostiquer l’état d’une personne à partir de ses pensées.`
], 'Une pensée involontaire et une conviction adoptée ne sont pas la même chose. Le hadith enseigne une conduite face aux insinuations décrites.'),
chapter('La question posée dans le récit est directe : si le destin est écrit, pourquoi agir ? La réponse du hadith permet d’étudier ensemble la foi au destin et l’effort.', [
`L’ordre d’œuvrer constitue le point décisif de la réponse. Le récit ne transforme pas la croyance au destin en permission de rester inactif. C’est pourquoi le cours relie l’enseignement sur ce qui est écrit à ce qui est demandé au croyant.

Pour comprendre une réponse, il faut garder en mémoire la question à laquelle elle répond. Ici, la tentation de délaisser l’action est précisément ce que la réponse corrige.`,
`Croire qu’Allah sait ne signifie pas que nous connaissons nous-mêmes notre avenir. Ce que le croyant doit faire aujourd’hui ne se déduit donc pas d’une prétendue connaissance de son issue cachée.

La leçon distingue ainsi deux niveaux : ce qui relève du destin et ce qui relève de l’action demandée. Les confondre peut conduire à justifier l’inaction par quelque chose que l’on ne connaît pas.`,
`Une manière de mettre la leçon en pratique est d’identifier un effort utile à ta portée : reprendre une étude, accomplir une obligation ou corriger une négligence connue. La démarche commence par ce sur quoi tu peux agir.

Tu ne prétends pas maîtriser tout le résultat. Tu reconnais simplement que l’incertitude sur l’avenir ne supprime pas la responsabilité de l’effort présent. C’est le lien central à savoir reformuler.`
], 'La foi au destin ne dispense pas d’agir. Le récit répond à la tentation de l’inaction par l’ordre d’œuvrer.'),
chapter('Le récit d’Ibn Masûd aborde la création et le destin. La leçon porte particulièrement sur l’humilité et la constance face à une issue que l’on ne connaît pas.', [
`Le texte mentionne la subsistance, la durée de vie, les œuvres et l’issue. Ces éléments appartiennent au récit transmis. Il faut les apprendre en respectant ce que le texte dit, sans lui ajouter des détails imaginés.

Dans ce cours, le récit est étudié pour son enseignement religieux. On distingue donc sa lecture et les commentaires pédagogiques qui en expliquent les conséquences sur l’attitude du croyant.`,
`Le fait qu’une issue soit connue d’Allah ne donne pas à une personne le pouvoir de l’annoncer pour elle-même ou pour autrui. Le cours attire l’attention sur la fin des œuvres et sur la nécessité de ne pas se croire définitivement à l’abri.

Cette vigilance n’est pas une invitation à abandonner. Elle signifie que l’on ne transforme pas un acquis actuel en garantie personnelle sur l’avenir. L’effort et la constance restent nécessaires.`,
`Après une période où tu as progressé, continue les habitudes qui t’ont aidé à apprendre et à agir. Évite de considérer qu’une réussite passée rend désormais tout effort inutile.

Le rapprochement avec le chapitre précédent est important : l’un enseigne à agir, l’autre à ne pas se reposer sur l’apparence de son état actuel. Ensemble, ils éclairent une attitude d’effort accompagnée d’humilité.`
], 'Le récit invite à la vigilance et à la constance ; il ne donne pas accès à la connaissance de sa propre issue.'),
chapter('Ce hadith relie trois directions : chercher l’utile, demander l’aide d’Allah et ne pas s’enfermer dans l’impuissance. Il distingue aussi ce qui précède un événement et ce qui le suit.', [
`Chercher l’utile demande de se demander ce qu’une action apporte réellement. Toutes les occupations ne servent pas le même objectif. La leçon invite à orienter son énergie vers ce qui bénéficie à la personne dans le cadre enseigné par le cours.

La demande d’aide n’est pas présentée comme un remplacement de l’effort. Les deux sont associés dans le texte : choisir une action utile et demander l’aide d’Allah pour l’accomplir.`,
`Avant un événement, on prépare les moyens à sa portée. Après ce qui est arrivé, on peut tirer un enseignement sans rester prisonnier d’un regret qui ne produit plus d’action. Le cours distingue ainsi apprendre d’une erreur et ressasser indéfiniment.

Accepter ce qui a eu lieu ne veut donc pas dire que toute préparation était inutile. Cette distinction aide à ne pas opposer l’effort et la foi au destin.`,
`Supposons qu’une séance d’apprentissage ait été manquée. Une réponse utile est d’identifier la difficulté, de choisir un prochain créneau réaliste et de reprendre. Répéter seulement « si j’avais… » ne suffit pas à reconstruire cette séance.

L’exemple ne promet pas que tout deviendra facile. Il rend visible le mouvement enseigné : chercher ce qui aide, employer les moyens disponibles et continuer à demander l’aide d’Allah.`
], 'L’effort, la demande d’aide et l’acceptation de ce qui est arrivé se complètent.'),
chapter('Le hadith enseigne une limite dans l’éloge du Prophète. Comprendre cette limite permet de garder ensemble le respect de sa place et l’adoration d’Allah seul.', [
`Le texte rappelle les qualités de serviteur et de messager. Le mot « serviteur » rappelle la relation à Allah ; le mot « messager » affirme la mission reçue. Les deux sont importants et doivent rester ensemble.

L’interdiction de l’exagération ne retire donc pas la dignité de la mission prophétique. Elle précise comment la reconnaître sans attribuer au Prophète ce qui appartient à Allah.`,
`Aimer une personne et lui attribuer une qualité divine sont deux choses différentes. Le cours travaille cette limite à partir de l’éloge : une formule peut sembler exprimer beaucoup d’amour tout en dépassant la place enseignée dans le texte.

Pour comprendre, demande ce que la phrase affirme réellement, plutôt que de juger uniquement l’émotion qu’elle provoque. C’est le contenu de l’éloge qui doit être examiné.`,
`Lorsque tu expliques ce chapitre, utilise d’abord les deux termes du hadith et définis-les. Tu peux ensuite montrer pourquoi ils répondent à deux confusions opposées : négliger la mission ou dépasser la place du messager.

Cette méthode permet de formuler le respect avec précision. L’apprentissage porte sur les mots employés et leur sens, pas sur une compétition dans la force des éloges.`
], 'Serviteur et messager : les deux qualités enseignent une juste compréhension de la place du Prophète.'),
chapter('Le chapitre explique la mise en garde du hadith à propos des tombes et des lieux de prière. On étudie d’abord son objet avant d’en tirer un enseignement.', [
`Une mise en garde a un objet précis. Ici, le texte porte sur le fait de prendre des tombes comme lieux de prière. Le cours rattache cet avertissement à la protection de l’adoration vouée à Allah.

Il est important de nommer exactement ce dont parle le texte. Une formule vague sur « les tombes » ferait perdre cette précision et pourrait conduire à confondre plusieurs situations.`,
`Le respect dû aux défunts ne signifie pas qu’on leur voue une adoration. Le chapitre apprend à distinguer l’affection, le souvenir et l’objet d’une pratique d’adoration.

Cette distinction se retrouve dans les leçons de Tawhîd. Une intention de respect doit être examinée avec la manière dont l’acte est accompli. C’est ce rapport entre intention, acte et destination de l’adoration qui structure l’explication.`,
`Pour restituer le cours, commence par la situation mentionnée, puis explique la mise en garde et sa raison. Tu évites ainsi de transformer un titre en formule générale sans contenu.

Si tu rencontres une situation particulière qui n’est pas expliquée dans le chapitre, note la question. L’exposé d’un principe ne fournit pas automatiquement une réponse détaillée à tous les cas possibles.`
], 'La leçon distingue le respect des défunts et la destination de l’adoration en expliquant la mise en garde du texte.'),
chapter('Ce récit demande une attention particulière à l’attribution : la parole adressée à la Pierre noire est celle de Umar. Elle explique pourquoi il suit un geste prophétique.', [
`Umar s’adresse à la Pierre noire et rappelle qu’elle ne détient pas par elle-même le pouvoir de nuire ou de profiter. Il explique ensuite que le fait d’avoir vu le Prophète l’embrasser est la raison pour laquelle il accomplit ce geste.

Le récit comporte donc une parole de compagnon et la mention d’un acte prophétique observé. Si l’on attribuait directement la phrase à la bouche du Prophète, on modifierait la structure du récit.`,
`Deux questions doivent être distinguées : qui parle, et quel exemple est suivi ? Ici, Umar parle ; il rapporte avoir observé le Prophète. Cette précision n’est pas secondaire : elle fait partie de la fidélité dans la transmission.

Le geste n’est pas présenté comme la conséquence d’un pouvoir indépendant attribué à la pierre. Il est expliqué par le suivi de l’exemple prophétique. C’est la distinction que le cours cherche à rendre claire.`,
`Avant de raconter ce récit, prépare une phrase d’introduction exacte : « Umar explique son geste en rappelant ce qu’il a vu faire au Prophète. » Cette formulation permet de conserver les rôles.

Le réflexe est utile dans tous les cours de hadith : identifier le rapporteur, le locuteur d’une parole citée et l’action rapportée. Ces rôles peuvent être réunis chez une personne ou répartis entre plusieurs.`
], 'Umar est le locuteur de la parole citée ; le geste suivi est celui qu’il a vu accomplir au Prophète.'),
chapter('Le chapitre traite du serment. Il demande de prêter attention aux mots employés et de distinguer les situations au lieu de donner une réponse identique à toute formule.', [
`Un serment n’est pas une simple phrase descriptive : il engage la parole de celui qui le prononce. Le cours étudie ce par quoi on jure et la manière de comprendre les expressions concernées.

Pour commencer, identifie donc la formule exacte. Sans elle, on risque de discuter d’une situation imaginée plutôt que de ce qui a réellement été dit. Le vocabulaire est ici une partie de l’objet du cours.`,
`Une expression répétée par habitude et une formule étudiée dans son contexte doivent être examinées avec précision. Le support distingue des situations ; il ne faut pas effacer ces distinctions en retenant seulement un titre.

L’apprentissage d’un principe ne donne pas accès à l’intention d’une autre personne. Pour comprendre un cas, on a besoin des éléments utiles et des explications correspondantes. Cette prudence fait partie d’une restitution fidèle du chapitre.`,
`Observe ta manière de parler et repère les expressions de serment que tu utilises. L’objectif est d’abord de comprendre tes propres mots et de les rapprocher du texte étudié.

Si une formule te pose question, écris-la exactement avant de demander une explication. Une question précise permet de recevoir une réponse plus utile qu’une situation résumée de façon approximative.`
], 'Comprendre le serment demande d’identifier la formule et sa situation, puis de revenir à l’explication du texte.'),
chapter('La parole sur le fait d’être avec ceux que l’on aime suscite l’espérance. Le cours apprend à relier cet amour aux choix et à l’exemple que l’on cherche à suivre.', [
`Le récit met en relation l’amour et ceux vers qui il se dirige. Pour le comprendre, il faut lire la question, la réponse et la réaction rapportée, et non détacher une courte formule de tout son contexte.

Le cours montre la place de cette parole dans l’espérance du croyant. L’émotion du récit aide à saisir son importance, mais l’étude doit aussi expliquer ce que cet amour signifie dans la vie.`,
`Aimer et suivre sont liés sans être des mots identiques. L’amour peut donner envie d’adopter une qualité ou une conduite. Il ne doit pas servir d’argument pour considérer tout effort comme inutile.

La leçon invite donc à éviter une lecture qui ne garderait qu’une déclaration verbale. Il faut pouvoir expliquer comment l’attachement à un bon exemple influence ce que l’on cherche à devenir.`,
`Choisis une qualité de l’exemple que tu admires : une manière d’apprendre, de parler ou d’agir que le cours permet de reconnaître. Décris ensuite une action réaliste qui en rapproche.

Tu ne prétends pas atteindre le même degré par une seule action. Tu donnes une direction concrète à cet amour. Cette différence entre une aspiration et une prétention est utile pour apprendre avec humilité.`
], 'L’amour étudié nourrit l’espérance et oriente vers un exemple à suivre ; il ne rend pas l’effort superflu.'),
chapter('Le chapitre traite du mérite des compagnons et du respect de leur place. Il invite aussi à la précision lorsqu’on rapporte des récits les concernant.', [
`Le mérite présenté par le texte ne se réduit pas à la comparaison d’une quantité de biens ou d’actes. Le cours attire l’attention sur la place des compagnons et sur ce qui distingue leur engagement.

Pour comprendre cette idée, sépare la mesure visible d’une action et sa place dans un contexte. Deux gestes qui se ressemblent extérieurement ne permettent pas de conclure immédiatement à une valeur identique.`,
`Étudier un mérite et entrer dans une querelle sont deux démarches différentes. Le cours n’invite pas à transformer les récits historiques en compétition verbale. Il demande de respecter ce qui est transmis et de ne pas parler sans connaissance.

Une parole provocatrice peut retenir l’attention sans aider à comprendre. Le bon réflexe consiste à demander quelle est la source du récit, son contenu exact et l’explication qui en est donnée.`,
`Avant de partager une anecdote sur un compagnon, vérifie que tu sais d’où elle vient. Si tu ne peux pas distinguer ce qui est établi de ce qui est seulement raconté, garde cette incertitude au lieu de présenter l’ensemble comme certain.

Cette manière de transmettre est une application concrète du respect étudié. Elle relie l’attitude envers les personnes et la rigueur dans ce que l’on dit à leur sujet.`
], 'Respecter la place des compagnons implique aussi de prendre soin des récits que l’on transmet à leur sujet.'),
chapter('Le hadith réunit trois qualités autour de la douceur de la foi. La leçon cherche à comprendre leur relation plutôt qu’à en faire trois formules isolées.', [
`Les qualités évoquées concernent l’amour d’Allah et de Son Messager, l’amour pour Allah et l’attachement à la foi. Elles portent donc sur ce qui occupe une place profonde dans le cœur et oriente les choix.

Une liste se retient mieux lorsque l’on voit ce qui relie ses éléments. Ici, le fil commun concerne les attachements : ce que l’on préfère, la raison pour laquelle on aime et ce dont on refuse de s’éloigner.`,
`La douceur de la foi ne se comprend pas comme une simple émotion agréable produite à volonté. Le cours la met en relation avec les qualités citées et avec la sincérité de ces attachements.

Il faut donc étudier les causes décrites plutôt que mesurer sa foi par une sensation passagère. Une émotion varie ; la leçon demande de comprendre une orientation plus profonde du cœur et de la conduite.`,
`Pour rendre le sujet concret, examine une relation ou un choix : est-ce seulement un intérêt immédiat qui le guide, ou aussi un bien religieux que tu cherches à préserver ? La question sert à réfléchir à ta propre conduite.

Ne transforme pas cette réflexion en lecture du cœur des autres. L’exercice consiste à savoir expliquer les trois qualités et à reconnaître ce qu’elles invitent à travailler en soi.`
], 'Les trois qualités se répondent : elles concernent les attachements du cœur et leur effet sur les choix.'),
chapter('Ce chapitre complète celui des intentions. Une question porte sur le but recherché ; l’autre sur la conformité de l’œuvre à l’enseignement reçu.', [
`Le texte présente le rejet de ce qui est ajouté à la voie religieuse sans en faire partie. Le cours explique ainsi pourquoi la bonne volonté ne suffit pas, à elle seule, à déterminer la manière d’accomplir une adoration.

Il faut distinguer l’intention et la forme de l’acte. Une personne peut rechercher un bien tout en ayant besoin d’apprendre comment agir correctement. Les deux apprentissages se complètent.`,
`Le support examine plusieurs aspects de la conformité : la cause, le genre, la quantité, la manière, le temps et le lieu. Ces repères montrent qu’une œuvre ne se décrit pas seulement par son nom.

Par exemple, une même appellation peut masquer une différence dans le moment ou la manière d’agir. Le cours invite à identifier le point concerné avant de conclure. Cette liste est une grille d’étude, pas une autorisation à trancher tous les cas sans explication.`,
`Lorsque tu apprends une pratique, demande ce qui en établit la manière et les conditions. Évite de considérer une habitude comme une preuve simplement parce qu’elle est familière ou qu’elle produit une émotion.

Relie ensuite les deux chapitres : « pourquoi est-ce que j’agis ? » renvoie à l’intention ; « comment cet acte est-il enseigné ? » renvoie à la conformité. Une réponse complète ne confond pas ces questions.`
], 'La sincérité concerne l’intention ; la conformité concerne l’œuvre. Les deux questions doivent être étudiées.'),
chapter('Le récit rassemble plusieurs conseils après une exhortation. Pour l’apprendre, on les distingue puis on cherche le fil qui les relie, sans isoler une formule de son explication.', [
`Le premier conseil est la crainte d’Allah. Le texte évoque ensuite l’écoute et l’obéissance, l’attachement à la Sunna et la mise en garde contre les nouveautés ajoutées à la religion. Le cours développe chaque point.

Il ne suffit pas de mémoriser cette liste : il faut comprendre le sens des mots et ce qu’ils concernent. C’est particulièrement important pour un conseil qui touche à la conduite au sein d’une communauté.`,
`Le terme « nouveauté » est expliqué ici dans le domaine religieux visé par le texte. Le cours le met en relation avec ce qui est ajouté à la religion sans en faire partie. Il ne faut pas remplacer cette explication par l’idée vague que toute chose nouvelle serait identique.

De même, un conseil cité doit être étudié avec les précisions de sa source. Les termes ne deviennent pas plus clairs lorsqu’on les détache du développement qui leur donne leur portée.`,
`Choisis un conseil et construis une restitution en trois phrases : ce qu’il dit, le sens du terme principal, puis ce qu’il invite à faire. Si tu ne peux pas expliquer le terme, c’est ce point qu’il faut reprendre.

Cette démarche aide à garder une leçon suivie. Elle évite de transformer une exhortation riche en quelques mots d’ordre dont on ne saurait plus expliquer la signification.`
], 'Les conseils se comprennent par leurs termes, leur contexte et leurs explications, avant leur application.'),
chapter('Le Prophète utilise des traits tracés au sol pour enseigner. Ce chapitre apprend à passer d’une image visible à son sens, sans lui faire dire davantage que le récit.', [
`Un trait représente le chemin d’Allah, tandis que d’autres traits représentent les sentiers qui s’en écartent. Le geste rend la distinction visible. Le cours explique ensuite la direction commune de l’image et des paroles.

Pour restituer le récit, il faut conserver les deux : le dessin aide à voir, la parole explique ce qui est montré. Décrire seulement les traits ferait perdre l’enseignement ; donner seulement un slogan ferait perdre la force de l’exemple.`,
`Une image pédagogique sert à faire comprendre une idée. Elle ne permet pas d’attribuer automatiquement une place à chaque personne rencontrée. Le cours distingue d’ailleurs les questions de fond des divergences dans les branches de la jurisprudence.

Cette précision empêche de transformer toute différence en opposition au chemin droit. Il faut identifier de quel type de question on parle et revenir à son explication.`,
`Face à une direction proposée, demande ce qui la fonde et vers quoi elle mène. Une invitation séduisante n’est pas une preuve en elle-même. Le chapitre rapproche cette vigilance de l’apprentissage des textes et de leurs explications.

Tu peux résumer la méthode ainsi : comprendre l’enseignement, vérifier le fondement d’une proposition et ne pas suivre uniquement une impression. L’image du chemin devient alors un repère de réflexion.`
], 'Le dessin éclaire une distinction ; son application demande une compréhension des textes et des situations.'),
chapter('Ce hadith montre que l’influence d’une action peut dépasser celui qui l’accomplit. Il invite à prendre au sérieux ce que l’on transmet et l’exemple que l’on donne.', [
`Le texte met en parallèle l’appel à la droiture et l’appel à l’égarement. Il décrit les conséquences de l’influence sur ceux qui suivent. La question n’est donc pas seulement « qu’ai-je fait ? », mais aussi « qu’ai-je encouragé ? ».

Le cours explique que l’appel peut passer par une parole, un enseignement ou une conduite prise en exemple. La transmission n’est pas limitée à une prise de parole formelle.`,
`Une personne peut reproduire ce qu’elle voit sans avoir reçu un ordre explicite. C’est pourquoi l’exemple donné compte. Le nombre de personnes touchées ne permet pas, à lui seul, de savoir si l’influence est bonne.

Cette distinction est particulièrement utile lorsqu’on partage un contenu : rendre une information visible n’est pas encore avoir vérifié qu’elle est juste. L’attention à la source fait partie de la responsabilité de transmettre.`,
`Avant de partager un conseil religieux, prends le temps d’en vérifier la référence et le sens. Si tu as transmis une erreur identifiable, la corriger permet d’agir sur ses effets plutôt que de laisser la diffusion se poursuivre.

L’exemple du partage est une application pédagogique du principe. Il rappelle que de petits gestes de transmission peuvent avoir une portée durable et qu’il vaut mieux transmettre clairement ce que l’on comprend.`
], 'Transmettre et montrer l’exemple ont des effets sur autrui. Vérifier ce que l’on encourage fait partie de cette responsabilité.')
];

export function chapterTeaching(id: string): ChapterTeaching | null {
 const match = /^sabirin-(tawhid|hadith)-(\d+)$/.exec(id);
 return match ? (match[1] === 'tawhid' ? TAWHID_TEACHING : HADITH_TEACHING)[Number(match[2]) - 1] ?? null : null;
}

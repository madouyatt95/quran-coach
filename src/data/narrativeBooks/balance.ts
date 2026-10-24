import {defineBook} from './defineBook';
import type {HadithNarrativeSource} from '../../lib/narrativeBooks';
const source=(number:string,description:string):HadithNarrativeSource=>({id:`bukhari-${number}-equilibre`,type:'hadith',collection:'Sahih al-Bukhari',number,url:`https://sunnah.com/bukhari:${number}`,grade:'Sahih — recueil de Sahih al-Bukhari',description,checkedAt:'2026-10-24'});
const salman=source('1968','La visite de Salman chez Abou al-Darda et la confirmation prophétique. Adaptation française originale de l’arabe ancien.');
const abdallah=source('5199','Conseil adressé à Abdallah ibn Amr : droits du corps, des yeux et de l’épouse. Adaptation originale.');
const three=source('5063','Les trois hommes qui veulent dépasser la pratique prophétique par des renoncements permanents. Adaptation originale.');

export const balanceBook=defineBook({
 id:'equilibre-droits',title:'Donner à chaque droit sa place',subtitle:'Trois récits sur la ferveur et la mesure',category:'story',checkedAt:'2026-10-24',
 note:'Trois épisodes distincts, sans chronologie commune inventée. Les indications portent sur les pratiques volontaires évoquées par les hadiths et ne dispensent jamais des obligations. Aucun diagnostic médical ou règle matrimoniale individuelle n’en est déduit. Le commentaire pédagogique est distingué de la narration par les sections.',
 chapters:[
  {id:'salman',title:'Le visiteur qui demande de dormir',sections:[
   {title:'Un repas dans la maison d’un frère',refs:[salman],text:`Le Prophète, que la paix et les bénédictions soient sur lui, a établi un lien de fraternité entre Salman et Abou al-Darda. Salman vient lui rendre visite. Il rencontre Oum al-Darda dans une tenue sans apprêt et lui demande ce qui se passe. Elle lui répond que son frère n’a plus de besoin dans ce monde. Sa parole attire l’attention du visiteur sur la vie de la maison.

Abou al-Darda arrive et prépare un repas pour lui. Salman l’invite à manger. Son hôte répond qu’il jeûne. Salman refuse alors de manger tant que lui-même ne mangera pas. Abou al-Darda prend le repas avec lui. La visite a commencé par une question, puis par un geste qui fait entrer la relation fraternelle dans une pratique concrète.

Lorsque vient la nuit, Abou al-Darda veut se lever pour prier. Salman lui demande de dormir. Il dort, puis veut de nouveau se lever. Salman lui dit encore de dormir. À la fin de la nuit, c’est cette fois Salman qui l’invite à se lever. Ils prient ensemble. Celui qui avait demandé le repos n’avait donc pas oublié la prière ; il lui a donné sa place dans une nuit qui comprend aussi le sommeil.

Il explique alors que son Seigneur a un droit sur lui, que sa personne a un droit sur lui et que sa famille a un droit sur lui. Il doit rendre à chacun son droit. Abou al-Darda rapporte ce qui s’est passé au Prophète. Celui-ci confirme que Salman a dit vrai. Le récit n’oppose pas l’adoration à la vie de la maison. Il nous montre une attention qui les considère ensemble.`},
   {title:'Regarder ce que l’enthousiasme ne voit plus',refs:[salman],text:`L’intervention de Salman nous surprend peut-être. Dans un livre de récits spirituels, nous pourrions attendre qu’un visiteur encourage seulement à faire davantage. Il commence pourtant par remarquer la situation d’une personne dans la maison. Il ne mesure pas tout à la quantité de jeûne ou au temps passé debout. Les relations et le repos font aussi partie de ce dont il faut répondre.

Le hadith concerne le jeûne volontaire et la prière de nuit de cet épisode. Il ne nous permet pas de traiter avec légèreté les obligations ni de décider à la place de chaque personne de son programme. Son enseignement nous demande plutôt une question plus complète : ce bien que je souhaite accomplir me rend-il attentif à tous les droits dont je suis chargé, ou m’en fait-il négliger certains ?

Cette question peut se poser dans une semaine ordinaire. On ajoute des activités, des engagements, des apprentissages. Chaque projet peut être bon, mais leur accumulation n’est pas forcément juste si elle ne laisse plus de place à ce qui est déjà confié. Il faut parfois entendre une personne proche ou un conseil bienveillant pour voir ce que notre seul enthousiasme ne remarquait plus.

Salman ne quitte pas son frère après lui avoir seulement adressé une leçon. Il partage le repas et demeure avec lui pendant la nuit, puis prie à ses côtés. Le conseil est porté par cette présence. Le livre garde cette image : deux hommes se lèvent ensemble à la fin de la nuit, après qu’un visiteur a rappelé qu’un corps et une famille ont eux aussi des droits.`},
  ]},
  {id:'abdallah',title:'Le corps dont on a la charge',sections:[
   {title:'Une question adressée à Abdallah',refs:[abdallah],text:`Dans un autre récit, le Messager d’Allah s’adresse à Abdallah ibn Amr. Il a été informé qu’il jeûne le jour et passe la nuit à prier. Il lui demande si c’est bien le cas. Abdallah confirme. Le conseil vient donc après une question qui fait préciser la pratique réelle de la personne à laquelle il parle.

Le Prophète lui dit de ne pas agir ainsi en permanence. Il lui demande de jeûner et de rompre le jeûne, de prier et de dormir. Puis il nomme les droits : son corps a un droit sur lui, ses yeux ont un droit sur lui et son épouse a un droit sur lui. Chaque mot rend présente une part de sa responsabilité que le programme de ferveur risquait de recouvrir.

Nous n’ajoutons pas à cette courte scène une maladie qu’Abdallah aurait déjà contractée ou une plainte de son épouse. La version retenue n’en parle pas. Elle nous donne la question, la réponse et l’enseignement. Cela suffit pour comprendre que le soin dû à soi et la relation conjugale sont pris en compte au cœur même du conseil religieux.

Les yeux nommés dans le hadith rendent ce rappel très concret. Le repos n’est pas présenté comme ce qui resterait lorsque toute activité importante est terminée. Il fait partie du droit que l’on doit honorer. On peut avoir la volonté d’accomplir beaucoup et avoir besoin d’apprendre la mesure qui permettra de le faire justement, sans épuiser ce qui a été confié.`},
   {title:'Apprendre une fidélité qui dure',refs:[abdallah,salman],text:`Le conseil à Abdallah rejoint celui de Salman, sans qu’il soit nécessaire de fondre les deux épisodes en une seule histoire. Dans les deux cas, la ferveur est accompagnée d’un rappel des droits. Une pratique n’est pas examinée seulement dans le moment où elle paraît facile. Elle est aussi replacée dans une vie, avec son corps, ses proches et la durée qui vient.

Pour nous, le rappel peut commencer par un examen simple de nos habitudes. Avons-nous laissé au sommeil une place suffisante ? Une personne qui compte sur nous peut-elle nous parler ? Le temps que nous consacrons à un projet nous rend-il plus disponibles pour une obligation, ou l’utilisons-nous pour nous soustraire à une responsabilité moins visible ? Ces questions sont proposées pour réfléchir ; elles ne sont pas attribuées à Abdallah.

Reconnaître une limite n’oblige pas à abandonner tout effort. Le conseil conserve le jeûne et la prière de nuit, mais leur donne une forme qui inclut aussi le repas et le repos. Il faut parfois modifier un rythme pour préserver la possibilité de continuer. Une pratique plus mesurée peut demander davantage de lucidité que l’élan initial qui voulait tout entreprendre.

Lorsque nous quittons cette scène, nous ne savons pas tous les gestes qu’Abdallah accomplira après cette parole. Nous connaissons cependant ce qui lui a été demandé. Le corps n’a pas été oublié, les yeux n’ont pas été oubliés, l’épouse n’a pas été oubliée. Le livre avance vers un troisième épisode, où le désir de faire plus se transforme en projets de renoncements pour toute la vie.`},
  ]},
  {id:'trois',title:'Le modèle que l’on n’a pas à dépasser',sections:[
   {title:'Trois projets et une réponse',refs:[three],text:`Trois hommes se rendent auprès des maisons des épouses du Prophète pour interroger sur son adoration. Lorsqu’ils en sont informés, ils la trouvent peu abondante au regard de ce qu’ils imaginaient devoir accomplir eux-mêmes. Ils évoquent le pardon accordé au Prophète et considèrent que leur propre situation devrait les conduire à faire davantage.

Chacun annonce alors un projet. Le premier priera toute la nuit, sans interruption. Le deuxième jeûnera continuellement, sans rompre. Le troisième se tiendra à l’écart des femmes et ne se mariera jamais. Leur volonté se formule dans la permanence : toujours, sans pause, sans retour vers une part ordinaire de la vie.

Le Messager vient et leur demande si ce sont eux qui ont prononcé ces paroles. Il affirme être celui qui craint le plus Allah et Le révère le plus parmi eux. Pourtant, il jeûne et rompt le jeûne, prie et dort, et se marie. Il rappelle avec force l’importance de ne pas se détourner de sa voie. L’intensité d’un projet ne suffit donc pas à en faire une pratique meilleure.

La réponse corrige leur manière de lire son exemple. Ils avaient entendu parler d’actes concrets puis construit l’idée d’un dépassement nécessaire. Le Prophète les ramène au modèle qu’ils étaient venus connaître. La mesure ne se trouve pas en dehors de sa ferveur. Elle appartient à la voie qu’il enseigne et à la manière dont il réunit l’adoration aux autres responsabilités de l’existence.`},
   {title:'Une place pour demain',refs:[three,abdallah,salman],text:`Ces trois récits parlent à celui qui commence avec beaucoup d’enthousiasme, mais aussi à celui qui pense ne plus en faire assez. Nous pouvons être tentés de mesurer la sincérité à une fatigue visible ou de croire qu’un engagement n’a de valeur que s’il occupe toute la place. Les épisodes que nous avons lus invitent à un examen plus juste : l’effort doit aussi rendre leurs droits à ceux qui les possèdent.

Il ne s’agit pas de fixer dans ce livre un programme unique pour toutes les personnes. Les besoins, les obligations et les capacités varient. La mesure demande parfois un conseil compétent et une attention à sa santé. Le récit religieux n’a pas à devenir une ordonnance médicale ni un moyen d’imposer à un proche un rythme décidé pour lui.

Nous pouvons en revanche choisir une fidélité simple : accomplir ce qui nous est demandé, réserver un effort volontaire que nous pouvons tenir et vérifier qu’il ne sert pas à oublier quelqu’un. Une prière, un apprentissage, un service ou un moment de présence gagnent à prendre place dans une vie qui ne traite ni le corps ni la famille comme un obstacle sans droit.

Le souvenir de Salman demeure au terme du livre. Il sait demander de dormir, puis inviter à se lever. Il sait partager un repas, puis rappeler un principe. Sa présence auprès de son frère nous laisse une manière d’encourager : aider quelqu’un à rendre sa vie plus juste, afin que son désir de bien ne lui fasse pas perdre de vue les responsabilités qu’il porte déjà.`},
  ]},
 ],
 epilogue:'La mesure ne retire pas au bien sa force. Elle peut lui donner la place qui permet de durer. Rendre à chaque droit sa part demande de regarder sa vie entière, puis de consentir parfois à un rythme moins spectaculaire et plus fidèle.',
 lessons:['Inclure le repos et les proches dans l’examen de ses engagements.','Distinguer une pratique volontaire d’une obligation.','Chercher un rythme juste plutôt qu’une intensité que l’on ne peut pas tenir.'],
 question:'Quel ajustement rendrait ton prochain effort plus durable et plus attentif aux droits de tes proches ?',
});

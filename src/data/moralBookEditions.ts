/** Stable navigation map for the short editions, retained for shared links and saved reading. */
export const moralVolumes = [
 {id:'or-et-intention',members:['or-et-intention','responsabilite-du-don']},
 {id:'aimer-sans-paraitre',members:['aimer-sans-paraitre','ceux-que-lon-ne-voyait-pas','force-de-douceur']},
 {id:'portes-de-misericorde',members:['portes-de-misericorde','coeur-eprouve']},
 {id:'juger-liberer-proteger',members:['juger-liberer-proteger','discernement-epreuve','signes-et-limites']},
 {id:'croire-parmi-les-siens',members:['croire-parmi-les-siens','une-parole-entendue','images-qui-reveillent']},
];
export const moralMemberChapters:Record<string,string[]>={
 'or-et-intention':['tresor','aumones','debiteur'],'responsabilite-du-don':['saba','sabbat','freres'],
 'aimer-sans-paraitre':['visite','uways','dattes'],'ceux-que-lon-ne-voyait-pas':['echarpe','mosquee','visite'],'force-de-douceur':['mosquee','manteau','priere'],
 'portes-de-misericorde':['mere','monture','crainte'],'coeur-eprouve':['maladie','tombe','ibrahim'],
 'juger-liberer-proteger':['thumama','enfant','arbre'],'discernement-epreuve':['voleur','orgueil','feu'],'signes-et-limites':['soleil','palmier','pluie'],
 'croire-parmi-les-siens':['croyant','epouse-pharaon','liens'],'une-parole-entendue':['plainte','aveugle','table','mosquee'],'images-qui-reveillent':['feu-orage','mirage','ecume','jardins'],
};
export function moralChapterId(bookId:string,chapterId:string){
 if(bookId==='ceux-que-lon-ne-voyait-pas'&&chapterId==='visite')return 'visite-malade';
 if(bookId==='force-de-douceur'&&chapterId==='mosquee')return 'mosquee-apprentissage';
 return chapterId;
}
/** Resolve links from the briefly published combined edition back to independent books. */
export function moralBookDestination(bookId:string,chapterId?:string|null){
 const volume=moralVolumes.find(v=>v.id===bookId);
 if(volume&&chapterId){
  for(const member of volume.members)for(const original of moralMemberChapters[member]){
   if(moralChapterId(member,original)===chapterId)return {bookId:member,chapterId:original};
  }
 }
 return moralMemberChapters[bookId]?{bookId,chapterId:chapterId||moralMemberChapters[bookId][0]}:null;
}

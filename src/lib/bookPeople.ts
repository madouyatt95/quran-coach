import {companionPortraits} from '../data/companionPortraits';
export interface BookPerson {id:string;name:string;aliases:string[];bookId?:string;chapterId?:string;portraitId?:string}
const shortNames:Record<string,string[]>={
 hamza:['Hamza'],jafar:['Jafar'],hafsa:['Hafsa'],'ibn-masud':['Ibn Masud','ibn Masud'],'abu-ubayda':['Abu Ubayda'],'umm-sulaym':['Umm Sulaym','Oum Soulaym'],nusayba:['Nusayba','Umm Umara'],
 'abu-bakr':['Abu Bakr','Abou Bakr'],umar:['Umar','Omar'],uthman:['Uthman','Othman'],ali:['Ali'],khadija:['Khadija'],fatima:['Fatima'],aicha:['Aicha','Aïcha'],bilal:['Bilal'],musab:['Musab'],asma:['Asma'], 'umm-salama':['Umm Salama','Oum Salama'],salman:['Salman'],khalid:['Khalid'], 'abu-hurayra':['Abu Hurayra','Abou Hourayra'], 'ibn-abbas':['Ibn Abbas','ibn Abbas','Abdullah ibn Abbas'],anas:['Anas'],muadh:['Muadh'], 'zayd-thabit':['Zayd ibn Thabit'], 'abu-dharr':['Abou Dharr','Abu Dharr'],'kaab-malik':['Kaab','Kab ibn Malik'],jabir:['Jabir'],talha:['Talha'],zubayr:['az-Zubayr','Az-Zubayr'],abdurrahman:['Abd ar-Rahman ibn Awf'],saad:['Saad ibn Abi Waqqas'],
};
const companions:BookPerson[]=companionPortraits.map(p=>({id:`companion:${p.id}`,name:p.nameFr,aliases:[p.nameFr,...shortNames[p.id]||[]],bookId:p.bookId,portraitId:p.id}));
const prophet=(id:string,name:string,aliases:string[],bookId=id,chapterId?:string):BookPerson=>({id:`person:${id}`,name,aliases:[name,...aliases],bookId,chapterId});
export const bookPeople:BookPerson[]=[...companions,
 prophet('adam','Adam',[]),prophet('nuh','Nuh',['Nouh','Noé']),prophet('ibrahim','Ibrahim',['Abraham']),prophet('yusuf','Yusuf',['Youssouf']),prophet('musa','Moussa',['Musa']),
 prophet('maryam','Maryam',[],'maryam-isa','vocation'),prophet('isa','Isa',['Issa'],'maryam-isa','mission'),prophet('dawud','Dawud',['Daoud'],'sulayman','justice'),prophet('sulayman','Sulayman',['Souleymane'],'sulayman','fourmi'),
 prophet('hajar','Hajar',[],'hajar-zamzam','vallee'),prophet('ismail','Ismail',['Ismaïl'],'hajar-zamzam','maison'),prophet('lut','Lout',['Lut'],'lut'),
 prophet('hud','Hud',[],'appels-et-mesure','hud'),prophet('salih','Salih',[],'appels-et-mesure','salih'),prophet('shuayb','Shuayb',[],'appels-et-mesure','shuayb'),
 prophet('yunus','Yunus',['Younous'],'voix-epreuve','yunus'),prophet('ayyub','Ayyub',['Ayoub'],'voix-epreuve','ayyub'),prophet('luqman','Luqman',[],'luqman-conseils'),
 prophet('muhammad','Muhammad',['Mohammed'],'sira-confiance'),
];
const escaped=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const patterns=bookPeople.flatMap(person=>[...new Set(person.aliases)].map(alias=>({person,alias,regex:new RegExp(`(^|[^\\p{L}\\p{M}])(${escaped(alias)})(?![\\p{L}\\p{M}])`,'gu')})));
export function peopleMentions(text:string):{start:number;end:number;person:BookPerson}[]{
 const matches=patterns.flatMap(({person,alias,regex})=>[...text.matchAll(regex)].flatMap(m=>{
  const start=m.index+m[1].length,end=start+alias.length;
  // A familiar given name does not identify a different person with another patronymic.
  if(!alias.includes(' ')&&/^\s+(?:ibn|bint)\s/u.test(text.slice(end)))return [];
  return [{start,end,person}];
 }));
 matches.sort((a,b)=>a.start-b.start||(b.end-b.start)-(a.end-a.start));
 const result:typeof matches=[];for(const m of matches){if(m.start>=(result.at(-1)?.end??0))result.push(m);}return result;
}
export function peopleInText(text:string){return [...new Map(peopleMentions(text).map(m=>[m.person.id,m.person])).values()];}

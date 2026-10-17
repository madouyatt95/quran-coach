export const DIAGNOSTIC=[
 {lesson:'categories',prompt:'Quelle est la nature de مَسْجِدٌ ?',options:['Un verbe','Un nom','Une particule'],answer:1,why:'Ce mot désigne une mosquée.'},
 {lesson:'pronouns',prompt:'Quel pronom désigne « tu » au masculin singulier ?',options:['أَنْتَ','هُوَ','نَحْنُ'],answer:0,why:'Anta désigne un destinataire masculin singulier.'},
 {lesson:'nominal',prompt:'Dans الْقَلَمُ جَدِيدٌ, quel est l’attribut ?',options:['الْقَلَمُ','Les deux mots','جَدِيدٌ'],answer:2,why:'Jadīdun apporte l’information « neuf » sur le stylo.'},
 {lesson:'prepositions',prompt:'Après مِنْ, le nom est normalement…',['options']:['À l’accusatif','Au génitif','Au nominatif'],answer:1,why:'Min est une préposition qui commande le génitif.'},
 {lesson:'conjugation',prompt:'أَفْتَحُ signifie ici…',options:['J’ouvre','Nous ouvrons','Il a ouvert'],answer:0,why:'Le préfixe أَـ indique ici la première personne du singulier.'},
 {lesson:'patterns',prompt:'Quel schème reconnaît-on dans فَاتِحٌ ?',options:['مَفْعُول','فَعَّلَ','فَاعِل'],answer:2,why:'Les radicales ف ت ح prennent ici la place de ف ع ل dans fāʿil.'},
];
export const diagnosticRecommendation=(answers:Record<string,number>)=>DIAGNOSTIC.find(q=>answers[q.lesson]!==q.answer)?.lesson||'agreement';

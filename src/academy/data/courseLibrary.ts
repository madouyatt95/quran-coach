import tawhid from './courses/tawhid.json';
import hadith from './courses/hadith.json';
import {TAWHID_PLANS,HADITH_PLANS} from './coursePedagogy';
import type {AcademyLevel,AcademyModule,QuizQuestion} from './types';
export const COURSE_DOCUMENTS=[tawhid,hadith];
export const COURSE_LEVELS:AcademyLevel[]=COURSE_DOCUMENTS.map(doc=>({
 id:doc.id as AcademyLevel['id'],title:doc.subject==='aqidah'?'Comprendre la Aqidah':'Vivre les enseignements des hadiths',titleAr:'',description:`${doc.chapters.length-1} chapitres expliqués · cours de ${doc.author}`,icon:doc.subject==='aqidah'?'🌿':'📜',gradient:doc.subject==='aqidah'?'linear-gradient(135deg,#234b43,#1c2538)':'linear-gradient(135deg,#25396b,#29203e)',
 modules:doc.chapters.filter(ch=>ch.number>0).map(ch=>{
 const plan=(doc.subject==='aqidah'?TAWHID_PLANS:HADITH_PLANS)[ch.number-1];
 const source={document:doc.id,page:ch.start,url:`${doc.pdf}#page=${ch.start}`};
 const questions:QuizQuestion[]=plan.concepts.map(([title,body],i)=>({q:`« ${body.split(/[.!?]/)[0]}. » Quelle notion cette phrase aide-t-elle à comprendre ?`,options:plan.concepts.map(([name])=>name),answer:i,explanation:`${title} : ${body} Retrouve le développement au chapitre ${ch.number} du cours.`,feedbacks:plan.concepts.map(([name],n)=>n===i?`Exact : ${name} est bien la notion expliquée.`:`« ${name} » correspond à une autre idée du chapitre. Ici, la phrase explique « ${title} » : ${body.split(/[.!?]/)[0]}.`)}));
 return {id:`${doc.id}-${ch.number}`,icon:'📚',title:ch.title,titleAr:'',description:plan.objective,category:doc.subject as AcademyModule['category'],sourceDocument:doc.id,difficulty:1,estimatedMinutes:10,content:[
 {type:'lesson',title:'Le cours expliqué',sections:plan.concepts.map(([title,body])=>({title,body,source}))},
 {type:'quiz',title:'Relier les notions',passThreshold:66,questions},
 {type:'lesson',title:'À toi de jouer',sections:[{title:'Réfléchir avant de répondre',body:plan.scenario,source,reflection:plan.reflection}]},
 {type:'quiz',title:'Une situation concrète',passThreshold:100,questions:[{q:plan.scenario,options:plan.choices,answer:plan.answer,explanation:plan.explanation,feedbacks:plan.choices.map((choice,n)=>n===plan.answer?plan.explanation:`« ${choice} » manque la distinction travaillée dans ce chapitre. ${plan.explanation}`)}]}
 ]};})
}));
export function courseChapter(moduleId:string){for(const doc of COURSE_DOCUMENTS){const ch=doc.chapters.find(c=>`${doc.id}-${c.number}`===moduleId);if(ch)return {doc,chapter:ch,pages:doc.pages.slice(ch.start-1,ch.end)};}return null;}

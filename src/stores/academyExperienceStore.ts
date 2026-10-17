import {create} from 'zustand';
import {persist} from 'zustand/middleware';
export interface CourseExperienceProgress {
 hypothesis:string;conclusion:string;node:number;explanationByNode:Record<number,string>;
 decisions:Record<string,number>;sequence:number[];explored:string[];oralChecks:string[];
}
export const emptyCourseExperience=():CourseExperienceProgress=>({hypothesis:'',conclusion:'',node:0,explanationByNode:{},decisions:{},sequence:[],explored:[],oralChecks:[]});
interface State {
 courses:Record<string,CourseExperienceProgress>;
 update:(id:string,patch:Partial<CourseExperienceProgress>)=>void;
 explain:(id:string,node:number,text:string)=>void;
 decide:(id:string,step:string,choice:number)=>void;
 explore:(id:string,key:string)=>void;
}
export const useAcademyExperienceStore=create<State>()(persist((set)=>({courses:{},
 update:(id,patch)=>set(state=>({courses:{...state.courses,[id]:{...emptyCourseExperience(),...state.courses[id],...patch}}})),
 explain:(id,node,text)=>set(state=>({courses:{...state.courses,[id]:{...emptyCourseExperience(),...state.courses[id],explanationByNode:{...state.courses[id]?.explanationByNode,[node]:text.slice(0,3000)}}}})),
 decide:(id,step,choice)=>set(state=>({courses:{...state.courses,[id]:{...emptyCourseExperience(),...state.courses[id],decisions:{...state.courses[id]?.decisions,[step]:choice}}}})),
 explore:(id,key)=>set(state=>({courses:{...state.courses,[id]:{...emptyCourseExperience(),...state.courses[id],explored:[...new Set([...(state.courses[id]?.explored||[]),key])]}}})),
}),{name:'qc-academy-experience-v1',version:1}));

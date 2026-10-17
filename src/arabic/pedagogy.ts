import guides from './guides.json';
import {LEVEL_GUIDES,LEVEL_REMEDIES} from './levelTwo';
import remediation from './remediation.json';
export interface Guide {opening:string;steps:{title:string;body:string}[];contrast:{arabic:string;explanation:string};why:string;reason:string;another:{arabic:string;explanation:string};trap:string}
export interface Remedy {feedback:Record<string,string>;check:{prompt:string;options:string[];answer:number;explanation:string}}
export const GUIDES:Record<string,Guide>={...guides,...LEVEL_GUIDES};
export const REMEDIES:Record<string,Remedy>={...remediation,...LEVEL_REMEDIES};

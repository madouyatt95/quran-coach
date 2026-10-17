interface Exercise {id:string;lesson:string}
export interface ExerciseHistory {seen:string[]}
/** Prefer a fresh example of the same notion; exhausted banks rotate predictably. */
export function nextChallenge<T extends Exercise>(bank:T[],current:T,seen:string[]=[]):T {
 const others=bank.filter(t=>t.id!==current.id&&t.lesson===current.lesson);
 const pool=others.length?others:bank.filter(t=>t.id!==current.id);
 return pool.find(t=>!seen.includes(t.id))||pool[(Math.max(0,seen.length-1))%Math.max(1,pool.length)]||current;
}
export function selectChallenge<T extends Exercise>(bank:T[],lesson:string,history:Record<string,ExerciseHistory>,kind:string):T {
 const pool=bank.filter(t=>t.lesson===lesson);
 const candidates=pool.length?pool:bank;
 const seen=history[`challenge:${kind}`]?.seen||[];
 return candidates.find(t=>!seen.includes(t.id))||candidates[seen.length%candidates.length];
}

import { createContext, useContext } from 'react';
import type { useAutomaticMosque } from './useAutomaticMosque';
export const AutomaticMosqueContext=createContext<ReturnType<typeof useAutomaticMosque>|null>(null);
export function useAutomaticMosqueControl(){
 const state=useContext(AutomaticMosqueContext);
 if(!state)throw new Error('Automatic mosque provider is missing');
 return state;
}

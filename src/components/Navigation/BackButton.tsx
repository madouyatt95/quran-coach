import type {ButtonHTMLAttributes} from 'react';
import {useSmartBack} from '../../hooks/usePageState';
/** In-app history first; a direct link gets a safe parent destination. */
export function BackButton({fallback,children='← Retour',...props}:ButtonHTMLAttributes<HTMLButtonElement>&{fallback:string}){
 const back=useSmartBack(fallback);
 return <button type="button" {...props} onClick={back}>{children}</button>;
}

import {persist as basePersist,createJSONStorage} from 'zustand/middleware';
import {profileStorage} from './profileStorage';
/** Keep Zustand's exact generic signature and existing migrations. */
export const persist:typeof basePersist=(initializer,options)=>basePersist(initializer,{storage:createJSONStorage(()=>profileStorage),...options});

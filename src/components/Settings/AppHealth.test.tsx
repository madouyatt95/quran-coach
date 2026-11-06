// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {MemoryRouter} from 'react-router-dom';
import {it,expect,vi} from 'vitest';
vi.mock('../../lib/audioLibrary',()=>({loadAudioLibrary:async()=>[],downloadedAudioIds:async()=>['verified-file']}));
vi.mock('../../lib/backupHealth',()=>({BACKUP_HEALTH_EVENT:'health',readBackupHealth:()=>({export:'2026-11-06T09:00:00Z'})}));
import {AppHealth} from './AppHealth';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('checks current content and real audio presence without claiming an export is a successful sync',async()=>{
 vi.stubGlobal('__QC_RELEASE__',{id:'test-build',builtAt:'2026-11-06T08:00:00Z'});
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:true,json:async()=>({id:'test-build',builtAt:'2026-11-06T08:00:00Z'})}));
 const host=document.createElement('div'),root=createRoot(host);
 await act(async()=>root.render(<MemoryRouter><AppHealth/></MemoryRouter>));
 expect(host.textContent).toContain('Aucune confirmation enregistrée');expect(host.textContent).toContain('Dernier fichier de sauvegarde préparé');
 await act(async()=>host.querySelector('button')!.click());
 expect(host.textContent).toContain('dernière version du contenu');expect(host.textContent).toContain('1 fichier de livres audio présent');
 expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/version.json?t='),expect.objectContaining({cache:'no-store'}));
 await act(async()=>root.unmount());vi.unstubAllGlobals();
});

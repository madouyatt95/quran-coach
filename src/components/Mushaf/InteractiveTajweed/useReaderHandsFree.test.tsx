// @vitest-environment jsdom
import {act} from 'react';
import {createRoot} from 'react-dom/client';
import {it,expect,vi} from 'vitest';
import {useReaderHandsFree} from './useReaderHandsFree';
import {claimMediaSession,mediaSessionOwner,releaseMediaSession} from '../../../lib/mediaSessionOwner';
import type {MushafAudioState} from '../hooks/useMushafAudio';
Object.assign(globalThis,{IS_REACT_ACT_ENVIRONMENT:true});
it('binds optional headphone controls, guards page turns in dialogs and leaves a new media owner intact',async()=>{
 const handlers=new Map<string,MediaSessionActionHandler|null>(),session={setActionHandler:vi.fn((a:string,h:MediaSessionActionHandler|null)=>handlers.set(a,h)),setPositionState:vi.fn(),metadata:null,playbackState:'none'};
 Object.defineProperty(navigator,'mediaSession',{configurable:true,value:session});
 const seek=vi.fn(),toggle=vi.fn(),next=vi.fn(),previous=vi.fn(),stop=vi.fn();
 const element=new EventTarget();Object.assign(element,{currentTime:5,duration:20,playbackRate:1});
 const audio={audioRef:{current:element},audioActive:true,audioPlaying:true,currentPlayingAyah:8,seekTo:seek} as unknown as MushafAudioState;
 const div=document.createElement('div'),root=createRoot(div);let blocked=false;
 function Harness(){useReaderHandsFree({audio,enabled:true,blocked,title:'2:1',voice:'Al-Husary',next,previous,toggle,stop});return null;}
 try{
  await act(async()=>root.render(<Harness/>));expect(mediaSessionOwner()).toMatch(/^mushaf-/);
  handlers.get('pause')!({action:'pause'});expect(toggle).toHaveBeenCalledOnce();
  handlers.get('nexttrack')!({action:'nexttrack'});expect(next).toHaveBeenCalledOnce();
  handlers.get('seekto')!({action:'seekto',seekTime:11});expect(seek).toHaveBeenCalledWith(11);
  blocked=true;await act(async()=>root.render(<Harness/>));handlers.get('nexttrack')!({action:'nexttrack'});expect(next).toHaveBeenCalledOnce();
  claimMediaSession('audio-library');session.setActionHandler.mockClear();await act(async()=>root.unmount());expect(session.setActionHandler).not.toHaveBeenCalled();
 }finally{releaseMediaSession('audio-library');delete (navigator as {mediaSession?:unknown}).mediaSession;}
});

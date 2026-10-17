import {it,expect,vi,afterEach} from 'vitest';
import {bindNarrationMedia,clearNarrationMedia,updateNarrationMedia} from './narrationMediaSession';
import {claimMediaSession,releaseMediaSession} from './mediaSessionOwner';
afterEach(()=>{releaseMediaSession('n');releaseMediaSession('quran');vi.unstubAllGlobals();});
it('binds lock screen transport, clamps position, and does not clear another player',()=>{
 const handlers=new Map<string,Function>(),session={setActionHandler:vi.fn((action,fn)=>handlers.set(action,fn)),setPositionState:vi.fn(),playbackState:'none',metadata:null};vi.stubGlobal('navigator',{mediaSession:session});const play=vi.fn(),pause=vi.fn(),seek=vi.fn();bindNarrationMedia('n','Title','Chapter',{play,pause,seek});handlers.get('play')!();handlers.get('pause')!();handlers.get('seekbackward')!({});handlers.get('seekto')!({seekTime:7});expect(play).toHaveBeenCalledOnce();expect(pause).toHaveBeenCalledOnce();expect(seek.mock.calls).toEqual([[-15,true],[7]]);updateNarrationMedia('n',true,30,20,1.25);expect(session.setPositionState).toHaveBeenCalledWith({duration:20,position:20,playbackRate:1.25});claimMediaSession('quran');session.setActionHandler.mockClear();clearNarrationMedia('n');expect(session.setActionHandler).not.toHaveBeenCalled();
});

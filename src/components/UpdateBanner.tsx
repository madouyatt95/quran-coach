import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { RefreshCw } from 'lucide-react';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useLiveFollowStore } from '../stores/liveFollowStore';
import { isSessionRoute, watchAppUpdates } from '../lib/appUpdates';

export function UpdateBanner() {
    const [available, setAvailable] = useState(false);
    const {pathname} = useLocation();
    const playing = useAudioPlayerStore(s => s.isPlaying);
    const following = useLiveFollowStore(s => s.active);
    // Preserve the whole session, including pauses between verses and recording preparation.
    const protectedSession = isSessionRoute(pathname) || playing || following;
    const protectedRef = useRef(protectedSession);
    const watcher = useRef<ReturnType<typeof watchAppUpdates> | null>(null);
    useEffect(() => {
        protectedRef.current = protectedSession;
        watcher.current?.checkIdle();
    }, [protectedSession]);
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;
        const instance = watchAppUpdates(navigator.serviceWorker, {
            isProtected: () => protectedRef.current,
            onAvailable: setAvailable,
            reload: () => window.location.reload(),
        });
        watcher.current = instance;
        return () => { instance.dispose(); watcher.current = null; };
    }, []);

    if (!available || protectedSession) return null;
    return <aside role="status" style={{position:'fixed',bottom:'calc(82px + env(safe-area-inset-bottom))',left:16,right:16,maxWidth:480,margin:'auto',zIndex:10000,
        background:'var(--color-bg-secondary)',border:'1px solid #c9a84c66',color:'var(--color-text-primary)',padding:'12px 16px',borderRadius:16,
        display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,boxShadow:'0 8px 30px #0003',fontSize:13}}>
        <span>Une nouvelle version est prête.</span>
        <button onClick={()=>watcher.current?.apply()} style={{display:'flex',alignItems:'center',gap:6,border:0,borderRadius:10,padding:'10px 12px',background:'#c9a84c',color:'#14181c',cursor:'pointer',flexShrink:0}}>
            <RefreshCw size={15}/> Mettre à jour
        </button>
    </aside>;
}

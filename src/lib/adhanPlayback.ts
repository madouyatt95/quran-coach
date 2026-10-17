import { create } from 'zustand';
import { playMediaClip } from './mediaPlayback';
import { ADHAN_RECORDINGS, adhanUrl } from './adhanCatalog';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { stopTts } from './ttsService';
import { stopAdhkarAudio } from './adhkarAudioService';

export const useAdhanPlayback = create<{
  id: string | null; title: string; status: 'idle' | 'loading' | 'playing' | 'error'; error: string;
}>(() => ({ id: null, title: '', status: 'idle', error: '' }));
let audio: HTMLAudioElement | undefined;
let current: AbortController | undefined;

export function stopAdhan() {
  current?.abort(); current = undefined;
  audio?.pause();
  useAdhanPlayback.setState({ id: null, title: '', status: 'idle', error: '' });
}
export async function playAdhan(id: string, title = 'Adhan') {
  if (!ADHAN_RECORDINGS.some(r => r.id === id)) return false;
  stopAdhan();
  window.dispatchEvent(new Event('quran-stop-playback'));
  const player = useAudioPlayerStore.getState();
  if (player.isPlaying) player.togglePlay();
  stopTts(); stopAdhkarAudio();
  audio ??= new Audio();
  const request = new AbortController(); current = request;
  useAdhanPlayback.setState({ id, title, status: 'loading', error: '' });
  const ok = await playMediaClip(audio, adhanUrl(id), {
    signal: request.signal,
    onStarted: () => { if (current === request) useAdhanPlayback.setState({ status: 'playing' }); },
  });
  if (current !== request) return false;
  current = undefined;
  useAdhanPlayback.setState(ok ? { id: null, title: '', status: 'idle' } : {
    status: 'error', error: 'Lecture impossible. Touchez Réessayer et vérifiez votre connexion si cet audio n’a pas encore été chargé.',
  });
  return ok;
}

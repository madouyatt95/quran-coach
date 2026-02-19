import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListenStore } from '../stores/listenStore';
import { useAssetsStore } from '../stores/assetsStore';
import { useDownloadStore } from '../stores/downloadStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useQuranStore } from '../stores/quranStore';
import { mp3QuranApi, ARABIC_FRENCH_COLLECTION, OMAR_HISHAM_COLLECTION } from '../lib/mp3QuranApi';
import { SURAH_NAMES_FR } from '../components/Mushaf/mushafConstants';
import { getReciterColor } from '../lib/assetPipeline';
import { trackAudioPlay } from '../lib/analyticsService';
import { ChevronLeft, Play, Download, CheckCircle2, Clock, Plus } from 'lucide-react';
import { AddToPlaylistModal } from '../components/Playlist/AddToPlaylistModal';
import type { PlaylistItem } from '../types';
import './ReciterDetailPage.css';

export function ReciterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { reciters } = useListenStore();
    const { assets } = useAssetsStore();
    const { surahs: quranSurahs } = useQuranStore();
    const { isDownloaded, downloadSurah, removeDownload, isDownloading } = useDownloadStore();
    const { setPlaylist, isPlaying, currentSurahNumber } = useAudioPlayerStore();

    const [surahs, setSurahs] = useState<any[]>([]);
    const [loadingSurahs, setLoadingSurahs] = useState(true);
    const [playlistModalItem, setPlaylistModalItem] = useState<PlaylistItem | null>(null);
    const { setLastListened } = useListenStore();

    // Resolve custom collections by their string id
    const CUSTOM_COLLECTIONS = [ARABIC_FRENCH_COLLECTION, OMAR_HISHAM_COLLECTION];
    const customCollection = CUSTOM_COLLECTIONS.find(c => c.id === id);
    const isCustom = !!customCollection;

    // Find reciter: custom collection, synthetic (-1 for Omar Hisham), or API reciter
    const reciter = customCollection
        ? customCollection
        : reciters.find(r => r.id.toString() === id || (id === OMAR_HISHAM_COLLECTION.id && r.id === -1));

    useEffect(() => {
        async function loadSurahs() {
            const data = await mp3QuranApi.getSurahs('fr');
            setSurahs(data);
            setLoadingSurahs(false);
        }
        loadSurahs();
    }, []);

    if (!reciter) {
        return <div className="detail-error">Récitant non trouvé</div>;
    }

    const asset = assets.get(reciter.id.toString());
    const initials = reciter.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    const handlePlaySurah = (surah: any) => {
        // Create a playlist from this surah to the end for auto-play
        const startIndex = surahs.findIndex(s => s.id === surah.id);
        const playlistItems = surahs.slice(startIndex).map(s => {
            const qSurah = quranSurahs.find(qs => qs.number === s.id);
            const bestMoshaf = !isCustom && (reciter as any).moshaf
                ? mp3QuranApi.getBestMoshaf((reciter as any).moshaf)
                : null;

            const audioUrl = isCustom
                ? customCollection!.getAudioUrl(s.id)
                : mp3QuranApi.getAudioUrl(bestMoshaf?.server || '', s.id);

            return {
                surahNumber: s.id,
                surahName: s.name,
                surahNameAr: qSurah?.name || s.name,
                transliteration: qSurah?.englishName.toUpperCase().replace('-', ' ') || s.name,
                totalAyahs: qSurah?.numberOfAyahs || 0,
                audioUrl,
                playbackType: 'surah' as const
            };
        });

        setPlaylist(playlistItems, 0, id || 'default');

        // Start playback immediately
        const audio = useAudioPlayerStore.getState().getAudioRef();
        audio.src = playlistItems[0].audioUrl!;
        audio.play().catch(console.error);
        useAudioPlayerStore.setState({ isPlaying: true });

        // Save last listened for resume feature (with full playlist context)
        setLastListened({
            reciterId: isNaN(Number(id)) ? -1 : Number(id),
            reciterName: reciter.name,
            surahNumber: surah.id,
            surahName: SURAH_NAMES_FR[surah.id] || surah.name,
            audioUrl: playlistItems[0].audioUrl!,
            position: 0,
            playlist: playlistItems,
            playlistIndex: 0,
        });

        trackAudioPlay(surah.id, SURAH_NAMES_FR[surah.id] || surah.name, reciter.name, 'reciter');
    };

    return (
        <div className="reciter-detail-page">
            <div className="detail-header-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
            </div>

            <div className="reciter-profile-hero">
                <div className="profile-photo-container">
                    {asset?.status === 'approved' ? (
                        <img src={asset.image_url} alt={reciter.name} className="profile-photo" />
                    ) : (
                        <div
                            className="profile-avatar-fallback"
                            style={{ backgroundColor: getReciterColor(reciter.id.toString()) }}
                        >
                            {initials}
                        </div>
                    )}
                </div>
                <div className="profile-text">
                    <h1>{reciter.name}</h1>
                    <p className="profile-moshaf">
                        {mp3QuranApi.getBestMoshaf((reciter as any).moshaf || [])?.name || 'Coran Complet'}
                    </p>
                </div>
            </div>

            <div className="surah-list-container">
                <div className="list-header">
                    <h2>Sourates ({surahs.length})</h2>
                    <button className="download-all-btn">Tout télécharger</button>
                </div>

                {loadingSurahs ? (
                    <div className="loading-spinner">Chargement...</div>
                ) : (
                    <div className="surah-rows">
                        {surahs.map(surah => {
                            const isCurrent = currentSurahNumber === surah.id && isPlaying;
                            const downloaded = isDownloaded(reciter.id.toString(), surah.id);
                            const downloading = isDownloading.has(`${reciter.id}-${surah.id}`);
                            const qSurah = quranSurahs.find(qs => qs.number === surah.id);
                            const transliteration = qSurah?.englishName.toUpperCase().replace('-', ' ');


                            return (
                                <div
                                    key={surah.id}
                                    className={`surah-row ${isCurrent ? 'active' : ''}`}
                                >
                                    <div className="surah-number">{surah.id}</div>
                                    <div className="surah-info-main" onClick={() => handlePlaySurah(surah)}>
                                        <div className="surah-names-container">
                                            <div className="surah-names-top">
                                                <span className="surah-name-fr">{SURAH_NAMES_FR[surah.id] || surah.name}</span>
                                                <span className="surah-name-trans">{transliteration}</span>
                                            </div>
                                            <span className="surah-name-ar">{qSurah?.name}</span>
                                        </div>
                                        <span className="surah-meta">
                                            {surah.makkia === 1 ? 'Mecquoise' : 'Médinoise'} • {qSurah?.numberOfAyahs} versets
                                        </span>
                                    </div>
                                    <div className="surah-actions">
                                        <button
                                            className="action-btn add-playlist-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const qSurah = quranSurahs.find(qs => qs.number === surah.id);
                                                const audioUrl = isCustom
                                                    ? customCollection!.getAudioUrl(surah.id)
                                                    : mp3QuranApi.getAudioUrl(mp3QuranApi.getBestMoshaf((reciter as any).moshaf).server, surah.id);

                                                setPlaylistModalItem({
                                                    surahNumber: surah.id,
                                                    surahName: surah.name,
                                                    surahNameAr: qSurah?.name || surah.name,
                                                    totalAyahs: qSurah?.numberOfAyahs || 0,
                                                    transliteration: qSurah?.englishName.toUpperCase().replace('-', ' ') || surah.name,
                                                    reciterId: reciter.id.toString(),
                                                    reciterName: reciter.name,
                                                    playbackType: 'surah',
                                                    audioUrl
                                                });
                                            }}
                                        >
                                            <Plus size={20} />
                                        </button>
                                        {downloading ? (
                                            <Clock size={20} className="icon-downloading" />
                                        ) : downloaded ? (
                                            <div className="downloaded-badge" onClick={() => removeDownload(reciter.id.toString(), surah.id)}>
                                                <CheckCircle2 size={20} color="#4CAF50" />
                                            </div>
                                        ) : (
                                            <button
                                                className="action-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const url = isCustom
                                                        ? customCollection!.getAudioUrl(surah.id)
                                                        : mp3QuranApi.getAudioUrl(mp3QuranApi.getBestMoshaf((reciter as any).moshaf).server, surah.id);
                                                    downloadSurah(reciter.id.toString(), surah.id, url);
                                                }}
                                            >
                                                <Download size={20} />
                                            </button>
                                        )}
                                        <button className="action-btn play-btn" onClick={(e) => { e.stopPropagation(); handlePlaySurah(surah); }}>
                                            {isCurrent ? <div className="playing-bars"><span></span><span></span><span></span></div> : <Play size={20} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {playlistModalItem && (
                <AddToPlaylistModal
                    item={playlistModalItem}
                    onClose={() => setPlaylistModalItem(null)}
                />
            )}
        </div>
    );
}

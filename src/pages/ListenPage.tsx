import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useListenStore } from '../stores/listenStore';
import { useAssetsStore } from '../stores/assetsStore';
import { searchWikimediaForReciter, getReciterColor } from '../lib/assetPipeline';
import { useNavigate } from 'react-router-dom';
import { usePlaylistsStore } from '../stores/playlistsStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { trackAudioResume } from '../lib/analyticsService';
import { ListMusic, ChevronLeft, Play } from 'lucide-react';
import './ListenPage.css';
import { OMAR_HISHAM_COLLECTION } from '../lib/mp3QuranApi';

// Route synthetic reciters (id=-1) to their custom collection ID
const getReciterRoute = (reciterId: number) =>
    reciterId === -1 ? `/listen/${OMAR_HISHAM_COLLECTION.id}` : `/listen/${reciterId}`;

export function ListenPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        reciters, featuredReciters, isLoading, searchQuery,
        fetchReciters, setSearchQuery, getFilteredReciters,
        lastListened,
    } = useListenStore();

    const { playlists } = usePlaylistsStore();
    const { assets, fetchAssets, addPendingAsset } = useAssetsStore();
    const { getAudioRef } = useAudioPlayerStore();

    // Format seconds to mm:ss
    const formatPos = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = Math.floor(sec % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    // Resume: restore audio + full playlist to saved position
    const handleResume = () => {
        if (!lastListened) return;
        const audio = getAudioRef();

        trackAudioResume(lastListened.surahNumber, lastListened.position);

        // Restore full playlist context if available
        const savedPlaylist = lastListened.playlist;
        const savedIndex = lastListened.playlistIndex ?? 0;

        if (savedPlaylist && savedPlaylist.length > 0) {
            // Full playlist resume: restore all items from saved index onward
            useAudioPlayerStore.setState({
                isPlaying: true,
                currentSurahNumber: lastListened.surahNumber,
                currentSurahName: lastListened.surahName,
                currentSurahNameAr: savedPlaylist[savedIndex]?.surahNameAr || '',
                playbackType: 'surah',
                playlist: savedPlaylist,
                currentPlaylistIndex: savedIndex,
                reciterId: lastListened.reciterId.toString(),
            });

            audio.src = lastListened.audioUrl;
            audio.currentTime = lastListened.position;
            audio.play().catch(() => { });
        } else {
            // Fallback: single track resume
            audio.src = lastListened.audioUrl;
            audio.currentTime = lastListened.position;
            audio.play().catch(() => { });
            useAudioPlayerStore.setState({
                isPlaying: true,
                currentSurahNumber: lastListened.surahNumber,
                currentSurahName: lastListened.surahName,
                currentSurahNameAr: '',
                playbackType: 'surah',
                playlist: [{
                    surahNumber: lastListened.surahNumber,
                    surahName: lastListened.surahName,
                    surahNameAr: '',
                    totalAyahs: 0,
                    audioUrl: lastListened.audioUrl,
                    playbackType: 'surah',
                }],
                currentPlaylistIndex: 0,
                reciterId: lastListened.reciterId.toString(),
            });
        }
    };

    useEffect(() => {
        fetchReciters();
        fetchAssets();
    }, []);

    const filteredReciters = getFilteredReciters();
    const popularReciters = useListenStore.getState().getPopularReciters();

    // Background task: search for missing assets
    useEffect(() => {
        if (!isLoading && reciters.length > 0) {
            reciters.slice(0, 10).forEach(async (r) => {
                if (!assets.has(r.id.toString())) {
                    const suggested = await searchWikimediaForReciter(r.name, r.id);
                    if (suggested) {
                        addPendingAsset(suggested);
                    }
                }
            });
        }
    }, [isLoading, reciters.length, assets, addPendingAsset]);

    return (
        <div className="listen-page">
            <header className="listen-header">
                <button className="listen-back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>{t('listen.title', 'Écoute')}</h1>
                <p>{t('listen.subtitle', 'Découvrez les plus belles récitations du Noble Coran')}</p>
            </header>

            {/* Resume Banner */}
            {lastListened && (
                <div className="listen-resume-banner">
                    <div className="listen-resume-info">
                        <span className="listen-resume-icon">🎧</span>
                        <div className="listen-resume-text">
                            <span className="listen-resume-reciter">{lastListened.reciterName}</span>
                            <span className="listen-resume-surah">
                                {lastListened.surahName}
                                {lastListened.position > 5 && (
                                    <span className="listen-resume-pos"> · {formatPos(lastListened.position)}</span>
                                )}
                            </span>
                        </div>
                    </div>
                    <button className="listen-resume-btn" onClick={handleResume}>
                        <Play size={16} />
                        {t('listen.resume', 'Reprendre')}
                    </button>
                </div>
            )}

            <div className="listen-search">
                <div className="audio-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder={t('listen.searchReciter', 'Chercher un récitant...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="listen-content">
                {/* User Playlists Section */}
                {!searchQuery && playlists.length > 0 && (
                    <section className="listen-section playlist-section">
                        <div className="section-header">
                            <h2 className="section-title">📂 {t('listen.myPlaylists', 'Mes Playlists')}</h2>
                        </div>
                        <div className="popular-reciters-scroll">
                            {playlists.map(playlist => (
                                <div
                                    key={playlist.id}
                                    className="popular-reciter-card playlist-card"
                                    onClick={() => navigate(`/playlists/${playlist.id}`)}
                                >
                                    <div className="popular-card-photo playlist-icon">
                                        <div className="playlist-avatar">
                                            <ListMusic size={32} />
                                            {playlist.items.length > 0 && (
                                                <span className="playlist-badge">{playlist.items.length}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="popular-card-name">{playlist.name}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
                {/* Popular Reciters Section */}
                {!searchQuery && popularReciters.length > 0 && (
                    <section className="listen-section">
                        <div className="section-header">
                            <h2 className="section-title">⭐ {t('listen.popularReciters', 'Récitants Populaires')}</h2>
                        </div>
                        <div className="popular-reciters-scroll">
                            {popularReciters.map(reciter => {
                                const asset = assets.get(reciter.id.toString());
                                const isApproved = asset?.status === 'approved';
                                const initials = reciter.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const bgColor = getReciterColor(reciter.id.toString());

                                return (
                                    <div
                                        key={reciter.id}
                                        className="popular-reciter-card"
                                        onClick={() => navigate(getReciterRoute(reciter.id))}
                                    >
                                        <div className="popular-card-photo">
                                            {isApproved ? (
                                                <img src={asset.image_url} alt={reciter.name} />
                                            ) : (
                                                <div
                                                    className="popular-avatar-fallback"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc, ${bgColor}88)`,
                                                    }}
                                                >
                                                    {initials}
                                                </div>
                                            )}
                                        </div>
                                        <span className="popular-card-name" title={reciter.name}>{reciter.name}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Featured Section (Arabe + Français) */}
                {!searchQuery && (
                    <section className="listen-section">
                        <h2 className="section-title">✨ {t('listen.arabicAndFrench', 'Arabe + Français')}</h2>
                        {featuredReciters.map(reciter => (
                            <div key={reciter.id} className="featured-reciter-card" onClick={() => navigate(`/listen/${reciter.id}`)}>
                                <div className="reciter-photo-placeholder" style={{ background: '#c9a84c' }}>📖</div>
                                <div className="reciter-info">
                                    <h3>{reciter.name}</h3>
                                    <p>{t('listen.completeQuranArFr', 'Coran Complet • Arabe & Français')}</p>
                                    <span className="badge-featured">{t('listen.pinned', 'Épinglé')}</span>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Reciters List */}
                <section className="listen-section">
                    <h2 className="section-title">🎙️ {t('listen.reciters', 'Récitants')}</h2>
                    <div className="reciter-grid">
                        {isLoading ? (
                            <div className="listen-loading">{t('common.loading', 'Chargement...')}</div>
                        ) : (
                            filteredReciters.map((reciter, idx) => {
                                const asset = assets.get(reciter.id.toString());
                                const isApproved = asset?.status === 'approved';
                                const initials = reciter.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const bgColor = getReciterColor(reciter.id.toString());

                                return (
                                    <div
                                        key={reciter.id}
                                        className="reciter-mini-card"
                                        onClick={() => navigate(getReciterRoute(reciter.id))}
                                        style={{ animationDelay: `${Math.min(idx, 30) * 30}ms` }}
                                    >
                                        <div className="reciter-card-photo">
                                            {isApproved ? (
                                                <img src={asset.image_url} alt={reciter.name} />
                                            ) : (
                                                <div
                                                    className="reciter-avatar-fallback"
                                                    style={{
                                                        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}dd, ${bgColor}99)`,
                                                    }}
                                                >
                                                    {initials}
                                                </div>
                                            )}
                                        </div>
                                        <div className="reciter-card-info">
                                            <span className="reciter-card-name" title={reciter.name}>{reciter.name}</span>
                                            <span className="reciter-card-moshaf">{reciter.moshaf[0]?.name || 'Hafs'}</span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

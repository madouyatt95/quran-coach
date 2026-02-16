import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useListenStore } from '../stores/listenStore';
import { useAssetsStore } from '../stores/assetsStore';
import { useDownloadStore } from '../stores/downloadStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { mp3QuranApi, ARABIC_FRENCH_COLLECTION } from '../lib/mp3QuranApi';
import { getReciterColor } from '../lib/assetPipeline';
import { ChevronLeft, Play, Download, CheckCircle2, Clock } from 'lucide-react';
import './ReciterDetailPage.css';

export function ReciterDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { reciters } = useListenStore();
    const { assets } = useAssetsStore();
    const { isDownloaded, downloadSurah, removeDownload, isDownloading } = useDownloadStore();
    const { playSurah, isPlaying, currentSurahNumber } = useAudioPlayerStore();

    const [surahs, setSurahs] = useState<any[]>([]);
    const [loadingSurahs, setLoadingSurahs] = useState(true);

    // Find reciter
    const reciter = id === ARABIC_FRENCH_COLLECTION.id
        ? ARABIC_FRENCH_COLLECTION
        : reciters.find(r => r.id.toString() === id);

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
        const audioUrl = id === ARABIC_FRENCH_COLLECTION.id
            ? ARABIC_FRENCH_COLLECTION.getAudioUrl(surah.id)
            : mp3QuranApi.getAudioUrl((reciter as any).moshaf[0].server, surah.id);

        playSurah({
            surahNumber: surah.id,
            surahName: surah.name,
            surahNameAr: surah.name,
            totalAyahs: 0,
            audioUrl,
            playbackType: 'surah'
        }, id || 'default');
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
                        {(reciter as any).moshaf?.[0]?.name || 'Coran Complet'}
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

                            return (
                                <div key={surah.id} className={`surah-row ${isCurrent ? 'active' : ''}`}>
                                    <div className="surah-number">{surah.id}</div>
                                    <div className="surah-info-main" onClick={() => handlePlaySurah(surah)}>
                                        <span className="surah-name-fr">{surah.name}</span>
                                        <span className="surah-meta">
                                            {surah.makkia === 1 ? 'Mecquoise' : 'Médinoise'}
                                        </span>
                                    </div>
                                    <div className="surah-actions">
                                        {downloading ? (
                                            <Clock size={20} className="icon-downloading" />
                                        ) : downloaded ? (
                                            <div className="downloaded-badge" onClick={() => removeDownload(reciter.id.toString(), surah.id)}>
                                                <CheckCircle2 size={20} color="#4CAF50" />
                                            </div>
                                        ) : (
                                            <button
                                                className="action-btn"
                                                onClick={() => {
                                                    const url = id === ARABIC_FRENCH_COLLECTION.id
                                                        ? ARABIC_FRENCH_COLLECTION.getAudioUrl(surah.id)
                                                        : mp3QuranApi.getAudioUrl((reciter as any).moshaf[0].server, surah.id);
                                                    downloadSurah(reciter.id.toString(), surah.id, url);
                                                }}
                                            >
                                                <Download size={20} />
                                            </button>
                                        )}
                                        <button className="action-btn play-btn" onClick={() => handlePlaySurah(surah)}>
                                            {isCurrent ? <div className="playing-bars"><span></span><span></span><span></span></div> : <Play size={20} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useEffect } from 'react';
import { useListenStore } from '../stores/listenStore';
import { useAssetsStore } from '../stores/assetsStore';
import { searchWikimediaForReciter, getReciterColor } from '../lib/assetPipeline';
import { useNavigate } from 'react-router-dom';
import './ListenPage.css';

export function ListenPage() {
    const navigate = useNavigate();
    const {
        reciters, featuredReciters, isLoading, searchQuery,
        fetchReciters, setSearchQuery, getFilteredReciters
    } = useListenStore();

    const { assets, fetchAssets, addPendingAsset } = useAssetsStore();

    useEffect(() => {
        fetchReciters();
        fetchAssets();
    }, []);

    const filteredReciters = getFilteredReciters();

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
    }, [isLoading, reciters.length]);

    return (
        <div className="listen-page">
            <header className="listen-header">
                <h1>Écoute</h1>
                <p>Découvrez les plus belles récitations du Noble Coran</p>
            </header>

            <div className="listen-search">
                <div className="audio-search-box">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Chercher un récitant..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="listen-content">
                {/* Featured Section */}
                {!searchQuery && (
                    <section className="listen-section">
                        <h2 className="section-title">✨ Arabe + Français</h2>
                        {featuredReciters.map(reciter => (
                            <div key={reciter.id} className="featured-reciter-card" onClick={() => navigate(`/listen/${reciter.id}`)}>
                                <div className="reciter-photo-placeholder" style={{ background: '#c9a84c' }}>📖</div>
                                <div className="reciter-info">
                                    <h3>{reciter.name}</h3>
                                    <p>Coran Complet • Arabe & Français</p>
                                    <span className="badge-featured">Épinglé</span>
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Reciters List */}
                <section className="listen-section">
                    <h2 className="section-title">🎙️ Récitants</h2>
                    <div className="reciter-grid">
                        {isLoading ? (
                            <div className="listen-loading">Chargement des récitants...</div>
                        ) : (
                            filteredReciters.map(reciter => {
                                const asset = assets.get(reciter.id.toString());
                                const isApproved = asset?.status === 'approved';
                                const initials = reciter.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

                                return (
                                    <div
                                        key={reciter.id}
                                        className="reciter-mini-card"
                                        onClick={() => navigate(`/listen/${reciter.id}`)}
                                    >
                                        <div className="reciter-card-photo">
                                            {isApproved ? (
                                                <img src={asset.image_url} alt={reciter.name} />
                                            ) : (
                                                <div
                                                    className="reciter-avatar-fallback"
                                                    style={{ backgroundColor: getReciterColor(reciter.id.toString()) }}
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

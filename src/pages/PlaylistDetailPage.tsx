import { useParams, useNavigate } from 'react-router-dom';
import { usePlaylistsStore } from '../stores/playlistsStore';
import { useAudioPlayerStore } from '../stores/audioPlayerStore';
import { useListenStore } from '../stores/listenStore';
import { ChevronLeft, Play, Trash2, ListMusic, Music, ChevronUp, ChevronDown } from 'lucide-react';
import './PlaylistDetailPage.css';

export function PlaylistDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { playlists, deletePlaylist, removeItemFromPlaylist, reorderItem } = usePlaylistsStore();
    const { setPlaylist, isPlaying, currentSurahNumber } = useAudioPlayerStore();

    const { setLastListened } = useListenStore();

    const playlist = playlists.find(p => p.id === id);

    if (!playlist) {
        return (
            <div className="playlist-detail-page">
                <div className="playlist-empty">
                    <ListMusic size={64} />
                    <h2>Playlist introuvable</h2>
                    <button className="btn-primary" onClick={() => navigate('/listen')}>Retour à l'écoute</button>
                </div>
            </div>
        );
    }

    const saveLastListened = (item: typeof playlist.items[0], index: number) => {
        setLastListened({
            reciterId: Number(item.reciterId || 0),
            reciterName: item.reciterName || playlist.name,
            surahNumber: item.surahNumber,
            surahName: item.surahName,
            audioUrl: item.audioUrl || '',
            position: 0,
            playlist: playlist.items,
            playlistIndex: index,
        });
    };

    const handlePlayAll = () => {
        if (playlist.items.length === 0) return;
        setPlaylist(playlist.items, 0, playlist.items[0].reciterId || '1');
        saveLastListened(playlist.items[0], 0);
    };

    const handlePlayItem = (index: number) => {
        setPlaylist(playlist.items, index, playlist.items[index].reciterId || '1');
        saveLastListened(playlist.items[index], index);
    };

    const handleDeletePlaylist = () => {
        if (window.confirm('Voulez-vous vraiment supprimer cette playlist ?')) {
            deletePlaylist(playlist.id);
            navigate('/listen');
        }
    };

    const handleRemoveItem = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        removeItemFromPlaylist(playlist.id, index);
    };

    return (
        <div className="playlist-detail-page">
            <header className="playlist-header-nav">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <button className="delete-plist-btn" onClick={handleDeletePlaylist}>
                    <Trash2 size={20} />
                </button>
            </header>

            <div className="playlist-hero">
                <div className="playlist-cover">
                    <ListMusic size={48} />
                </div>
                <h1>{playlist.name}</h1>
                <p className="playlist-stats">
                    {playlist.items.length} surahs · Créée le {new Date(playlist.createdAt).toLocaleDateString()}
                </p>
                <div className="playlist-actions">
                    <button
                        className="play-all-btn"
                        onClick={handlePlayAll}
                        disabled={playlist.items.length === 0}
                    >
                        <Play fill="currentColor" size={20} />
                        Ecouter tout
                    </button>
                </div>
            </div>

            <div className="playlist-items">
                {playlist.items.length === 0 ? (
                    <div className="items-empty">
                        <Music size={48} />
                        <p>Cette playlist est vide</p>
                        <button className="btn-secondary" onClick={() => navigate('/listen')}>Ajouter des surahs</button>
                    </div>
                ) : (
                    playlist.items.map((item, index) => {
                        const isCurrent = currentSurahNumber === item.surahNumber && isPlaying;

                        return (
                            <div
                                key={`${item.surahNumber}-${index}`}
                                className={`playlist-item-row ${isCurrent ? 'active' : ''}`}
                                onClick={() => handlePlayItem(index)}
                            >
                                <div className="item-number">{index + 1}</div>
                                <div className="item-info">
                                    <div className="item-names">
                                        <span className="item-name-ar">{item.surahNameAr}</span>
                                        <span className="item-name-fr">{item.surahName}</span>
                                    </div>
                                    <span className="item-reciter">{item.reciterName}</span>
                                </div>
                                <div className="item-actions">
                                    <button
                                        className="reorder-btn"
                                        disabled={index === 0}
                                        onClick={(e) => { e.stopPropagation(); reorderItem(playlist.id, index, index - 1); }}
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <button
                                        className="reorder-btn"
                                        disabled={index === playlist.items.length - 1}
                                        onClick={(e) => { e.stopPropagation(); reorderItem(playlist.id, index, index + 1); }}
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                    <button className="remove-item-btn" onClick={(e) => handleRemoveItem(index, e)}>
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

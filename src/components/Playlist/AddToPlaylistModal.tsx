import { useState } from 'react';
import { X, Plus, ListMusic, CheckCircle2 } from 'lucide-react';
import { usePlaylistsStore } from '../../stores/playlistsStore';
import type { PlaylistItem } from '../../types';
import './AddToPlaylistModal.css';

interface AddToPlaylistModalProps {
    item: PlaylistItem;
    onClose: () => void;
}

export function AddToPlaylistModal({ item, onClose }: AddToPlaylistModalProps) {
    const { playlists, createPlaylist, addItemToPlaylist } = usePlaylistsStore();
    const [newPlaylistName, setNewPlaylistName] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [addedTo, setAddedTo] = useState<string | null>(null);

    const handleCreateAndAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        const id = createPlaylist(newPlaylistName.trim());
        addItemToPlaylist(id, item);
        setAddedTo(id);
        setTimeout(onClose, 1500);
    };

    const handleAddToExisting = (playlistId: string) => {
        addItemToPlaylist(playlistId, item);
        setAddedTo(playlistId);
        setTimeout(onClose, 1500);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="playlist-modal" onClick={e => e.stopPropagation()}>
                <div className="playlist-modal__header">
                    <h3>Ajouter à une playlist</h3>
                    <button className="close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <div className="playlist-modal__item-preview">
                    <span className="item-name">{item.surahNameAr}</span>
                    <span className="item-detail">{item.surahName} · {item.reciterName}</span>
                </div>

                <div className="playlist-modal__content">
                    {!showCreateForm ? (
                        <>
                            <div className="playlist-list">
                                {playlists.map(p => (
                                    <button
                                        key={p.id}
                                        className={`playlist-item ${addedTo === p.id ? 'added' : ''}`}
                                        onClick={() => handleAddToExisting(p.id)}
                                        disabled={!!addedTo}
                                    >
                                        <div className="playlist-item__info">
                                            <ListMusic size={20} />
                                            <span>{p.name}</span>
                                        </div>
                                        {addedTo === p.id ? (
                                            <CheckCircle2 size={20} color="#4CAF50" />
                                        ) : (
                                            <span className="item-count">{p.items.length}</span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            <button className="create-plist-btn" onClick={() => setShowCreateForm(true)}>
                                <Plus size={20} />
                                <span>Nouvelle playlist</span>
                            </button>
                        </>
                    ) : (
                        <form className="create-plist-form" onSubmit={handleCreateAndAdd}>
                            <input
                                type="text"
                                placeholder="Nom de la playlist (ex: Lecture Lente)"
                                autoFocus
                                value={newPlaylistName}
                                onChange={e => setNewPlaylistName(e.target.value)}
                            />
                            <div className="form-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowCreateForm(false)}>
                                    Annuler
                                </button>
                                <button type="submit" className="btn-primary" disabled={!newPlaylistName.trim()}>
                                    Créer et ajouter
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

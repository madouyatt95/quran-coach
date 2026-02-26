import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, HardDrive, Trash2, Database, AlertCircle } from 'lucide-react';
import { getAudioCacheSize } from '../lib/audioCacheService';
import { useDownloadStore } from '../stores/downloadStore';
import './StoragePage.css';

export function StoragePage() {
    const navigate = useNavigate();
    const { tasks } = useDownloadStore();

    const [audioSize, setAudioSize] = useState('0 B');
    const [isCalculating, setIsCalculating] = useState(true);

    const completedTasks = Object.values(tasks).filter(t => t.status === 'completed');

    const refreshSize = async () => {
        setIsCalculating(true);
        const size = await getAudioCacheSize();
        setAudioSize(size);
        setIsCalculating(false);
    };

    useEffect(() => {
        refreshSize();
    }, [tasks]); // Refresh when tasks change

    const handleClearAll = async () => {
        if (window.confirm("Voulez-vous vraiment supprimer tout l'audio téléchargé ? Vous devrez télécharger à nouveau pour écouter hors-ligne.")) {
            const store = useDownloadStore.getState();
            for (const task of completedTasks) {
                await store.removeDownload(task.id, task.urls);
            }
            refreshSize();
        }
    };

    return (
        <div className="storage-page">
            <div className="storage-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1>Stockage Hors-Ligne</h1>
                <div style={{ width: 44 }} />
            </div>

            <div className="storage-content">
                <div className="storage-card master-card">
                    <div className="storage-card-header">
                        <HardDrive size={32} color="#c9a84c" />
                        <div className="storage-card-title">
                            <h3>Espace Audio (MP3)</h3>
                            <p>Taille estimée utilisée par les téléchargements</p>
                        </div>
                    </div>
                    <div className="storage-size">
                        {isCalculating ? "Calcul..." : audioSize}
                    </div>
                    {completedTasks.length > 0 && (
                        <button className="storage-btn-clear" onClick={handleClearAll}>
                            <Trash2 size={18} />
                            Tout supprimer
                        </button>
                    )}
                </div>

                <div className="storage-card info-card">
                    <Database size={24} color="#4facfe" />
                    <div className="info-text">
                        <p><strong>Textes & Données :</strong> Le Coran complet (texte), les 42 Hadiths et Tafsirs occupent environ <strong>~15 MB</strong> et sont gérés automatiquement en arrière-plan sans action requise.</p>
                    </div>
                </div>

                <h2 className="storage-section-title">Contenu Téléchargé ({completedTasks.length})</h2>

                {completedTasks.length === 0 ? (
                    <div className="storage-empty">
                        <AlertCircle size={40} color="rgba(255,255,255,0.2)" />
                        <p>Aucun audio téléchargé.</p>
                    </div>
                ) : (
                    <div className="storage-list">
                        {completedTasks.map(task => (
                            <div key={task.id} className="storage-item">
                                <div className="storage-item-info">
                                    <span className="storage-item-title">{task.title}</span>
                                    <span className="storage-item-sub">{task.urls.length} fichiers audio</span>
                                </div>
                                <button
                                    className="storage-item-delete"
                                    onClick={() => {
                                        useDownloadStore.getState().removeDownload(task.id, task.urls);
                                    }}
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

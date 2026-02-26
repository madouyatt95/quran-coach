import React, { useEffect } from 'react';
import { CloudDownload, Loader2, XCircle, CheckCircle2 } from 'lucide-react';
import { useDownloadStore } from '../stores/downloadStore';
import './DownloadButton.css';

interface DownloadButtonProps {
    id: string; // Identifiant unique, ex: "surah-1-reciter-7"
    title: string;
    urls: string[];
    className?: string;
    sampleUrlForCheck?: string; // URL à vérifier au montage pour set l'état initial
}

export function DownloadButton({ id, title, urls, className = '', sampleUrlForCheck }: DownloadButtonProps) {
    const { tasks, isItemCached, startDownload, removeDownload, verifyCacheStatus } = useDownloadStore();

    // Au montage, vérifier silencieusement si c'est déjà en cache
    useEffect(() => {
        if (sampleUrlForCheck && !tasks[id]) {
            verifyCacheStatus(id, sampleUrlForCheck);
        }
    }, [id, sampleUrlForCheck]);

    const task = tasks[id];
    const isCached = isItemCached(id); // Vrai si status === 'completed'

    const handleAction = async (e: React.MouseEvent) => {
        e.stopPropagation();

        if (isCached) {
            // Demander confirmation avant de supprimer
            if (window.confirm(`Voulez-vous supprimer "${title}" de vos téléchargements hors-ligne ?`)) {
                await removeDownload(id, urls);
            }
        } else if (!task || task.status === 'error') {
            await startDownload(id, title, urls);
        }
    };

    if (isCached) {
        return (
            <button
                className={`download-btn download-btn--done ${className}`}
                onClick={handleAction}
                title="Supprimer du mode hors-ligne"
            >
                <CheckCircle2 size={18} color="#4CAF50" />
            </button>
        );
    }

    if (task && task.status === 'downloading') {
        return (
            <button className={`download-btn download-btn--progress ${className}`} disabled>
                <div className="download-btn__spinner">
                    <Loader2 size={18} className="spin" color="#c9a84c" />
                    <span className="download-btn__percent">{task.progress}%</span>
                </div>
            </button>
        );
    }

    if (task && task.status === 'error') {
        return (
            <button
                className={`download-btn download-btn--error ${className}`}
                onClick={handleAction}
                title="Erreur. Réessayer ?"
            >
                <XCircle size={18} color="#F44336" />
            </button>
        );
    }

    // Par défaut, proposer le téléchargement
    return (
        <button
            className={`download-btn download-btn--idle ${className}`}
            onClick={handleAction}
            title="Télécharger pour écoute hors-ligne"
        >
            <CloudDownload size={18} color="rgba(255,255,255,0.7)" />
        </button>
    );
}

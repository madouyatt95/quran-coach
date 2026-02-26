import { useEffect } from 'react';
import { useAssetsStore } from '../stores/assetsStore';
import { useListenStore } from '../stores/listenStore';
import { ChevronLeft, Check, X, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './AdminAssetsPage.css';

export function AdminAssetsPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { assets, fetchAssets, updateAssetStatus } = useAssetsStore();
    const { reciters, fetchReciters } = useListenStore();

    useEffect(() => {
        fetchAssets();
        fetchReciters();
    }, []);

    const pendingAssets = Array.from(assets.values()).filter(a => a.status === 'pending');

    return (
        <div className="admin-assets-page">
            <header className="admin-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ChevronLeft size={24} />
                </button>
                <h1>{t('admin.assets.title', 'Modération Assets')}</h1>
            </header>

            <div className="admin-content">
                <div className="stats-row">
                    <div className="stat-card">
                        <span className="stat-num">{pendingAssets.length}</span>
                        <span className="stat-label">{t('admin.assets.pending', 'En attente')}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-num">{Array.from(assets.values()).filter(a => a.status === 'approved').length}</span>
                        <span className="stat-label">{t('admin.assets.approved', 'Approuvés')}</span>
                    </div>
                </div>

                <div className="assets-list">
                    {pendingAssets.length === 0 ? (
                        <div className="empty-state">{t('admin.assets.allUpToDate', 'Tout est à jour ! 🎉')}</div>
                    ) : (
                        pendingAssets.map(asset => {
                            const reciter = reciters.find(r => r.id.toString() === asset.reciter_id);
                            return (
                                <div key={asset.reciter_id} className="admin-asset-card">
                                    <div className="asset-preview">
                                        <img src={asset.image_url} alt="Reciter" />
                                    </div>
                                    <div className="asset-details">
                                        <h3>{reciter?.name || `Reciter #${asset.reciter_id}`}</h3>
                                        <p>{t('admin.assets.source', 'Source:')} {asset.image_source}</p>
                                        <p>{t('admin.assets.license', 'Licence:')} {asset.license_type}</p>
                                        <a href={asset.image_url} target="_blank" rel="noreferrer" className="link">
                                            {t('admin.assets.viewLive', 'Voir live')} <ExternalLink size={12} />
                                        </a>
                                    </div>
                                    <div className="asset-actions">
                                        <button
                                            className="action-btn approve"
                                            onClick={() => updateAssetStatus(asset.reciter_id, 'approved')}
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button
                                            className="action-btn reject"
                                            onClick={() => updateAssetStatus(asset.reciter_id, 'rejected')}
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

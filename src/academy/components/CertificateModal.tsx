import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Share2 } from 'lucide-react';
import './CertificateModal.css';

interface CertificateModalProps {
    userName: string;
    levelTitle: string;
    onClose: () => void;
}

export function CertificateModal({ userName, levelTitle, onClose }: CertificateModalProps) {
    const certificateRef = useRef<HTMLDivElement>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generatedDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            setIsGenerating(true);
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2, // High resolution
                useCORS: true,
                backgroundColor: '#1E1E24'
            });

            const image = canvas.toDataURL('image/png', 1.0);

            // Auto download
            const link = document.createElement('a');
            link.href = image;
            link.download = `Certificat_${levelTitle.replace(/\s+/g, '_')}.png`;
            link.click();
        } catch (error) {
            console.error('Failed to generate certificate:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleShare = async () => {
        if (!certificateRef.current) return;

        try {
            setIsGenerating(true);
            const canvas = await html2canvas(certificateRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#1E1E24'
            });

            canvas.toBlob(async (blob) => {
                if (!blob) return;

                const file = new File([blob], `Certificat_${levelTitle.replace(/\s+/g, '_')}.png`, { type: 'image/png' });

                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: 'Mon Certificat Quran Coach',
                        text: `J'ai complété le niveau "${levelTitle}" sur Quran Coach ! 🎓`,
                        files: [file]
                    });
                } else {
                    alert('Le partage direct de fichier n\'est pas supporté sur ce navigateur. Vous pouvez télécharger l\'image.');
                    handleDownload();
                }
            });
        } catch (error) {
            console.error('分享失敗:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="certificate-modal-overlay">
            <div className="certificate-modal-content">
                <button className="certificate-modal-close" onClick={onClose}>
                    <X size={24} />
                </button>

                <h2 className="certificate-modal-title">Félicitations ! 🎉</h2>
                <p className="certificate-modal-subtitle">Vous avez débloqué votre certificat de réussite.</p>

                {/* The visual certificate that will be captured */}
                <div className="certificate-frame-container">
                    <div className="certificate-frame" ref={certificateRef}>
                        <div className="certificate-border">
                            <div className="certificate-header">
                                <span className="certificate-app-name">Quran Coach</span>
                                <h1 className="certificate-main-title">Certificat d'Excellence</h1>
                            </div>

                            <div className="certificate-body">
                                <p className="certificate-text">Ceci certifie que</p>
                                <h2 className="certificate-user-name">{userName || 'Étudiant(e)'}</h2>
                                <p className="certificate-text">a complété avec succès le niveau :</p>
                                <h3 className="certificate-level-title">{levelTitle}</h3>
                            </div>

                            <div className="certificate-footer">
                                <div className="certificate-date">
                                    <span className="certificate-date-val">{generatedDate}</span>
                                    <span className="certificate-date-label">Date d'obtention</span>
                                </div>
                                <div className="certificate-signature">
                                    <span className="certificate-signature-val">Quran Coach Academy</span>
                                    <span className="certificate-signature-label">Signature</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="certificate-actions">
                    <button
                        className="certificate-btn certificate-btn-download"
                        onClick={handleDownload}
                        disabled={isGenerating}
                    >
                        <Download size={20} />
                        {isGenerating ? 'Création...' : 'Télécharger'}
                    </button>
                    {typeof navigator.share === 'function' && (
                        <button
                            className="certificate-btn certificate-btn-share"
                            onClick={handleShare}
                            disabled={isGenerating}
                        >
                            <Share2 size={20} />
                            Partager
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

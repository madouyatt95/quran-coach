import type { Node, Edge } from '@xyflow/react';

// Configuration des dimensions des nœuds
const xSpacing = 280;
const ySpacing = 120;

const COLORS = {
    prophet: '#FFD700', // Gold
    sahaba: '#4CAF50',  // Green (Médine/Compagnons)
    tabiin: '#2196F3',  // Blue
    qari: '#9C27B0'     // Purple (Les 10 Lecteurs)
};

export const initialNodes: Node[] = [
    // Niveau 0 : Le Prophète ﷺ
    {
        id: 'prophet',
        position: { x: xSpacing * 2.5, y: 0 },
        data: { id: 'prophet', label: 'Prophète Muhammad ﷺ\n(Révélation)', color: COLORS.prophet },
        type: 'sanadNode',
    },

    // Niveau 1 : Les Grands Sahaba (Lecteurs/Mémorisateurs)
    { id: 'sahaba_uthman', position: { x: xSpacing * 0.5, y: ySpacing }, data: { id: 'sahaba_uthman', label: '\'Uthman ibn \'Affan\n(3ème Calife)', color: COLORS.sahaba }, type: 'sanadNode' },
    { id: 'sahaba_ali', position: { x: xSpacing * 1.5, y: ySpacing }, data: { id: 'sahaba_ali', label: '\'Ali ibn Abi Talib\n(4ème Calife)', color: COLORS.sahaba }, type: 'sanadNode' },
    { id: 'sahaba_ubayy', position: { x: xSpacing * 2.5, y: ySpacing }, data: { id: 'sahaba_ubayy', label: 'Ubayy ibn Ka\'b\n(Le Maître des Lecteurs)', color: COLORS.sahaba }, type: 'sanadNode' },
    { id: 'sahaba_zayd', position: { x: xSpacing * 3.5, y: ySpacing }, data: { id: 'sahaba_zayd', label: 'Zayd ibn Thabit\n(Scribe de la Révélation)', color: COLORS.sahaba }, type: 'sanadNode' },
    { id: 'sahaba_ibn_masud', position: { x: xSpacing * 4.5, y: ySpacing }, data: { id: 'sahaba_ibn_masud', label: 'Abdullah ibn Mas\'ud\n(Kufa)', color: COLORS.sahaba }, type: 'sanadNode' },

    // Niveau 2 : Grands Tabi'in (Élèves des Sahaba)
    // Lignée de Médine (Nafi')
    { id: 'tabiin_abu_hurayra', position: { x: xSpacing * 1.5, y: ySpacing * 2 }, data: { id: 'tabiin_abu_hurayra', label: 'Abu Hurayra\n(Médine)', color: COLORS.tabiin }, type: 'sanadNode' },
    { id: 'tabiin_ibn_abbas', position: { x: xSpacing * 2.5, y: ySpacing * 2 }, data: { id: 'tabiin_ibn_abbas', label: 'Ibn Abbas\n(La Mecque/Médine)', color: COLORS.tabiin }, type: 'sanadNode' },
    // Lignée de Kufa (Asim / Hamza)
    { id: 'tabiin_sulami', position: { x: xSpacing * 3.5, y: ySpacing * 2 }, data: { id: 'tabiin_sulami', label: 'Abu \'Abdir-Rahman\nas-Sulami (Kufa)', color: COLORS.tabiin }, type: 'sanadNode' },
    { id: 'tabiin_zirr', position: { x: xSpacing * 4.5, y: ySpacing * 2 }, data: { id: 'tabiin_zirr', label: 'Zirr ibn Hubaysh\n(Kufa)', color: COLORS.tabiin }, type: 'sanadNode' },

    // Niveau 3 : Les Grands Imams des 10 Qira'at
    { id: 'qari_nafi', position: { x: xSpacing * 2, y: ySpacing * 3 }, data: { id: 'qari_nafi', label: 'Imam Nafi\'\n(Médine, mort en 169 H)', color: COLORS.qari }, type: 'sanadNode' },
    { id: 'qari_asim', position: { x: xSpacing * 4, y: ySpacing * 3 }, data: { id: 'qari_asim', label: 'Imam \'Asim\n(Kufa, mort en 127 H)', color: COLORS.qari }, type: 'sanadNode' },

    // Niveau 4 : Les Rapporteurs (Ruwat - Ceux qu'on lit aujourd'hui)
    { id: 'rawi_qalun', position: { x: xSpacing * 1.5, y: ySpacing * 4 }, data: { id: 'rawi_qalun', label: 'Qalun\n(Libye, Tunisie)', color: '#D32F2F' /* Red emphasis */ }, type: 'sanadNode' },
    { id: 'rawi_warsh', position: { x: xSpacing * 2.5, y: ySpacing * 4 }, data: { id: 'rawi_warsh', label: 'Warsh\n(Maghreb, Afrique)', color: '#D32F2F' }, type: 'sanadNode' },

    { id: 'rawi_shubah', position: { x: xSpacing * 3.5, y: ySpacing * 4 }, data: { id: 'rawi_shubah', label: 'Shu\'bah\n(Moyen-Orient ancien)', color: '#D32F2F' }, type: 'sanadNode' },
    { id: 'rawi_hafs', position: { x: xSpacing * 4.5, y: ySpacing * 4 }, data: { id: 'rawi_hafs', label: 'Hafs\n(Monde entier, 95% today)', color: '#D32F2F' }, type: 'sanadNode' },
];

export const initialEdges: Edge[] = [
    // Prophète -> Sahaba
    { id: 'e-prophet-uthman', source: 'prophet', target: 'sahaba_uthman', animated: true, style: { stroke: COLORS.sahaba, strokeWidth: 2 } },
    { id: 'e-prophet-ali', source: 'prophet', target: 'sahaba_ali', animated: true, style: { stroke: COLORS.sahaba, strokeWidth: 2 } },
    { id: 'e-prophet-ubayy', source: 'prophet', target: 'sahaba_ubayy', animated: true, style: { stroke: COLORS.sahaba, strokeWidth: 2 } },
    { id: 'e-prophet-zayd', source: 'prophet', target: 'sahaba_zayd', animated: true, style: { stroke: COLORS.sahaba, strokeWidth: 2 } },
    { id: 'e-prophet-ibn_masud', source: 'prophet', target: 'sahaba_ibn_masud', animated: true, style: { stroke: COLORS.sahaba, strokeWidth: 2 } },

    // Sahaba -> Tabi'in (Lignée Nafi')
    { id: 'e-ubayy-abuhurayra', source: 'sahaba_ubayy', target: 'tabiin_abu_hurayra', animated: true },
    { id: 'e-zayd-abuhurayra', source: 'sahaba_zayd', target: 'tabiin_abu_hurayra', animated: true },

    { id: 'e-ubayy-ibnabbas', source: 'sahaba_ubayy', target: 'tabiin_ibn_abbas', animated: true },
    { id: 'e-zayd-ibnabbas', source: 'sahaba_zayd', target: 'tabiin_ibn_abbas', animated: true },
    { id: 'e-ali-ibnabbas', source: 'sahaba_ali', target: 'tabiin_ibn_abbas', animated: true },

    // Sahaba -> Tabi'in (Lignée Asim)
    { id: 'e-ali-sulami', source: 'sahaba_ali', target: 'tabiin_sulami', animated: true },
    { id: 'e-uthman-sulami', source: 'sahaba_uthman', target: 'tabiin_sulami', animated: true },
    { id: 'e-zayd-sulami', source: 'sahaba_zayd', target: 'tabiin_sulami', animated: true },
    { id: 'e-ibn_masud-sulami', source: 'sahaba_ibn_masud', target: 'tabiin_sulami', animated: true },

    { id: 'e-ibn_masud-zirr', source: 'sahaba_ibn_masud', target: 'tabiin_zirr', animated: true },
    { id: 'e-ali-zirr', source: 'sahaba_ali', target: 'tabiin_zirr', animated: true },

    // Tabi'in -> Qari Nafi'
    { id: 'e-abuhurayra-nafi', source: 'tabiin_abu_hurayra', target: 'qari_nafi', animated: true, label: 'Transmission', style: { stroke: COLORS.qari, strokeWidth: 2 } },
    { id: 'e-ibnabbas-nafi', source: 'tabiin_ibn_abbas', target: 'qari_nafi', animated: true, style: { stroke: COLORS.qari, strokeWidth: 2 } },

    // Tabi'in -> Qari 'Asim
    { id: 'e-sulami-asim', source: 'tabiin_sulami', target: 'qari_asim', animated: true, label: 'Transmission', style: { stroke: COLORS.qari, strokeWidth: 2 } },
    { id: 'e-zirr-asim', source: 'tabiin_zirr', target: 'qari_asim', animated: true, style: { stroke: COLORS.qari, strokeWidth: 2 } },

    // Qari -> Ruwat (Lectures actuelles)
    { id: 'e-nafi-qalun', source: 'qari_nafi', target: 'rawi_qalun', animated: true, label: 'Riwâyah', style: { stroke: '#E53935', strokeWidth: 2 } },
    { id: 'e-nafi-warsh', source: 'qari_nafi', target: 'rawi_warsh', animated: true, label: 'Riwâyah', style: { stroke: '#E53935', strokeWidth: 2 } },

    { id: 'e-asim-shubah', source: 'qari_asim', target: 'rawi_shubah', animated: true, label: 'Riwâyah', style: { stroke: '#E53935', strokeWidth: 2 } },
    { id: 'e-asim-hafs', source: 'qari_asim', target: 'rawi_hafs', animated: true, label: 'Riwâyah', style: { stroke: '#E53935', strokeWidth: 2 } },
];

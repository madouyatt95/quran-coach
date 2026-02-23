import type { Node, Edge } from '@xyflow/react';

export const initialNodes: Node[] = [
    { id: 'adam', position: { x: 400, y: 0 }, data: { id: 'adam' }, type: 'prophetNode' },
    { id: 'idris', position: { x: 400, y: 120 }, data: { id: 'idris' }, type: 'prophetNode' },
    { id: 'nuh', position: { x: 400, y: 240 }, data: { id: 'nuh' }, type: 'prophetNode' },

    { id: 'hud', position: { x: 200, y: 360 }, data: { id: 'hud' }, type: 'prophetNode' },
    { id: 'salih', position: { x: 600, y: 360 }, data: { id: 'salih' }, type: 'prophetNode' },

    { id: 'ibrahim', position: { x: 400, y: 480 }, data: { id: 'ibrahim' }, type: 'prophetNode' },
    { id: 'lut', position: { x: 650, y: 480 }, data: { id: 'lut' }, type: 'prophetNode' }, // Nephew

    // Ismail branch
    { id: 'ismail', position: { x: 200, y: 600 }, data: { id: 'ismail' }, type: 'prophetNode' },
    { id: 'muhammad', position: { x: 200, y: 1320 }, data: { id: 'muhammad' }, type: 'prophetNode' }, // Distant descendant

    // Madyan / related
    { id: 'shuayb', position: { x: 100, y: 720 }, data: { id: 'shuayb' }, type: 'prophetNode' },

    // Ishaq branch
    { id: 'ishaq', position: { x: 500, y: 600 }, data: { id: 'ishaq' }, type: 'prophetNode' },
    { id: 'yaqub', position: { x: 500, y: 720 }, data: { id: 'yaqub' }, type: 'prophetNode' },
    { id: 'yusuf', position: { x: 650, y: 840 }, data: { id: 'yusuf' }, type: 'prophetNode' },

    // Ayyub branch
    { id: 'ayyub', position: { x: 350, y: 840 }, data: { id: 'ayyub' }, type: 'prophetNode' },
    { id: 'dhulkifl', position: { x: 350, y: 960 }, data: { id: 'dhulkifl' }, type: 'prophetNode' },

    // Musa & Harun
    { id: 'musa', position: { x: 500, y: 960 }, data: { id: 'musa' }, type: 'prophetNode' },
    { id: 'harun', position: { x: 650, y: 960 }, data: { id: 'harun' }, type: 'prophetNode' },

    // Kings
    { id: 'dawud', position: { x: 500, y: 1080 }, data: { id: 'dawud' }, type: 'prophetNode' },
    { id: 'sulayman', position: { x: 500, y: 1200 }, data: { id: 'sulayman' }, type: 'prophetNode' },

    { id: 'ilyas', position: { x: 350, y: 1200 }, data: { id: 'ilyas' }, type: 'prophetNode' },
    { id: 'alyasa', position: { x: 350, y: 1320 }, data: { id: 'alyasa' }, type: 'prophetNode' },

    { id: 'zakariyya', position: { x: 650, y: 1200 }, data: { id: 'zakariyya' }, type: 'prophetNode' },
    { id: 'yahya', position: { x: 650, y: 1320 }, data: { id: 'yahya' }, type: 'prophetNode' },
    { id: 'isa', position: { x: 800, y: 1320 }, data: { id: 'isa' }, type: 'prophetNode' },
];

export const initialEdges: Edge[] = [
    { id: 'e-adam-idris', source: 'adam', target: 'idris', type: 'smoothstep' },
    { id: 'e-idris-nuh', source: 'idris', target: 'nuh', type: 'smoothstep' },

    { id: 'e-nuh-hud', source: 'nuh', target: 'hud', type: 'smoothstep' },
    { id: 'e-nuh-salih', source: 'nuh', target: 'salih', type: 'smoothstep' },
    { id: 'e-nuh-ibrahim', source: 'nuh', target: 'ibrahim', type: 'smoothstep' },

    { id: 'e-ibrahim-lut', source: 'ibrahim', target: 'lut', type: 'smoothstep', animated: true }, // relation indirecte

    { id: 'e-ibrahim-ismail', source: 'ibrahim', target: 'ismail', type: 'smoothstep' },
    { id: 'e-ibrahim-ishaq', source: 'ibrahim', target: 'ishaq', type: 'smoothstep' },

    { id: 'e-ismail-muhammad', source: 'ismail', target: 'muhammad', type: 'smoothstep', animated: true }, // longue descendance

    { id: 'e-ibrahim-shuayb', source: 'ibrahim', target: 'shuayb', type: 'smoothstep', animated: true },

    { id: 'e-ishaq-yaqub', source: 'ishaq', target: 'yaqub', type: 'smoothstep' },
    { id: 'e-yaqub-yusuf', source: 'yaqub', target: 'yusuf', type: 'smoothstep' },

    { id: 'e-yaqub-ayyub', source: 'yaqub', target: 'ayyub', type: 'smoothstep', animated: true },
    { id: 'e-ayyub-dhulkifl', source: 'ayyub', target: 'dhulkifl', type: 'smoothstep' },

    { id: 'e-yaqub-musa', source: 'yaqub', target: 'musa', type: 'smoothstep', animated: true },
    { id: 'e-yaqub-harun', source: 'yaqub', target: 'harun', type: 'smoothstep', animated: true },

    { id: 'e-yaqub-dawud', source: 'yaqub', target: 'dawud', type: 'smoothstep', animated: true },
    { id: 'e-dawud-sulayman', source: 'dawud', target: 'sulayman', type: 'smoothstep' },

    { id: 'e-yaqub-ilyas', source: 'yaqub', target: 'ilyas', type: 'smoothstep', animated: true },
    { id: 'e-ilyas-alyasa', source: 'ilyas', target: 'alyasa', type: 'smoothstep' },

    { id: 'e-yaqub-zakariyya', source: 'yaqub', target: 'zakariyya', type: 'smoothstep', animated: true },
    { id: 'e-zakariyya-yahya', source: 'zakariyya', target: 'yahya', type: 'smoothstep' },

    // Maryam -> Isa (indirectement relié par Imran à Yaqub)
    { id: 'e-yaqub-isa', source: 'yaqub', target: 'isa', type: 'smoothstep', animated: true },
];

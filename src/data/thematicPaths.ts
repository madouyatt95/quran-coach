export interface PathStep {
    type: 'VERSE' | 'HADITH' | 'REFLECTION' | 'DUA';
    title?: string;
    text: string;
    textAr?: string;
    reference?: string;
    source?: string;
    narrator?: string;
    prompt?: string;
}

export interface ThematicPath {
    id: string;
    title: string;
    emoji: string;
    color: string;
    gradient: string;
    image: string;
    steps: PathStep[];
}

export const THEMATIC_PATHS: Record<string, ThematicPath> = {
    'serenity': {
        id: 'serenity',
        title: 'Retrouver la Paix Intérieure',
        emoji: '😌',
        color: '#4facfe',
        gradient: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
        image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
        steps: [
            {
                type: 'REFLECTION',
                text: 'Prends un instant pour fermer les yeux. Respire profondément. Tu es ici, maintenant, sous la protection du Très-Haut.',
            },
            {
                type: 'VERSE',
                textAr: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
                text: 'N’est-ce pas par l’évocation d’Allah que les cœurs s’apaisent ?',
                reference: '13:28',
            },
            {
                type: 'HADITH',
                text: 'L’affaire du croyant est étonnante ! Tout ce qui lui arrive est un bien. S’il reçoit un bienfait, il remercie et c’est un bien pour lui. S’il subit une épreuve, il patiente et c’est un bien pour lui.',
                source: 'Muslim',
                narrator: 'Suhaib ibn Sinan',
            },
            {
                type: 'REFLECTION',
                text: 'Rien de ce que tu traverses n\'est vain. Chaque souffle est une opportunité de reconnexion.',
            },
            {
                type: 'DUA',
                textAr: 'اللهم إني أسألك نفسا بك مطمئنة تؤمن بلقائك وترضى بقضائك وتقنع بعطائك',
                text: 'Ô Allah, je Te demande une âme apaisée par Toi, qui croit en Ta rencontre, accepte Ton décret et se contente de Tes dons.',
            }
        ]
    },
    'energy': {
        id: 'energy',
        title: 'Source d\'Électrisation Spirituelle',
        emoji: '🔋',
        color: '#38ef7d',
        gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
        steps: [
            {
                type: 'VERSE',
                textAr: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
                text: 'Cherchez secours dans l’endurance et la prière.',
                reference: '2:45',
            },
            {
                type: 'REFLECTION',
                text: 'Ta force ne vient pas de tes muscles, mais de ton lien avec Celui qui détient toute Puissance.',
            }
        ]
    },
    'gratitude': {
        id: 'gratitude',
        title: 'Cultiver la Gratitude',
        emoji: '✨',
        color: '#c9a84c',
        gradient: 'linear-gradient(135deg, #fceabb, #f8b500)',
        image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=600',
        steps: [
            {
                type: 'VERSE',
                textAr: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
                text: 'Si vous êtes reconnaissants, très certainement J’augmenterai [Mes bienfaits] pour vous.',
                reference: '14:7',
            }
        ]
    }
};

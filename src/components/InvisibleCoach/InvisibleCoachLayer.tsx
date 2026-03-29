// ─── Invisible Coach Layer ───────────────────────────────────
// Composant global monté dans App.tsx, orchestre les 3 niveaux
// d'intervention : whisper, nudge, celebration.

import { useInvisibleCoach } from '../../hooks/useInvisibleCoach';
import { CoachWhisper } from './CoachWhisper';
import { CoachNudge } from './CoachNudge';
import { CoachCelebration } from './CoachCelebration';

export function InvisibleCoachLayer() {
    const { currentIntervention, dismiss, action, snooze } = useInvisibleCoach();

    if (!currentIntervention) return null;

    switch (currentIntervention.level) {
        case 'whisper':
            return (
                <CoachWhisper
                    intervention={currentIntervention}
                    onDismiss={dismiss}
                    onAction={action}
                />
            );

        case 'nudge':
            return (
                <CoachNudge
                    intervention={currentIntervention}
                    onDismiss={dismiss}
                    onAction={action}
                    onSnooze={snooze}
                />
            );

        case 'celebration':
            return (
                <CoachCelebration
                    intervention={currentIntervention}
                    onDismiss={dismiss}
                />
            );

        default:
            return null;
    }
}

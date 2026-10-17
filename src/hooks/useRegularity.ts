import { useEffect } from 'react';
import { useStatsStore } from '../stores/statsStore';
import { localDay } from '../lib/learning';
/** Restore only dated evidence. Opening a screen or resuming the app is not activity. */
export function useRegularity() {
    useEffect(() => {
        let disposed = false;
        const unsubscribe: (() => void)[] = [];
        void Promise.all([
            import('../stores/companionStore'), import('../stores/listeningEvidenceStore'),
            import('../stores/academyKnowledgeStore'), import('../stores/learningStore'),
            import('../stores/fahmStore'), import('../stores/academyStore'),
        ]).then(([reading, listening, academy, learning, fahm, courses]) => {
            if (disposed) return;
            const stats = useStatsStore.getState();
            const timestamps = [
                ...listening.useListeningEvidenceStore.getState().entries.map(v => Date.parse(v.at)),
                ...Object.values(academy.useAcademyKnowledgeStore.getState().concepts).map(v => v.updatedAt),
                ...Object.values(learning.useLearningStore.getState().records).map(v => Date.parse(v.lastPracticed)),
                ...Object.values(fahm.useFahmStore.getState().learnedWords).map(v => v.lastReviewed),
            ].filter(v => Number.isFinite(v) && v > 0);
            stats.restoreActivityDays([...reading.useCompanionStore.getState().evidence.map(v => v.day), ...timestamps.map(v => localDay(new Date(v)))]);
            unsubscribe.push(reading.useCompanionStore.subscribe((s,p) => {
                if (s.evidence === p.evidence) return;
                for (const v of s.evidence.filter(v => !p.evidence.includes(v))) {
                    stats.recordActivity(v.at);
                    if (v.ayah === 0) stats.recordQualifiedPage(v.page, v.at);
                }
            }));
            unsubscribe.push(listening.useListeningEvidenceStore.subscribe((s,p) => { if(s.entries.some(v => !p.entries.includes(v))) stats.recordActivity(); }));
            unsubscribe.push(academy.useAcademyKnowledgeStore.subscribe((s,p) => { if(Object.entries(s.concepts).some(([k,v]) => v.attempts > (p.concepts[k]?.attempts || 0))) stats.recordActivity(); }));
            unsubscribe.push(learning.useLearningStore.subscribe((s,p) => { if(Object.entries(s.records).some(([k,v]) => v.attempts > (p.records[k]?.attempts || 0))) stats.recordActivity(); }));
            unsubscribe.push(fahm.useFahmStore.subscribe((s,p) => { if(s.totalReviews > p.totalReviews) stats.recordActivity(); }));
            unsubscribe.push(courses.useAcademyStore.subscribe((s,p) => { if(Object.entries(s.progress).some(([k,v]) => JSON.stringify(v.answers) !== JSON.stringify(p.progress[k]?.answers) && Object.keys(v.answers || {}).length > 0)) stats.recordActivity(); }));
        });
        const refresh = () => useStatsStore.getState().checkAndUpdateStreak();
        refresh(); const timer = window.setInterval(refresh, 30000);
        window.addEventListener('focus', refresh); document.addEventListener('visibilitychange', refresh);
        return () => { disposed = true; unsubscribe.forEach(fn => fn()); clearInterval(timer); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', refresh); };
    }, []);
}

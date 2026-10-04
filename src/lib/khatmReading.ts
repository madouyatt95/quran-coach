export const MIN_KHATM_READING_MS = 15_000;
export interface ReadingObservation {
    page: number; jump: number; ready: boolean; active: boolean;
    surah: number; ayah: number;
}
/** Conservative evidence of consultation, not a claim to detect whether someone has read. */
export class KhatmReadingTracker {
    private visit: {page:number; jump:number; since:number} | null = null;
    reset() { this.visit = null; }
    observe(observation: ReadingObservation, now: number): number | null {
        const previous = this.visit;
        if (!observation.active) { this.reset(); return null; }
        let completed: number | null = null;
        if (previous && previous.jump === observation.jump && observation.page === previous.page + 1 && now - previous.since >= MIN_KHATM_READING_MS) {
            completed = previous.page;
        }
        if (!observation.ready) this.reset();
        else if (!previous || previous.page !== observation.page || previous.jump !== observation.jump) {
            this.visit = {page:observation.page,jump:observation.jump,since:now};
        }
        return completed;
    }
    qualified(observation: ReadingObservation, now: number): boolean {
        return !!this.visit && observation.active && observation.ready && observation.page === this.visit.page && observation.jump === this.visit.jump && now - this.visit.since >= MIN_KHATM_READING_MS;
    }
}

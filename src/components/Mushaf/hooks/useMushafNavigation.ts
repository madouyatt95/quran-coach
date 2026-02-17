import { useCallback, useEffect, useRef } from 'react';

interface UseMushafNavigationOptions {
    currentPage: number;
    nextPage: () => void;
    prevPage: () => void;
}

export interface MushafNavigationHandlers {
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
    pageTransition: 'none' | 'turn-next' | 'turn-prev';
}

export function useMushafNavigation({
    currentPage,
    nextPage,
    prevPage,
}: UseMushafNavigationOptions): MushafNavigationHandlers {
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    // Page turn animation state
    const pageTransitionRef = useRef<'none' | 'turn-next' | 'turn-prev'>('none');

    // Scroll-based page navigation debounce
    const scrollDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastScrollNav = useRef(0);

    // Swipe handlers — RTL Quran: swipe right (L→R) = next page, swipe left (R→L) = prev page
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isSwiping.current = false;
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            isSwiping.current = true;
        }
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        if (!isSwiping.current) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 60;
        // RTL Quran: swipe right (L→R) = next page, swipe left (R→L) = prev page
        if (dx > threshold && currentPage < 604) {
            nextPage();
        } else if (dx < -threshold && currentPage > 1) {
            prevPage();
        }
    }, [currentPage, nextPage, prevPage]);

    // Scroll-based navigation: scroll to bottom = next page, scroll to top = prev page
    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        const now = Date.now();

        // Debounce: minimum 600ms between scroll-navigations
        if (now - lastScrollNav.current < 600) return;

        if (scrollDebounce.current) clearTimeout(scrollDebounce.current);

        scrollDebounce.current = setTimeout(() => {
            // Reached bottom
            if (el.scrollTop + el.clientHeight >= el.scrollHeight - 5 && currentPage < 604) {
                lastScrollNav.current = Date.now();
                nextPage();
            }
            // Reached top
            else if (el.scrollTop <= 0 && currentPage > 1) {
                lastScrollNav.current = Date.now();
                prevPage();
            }
        }, 150);
    }, [currentPage, nextPage, prevPage]);

    // Keyboard navigation (← →) — RTL: ← = prev, → = next
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowLeft' && currentPage < 604) {
                nextPage();
            } else if (e.key === 'ArrowRight' && currentPage > 1) {
                prevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, nextPage, prevPage]);

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        handleScroll,
        pageTransition: pageTransitionRef.current,
    };
}

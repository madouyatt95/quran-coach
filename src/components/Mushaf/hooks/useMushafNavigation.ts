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
}

export function useMushafNavigation({
    currentPage,
    nextPage,
    prevPage,
}: UseMushafNavigationOptions): MushafNavigationHandlers {
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);

    // Swipe handlers
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
        // RTL: swipe left = next page, swipe right = prev page
        if (dx < -threshold && currentPage < 604) {
            nextPage();
        } else if (dx > threshold && currentPage > 1) {
            prevPage();
        }
    }, [currentPage, nextPage, prevPage]);

    // Keyboard navigation (← →)
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
    };
}

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMushafNavigationOptions {
    currentPage: number;
    nextPage: () => void;
    prevPage: () => void;
}

export interface MushafNavigationHandlers {
    handleTouchStart: (e: React.TouchEvent) => void;
    handleTouchMove: (e: React.TouchEvent) => void;
    handleTouchEnd: (e: React.TouchEvent) => void;
    pullIndicator: { visible: boolean; direction: 'up' | 'down'; progress: number };
    pageTransitionClass: string;
    containerRef: React.RefObject<HTMLDivElement | null>;
}

const PULL_THRESHOLD = 80; // pixels to pull before triggering navigation

export function useMushafNavigation({
    currentPage,
    nextPage,
    prevPage,
}: UseMushafNavigationOptions): MushafNavigationHandlers {
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const isSwiping = useRef(false);
    const isPulling = useRef(false);
    const pullStartY = useRef(0);
    const containerRef = useRef<HTMLDivElement>(null);

    const [pullIndicator, setPullIndicator] = useState<{
        visible: boolean; direction: 'up' | 'down'; progress: number;
    }>({ visible: false, direction: 'down', progress: 0 });

    const [pageTransitionClass, setPageTransitionClass] = useState('');

    // Trigger page turn animation
    const animatePageTurn = useCallback((direction: 'next' | 'prev') => {
        setPageTransitionClass(direction === 'next' ? 'mih-page-turn-next' : 'mih-page-turn-prev');
        setTimeout(() => setPageTransitionClass(''), 500);
    }, []);

    // Swipe handlers — RTL Quran: swipe right (L→R) = next page
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
        isSwiping.current = false;
        isPulling.current = false;

        // Check if at scroll boundary for pull-to-navigate
        const el = containerRef.current;
        if (el) {
            const atTop = el.scrollTop <= 2;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
            if (atTop || atBottom) {
                isPulling.current = true;
                pullStartY.current = e.touches[0].clientY;
            }
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX.current;
        const dy = e.touches[0].clientY - touchStartY.current;

        // Horizontal swipe detection
        if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy) * 1.5) {
            isSwiping.current = true;
            isPulling.current = false;
            setPullIndicator({ visible: false, direction: 'down', progress: 0 });
            return;
        }

        // Pull-to-navigate (vertical overscroll)
        if (isPulling.current) {
            const el = containerRef.current;
            if (!el) return;
            const pullDy = e.touches[0].clientY - pullStartY.current;
            const atTop = el.scrollTop <= 2;
            const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;

            // Pulling down at top = prev page
            if (atTop && pullDy > 10 && currentPage > 1) {
                const progress = Math.min(pullDy / PULL_THRESHOLD, 1);
                setPullIndicator({ visible: true, direction: 'up', progress });
                e.preventDefault();
            }
            // Pulling up at bottom = next page
            else if (atBottom && pullDy < -10 && currentPage < 604) {
                const progress = Math.min(Math.abs(pullDy) / PULL_THRESHOLD, 1);
                setPullIndicator({ visible: true, direction: 'down', progress });
                e.preventDefault();
            }
            else {
                setPullIndicator({ visible: false, direction: 'down', progress: 0 });
            }
        }
    }, [currentPage]);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        // Handle pull-to-navigate
        if (isPulling.current && pullIndicator.visible) {
            if (pullIndicator.progress >= 1) {
                if (pullIndicator.direction === 'up' && currentPage > 1) {
                    animatePageTurn('prev');
                    prevPage();
                } else if (pullIndicator.direction === 'down' && currentPage < 604) {
                    animatePageTurn('next');
                    nextPage();
                }
            }
            setPullIndicator({ visible: false, direction: 'down', progress: 0 });
            isPulling.current = false;
            return;
        }

        // Handle swipe
        if (!isSwiping.current) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        const threshold = 60;
        // RTL Quran: swipe right (L→R) = next page, swipe left (R→L) = prev page
        if (dx > threshold && currentPage < 604) {
            animatePageTurn('next');
            nextPage();
        } else if (dx < -threshold && currentPage > 1) {
            animatePageTurn('prev');
            prevPage();
        }
    }, [currentPage, nextPage, prevPage, pullIndicator, animatePageTurn]);

    // Keyboard navigation (← →)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === 'ArrowLeft' && currentPage < 604) {
                animatePageTurn('next');
                nextPage();
            } else if (e.key === 'ArrowRight' && currentPage > 1) {
                animatePageTurn('prev');
                prevPage();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, nextPage, prevPage, animatePageTurn]);

    return {
        handleTouchStart,
        handleTouchMove,
        handleTouchEnd,
        pullIndicator,
        pageTransitionClass,
        containerRef,
    };
}

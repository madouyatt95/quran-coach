import { useLocation, useNavigate } from 'react-router-dom';

export interface ReaderTarget { surah: number; ayah: number; page?: number }
export function readerUrl({ surah, ayah, page }: ReaderTarget) {
    const params = new URLSearchParams({ surah: String(surah), ayah: String(ayah) });
    if (Number.isInteger(page) && page! >= 1 && page! <= 604) params.set('page', String(page));
    return `/read?${params}`;
}

/** Route first: the persistent reader must only apply a jump once it is visible. */
export function useOpenReader(label = 'Retour') {
    const navigate = useNavigate();
    const location = useLocation();
    return (target: ReaderTarget) => navigate(readerUrl(target), {
        state: location.pathname === '/read' ? location.state : {
            readerReturn: { index: window.history.state?.idx, to: location.pathname + location.search, label, state: location.state },
        },
    });
}

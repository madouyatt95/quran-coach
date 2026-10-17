import { useEffect, useReducer } from 'react';
import { localDay } from '../../lib/learning';

type Counts = Record<string, number>;
type State = { day: string; values: Counts; previous: Counts | null };
type Action = { type: 'tap'; id: string } | { type: 'reset'; id: string } | { type: 'resetAll' } | { type: 'undo' } | { type: 'day'; day: string };
function read(day: string): Counts {
    try {
        const value = JSON.parse(localStorage.getItem(`dhikr-v2-${day}`) || '{}');
        return Object.fromEntries(Object.entries(value).filter(([, n]) => typeof n === 'number' && Number.isFinite(n) && n >= 0)) as Counts;
    } catch { return {}; }
}
function reducer(state: State, action: Action): State {
    if (action.type === 'day') return { day: action.day, values: read(action.day), previous: null };
    if (action.type === 'undo') return state.previous ? { ...state, values: state.previous, previous: null } : state;
    const values = action.type === 'resetAll' ? {} : action.type === 'tap'
        ? { ...state.values, [action.id]: (state.values[action.id] || 0) + 1 }
        : { ...state.values, [action.id]: 0 };
    return { ...state, values, previous: state.values };
}
export function useDhikrCounts(now: Date) {
    const day = localDay(now);
    const [state, dispatch] = useReducer(reducer, day, day => ({ day, values: read(day), previous: null }));
    if (state.day !== day) dispatch({ type: 'day', day });
    useEffect(() => {
        try { localStorage.setItem(`dhikr-v2-${state.day}`, JSON.stringify(state.values)); }
        catch { /* Counts remain available in this session. */ }
    }, [state.day, state.values]);
    return {
        counts: state.values,
        tap: (id: string) => dispatch({ type: 'tap', id }),
        reset: (id: string) => dispatch({ type: 'reset', id }),
        resetAll: () => dispatch({ type: 'resetAll' }),
        canUndo: state.previous !== null,
        undo: () => dispatch({ type: 'undo' }),
    };
}

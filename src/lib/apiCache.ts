import { get, set } from 'idb-keyval';

/**
 * Fonctions utilitaires pour le cache en mode Offline-First.
 * On utilise `idb-keyval` (IndexedDB) car le localStorage est limité à ~5 Mo,
 * ce qui est insuffisant pour stocker tout le texte du Coran et de Hisnul Muslim.
 */

// Durée de validité du cache en ms (1 mois par défaut pour le Coran qui change très peu)
const CACHE_TTL = 30 * 24 * 60 * 60 * 1000;

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export async function fetchWithCache<T>(url: string, forceRefresh: boolean = false): Promise<T> {
    const cacheKey = `quran-coach-cache-${url}`;

    // Si on ne force pas le rafraîchissement, on cherche dans IndexedDB
    if (!forceRefresh) {
        try {
            const cached = await get<CacheEntry<T>>(cacheKey);
            if (cached) {
                const isExpired = (Date.now() - cached.timestamp) > CACHE_TTL;
                if (!isExpired) {
                    return cached.data;
                }
            }
        } catch (e) {
            console.warn('[Cache API] Erreur lors de la lecture IndexedDB', e);
        }
    }

    // Pas de cache valide ou forcé, on requête le réseau
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();

        // On sauvegarde le résultat de manière asynchrone (sans bloquer)
        set(cacheKey, { data, timestamp: Date.now() }).catch(e => {
            console.warn('[Cache API] Erreur lors de l\'écriture IndexedDB', e);
        });

        return data;
    } catch (networkError) {
        // En cas de coupure internet, on essaie de retourner le cache même s'il est expiré (Offline Fallback)
        try {
            const cached = await get<CacheEntry<T>>(cacheKey);
            if (cached) {
                console.info('[Cache API] Hors ligne: Retour du cache expiré pour', url);
                return cached.data;
            }
        } catch (dbError) {
            // Ignorer l'erreur DB
        }

        throw networkError; // Si vraiment pas de cache, on lance l'erreur
    }
}

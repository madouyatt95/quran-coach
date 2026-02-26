/**
 * Service gérant le téléchargement et la mise en cache des gros fichiers Audio (MP3).
 * Utilise l'API native `CacheStorage` du navigateur, idéale pour les streams multimédias
 * (contrairement à IndexedDB qui est limité pour les blobs binaires lourds).
 */

const AUDIO_CACHE_NAME = 'quran-coach-audio-v1';

export async function isAudioCached(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await cache.match(url);
        return !!response;
    } catch (e) {
        console.error('Erreur lors de la vérification du cache audio', e);
        return false;
    }
}

export async function downloadAudio(url: string, onProgress?: (percent: number) => void): Promise<boolean> {
    if (!('caches' in window)) return false;

    try {
        // Optionnel : implémenter un lecteur de flux (ReadableStream) pour afficher
        // la progression exacte si le serveur renvoie l'en-tête Content-Length.
        // Pour l'instant, on fait un fetch simple qui télécharge le fichier complet.

        if (onProgress) onProgress(10); // Début du téléchargement

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Erreur HTTP réseau: ${response.status}`);
        }

        if (onProgress) onProgress(90); // Téléchargement terminé, mise en cache...

        const cache = await caches.open(AUDIO_CACHE_NAME);
        await cache.put(url, response);

        if (onProgress) onProgress(100);

        return true;
    } catch (error) {
        console.error(`Échec du téléchargement de l'audio: ${url}`, error);
        return false;
    }
}

export async function deleteAudioFromCache(url: string): Promise<boolean> {
    if (!('caches' in window)) return false;
    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        return await cache.delete(url);
    } catch (e) {
        return false;
    }
}

export async function getCachedAudioUrl(url: string): Promise<string> {
    // Dans un Service Worker classique, les requêtes audio ('<audio src={url}>')
    // sont interceptées automatiquement s'il existe une route 'fetch'.
    // Si notre SW VitePWA n'intercepte pas ces URLs externes, on peut retourner
    // une URL Blob locale créée depuis le cache.
    // 
    // Pour l'instant, on retourne l'URL originale car VitePWA ou la balise <audio>
    // gère généralement bien le cache si les en-têtes sont corrects.
    // Mais si besoin d'un mode "Off-Grid STRICT", décommenter ci-dessous:

    /*
    if ('caches' in window) {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const response = await cache.match(url);
        if (response) {
            const blob = await response.blob();
            return URL.createObjectURL(blob);
        }
    }
    */

    return url;
}

/**
 * Calcule la taille totale occupée par le cache audio (Approximation)
 */
export async function getAudioCacheSize(): Promise<string> {
    if (!('caches' in window)) return '0 B';

    try {
        const cache = await caches.open(AUDIO_CACHE_NAME);
        const keys = await cache.keys();
        let totalBytes = 0;

        // C'est lourd : on doit récupérer chaque response buffer pour mesurer.
        // À faire de manière asynchrone sans bloquer l'UI principale.
        for (const request of keys) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                totalBytes += blob.size;
            }
        }

        if (totalBytes === 0) return '0 B';
        const mb = totalBytes / (1024 * 1024);
        if (mb > 1000) return `${(mb / 1024).toFixed(2)} GB`;
        return `${mb.toFixed(1)} MB`;
    } catch (e) {
        return '0 B';
    }
}

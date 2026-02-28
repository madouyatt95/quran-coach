import type { ReciterAsset } from '../stores/assetsStore';

/**
 * Searches Wikimedia Commons for a reciter image and returns metadata.
 */
export async function searchWikimediaForReciter(reciterName: string, reciterId: number): Promise<ReciterAsset | null> {
    try {
        // Search for the reciter name
        const searchUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(reciterName)}&gsrlimit=1&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*`;
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (!data.query || !data.query.pages) return null;

        const pageId = Object.keys(data.query.pages)[0];
        const page = data.query.pages[pageId];

        if (!page.imageinfo || page.imageinfo.length === 0) return null;

        const info = page.imageinfo[0];
        const metadata = info.extmetadata;

        // Basic license detection
        const rawLicense = metadata?.UsageTerms?.value || 'Unknown';
        const licenseType = detectLicenseType(rawLicense);

        return {
            reciter_id: reciterId.toString(),
            image_url: info.url,
            image_source: metadata?.Artist?.value || 'Wikimedia Commons',
            license_type: licenseType,
            status: licenseType === 'Unknown' ? 'pending' : 'pending', // Both pending by default as per req: "si aucune image n'existe... Proposer une image (status=pending)"
        };
    } catch (error) {
        console.error('[AssetPipeline] Error searching Wikimedia:', error);
        return null;
    }
}

function detectLicenseType(raw: string): string {
    const r = raw.toLowerCase();
    if (r.includes('public domain')) return 'Public Domain';
    if (r.includes('cc-by') || r.includes('creative commons')) return 'Creative Commons';
    return 'Unknown';
}

/**
 * Helper to generate a stable background color based on reciter ID
 */
export function getReciterColor(id: string): string {
    const colors = [
        '#c9a84c', '#b8943e', '#a67c32', '#d4af37',
        '#8b7355', '#9e8c6c', '#7a6a4f', '#c4a265'
    ];
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
}

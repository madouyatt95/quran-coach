/** Stable content address; the manifest also checks the exact text against collisions. */
export function narrationKey(text: string): string {
    let hash = 2166136261;
    for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619);
    return `${(hash >>> 0).toString(16)}-${text.length}`;
}

export function narrationSentences(text: string): string[] {
    return text.split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(Boolean);
}

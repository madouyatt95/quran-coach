// Avoid an idle Quran player overwriting the narration's lock-screen controls.
let owner: string | null = null;
export const mediaSessionOwner = () => owner;
export const claimMediaSession = (id: string) => { owner = id; };
export const releaseMediaSession = (id: string) => { if (owner === id) owner = null; };

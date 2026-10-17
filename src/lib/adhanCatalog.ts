/** Only recordings whose reuse is explicitly licensed by their author. */
export const ADHAN_RECORDINGS = [
  { id: 'ahmed-1', label: 'Ahmed Khalaf · 1', duration: 145, fajr: false },
  { id: 'ahmed-2', label: 'Ahmed Khalaf · 2', duration: 132, fajr: false },
  { id: 'ahmed-fajr', label: 'Ahmed Khalaf · Fajr', duration: 100, fajr: true },
] as const;
export const ADHAN_SOURCE = 'https://github.com/nandxorandor/Athan/blob/821da16cfef191c2d4749c4a5b2f31a37c49ae81/LICENSE';
export function adhanRecording(id: string, fajr = false) {
  return ADHAN_RECORDINGS.find(r => r.id === id && r.fajr === fajr) ?? ADHAN_RECORDINGS[fajr ? 2 : 0];
}
export const adhanUrl = (id: string) => `/audio/adhan/${id}.mp3`;
export const adhanNotificationSound = (id: string) => `adhan-${id}.caf`;

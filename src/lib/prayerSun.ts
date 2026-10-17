/** A chronological daylight curve, not an astronomical elevation measurement. */
export function sunPosition(at: number, sunrise: number, sunset: number) {
 if (![at,sunrise,sunset].every(Number.isFinite) || sunset<=sunrise) return null;
 const progress=Math.max(0,Math.min(1,(at-sunrise)/(sunset-sunrise)));
 return {progress,x:24+312*progress,y:120-86*Math.sin(Math.PI*progress),daylight:at>=sunrise&&at<sunset};
}

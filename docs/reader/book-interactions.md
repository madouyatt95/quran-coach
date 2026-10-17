# Interactive reader — book interactions

## Behavior

- Drag either lower corner to curl the sheet. Release after 30% travel to navigate; return the finger or release before the threshold to cancel. Existing arrows, horizontal swipes and pinch zoom remain available. Reduced-motion preferences skip the curl.
- Landscape screens with at least 900 CSS pixels of usable width use facing pages (odd page on the right, even page on the left). Portrait and smaller screens retain one page. The preference is under Reading tools and stored in the existing reader settings key. Spread view fits both pages; disable it for single-page zoom.
- Double-tap a word/line to open its magnifier, or use Reading tools → Loupe de ligne. Existing verified glyph positions are reused. The row scrolls horizontally, and follows trustworthy word timestamps during audio. If these are unavailable, it follows the first line of the active verse; it does not estimate word timing. Manual row navigation disables automatic following until re-enabled.
- Verse actions → Other actions → Annotate opens the personal editor. Notes are keyed by surah:ayah, validated against the edition page manifest and persisted in `quran-coach-reader-notes` locally. A marker appears in the margin. Reading tools → My notes supports search and direct verse navigation. No server sync or generated Quran content.

## Verification

- 46 targeted tests: turn commit/cancel/reduced motion, geometry, gestures, word/verse actions, note persistence and invalid references, bookmarks, subtitles and audio.
- TypeScript and production build pass.
- Browser: 390×844 single page; 1180×820 landscape spread; corner drag commits 4→5 and 5–6→7–8; short drag cancels. Facing-page word opens the corresponding word card. Double-tap opens the original colored glyph row. Playback advanced the magnifier between rows. Local note saved, reloaded, edited/read from facing-page margin and test note removed.
- Physical iOS device, WebKit-specific rendering and full offline download behavior were not re-tested in this change. Existing page/font services and offline cache are reused.

## Page motion refinement — 2026-10-11

- Full button/swipe turn: 1.4 s with smooth acceleration/deceleration. A released corner has at least 620 ms to settle; a cancelled drag returns over at least 400 ms. A stationary corner click is released immediately so the subsequent click can navigate.
- Sheet curvature no longer applies a second time easing, and every segment stays between 0 and 180 degrees. This prevents the outer edge from dipping behind the book before landing.
- Perspective is centered on the actual turning sheet, with softer depth; cast shadow and anchoring mirror with the turn direction.
- 13 focused automated checks passed, including both directions, long-drag settling, click handling, reduced motion, and 101 intermediate geometric poses with continuity/mirror assertions. TypeScript/production build checked separately.
- This is still a segmented DOM sheet, not a physical paper simulation. Its reverse face remains plain paper. Physical iPhone smoothness requires device validation.

## Diagonal fold, real verso and momentum — 2026-10-11

This supersedes the plain reverse face and fixed release timing described above.

- The fold uses diagonal local coordinates. Its angle follows vertical corner travel (bounded to ±0.42 rad) and relaxes to zero at each flat endpoint. Explicit face clipping avoids compositing seams on the back. The existing interactive DOM/glyph layout is retained; no rasterized Quran pages or new text source.
- The two neighbouring reverse faces are prepared using `FacingPage` and the existing page/font cache. In a spread, 3–4 → 5–6 turns page 4 with page 5 on its reverse and page 6 underneath; going back turns page 5 with page 4 on its reverse. The untouched old page stays visible until covered. In a single-page view the reverse carries the destination page. Prepared pages are inert and hidden from accessibility.
- A missing reverse face holds the drag before the reverse becomes visible. A committed turn waits for its actual page/font rendering; after a 5-second failure the overlay is removed so normal destination loading remains usable. It never substitutes another page on the back. Unmount/resize/visibility cleanup removes observers, frames and the overlay.
- Release velocity is smoothed, clamped, and discarded after a 100 ms pause. A short purposeful flick can commit; reversing direction cancels. A Hermite trajectory carries the release momentum and lands at rest without overshooting. Completion is bounded to at least 460 ms (cancellation 320 ms); buttons retain a 1.4-second turn. Pinch cancels the corner turn.
- Verification: 24 focused automated tests including pointer events, both directions, diagonal coordinates, correct verso page, unique cloned SVG ids, delayed resources, failure cleanup, momentum and reversal. TypeScript and production build passed. Local browser checked at 390×844 and 1180×820, including diagonal forward/backward turns and a visual sequence showing the continuous, correctly oriented reverse face. No physical iPhone or new offline-download verification in this change; the existing cache services remain in use.
- Limit: this is a curved segmented sheet, not a full paper elasticity simulation. The fold angle follows the gesture but does not model every deformation of a real held corner.

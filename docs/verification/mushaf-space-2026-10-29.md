# Mushaf reading space — 29 October 2026

- Text framing fits the existing 468-unit calligraphy column with safety gutters. No Arabic text, glyph, line, word ID, or audio mapping changed. Outer ornaments may extend beyond the viewport; vertical scrolling is intentional on short screens.
- Whole-page framing fits the sheet/spread to both dimensions. Framing persists in the existing version-2 store, keeping backup compatibility and custom zoom/theme preferences. Stored zoom 1.15 remains the compatibility baseline, shown as 100% of the selected framing.
- Compact header and transport; main navigation retained outside immersion. Immersive caption is mounted only when enabled; hidden controls with no caption occupy zero height.
- Two-page layout requires at least 740 × 430 CSS pixels; honors zoom, preserves center binding. Desk uses the same framing with vertical semantic continuity and horizontal centering at fitted zoom.
- Optional Screen Wake Lock: off by default, opt-in persisted, visible reader only, release on exit/background/disable, reacquire on return. Shows actual granted/refused/unsupported state. API reference: https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API . No native iOS archive shipped in this change.

## Verification

- 37 targeted unit tests (framing, saved settings, gestures, page-turn lifecycle, bookmark ribbon, layout continuity, wake-lock lifecycle).
- TypeScript and Vite/PWA build succeeded; final production build also required at deployment.
- Browser tested at 390 × 844, 320 × 700 and 820 × 900 CSS pixels: QCF colors render; no horizontal word clipping at fitted size; long press on 2:17:2 opens that word's French meaning; audio starts/stops from selected word; page 4 → 5 works; main navigation remains visible.
- At 390 pixels: header 48 pixels, transport 48 pixels; fitted page width 473.55 pixels behind a 382-pixel text viewport. Toggling captions leaves page scale unchanged. Immersive hidden dock with captions disabled: measured height 0.
- At 320 pixels during playback: rightmost transport button ends at 315 pixels, inside viewport.
- Desk transition initially exposed a horizontal continuity conflict; fixed and checked: 820-pixel viewport, 968-pixel scroll area, centered offset 74 pixels.
- Wake-lock activation reported active in browser. Tests cover disabling, late acquisition after disable, background/foreground, refusal, system release and unmount.

## Remaining device checks

No physical iPhone or foldable was used. Native safe areas, prolonged battery/auto-lock behavior, and tactile pinch/drag feel still require physical-device verification. The OS may revoke wake lock (for example under power saving); the UI reports suspension rather than claiming protection.

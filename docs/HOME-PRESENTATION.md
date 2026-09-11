# Home presentation — 11 September 2026

The player-photo guessing game now leads the home screen, followed by the daily challenge, Champions League and domestic competitions. The previous layout spent the first phone screen on competitions before showing any player photos. Domestic leagues remain directly selectable in a horizontal row rather than two tall rows.

The player hero uses separate text and image columns with a full-width action below. The earlier absolute photo stack overlapped copy on a 320-pixel screen. The heading now wraps without pushing collection progress off screen. Existing reduced-motion behavior is retained.

Checked screenshots at 390x790 and 320x780, TypeScript, Expo web export and all 12 phone-browser app/competition tests. The local /simulator tab was refreshed from its stale 25-photo/World Cup bundle and now loads this build with 86 photos and Champions League content. It is a browser preview, not a native emulator.

This change follows Android 0.5.5 source 21343dc2e3ff43ab61bb601377e086d0dd8e4565 and is not included in that running build. No new Android build was submitted for this isolated layout update. Production Vercel promotion remains separate from a preview-branch push.

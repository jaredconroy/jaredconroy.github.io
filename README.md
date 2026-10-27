# Jared — portfolio shell

Milestone one: a static, responsive portfolio selector built with Preact, TypeScript, Vite, and plain CSS. Afroman uses its original artwork and imported browser game. Foul Balls has its supplied poster and theme song; The Sleds has the band photo and official video/music embeds. Graphic Design has its organized design galleries; Illustration includes the supplied drawings and shared Foul Balls artwork, with collection filters and a full-image viewer. No social links, contact details, or résumé have been invented.

## Run

Use Node 22+ and pnpm 11:

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
pnpm preview
```

## Deployment

A GitHub Pages workflow is included in `.github/workflows/deploy.yml`. Push this repository to GitHub, use `main` as the deployment branch, and select **GitHub Actions** as the Pages source in repository settings. The workflow builds and publishes `dist`. Hosting requires no application server, secrets, or paid service. `base: './'` supports both user sites and repository subpaths. Hash routes refresh directly on Pages without a custom 404 fallback.

No remote repository or public deployment has been created by this milestone.

## Content

Put original files in `assets-source/<project>/` and add captions/credits to that folder's `NOTES.md`. See [CONTENT_GUIDE.md](CONTENT_GUIDE.md) for the complete asset map. Raw originals stay local; copying them into these folders does not automatically publish them. The latest findings are in [UI_AUDIT.md](UI_AUDIT.md).

- `src/content/projects.ts`: project order, descriptions, canonical roles, expanded roles, colors, and placeholder-media kind.
- `src/content/tracks.ts`: playlist entries and project links. Optional `section` becomes a project subroute. Add finished audio under `public/audio` and update these records.
- `src/components/PlaceholderMedia.tsx`: homepage media compositions, including real design and Illustration assets.
- `src/content/illustration-details.json`: titles, captions, ordering, and brand-color backings for Illustration and shared Foul Balls artwork. Local image imports run automatically through Vite; see the content guide.
- `public/labs/previews/index.html`: six real-artwork homepage preview concepts to compare.
- `src/styles/global.css`: base shell styles.
- `src/styles/refinements.css`: project-wide palettes, revised role geometry, intro/header motion, and compact dark player.
- `src/styles/layout.css`: shared desktop columns, responsive header/project navigation, featured-media layout, and readable copy/control sizes.
- `src/styles/typography.css`: shared Arial standard face, proportional `-0.05em` tracking, native kerning, and inline navigation letter shaping.
- `src/styles/geometry.css`: the centered, capped desktop frame and signature-landmark identity layout.

The player now uses Jared’s supplied “Foul Balls” Theme Song, with the series poster as its artwork. The earlier synthetic WAV fixtures are retained locally but are not in the playlist. Fraunces is self-hosted through Fontsource under the SIL Open Font License; see `THIRD_PARTY_NOTICES.md` and `public/fonts/Fraunces-OFL.txt`.

## Behavior

The base palette pairs blue navy `#173458` with teal `#00A99D` on white. It is shared by the neutral shell, Design, and Illustration. Additional disciplines match the ampersand teal; functional small accent text uses deeper teal `#006D66` for readability; project-specific palettes remain independent.

- The noninteractive white intro animates the greeting word by word, draws the two-stroke signature, reveals the tagline, and cycles a pair of vertical title reels before shrinking into the carousel. Reduced motion uses a brief static introduction.
- Canonical roles sit at alternating opposite corners around a stationary ampersand. Hover/focus or the mobile toggle shrinks the pair and reveals curated supporting roles with the Ink Press effect.
- Project media and descriptors share a 280ms exit followed by a 280ms entrance, with the theme changing between them. Auto-advance runs on an eight-second cycle with no cooldown. Hovering interactive controls, the feature, role section, or project navigation pauses partial progress; player hover leaves the countdown running; leaving resumes it immediately. Active touch presses, keyboard focus, open overlays, and slide transitions also hold progress. Pointer focus is tracked separately so clicking a control never requires a neutral click to resume. Manual project selection starts a fresh eight-second cycle. Pause holds indefinitely until Play is clicked. Leaving the tab or window suspends the clock; returning resumes automatically unless explicitly paused. The hidden landing view also suspends its clock. Reduced motion disables auto-advance.
- Desktop landing layouts at least 600px tall fit the viewport; mobile and project views scroll normally. The persistent player has reserved space below the content.
- At 680–1000px wide, and in desktop windows up to 700px tall, a compact identity band puts the complete greeting on one row and a centered, single-line role pair below it. Both role labels share one fitted text size. Supporting roles expand into a small grid. Short desktop windows stack the preview beneath this band and can scroll vertically. Narrow phones keep the stacked identity. The intro measures the destination geometry for its handoff.
- One root audio element and shuffled queue survive internal navigation. Previous restarts after three seconds; otherwise it selects the preceding track. Playback requires a user gesture.
- About/Contact are route-backed native dialogs with Escape dismissal, focus restoration, and browser history support.
- The desktop frame has a responsive 390–470px identity column, a fixed 40px column gap, and media capped at 1120px or the available viewport height. Once the content reaches its cap, extra width becomes equal outer margins. Featured Work aligns with the right edge of the identity column. The signature and standard-text size are solved together: the greeting ends near the J's optical center, and the right-aligned tagline starts within the handwritten a. Phone headings use the same landmark relationships at their available width.
- Five equally sized project buttons sit above the media. Both navigation groups use Arial, changing from regular (400) to bold (700) one letter at a time while preserving title casing. Project letters follow the direction and duration of the tab handoff, including right-to-left when the final project wraps to the first; site navigation retains its 750ms handoff. Graphic Design stays on one line. Arrow keys, Home, and End select projects. Reduced motion switches immediately. The carousel owns selection, preview, pause, and timer state while rendering the desktop index into the header.
- About, Contact, and Featured Work share the directional weight animation and traveling underline. Their reserved widths keep the left column stable during page changes.
- The 4px timer sits below the landscape media, followed by a larger right-aligned title and description. Short desktop windows cap media size to keep content above the persistent player. Phones retain a compact project selector above the media and natural vertical scrolling; navigation takes a second header row up to 540px wide.

## Afroman

Afroman uses charcoal `#25282C`, warm light text `#F5F0E7`, orange `#EF8216`, and a black player. The shared solid text ampersand transitions between project themes; its Afroman idle fill is black. Hover, keyboard expansion or touch expansion reveals a complete SVG-only `#F5D504` outline, with two startup blinks, a two-frame ignition and a continuous game-derived brightness cycle (see Afroman neon hover below). The outline retains its 2.4px weight and orange `#EF8216` halo. Other project ampersands retain their existing treatment. `scripts/build-afroman-ampersand.py` regenerates the seamless outline using fonttools[woff] and Shapely.

`#/work/afroman` presents the original title art, the 2014/2026 story, and the three levels. It loads only images, with no game iframe or WebAssembly resources. The landing feature also uses the actual title art.

`#/play/afroman` mounts the static game in an iframe to isolate its runtime and keyboard input. The game has an explicit Play gesture for sound, fullscreen, its own mute control, and a saved rhythm calibration setting. The portfolio audio element remains mounted. Leaving the game route removes the runtime; returning starts a fresh game. The existing port requires a keyboard; the surrounding page is responsive, but touch gameplay has not been added.

The imported snapshot is from `Afroman-web`, build `f1dae57ce7a0`. Original game source and artwork are unchanged. Debug symbols were stripped and the imported WASM optimized with Binaryen, reducing it from approximately 30 MB to 2.5 MB. The full JS/WASM/data payload is approximately 23.5 MiB, fetched only in the play view. It uses no server, threads, special response headers, or third-party runtime URLs.

To update the game after building Afroman-web:

```sh
python3 scripts/import-afroman.py /absolute/path/to/Afroman-web \
  --wasm-opt /absolute/path/to/Afroman-web/.tools/emsdk/upstream/bin/wasm-opt
```

The optional optimizer operates on the imported copy. The script copies the three runtime files and preview artwork, applies `scripts/afroman-shell.html`, and records checksums in `public/games/afroman/build.json`. Run the tests and production build afterward. Vite copies these static files to `dist/games/afroman/`; all nested URLs remain relative for GitHub Pages repository subpaths.

The existing port includes provisional synthesized effects/music as documented in the source project's `proj.web/AUDIO_AND_POLISH.md`. Browser smoke checks verify startup and level access, not a complete playthrough or audio-latency calibration.

## Next

Foul Balls now includes its supplied poster, logline, art/music credits, and theme-song playback. The Sleds has a responsive band photo, lineup caption, two official YouTube music videos and a Spotify artist embed. Design and Illustration project pages remain placeholders. Add their remaining media and copy as those pages are developed. The supplied Illustrator signature remains unchanged; its smooth calligraphic outlines and sampled centerlines live in `public/media` and `src/content/signature-strokes.json`. The nib is 25% heavier, retaining the same angle and clean finish. `scripts/build-signature.py` regenerates both the SVG and shared `signature-brush.json` settings so the animated and static versions agree.

### Cursor studies

Open `/labs/cursors/index.html` on the local preview to compare eight isolated cursor effects, adjust intensity and palette, or run an eight-second preview. No extra dependencies or server endpoints are needed. The main portfolio has not adopted any of these effects yet.

The cursor playground’s ink option uses the signature’s shared elliptical nib dimensions and angle, scaled to the visible signature. It draws one smoothed continuous stroke instead of overlapping segments; the optional dust blend adds at most 36 flecks. `src/content/signature-brush.json` is the brush source of truth; regenerate the vector, centerlines and public demo configuration with `python3 scripts/build-signature.py`.

### The Sleds

The theme uses powder blue `#B6D3E9`, dark denim text `#19364D` and brown accents `#66534B`. The persistent player stays dark denim. Optimized band photos have 960px and 1600px variants; originals remain in assets-source.

`src/content/the-sleds.ts` stores the supplied lineup, photo caption, YouTube IDs and Spotify artist URL. `#/work/the-sleds/music-videos` and `#/work/the-sleds/music` link directly to sections. External video/music players mount on interaction, one at a time. Starting one pauses the root soundtrack; starting the root soundtrack closes the page embed.

Spotify’s official embed needs no MP3 uploads or app credentials and works on the static site. It retains Spotify’s UI and may offer previews depending on listener/browser context; this browser displayed Preview. It is currently page-based, so it stops on project navigation. It does not add Spotify tracks to the custom shuffled HTML-audio queue. Full custom Spotify playback via the Web Playback SDK requires user authorization and Spotify Premium; keep the file-based player for predictable anonymous playback.

References: [Spotify embeds](https://developer.spotify.com/documentation/embeds), [embed playback troubleshooting](https://developer.spotify.com/documentation/embeds/tutorials/troubleshooting), [Web Playback SDK requirements](https://developer.spotify.com/documentation/web-playback-sdk/howtos/web-app-player).

The Sleds role expansion flips the shared ampersand to the supplied band mark in `public/media/the-sleds/ampersand-logo.svg`, using the current navy accent and a cropped vector viewBox. Collapsing reverses the flip. Reduced motion switches faces immediately. Foul Balls uses its supplied tan (`#DCC1A2`) behind the poster; neutral caption panels use white lettering on teal, and Afroman uses a white progress fill against black.

On roomy desktops the signature grows from its existing top-left anchor until centered in the identity column; the tagline follows its added height. The comma shares the greeting typography and follows the signature baseline. The role pairing uses its compact rectangular layout with a centered ampersand and corner labels. `src/styles/compact.css` owns responsive variations. The Sleds replacement mark uses the latest supplied `logo ampersand3.svg`, normalized to currentColor in the existing local asset path.

The showcase places a fixed-height accent title panel above the media: title on the left, optional subtitle on the right, and no blurb. The countdown stays immediately below the image, followed by all five visible project tabs at every breakpoint. Decorative role arrows have been removed.

The column-layout signature is offset 7px left of its original optical alignment. The ared linework expands from its top-left bounds to the column edge with a fixed elliptical nib, shared by the static vector and animated canvas. Compact inline greetings retain their fitted signature size.

The greeting now reads Hi! with a Fraunces exclamation. The lower J flourish stretches to the column left edge; the ared linework reaches the right edge. The tagline moves toward the J bottom with a minimum ink clearance on phones. Desktop lower descriptors align to the media bottom. Afroman replaces the signature nib with a 2.4px yellow neon pen and orange glow, and keeps its idle ampersand black. Graphic Design swaps teal/navy independently of Illustration. The supplied Sleds wordmark is stored in `public/media/the-sleds/wordmark2.svg` and replaces the preview/project title in white.

Latest presentation: the J is uniformly enlarged 10% from its top-middle point, with its original brush weight. The greeting exclamation uses the real Fraunces italic face with expressive axes. Illustration and the opening shell use #88281d maroon; Graphic Design uses #008477 teal. Title bars have rounded top corners and the colored project index has matching rounded bottom corners. The player omits decorative playback/queue labels and shares the site frame. The hats toggle reads + a few more hats and matches the desktop timer baseline.

The exclamation now uses the ampersand’s upright Fraunces face, with extra spacing after Hi and a measured size that reaches the J top. The J retains its 10% enlargement, shifts 5px right, and stretches horizontally to the column left edge in column layouts. The Sleds hover mark is centered on the ampersand ink bounds and fitted to its width. The project index now follows the image directly; a text-width overline selects the active name, and the progress line closes the index bottom. The timer text sits below. Equal player side columns center playback on larger screens, while phones stack metadata, centered controls, and the timeline.

Latest interaction update: hovering the music player, including its controls and track link, leaves the eight-second showcase countdown running. Pointer presses and visible keyboard focus still count as interactions. The shared navigation handoff visits all intervening names in either direction and settles within 750ms, including interrupted selections. The project marker always uses the longest bold label width (currently Graphic Design), sits flush against the image, and stays fully visible at the first/last tabs on phones. The exclamation returns to the OFL-licensed Fraunces italic face with a 0.05em gap; Superclarendon and Urbane would require a configured licensed webfont kit or approved embed.

Current navigation layout: the desktop topbar again contains jared conroy / About / Contact / Featured Work within the identity-column width and the five project tabs within the media-column width. Both groups use transparent backgrounds, regular-to-bold standard text, and accent underlines below the text on the same baseline. The project underline spans its selected tab, matching the earlier inline version. Smaller screens retain one five-tab index above the preview. The eight-second progress line touches the image bottom, with timer text and pause/play immediately below it.

### Local signature editor

The editor is hidden by default. On the running Vite preview, explicitly open `?signature-editor=1#/`, then click **Adjust signature J** at the lower left after the intro. Drag the selection to move the J, pull a corner/edge handle to resize it, or use the round handle to rotate. Shift keeps resize proportions or snaps rotation to 15 degrees. Focus the selection and use arrow keys to nudge one pixel (Shift: ten). The panel also provides numeric movement, width/height, rotation and skew controls, plus Undo, Redo, Revert to last save, and Reset J to the starting shape. The rest of the signature stays untouched and the nib keeps its weight/angle.

**Save placement** writes `src/content/signature-transform.json` through a same-origin, development-only Vite endpoint. Those settings apply to both the static signature and its handwriting animation and scale with responsive signature geometry. Save does not reload the page or interrupt audio. Editing pauses the showcase; closing resumes its normal timer behavior. Drafts persist while navigating in the same session, but must be saved before a reload.

The editor, its controls/styles and the save endpoint are excluded from the production website. The built site remains fully static and GitHub Pages compatible. The saved transform is included in the normal build.

The saved J transform is preserved while the full signature is translated to center its swept ink bounds in column layouts, giving equal small overhangs. Compact inline greetings keep their fitted composition. The nib is a further 20% thicker (major 11.25 / minor 3.1640625). Afroman retains its 2.4px yellow tube and adds a 50% halo pass over its orange 4/12/28px glow. In column layouts, only ared translates right to meet the column edge with that thin tube; both regular ink and neon use this placement without stretching either stroke. Column greetings balance their lower/right clearance against the J; the tagline baseline follows the thin J's bottom. The role block uses a normal interline ink gap beneath the tagline and puts the lower descriptor's baseline at the image bottom on desktop. Compact inline greetings retain their two-row arrangement. Editing a draft keeps the current centering offset until Save, then recenters the whole word; editor handles follow that offset.

The project selection marker is now a solid accent tab: its upper edge stays at the previous underline position, its upper corners share the title panel’s 12px radius, and it extends behind the panel past its corner radius. First/last selections make the corresponding title corner appear square. Short desktop windows place project tabs immediately above the preview so the connector does not cross the compact greeting.

Responsive signature correction: `src/content/signature-layout.json` records the approved desktop J base and ared proportions. `src/features/signature-editor/geometry.ts` applies the saved J transform once in that shared coordinate system. Desktop, compact greeting bands, phone layouts and the handwriting canvas all use this same complete signature; only a uniform fit and translation vary by viewport. The pen scales with the word, and the local editor's handles follow the same mapping. Compact greeting text/comma align to the shared signature's word baseline; column roles clear the actual rendered J bottom.

### Tab handoff transitions

The folder frame and connected tab/title surfaces stay stationary and fully opaque. At seven seconds, all four inactive tabs peek halfway up while the active tab remains fully raised. Pointer-down immediately targets the full halfway resting position. Releasing the current tab raises it again without selecting, replaying roles, or resetting the countdown. A new selection begins on release. One absolute timeline controls the wave: the outgoing face descends at zero, and its next neighbour starts rising simultaneously. Hover and scheduled transition strokes use short 140ms constant-speed travel. Pointer-down dips take 80ms; releasing the current tab bounces it back in 80ms. A released project selection rejoins the regular 140ms wave clock. There is no easing tail at either endpoint. Every subsequent tab starts rising at the exact 140ms peak where its predecessor starts descending, including reverse travel and the final destination. Bold-letter handoffs follow each individual rise and finish one render frame before its peak, rather than stretching across a separate overall duration.

Descriptor/media timing is independent of tab travel. The destination selection starts a complete 280ms descriptor/media exit. Only after that exit does the displayed project swap and the theme begin fading; the new descriptors/media then grow in over 280ms. Manual and automatic changes use this same sequence. Selection and displayed content are separate states so adjacent changes cannot batch away the exit phase. The clock stays held through the complete tab/content sequence and cleanup. New requests queue the latest destination. The existing 500ms fan hold is at halfway after moving faces have settled. Hover cannot override a running wave. Keyboard selection, pointer cancellation and the extended index hit areas remain supported. Reduced motion switches immediately.

“Hi” is bold while “I’m” stays regular, including during the intro. The tagline baseline sits 4px below the midpoint between ared's written baseline and the thin J bottom. The descriptor block retains clearance below the J.

Each project tab occupies exactly one fifth of the preview width, with its title centered. Hover tabs retract over 140ms, and supporting disciplines shrink/fade out over 400ms before hiding. Graphic Design uses navy #173458 for primary text and teal #008477 for accents/player. Foul Balls uses accent purple #846393 for its player; Afroman's next-project progress fill is accent orange #EF8216 against black.

### Afroman neon hover

The ampersand blinks twice (90ms on/off), gating a looping buzz at half volume during the flashes. The flickers use 45% visual light/glow, with half-volume buzz. A 400ms dark/silent beat follows the blink sequence. A single plink plays at the third, sustained turn-on (760ms after hover begins), with one actual rendered frame at 50% light and the next at 100%. The following frame immediately fades from full brightness, with no bright plateau. The visual sampler counts render frames independently of refresh rate. The visual loop interpolates Afroman-web's title levels `[1, .85, .70, .55, .40, .25, .25, .40, .55, .70, .85]` over 140ms intervals; only the dim valley retains a hold. The buzz keeps its independent zero-to-full 600ms crescendo, game-derived gain steps and 25ms exponential gain smoothing.

The lit tube stays opaque: its color/halo carry the cycle, from dark orange #8C3E0B without glow, through page orange #EF8216, to bright yellow #F5D504 with full orange glow. Reduced motion uses a steady sign. The envelope and color mapping live in `src/features/neon/envelope.ts`.

`public/media/afroman/audio/neon-plink.wav` and `neon-buzz.wav` are standalone copies of the game's original files. They load on the first neon interaction without loading the game/WASM. A separate Web Audio effect bus follows the site's mute control without changing the music transport. Hover exit, navigation, overlays and window/tab inactivity stop the effects. Browsers may require a trusted click/key gesture before hover sound can play.

Illustration and the opening shell use #88281d maroon, with white caption text for contrast. The local signature editor is hidden by default; its existing saved transform is preserved. Development-only access remains available by explicitly opening `?signature-editor=1#/`.

The Sleds now uses the chosen Walnut + white palette: #66534B background, white primary text, #B6D3E9 signature/ampersand/tab/title and music bar, and navy #19364D text/controls on powder surfaces. Video/Spotify preview surfaces retain navy for contrast. Illustration uses a very light blue #EDF5FB background with maroon #88281D accents. The default intro remains white. Afroman's preview title/caption foreground is pure black.

### Foul Balls bat-crack hover

The Foul Balls role/ampersand area plays the supplied wooden-bat crack once when expanded by hover or tap. A standalone, lazy Web Audio voice follows the site mute setting without changing the persistent music transport. Hover exit cancels pending decoding but lets an already played hit ring out. Project changes, overlays, window/tab inactivity and unmount stop it. Browsers that block hover playback require an initial trusted click/key; a blocked hit is never stored for late playback. The MP3 export is about 55KB; the WAV master stays in assets-source. The existing ink-press animation remains unchanged.


### Compact widescreen greeting

At 680–1000px wide, and in wider windows at most 700px tall, the shared signature ink is 10% larger around the existing ared baseline and punctuation edge. The heading retains its original flow footprint, so the greeting words, comma, navigation and preview do not move. The compact ampersand is 80% of its previous size. The complete role row translates upward until the idle ampersand ink top meets the p descender in multidisciplinary, measured from the current fonts. Hover growth does not retarget this alignment. Desktop columns and narrow phones retain their existing geometry.

The compact hover/tap expansion is now a measured sentence chain: original first role, ampersand, additional roles separated by ampersands, then the original second role at the right edge. Both original roles shrink to the same 18–22px visual size as the additions. The shared ampersand shrinks to roughly 150% of descriptor ink height over 200ms, then slides beside the first role over 220ms. Each additional role and following separator pops in separately at 85ms intervals. The chain fits one line when readable, otherwise wraps in whole phrases to two lines; only the right-hand bookend shifts to the final line. Its role band keeps the original height, so the preview does not move. Leaving reverses the new tokens with a short stagger, slides the shared ampersand back, and restores the original pair. Keyboard/tap toggling and Escape are supported; reduced motion switches immediately. The Sleds retains an ampersand separator in this compact mode while its desktop logo flip remains intact. Afroman retains its neon hover/sound on the shared ampersand. Desktop and narrow phone expansion stay unchanged.

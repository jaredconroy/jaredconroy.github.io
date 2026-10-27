# Portfolio UI audit — 2026-10-21

## Changes completed

- Neutral navy is now `#173458`, halfway between the original navy and the brighter blue revision. Teal remains `#00A99D`; additional neutral-theme disciplines match the ampersand exactly. Functional small teal text uses `#006D66`.
- Afroman's bottom player is pure black. Its theme has an independent `playerBackground` field, so project text does not have to become black too. The same player theme follows the project and game routes and their overlays.
- Player controls retain light focus outlines against their dark background. A later global accent rule previously overrode these with dark colors.
- The expanded-role toggle now closes the visible list with one click. Previously, hovering could display the minus label while clicking actually pinned the list open. Manual project changes also clear the old hover expansion state.

## Checks completed

| Check | Result |
| --- | --- |
| 1920×1080 desktop | No horizontal overflow, no page scroll, no header collision, role labels clear the player |
| 1280×600 desktop | No horizontal overflow, no page scroll, no header collision, role labels clear the player |
| 390×844 phone-sized viewport | No horizontal overflow or header collision; natural vertical scrolling |
| 320×568 phone-sized viewport | No horizontal overflow or header collision; natural vertical scrolling; initial role pair clears the player |
| Role-list collapse | One click changes expanded to collapsed |
| About | Native dialog opens; Escape dismisses; focus returns to About |
| Contact | Browser Back dismisses the route-backed panel and restores the project |
| Audio navigation | One root audio element; playback continued while About was open and through panel navigation |
| Static build and existing tests | Build passes; all six tests pass |

These are desktop-browser and embedded responsive-viewport checks, not a physical iOS/Android device certification. No full game playthrough or listening-latency assessment was performed in this audit.

## Remaining UI/content work

1. **Short-phone information priority.** The current signature/role block uses enough vertical space that the project selector and See More require scrolling, especially at 320×568. It does not overflow sideways, but a compact mobile identity or an earlier project selector would make project discovery faster. This is a design refinement, not a hidden clipping bug.
2. **Small orange text on Afroman.** The requested `#EF8216` has approximately 2.48:1 contrast on `#FAF6EF`, below normal small-text contrast targets. That exact color is preserved on the name and extra disciplines. A darker small-text variant or dark backing would improve readability; either changes the current art direction and should be chosen deliberately.
3. **Unpopulated pages.** Design and Illustration are still placeholder project views. The Sleds now has the supplied photo, lineup caption, official music videos and a Spotify artist player. Foul Balls now has the supplied poster, logline, credits and theme-song action; further project detail can be added later. About needs a headshot, full bio, résumé and credits. Contact needs the public details to display. These should not be treated as finished destinations yet.
4. **Real player library/artwork.** The Foul Balls theme is connected with title, artist, year, project link and poster artwork. Synthetic clips are no longer queued. More finished tracks can be added to src/content/tracks.ts; files are not automatically scanned.
5. **Game on phones.** Afroman's page is responsive, but its game requires a keyboard. Touch gameplay is not implemented. Its dedicated play view makes the approximately 23.5 MiB game download explicit and keeps it off the project page.

## Adding content

Use `assets-source/<project>/` for original files and the accompanying `NOTES.md` for captions, credits and ordering. These originals remain local and outside the website build. Optimized, selected exports go under `public/media/<project>/` or `public/audio/` when connected.

See `CONTENT_GUIDE.md` and `assets-source/README.md` for the folder map and handoff checklist.

## Cursor studies

The standalone `public/labs/cursors/index.html` playground compares eight bounded Canvas 2D effects. Only one effect runs at a time, with no new dependencies. Motion defaults off on touch and reduced-motion devices; explicit previews are available. No candidate has been installed on the main portfolio.

The signature nib is now another 25% heavier (major radius 7.5, minor 2.109375, −30°). Animated signature, static SVG, and the cursor demo share its settings. Ink draws one continuous smoothed path; the optional ink/dust blend is capped at 36 flecks.

The Afroman hover/focus neon now draws its outer contour first (1 second), then each inner loop (300 ms each). Separate normalized paths and a measured stroke scale preserve a 2.4px tube without relying on non-scaling dashed strokes. Reduced motion shows the completed outline immediately. The featured index now spells out Graphic Design.

## The Sleds media and palette

- Powder blue `#B6D3E9`, navy `#19364D`, brown `#514238`; primary contrast ~8.04:1 and accent contrast ~6.17:1. Muted text is strengthened for the powder-blue surface.
- Band photo exported in two WebP sizes (about 98 KiB and 209 KiB); original untouched.
- Both Pretty Penny and Stuck loaded and played in their click-to-load YouTube embeds. Only one page player is mounted at a time.
- The supplied Spotify artist embed loaded and exposed Top tracks in Preview mode in the test browser. Full-track access was not certified.
- Verified root audio pauses when a page player opens; starting root audio removes the external player. One root HTML audio element remains mounted.
- Checked 390×844 and 320×568 embedded phone viewports. Corrected grid intrinsic sizing so the minimum 200px video height does not force horizontal overflow; both fit after correction. These checks are not physical-device certification.

Afroman now shares the persistent text ampersand with every other theme. Removed the SVG backdrop and theme-based glyph opacity swap; normal entry/exit is solely the existing 400ms text-color transition. The vector layer contains only the three unfilled hover-outline contours. Hover/focus still turns the text black beneath the animated neon; touch and reduced-motion alternatives remain in place.

## Header, title alignment, and typography

- Sleds background is the midpoint powder blue `#B6D3E9`.
- About, Contact, and Featured Work sit beside the wordmark. Removed the redundant featured-project number above the title.
- The active main-navigation item uses a 4px underline in the current ampersand color, matching the carousel timer line. Featured Work stays active within project/game routes; About/Contact take over when their panel opens. Navigation is 16px on desktop and 15px at narrower widths, with a 3px downward optical adjustment beside the wordmark.
- Featured titles align to the media's right edge. The current two-column layout places the larger title and description below the timer/media.
- Increased project descriptions to 15px, project-page body copy to 16px, index labels to 14px, captions/actions to 12–14px, and player title/artist/time to 14/12/11px. Small phones use a two-row header instead of shrinking navigation text.
- Browser checks at 1920×1080, 1280×600, 1001×600, 541×844, 390×844, and 320×568 found no horizontal overflow or header collision. Checked desktop layouts remained free of page scroll and feature/player overlap. Phone layouts retain natural vertical scrolling.
- Verified About's underline and Escape/focus restoration, Contact's underline and browser Back, and Featured Work's return from the Sleds page. These are browser viewport checks, not physical-device certification.

## Two-column selector revision

- Desktop column widths are shared through CSS subgrid: the left side matches the intrinsic width of the logo and three main links, and the right side takes the remaining space. The five project controls render into the header directly above the image, replacing the sidebar.
- Project controls distribute spare width evenly, reserving extra room for the selected display-font label. Tab widths and the 4px accent indicator move together over 750ms. Keyboard arrows/Home/End select and focus a project, preserving the manual cooldown. Reduced motion removes indicator/width motion and switches all letters immediately.
- The 8-second progress timer now sits directly beneath the media and remains stationary while media/title/description animate together. Phone layouts use a native project selector above the media.
- Responsive checks at 1920×1080, 1280×600, and 1001×600 confirmed matching header/identity columns, even project spacing, index/media edge alignment, correct timer/title order, no horizontal overflow, no page scroll, and no feature/player overlap. At 390×844 and 320×568, corrected a flex-basis override so the second header row fits without horizontal overflow. These checks include the intro completing into the revised geometry.

The project index now changes font one letter at a time: outgoing letters return to Arial while the same-position incoming letters become Fraunces. Both labels share a clock, including when an in-progress selection is replaced. Invisible, clipped measurements reserve each destination label's width so individual letter changes do not move neighboring tabs. Active letters share the wordmark's size and vertical position; inactive letters share About's size and position. The traveling rule shares the main-navigation underline's vertical position. Labels stay on one line, with strip-only scrolling available in short desktop windows.

Verified glyph positions at 1135×791 and 1001×600: selected glyphs, generic glyphs, and the traveling underline each have a 0px vertical difference from their corresponding header reference. Graphic Design remains one line at 25px (24px at the narrow breakpoint). All tabs fit the 1135px layout; the short 1001px layout uses the strip's horizontal scroll without page overflow. Recorded DOM changes confirm simultaneous first-, second-, and subsequent-letter handoffs during auto-advance. The 390px phone layout retains its native selector and has no horizontal page overflow.

## Directional navigation follow-up

- Display-font project letters are lowercase; generic letters retain the original label casing. The animated font now explicitly shares `WONK=0, SOFT=100` with the wordmark/headings, fixing the slanted n.
- A shared letter hook runs both navigation groups over 750ms. Selecting a lower index, including the final-to-first wrap, reverses each label's letter order. The final letter is scheduled at the same deadline as both traveling rules. Selected main pages are bold; the main links keep their existing text size and casing.
- Browser recordings confirmed right-to-left outgoing/incoming letter changes for Graphic Design → Foul Balls. In measured forward/reverse cases, the project underline finished within one animation frame of the final recorded font change (about 1–13ms).
- At 1135×791 and 1001×600, selected labels were lowercase, one line, and used the straight-n settings; project/main underline y positions matched. At 390×844 and 320×568 the main links and native selector retained no horizontal page overflow.

## Navigation typography simplification

Both navigation groups now use the standard Arial stack at the same navigation text size in regular (400) and bold (700) weights. Removed display-font styling and lowercase conversion from their animated labels and width measurements. Original project title casing is preserved throughout the directional letter-by-letter weight handoff. The 750ms traveling underlines and reduced-motion behavior remain. Browser inspection confirmed the font family, weights, 16px sizes, title casing, and absence of horizontal page overflow at the current desktop preview.

## Shared standard-text spacing

The identity's “multidisciplinary” and navigation both use Arial. The identity used `-0.05em` tracking while navigation used normal spacing and individually boxed glyphs. Standard text now shares `--standard-tracking: -0.05em`, resolved at each element's own font size, with native kerning enabled. Navigation letters now flow as inline text, including native word spacing, while retaining the directional regular-to-bold animation. Display typography retains its separate optical spacing.

Verified computed spacing: identity 27.24px / −1.362px, navigation 16px / −0.8px, body 15px / −0.75px, player title 14px / −0.7px, and metadata 12px / −0.6px. Each standard sample uses the same proportional tracking. The current desktop preview has no horizontal page overflow; the production build passes.

## Signature geometry and centered widescreen frame

- Replaced the fixed signature-width cap and historical horizontal offset formula with a proportional signature and measured standard text. Optical vector coordinates place the greeting's right edge near x=132 in the J and the tagline's start near x=211, inside the a's x=188–237 region. The tagline remains right-aligned; the greeting remains left-aligned. The identity's role text shares the solved standard size.
- Desktop identity width ranges from 390px to 470px, with 390px retained on short desktop windows. Header links spread to the column's right edge. A fixed 40px column gap replaces the growing whitespace caused by independently capped media inside an expanding grid track.
- The media cap is the smaller of 1120px and the available-height budget. The complete frame stays centered; surplus width becomes outer margins. At 1920×1080 and 2560×1080 the content frame is 1630px wide, with identical 40px internal gaps.
- Checked 2560×1080, 1920×1080, 1440×900, 1280×600, 1001×600, 390×844, and 320×568, including each intro finishing. Greeting/J errors were at most 0.4px; all tagline starts stayed inside the a. Desktop tagline and Featured Work right-edge errors were 0px, with equal outer margins, no page scroll, and both columns clearing the player. Phone layouts retained natural scrolling and no horizontal overflow.
- Also resized the same live document between 2560×1080, 1920×1080, and 1440×900. The gap remained 40px, margins remained equal, the tagline stayed within the a, and the greeting stayed within 0.5px of its J landmark. The identity width uses the same height-limited composition budget, so a capped composition no longer grows in response to extra viewport width.

### Optical signature-spacing refinement

The signature now centers the J's facing edges between the greeting's end and the tagline's start, preserving text size and edge alignment. This shifts the signature about 14px right at 1440×900. Measured horizontal gaps are 26.6px / 26.8px on that desktop and 20.7px / 20.4px at 390×844, with no horizontal overflow. Both intro and carousel use this shared positioning.

## Compact project tabs and accent caption

- Removed the mobile project dropdown. One shared project navigation now mounts in the desktop header or immediately above the preview at widths up to 1000px. Compact tabs use equal widths and wrap at word spaces; all five remain visible, including at 320px. Keyboard selection, the directional weight handoff, traveling underline, and manual cooldown remain shared.
- Removed the remaining 350px role-area cap: stacked layouts now share a centered 390px maximum for the greeting and role section. Measured matching left/right edges at 820px, 390px, and 320px. Traveling navigation rules are clipped independently of focus outlines so resizing cannot create temporary horizontal page overflow.
- Added an accent-colored caption with a left-aligned title and adjacent description. The complete caption links to the project; hovering or focusing the feature underlines its title. Removed the See More control. The timer and pause control stay immediately below the image, within the caption surface. Caption text contrast is 4.83:1 for Foul Balls, 9.25:1 for The Sleds, 6.03:1 for Afroman, and 5.48:1 for neutral projects.
- Verified compact project selection and caption navigation into Graphic Design, then browser Back. Confirmed five buttons and no select element on phones. At 1001×600, the caption ends at y=456 above the player at y=522, with no page overflow or desktop scrolling. At 1440×900, the new title/description panel stays beside the aligned role column. Typecheck and all six existing tests pass.

## Finite autoplay cooldown and Sleds flip

- Replaced persistent interaction pauses with an immediate thirty-second cooldown. Hover entry, focus, pointer/keyboard interaction, manual selection, role expansion, and overlay opening all start that countdown. Retaining hover or focus does not hold it. The delay control now postpones autoplay rather than toggling an indefinite pause. Slide transitions hold only cycle progress, allowing the cooldown to start immediately.
- Window blur and document visibility suspend the clock; window focus or returning to the tab resumes it without interaction. The hidden landing view and reduced-motion preference retain their existing suspension behavior.
- Browser regression exercised retained project-button focus and expanded hover roles for a complete cooldown and cycle: The Sleds advanced to Afroman while focus remained on The Sleds, without a neutral click or mouse exit. It also exercised window blur, a frozen interval, window focus, and a countdown continuing without a click. Results are saved in `previews/autoplay-regression-results.json`. Seven state/game tests and typecheck pass.
- Imported the supplied Sleds SVG as a clean currentColor vector, preserving the original file. Role expansion flips the solid ampersand to the brown band mark; collapse reverses the same transition. The logo is horizontally centered and aligned to the ampersand's visible top, using font-relative metrics. Reduced motion switches faces immediately.
- Foul Balls poster backdrop is now #DCC1A2. Neutral caption text is white on teal per the requested palette. Afroman's progress fill is white with a black track.

## Eight-second hover pause and explicit Pause/Play

This replaces the finite cooldown behavior above. Removed the thirty-second constant and cooldown state entirely. Hovering the media/caption, role area, project navigation, header links, or music player now freezes the current eight-second progress; pointer exit resumes immediately. Active touch presses and keyboard navigation hold the same clock. Pointer modality is tracked independently so retained focus from a mouse click cannot require a neutral click to resume. Manual selection resets the new project to eight seconds.

The Pause button now sets a persistent explicit pause and becomes Play. Hover exit and window return cannot clear that explicit pause. Play preserves elapsed progress and resumes after any current hover ends. Hidden windows/tabs, project views, open overlays, slide transitions, and reduced motion retain their suspension behavior.

Browser regression confirmed frozen partial progress on hover, immediate resumption with button focus retained, persistent pause after hover exit and window return, Play continuing without a cooldown, and automatic advancement after the remaining cycle. Results are saved in `previews/hover-pause-regression-results.json`. Typecheck and all seven existing state/game tests pass.

## Tablet identity row

At 680–1000px wide, the greeting/signature sits to the left of the ampersand section in equal columns separated by 32px. The role positioning observer disables the stacked J-bottom offset in this arrangement and restores it on phones and desktop. The intro now measures each destination block's width and horizontal/vertical offset, preserving its centered handwriting stage and the final responsive handoff.

Verified a fresh intro completing at 820px, then resized through 680px, 1000px, 390px, and 1440px. Tablet blocks stayed side by side with zero role top margin; phones and desktop restored the stacked relationship. No horizontal overflow appeared at any checked width. The five compact project tabs remain above the image. Typecheck and production build pass.

## Compact greeting band, square roles, and dark Afroman

- The compact layout now follows the two-row mockup: greeting, smaller signature, comma, and tagline on the first row; an ampersand centered between two unbroken descriptors on the second. Both descriptors share one fitted text size, including Software Developer / Game Designer. This mode covers 680–1000px widths and desktop windows at most 700px tall. Short desktop previews stack beneath the band and scroll vertically. Phones retain the prior stacked form. Compact supporting roles use a grid rather than crowding the central glyph.
- On roomy desktop layouts, the signature grows from its original top-left anchor until its SVG center matches the identity column center. The tagline moves down by the added signature height. The comma is positioned beside the signature's end on its written baseline, using the same Arial font, weight, and size as the greeting, and remains hidden until writing finishes in the intro.
- The role pair becomes square only when its width plus footer space fits above the player. The larger ampersand remains centered and the descriptor corners remain fixed. Two quiet SVG curves follow the actual end/start of the labels and the left/right middle of the ampersand, including reversed corner arrangements. They hide during transitions and expanded-role interaction.
- At 1600×1100, the signature center error measured 0.004px, the role pair measured 470×470px, and the ampersand was 216.2px. The complete role section ended at y=817 above the player at y=1018. The comma and greeting both measured 39.5148px in Arial. A fresh intro used matching target/copy role dimensions.
- Checked 680×900, 1000×1000, 1280×650, 390×844, 1440×900, and 1600×1100 without horizontal overflow. Compact descriptors stayed on one line at equal sizes; narrow phones retained wrapping. The 1440px desktop pair measured approximately 427×427px and cleared the player.
- Afroman now uses #25282C charcoal with #F5F0E7 text, orange actions, the existing gold/orange hover neon, and a black player. Confirmed the dedicated project view has no embedded game/iframe load. The latest supplied logo ampersand3.svg replaces the Sleds mark as a currentColor vector; browser inspection confirmed its brown #514238 fill.
- Final typecheck, production build, and all seven existing state/game tests pass.

### Native-window square activation and comma visibility

The comma is now displayed exclusively in the compact two-row media query; desktop columns and narrow phones hide it. Square sizing now checks the fixed player's actual top edge with 8px clearance. The previous 20px reservation rejected the user's 1135×791 preview by 11px despite sufficient physical space. At that native size the role pair now measures 390×390px, leaves 9.17px before the player, hides the comma, and has no horizontal overflow.

### Showcase order update — October 21

Removed decorative role arrows. The accent title panel now appears above the media, with title/subtitle left and description right. Timer remains against the bottom image edge; the five-button index follows it at every width. Foul Balls and The Sleds use the requested subtitles; Design and Illustration omit them. Checked native desktop, 1440×900 and 390px mobile; adjusted the desktop media height budget to reserve clearance above the persistent player. TypeScript and production build pass.

### Header spacing and tighter preview panel

Preview underlining is scoped to the title/media links, excluding project index and timer hover/focus. The title column uses its intrinsic width with a small gap to the blurb and reduced panel padding. Graphic Design stays on one line in the preview, index, and dedicated project heading. The desktop header uses equal measured gaps between the wordmark and three links; Featured Work starts at the media left edge. Verified 63.78px equal gaps and exact media/link alignment at the native preview width; all five index labels fit at 320px.

### Stable traveling index underline

Reserved the full bold label width in each project tab and positioned animated letters independently. Weight changes no longer resize flex items or repeatedly retarget the underline. Kept the shared 750ms handoff and used fractional bounding rectangles for exact endpoint alignment. Desktop forward/backward checks showed identical tab rectangles before and after handoff, with zero underline width error. Narrow phones reduce tab side padding to keep every label on one line. Typecheck, production build and all seven existing tests pass.

### Fixed title bars and rectangular roles

Removed showcase blurbs; optional subtitles sit to the right of titles. All five desktop title bars measure 72px tall (64px on narrow phones), including projects without subtitles. Graphic Design and Illustration show only their title. Removed square-role state, available-space detection, square CSS and intro square-size synchronization; the existing rectangular role geometry and responsive compact rows remain. Verified all five desktop states and the 320px subtitle layout. Typecheck and production build pass.

### Larger ared stroke

Moved the column-layout signature 5px right while preserving its previous overall SVG scale and J dimensions. The second original stroke (ared) now scales uniformly from its left baseline to the identity column right edge. Static vector and live canvas use the same transform; canvas bounds expand to include enlarged ink. Responsive checks at desktop and 390px showed less than 0.001px right-edge error. The compact inline greeting retains its fitted stroke size to leave room for the adjacent text. Typecheck, production build and seven existing tests pass.

### Corrected signature origin and brush behavior

Replaced the previous bottom-left filled-outline scaling. The signature now sits 7px left of its pre-experiment position, with the J at its original dimensions. The ared centerline scales uniformly from its top-left bounds to the column edge; the elliptical nib dimensions and angle stay unchanged. Static rendering strokes the centerline in nib-normalized space; intro canvas playback scales only centerline coordinates and retains the same nib. Greeting/role vertical placement reads the J path directly so transformed letter bounds cannot move surrounding elements. Typecheck and production build pass.

### Signature, image baseline, and project identity update

- Extended the lower J flourish to the column left edge while retaining upper-loop greeting clearance and the fixed nib. Ared remains fitted to the right edge. Static and animated rendering share the transformed centerlines.
- Lowered the tagline toward the J bottom, with an 8px minimum gap below ared ink on phones. Descriptor positioning follows the greeting clearance. In desktop column mode the lower descriptor matches the media bottom; measured difference was 0.016px at 1440×900. Compact greeting/role rows retain their normal flow.
- Afroman signature uses a uniform 2.4px #F5D504 pen, with the same #EF8216 4px/12px/28px drop-shadow glow as the hovered ampersand outline. Its idle ampersand is black.
- Graphic Design swaps #173458 navy and #00A99D teal, including the player; Illustration keeps its previous palette. The Sleds swaps brown/navy text and accents while retaining the #19364D player.
- Added the supplied wordmark.svg as a sanitized currentColor asset, including its circle. The preview and project heading render it in white. Preview subtitle is Catchy rock 'n' roll outta Boston. Shared preview title bars are 92px desktop / 76px phone, with media height budgeting updated.
- Greeting reads Hi! I’m, with the exclamation in Fraunces and matching hidden measurement typography.
- Verified wide/native desktop, 390px phone, compact 820px tablet, and the dedicated Sleds route. TypeScript, production build, and all seven existing tests pass.

### October 22 — uniform J, framed project controls, compact player

- Removed the lower-flourish deformation. The original J centerline now scales uniformly by 1.1 about its top-middle point; fixed brush dimensions are preserved in the normal vector and intro canvas. Updated the shared bottom landmark and drawing bounds.
- Added the licensed Fraunces true italic face for the exclamation only, using its expressive WONK/SOFT axes and 1.14em size.
- Sleds brown is #66534B. Imported assets-source/the-sleds/wordmark2.svg as a sanitized white/currentColor vector; its wider proportions allow 72px desktop / 64px phone title panels. Rounded top corners and colored project-index backgrounds with rounded bottom corners frame the media.
- Illustration and the opening shell use #B8860B in place of teal. Graphic Design uses #008477 for its text/player and keeps navy accents.
- Removed playback-status, welcome, and shuffled-queue labels. The persistent player retains artwork, metadata, transport, seek/time and mute controls plus real error feedback. Its inner frame matches the site boundaries exactly on desktop and phone; height is 74px desktop / 84px phone.
- Renamed the role toggle + a few more hats (minus when expanded). Its desktop text bottom matches the next-project timer bottom exactly.
- TypeScript, production build and all seven existing tests pass.

### October 22 — top marker, centered playback, and signature positioning

- Used the existing ampersand Fraunces face for the exclamation, adding a 0.1em left gap and measuring its scale against the J top. Removed the unused italic font asset.
- Shifted the J centerline 5px right in local display pixels, then applied one affine horizontal stretch to the left column edge, preserving its 10% vertical scale and fixed nib. Compact inline greetings retain their fitted width.
- Sleds flip-logo width and center derive from the ampersand ink metrics; the logo scales uniformly about that center rather than aligning to its top edge.
- Project index sits directly below the image with square bottom corners. Its top marker uses the bold text reserve’s width and x-position, keeping the 750ms handoff stable. Progress is the index’s bottom edge; timer text is below it. Hats alignment follows that timer position on desktop.
- Symmetric player columns and equal-width time fields center transport and seek input independently of metadata. Phones stack metadata, centered buttons and seek into three rows. Desktop/tablet/phone center measurements matched exactly (within 0.004px).
- Verified selected-name/marker width and x positions match exactly; progress/index bottom edges match exactly.

### October 22 — continuous index handoff and player hover exception

- Restored the licensed Fraunces italic punctuation face and halved the Hi/exclamation gap to 0.05em. Its size still follows the J top. Superclarendon and Urbane offer web licensing/embedding, but no licensed kit or embed is configured in the project.
- Player hover is excluded from countdown pausing, even over links and buttons; press and visible keyboard-focus behavior is retained. Browser observation confirmed progress increased while mute remained hovered.
- The bold-letter wave traverses adjacent names before settling at the requested destination in both navigation groups. It reverses for leftward travel and resumes from its actual partial state after interruption. Three added tests cover full forward/reverse paths, letter direction, and interrupted selections.
- Project marker width is fixed to the longest bold reserve (Graphic Design), with its top exactly at the image bottom. On 320px screens the rule stays fully visible at both endpoints; all five names remain visible without horizontal overflow.
- Sleds uses navy #19364D main text and brown #66534B accents. The player retains its established navy exception.

### October 22 — restored inline desktop topbar

Restored the earlier transparent topbar presentation using the saved shared-standard-font-spacing preview as reference. The main links end at the identity-column edge; the five project tabs occupy the media column with selected-tab underlines below the text. A single navigation instance moves into the root header outlet on desktop and back above the preview on smaller screens. Project routes hide the outlet. The countdown/progress is immediately against the image bottom again. At 1440×900 the Featured Work and identity right edges matched exactly, and both selection rules measured top 50px / bottom 54px. At 1001×650 all nine header items fit without horizontal overflow. At 390px there is one five-tab index above the preview and the progress top matches the image bottom exactly.

### October 22 — local free-transform editor for the J

Added a development-only editor on the actual landing layout, with a move surface, eight resize handles, rotation handle, numeric translation/independent scale/rotation/skew controls, Shift proportional sizing/rotation snapping, arrow-key pixel nudges, Undo/Redo, Revert and Reset. Editing pauses the showcase. Save writes the fixed signature-transform JSON through a bounded same-origin Vite middleware endpoint; it neither reloads the page nor ships with production. The production signature applies the saved affine transform to the J centerline before sweeping the existing nib, leaving ared and pen dimensions unchanged; the canvas drawing and neon line use the same transform. Animated canvas bounds account for the transformed J.

Browser verification: Move X 20px changed the rendered J by 19.9995px, preserved the ared path and nib matrix, and arrow-right changed the value to 21px. A direct 10px×10px drag moved X/Y by exactly that amount. Dragging the bottom-right resize handle preserved the opposite handle with 0px drift and retained the nib. A temporary saved 12px offset survived reload; original zero offsets/100% dimensions were restored and saved afterward. Save leaves the editor open with success feedback. Production output contains no editor UI, styles, or save endpoint.

### October 22 — centered saved signature and connected selection tab

Preserved the user’s saved J transform exactly. The two strokes translate together from sampled centerline/nib ink bounds to center over the identity column. Brush major/minor dimensions increase by 25%, while separate layout metrics retain the approved curve geometry. Both static SVG and handwriting canvas apply the same offset; the editor adjusts its handle coordinates and recenters after Save. A heading-style observer catches position-only changes after greeting/font layout. Measured overhang: 3.13px each side at the native desktop size, 3.77px each at 1440px, and 1.79px each at 320px after final layout.

The selection indicator keeps its previous 50px desktop top edge, becomes a filled accent tab with shared 12px top radii, and extends at least 2px beyond the title’s rounded corners. The title panel paints above it. Verified matching first/last tab and title outer edges, both connected corner treatments, mobile connection, and no horizontal overflow at 1440px / 1001px / 320px. Short desktop layouts place tabs beside the preview rather than drawing a connector through the greeting.

### October 22 — one signature shape across breakpoints

Removed breakpoint-specific rebuilding of the J and ared proportions. Captured the approved desktop base geometry in signature-layout.json and apply the saved J transform in that shared coordinate system. All layouts now use one uniform scale/translation for both strokes and the nib. Inline greeting text/comma follow the shared signature baseline; compact heading height and column role clearance follow actual ink bounds. Editor handles use the same fit transform. The saved J transform file is unchanged.

Browser checks at desktop, 820px medium and 390px phone show the identical full-word aspect ratio 1.9945289426354569. Medium greeting and tagline share the same y position. Phone overhang is 2.64px on each side, with 10.002px J-to-role clearance and no horizontal overflow. Added two regression tests for approved base proportions and uniform fitting; all 16 tests, TypeScript and production build pass.

### October 22 — folder lift

Grouped title/media/progress into one cover with a restrained paper stack and shadow. The separately positioned tab face uses the same world-space bottom hinge, animation and phase clock as the cover, while index text and timer copy remain stationary. Replaced the tab's horizontal slide with retract/lift, and reverse tilt/depth/lateral hints when navigating backward. Total duration is 650ms (260ms out / 390ms in), with synchronized descriptor phases; reduced motion uses a 160ms opacity-only handoff. Layout measurements use the untransformed stack so animated bounds cannot move descriptors or retarget the tab. Early intro selections queue through the intro handoff.

Browser checks confirmed identical body/tab animation matrices and opacity during both directions, clean identity transforms after settling, correct recovery from rapid selection changes, keyboard arrow navigation, one progress bar, white Afroman progress fill, and no mobile horizontal overflow. Existing clock test now covers both folder phases in regular and reduced motion. All 16 tests, TypeScript and production build pass.

### October 22 — opaque folder handoff and tab previews

Removed the folder crossfade that exposed the overlap between the header tab and title panel. Both remain fully opaque and share the same 90-degree bottom-hinge fold, regardless of navigation direction. Content changes at the edge-on midpoint, then rises from the bottom. Reduced motion switches immediately. Inactive index buttons now reveal a shorter, project-colored tab on pointer hover or keyboard focus; previews are hidden during a folder transition so they cannot appear through the moving cover.

Desktop and 390px phone browser checks confirm matching body/tab transforms and opacity 1 during forward, backward and last-to-first changes, including the automatic wrap. Pointer hover and keyboard focus reveal the correct project color without changing selection. Phone navigation retains all five names and has no horizontal overflow. The 16 existing tests, TypeScript check and production build pass.

### October 22 — equal tabs, reversible hover and shared neon halo

Graphic Design now uses navy #173458 for primary text/player and teal #008477 for accents. The index uses five equal grid tracks at every breakpoint, with centered labels and smaller fitted type in the narrow strip. Browser measurements at 1456px, 820px and 320px show equal fifths of the preview width, label centers within .004px of their tab centers, and no horizontal overflow; Graphic Design remains on one line.

Hover tabs retract over the same 180ms travel as their entrance and hide only after the motion ends. Supporting roles shrink/fade out before their container hides after 400ms; measured intermediate exit states remain visible with partial scale/opacity. Reduced motion skips these transitions. Afroman's signature neon now renders in a separate aligned SVG layer with its halo applied outside the SVG, eliminating viewBox-dependent blur scaling. Signature and ampersand share the 2.4px yellow tube and orange 4/12/28px screen-pixel halo. Browser checks confirm identical filters and aligned signature layers. TypeScript, all 16 tests and the production build pass.

### October 22 — connected folder silhouette and index fan

Moved the active tab from the header portal into the animated folder cover. It now shares the title/media's single perspective plane rather than approximating that projection with a second transform. Header measurements place the tab relative to the untransformed stack and compensate for the intro header slide. The title overlaps the tab by 14px at rest; forward/reverse browser samples retain positive overlap at full opacity during the fold. Mobile tabs retain equal fifths and match their index anchor without horizontal overflow.

Hovering the index reveals all four inactive project-colored tabs at half height; the hovered tab rises to the full active-tab height. Keyboard focus supplies the same fan and full-height target. Leaving retracts the fan with the existing exit animation; moving folders hide the previews. TypeScript, the production build and all 16 tests pass.

### October 22 — signature weight, neon edge and typographic baselines

Increased the calligraphic nib dimensions by 20% to 11.25 / 3.1640625 while preserving the saved J transform. Afroman's separate 2.4px neon linework stretches horizontally from its left ink edge until the right ink touches the column edge; its glow gains a second pass at 50% opacity. The regular signature geometry stays centered and the compact inline greeting keeps its existing composition.

Rendered signature measurements now supply the thin J's bottom and curve points. Column greetings balance their visible lower/right clearances against that curve. The tagline aligns its text baseline to the thin J bottom, consistently across themes. The role block measures the same visible ink gap as a descriptor line break; its lower row extends by the font's baseline tail so the bottom descriptor baseline reaches the image bottom. Supporting roles still animate normally.

Browser measurements at 1456px: neon right edge within .005px of the column, tagline baseline within .003px of the thin J, lower descriptor baseline within .03px of the image, and greeting clearances 11.24px / 11.35px. At 1920px the baselines remain within .01px and greeting gaps are 14.84px / 14.87px. A fresh phone load preserves the thin-J baseline and balanced gaps, while 820px retains the compact two-row layout with no horizontal overflow. Existing 16 tests and TypeScript checks pass.

### October 22 — ared translation and player accents

Preserved the user's newly saved J transform. Replaced the neon-only horizontal stretch with a translation of ared alone, calibrated so the thin tube's right ink edge meets the column. Regular ink, neon and handwriting use this same ared translation; compact inline greetings keep their fitted placement. Browser measurements put the right edge within .006px at desktop and 390px phone widths, with no horizontal overflow. Regular/neon J centerlines match within .005 SVG units of rounding, with no independent stretch of the J. The saved J settings remain unchanged.

Afroman's next-project timer fill is #EF8216 against black. Foul Balls' player background is the page accent purple #846393, and Graphic Design's is its teal #008477; browser-computed colors match all three. TypeScript and production build pass.

### October 22 — ared nudge and midpoint tagline

Moved ared a further 3 CSS pixels right in regular ink, neon and handwriting, preserving the J. In column layouts the tagline's baseline is now halfway between ared's written baseline and the thin J bottom. The descriptor block keeps its clearance below the J so the raised tagline cannot pull text into the descender. Compact inline greetings retain their arrangement. Browser checks measure a 3.004px right overhang and a tagline baseline within .002px of the requested midpoint. TypeScript and production build pass.

### October 22 — stationary preview and tab-path handoff

Moved the tagline down 3px. Replaced the 3D cover fold, stack and shadow with tab-only vertical motion. All faces remain inside the static preview plane, sized from the same content-driven tab count as the index. A seven-second cue raises the next tab halfway; at eight seconds, all tabs lower/reveal to halfway, intervening tabs rise and fall in path order, and the destination rises as the project changes. Cleanup hides other tabs unless pointer/keyboard preview retains the fan. Manual changes lower old and hovered destination tabs together. Normal handoff is 600ms, increasing by 270ms per passing tab; reduced motion switches immediately. Navigation letter weights use the same handoff deadline. Pending timers remove themselves after firing, and rapid selections queue only the latest destination.

Browser traces confirm the final-second cue at 88% progress, all five tabs halfway at 100%, content commit during the destination's rise, then cleanup to one selected tab. Preview transform stays none and opacity stays 1 through every phase. A reverse end-to-end trace visits Design, Afroman and The Sleds before committing Foul Balls. Hover holds the fan, while leaving hides it; rapid mixed selections settle on Afroman with one progress bar and one audio element. At 390px the five tabs are exactly 66px wide over a 330px image, labels are centered, and there is no horizontal overflow. All 21 tests, TypeScript and production build pass.

The component also resets interrupted handoff refs when a live module update cancels its timers, then replays the latest pending selection. Final fresh-load verification completed an Illustration-to-Foul Balls sweep and returned to idle with autoplay enabled. The tagline baseline measures within .002px of midpoint + 3px.

### October 22 — final-second fan, overlapping passes and pointer-down selection

Made “Hi” bold while retaining regular “I’m,” including the hidden width measurement and intro greeting. Lowered the column tagline another pixel, to midpoint + 4px, without changing the saved J or signature brush.

The final autoplay second now reveals all four inactive tabs halfway and leaves the active tab fully raised. At zero, adjacent autoplay tabs lower/rise simultaneously over 240ms. All inactive faces remain halfway visible for another 500ms after the rise, then retract unless pointer or keyboard preview retains them. Manual selection begins on primary pointer-down, preserving keyboard/assistive click activation without a duplicate selection on release. A new manual selection can interrupt the resting hold/cleanup. Nonconsecutive sweeps overlap each passing tab's descent with its neighbour's 120ms ascent.

Browser traces verify the full fan at 88% progress, simultaneous old-half/new-full targets at zero, approximately 500ms of hold, then cleanup. Reverse end-to-end passes occur approximately 120ms apart while the title/media remain stationary at opacity 1. A 300ms held click reaches the destination's raise before release; another selection during the hold starts lowering immediately. Keyboard arrow navigation, hover retention and retraction work. At 390px, all five tabs remain 66px wide over the 330px preview, with no horizontal overflow. Greeting weights compute to 700/400. All 24 tests, TypeScript and the production build pass.

### October 22 — continuous index hit area and release-driven overlapping sweep

Extended each project button's transparent hit area down to the title container's top edge. Raised the home header above the content layer so its extended hit targets receive events in the 10px desktop strip; stacked layouts use the same measured extension. No labels or title geometry move. Desktop and 390px browser checks confirm hovering the formerly empty strip reveals the full fan and identifies the matching project tab without hovering/underlining the title.

Pointer-down now dips only the pressed face and leaves the current project, navigation letter wave and handoff idle until the click is released. Window-level release, cancellation and blur clear the press; releasing outside restores the preview without selecting. A held 800ms browser click was observed with Foul Balls still active, phase idle and The Sleds halfway down; release began the lower phase and then selected The Sleds. Keyboard arrow selection remains functional.

Passing tabs now use independent 240ms CSS pulses (120ms up and 120ms down), staggered by 75ms instead of 120ms. The next pulse begins before the preceding tab reaches its peak, preserving each stroke's speed while shortening an end-to-end manual handoff from 780ms to 645ms. Browser-computed delays on a reverse sweep are 180/255/330ms, with each duration still 240ms and overlapping transforms. The preview stays stationary and fully opaque. The final-second fan and 500ms hold remain intact. All 25 tests, TypeScript and production build pass.

### October 22 — Illustration amber and Afroman neon sound/brightness

Replaced Illustration/default gold with #FFBF00, including the intro ampersand. The gold caption uses navy text for contrast. The local signature editor is hidden by default (development-only opt-in remains available); the saved signature transform and brush files are unchanged.

Read Afroman-web's StartScreen.cpp and audio.js and inspected its title artwork. The hover sign now reveals the complete outline in two blinks, builds light/buzz over 600ms, then follows the original eleven 140ms brightness/gain steps from 1 down to .25 and back. Visual light and the independent buzz voice use the game's 25ms exponential smoothing. Copied the original neon-plink.wav and neon-buzz.wav to standalone public media so the game payload stays lazy and unchanged. The two startup plinks and looping buzz use a separate Web Audio bus controlled by the site's mute setting; no music transport or gain is changed. Audio stops on hover exit, project navigation, overlay/window inactivity, or unmount, and stale decoding cannot start late sounds. Reduced motion uses a steady sign. A trusted click/key may be needed before browsers permit hover audio.

Browser checks confirmed blink, crescendo and loop phases, a running effect engine, changing brightness from approximately .25 to 1, shared mute state, sound off after exit/navigation, zero editor launch buttons and Illustration's computed #FFBF00 caption. The persistent music element remains singular. All 30 tests, TypeScript and production build pass; tests cover the game-matched envelope, independent gain/mute/stop behavior and leaving during asynchronous decoding.

### October 22 — color-driven neon, revised sound cues and softer tab presses

Illustration and the default intro gold now use #F3B617. The neon's two startup blinks gate the buzz at half gain; the only plink is scheduled for the third sustained turn-on at 360ms. The continuous buzz then follows the existing 600ms crescendo and game-derived loop. The steady outline stays at opacity 1 throughout its loop: color/halo interpolate from #8C3E0B with no glow, through page orange #EF8216, to #F5D504 with the full orange halo. Opacity is used only for the requested startup blinks and hover exit, rather than the brightness loop. Shared mute, stop and asynchronous-cancellation behavior remain intact.

Tab rise/fall pulses now take 140ms each, with the 75ms stagger retained; general dip/retraction is 210ms and destination rise 280ms. Pointer-down moves a full tab one quarter of its hidden travel. Release finishes the selected target's dip while the outgoing tab stays raised. The outgoing tab then starts lowering exactly when its neighbour starts rising, for both direct changes and sweeps. Independent passing pulses still overlap. Browser measurements show a 6px held dip for a 24px hidden travel (12px halfway), idle selection during the hold, the target completing its dip on release, and old/next tabs simultaneously moving during handoff. The media stays stationary and fully opaque.

Browser-computed neon endpoints confirm stroke rgb(245,213,4) with a full halo and stroke rgb(140,62,11) with filter none, both at opacity 1 and with the effect engine running. Exit stops the engine. At 390px, Illustration computes #F3B617 with five 66px tabs and no horizontal overflow or editor launcher. All 32 tests, TypeScript and the production build pass.

### October 22 — slower tabs, delayed neon ignition and Sleds palette exploration

Illustration/default gold is now #DAA520. Passing tabs take 260ms up and 260ms down, retaining 110ms start offsets for substantial overlap. The manual release dip is 320ms, destination rise 420ms and hover/cleanup retraction 300ms. This noticeably slows each individual stroke without changing the shallow held-press behavior, shared start of the outgoing/next faces, or stationary media plane. A complete end-to-end manual handoff takes 1070ms before the existing fan hold/cleanup.

Added a 240ms dark/silent beat after the startup blink sequence. The sustained neon turn-on and its sole plink now begin at 600ms, followed by the same 600ms crescendo and color/glow loop. Browser checks confirm the pause phase has opacity 0, then sustained ignition has opacity 1. Tests verify the sound is gated off during the added beat and the plink is scheduled at 600ms. All 33 tests, TypeScript and production build pass.

Prepared twelve side-by-side Sleds color directions using its supplied band photograph, signature and wordmark: the current powder/walnut theme, maroon substitution, powder/navy, two walnut-background variants, two navy-background variants, maroon background, three four-color combinations, and a white-background mix. Readable title/player foregrounds are selected per surface. The comparison supports local shortlisting and an optional custom mix through host design controls. It does not change the live Sleds palette. The comparison was browser-checked and its shortlist interaction verified. Preview: previews/sleds-color-comparison.html; overview: previews/sleds-color-directions.jpg.

### October 22 — Illustration maroon, Sleds finalists and immediate tab release

Illustration/default accents now use #88281d maroon, replacing gold; the caption uses white text for contrast. The saved signature geometry remains unchanged. Narrow and desktop browser checks confirm the maroon caption and five equal project tabs, with no horizontal overflow.

Removed the manual release-dip phase. Pointer-down still presses the face only one quarter of its hidden travel and leaves selection idle. Release now immediately targets the outgoing face halfway and the selected face fully raised. The destination remains full during all intermediate pulses, content commit and hold. Autoplay uses the same immediate handoff. Passing strokes retain their 260ms up/down speeds and 110ms overlap; a complete visible-index sweep settles after 740ms, followed by the existing 500ms hold and 300ms cleanup. The transform duration remains stable across pass/raise/hold. A fresh release retargets an in-flight sweep without waiting for it to finish.

Browser-held forward and reverse clicks confirm idle selection while pressed, old-half/new-full targets immediately on release, and the destination still full during hold. An actual eight-second autoplay check confirms the same simultaneous targets at zero. The media remains stationary and opacity 1. All 33 tests, TypeScript and production build pass.

Reduced the Sleds comparison to four finalists: Walnut + white; Navy + white with powder tab/title and music bar; Powder + tan (#CF995F); Powder + coral (#ED6A5A). Maroon is absent from the Sleds finalists. The live Sleds theme remains unchanged while these are compared. Side-by-side preview and shortlisting were checked in the browser. Preview: previews/sleds-color-comparison.html; overview: previews/sleds-color-finalists.jpg; Illustration: previews/illustration-maroon.jpg.

### October 22 — applied Walnut + white, light-blue Illustration and complete tab strokes

Applied the selected Sleds palette to both the carousel and dedicated project: walnut #66534B background, white body text, powder #B6D3E9 signature/ampersand/title/tab and player. Powder surfaces use navy #19364D text, controls, timeline and focus states. Video buttons, Spotify placeholder and project wordmark retain readable foreground/background pairs. Illustration's background is very light blue #EDF5FB; its maroon accents remain. The default intro stays white.

Added a small per-face TabMotion queue and FolderTab component. Each motion finishes before a reversal; mandatory presses and passing pulses remain ordered, while only pending hover requests coalesce. Normal strokes take 360ms, the shallow held press 180ms, and passing faces start 140ms apart. Relative passing delays preserve the stagger after an unfinished hover reveal. Release sends the selected face fully to halfway; it bounces to full only after the sweep and all halfway motions settle. New released selections wait for the whole current sequence, hold and cleanup rather than interrupting it. Actual queue completion gates content commit, the 500ms hold, and the next sequence. Unmount/HMR cancels owned work safely.

The Afroman neon now blinks with 45% visual light and halo, preserving half-volume buzz. Its extra dark/silent pause is 400ms; the sustained turn-on/plink begins at 760ms. The existing crescendo and game-derived brightness loop remain. The carousel title and subtitle are pure black.

Browser checks confirm the exact applied Sleds surface/player/text colors on both views, Illustration's computed pale-blue background, one persistent music element, and Afroman's black title. Neon checks show a .45 startup flash/halo, zero light during the pause and a running crescendo afterward. Held/rapid selection traces complete the first destination before processing the queued second destination, with stationary opacity-1 media. A real last-to-first autoplay sweep keeps the new destination halfway until arrival, then holds it fully raised. All 38 tests, TypeScript and production build pass. Proof images: previews/sleds-walnut-white-applied.jpg and previews/illustration-ice-blue.jpg.

### October 22 — Foul Balls wooden-bat hover sound

Copied the supplied WAV master into assets-source/foul-balls and created a 128kbps, approximately 55KB MP3 playback copy of the complete 3.45-second clip. The first Foul Balls ampersand/role expansion lazily decodes it; subsequent entries reuse that buffer. HoverSound owns one independent Web Audio voice at .65 gain, follows global mute, never touches the music transport, and permits the natural tail after hover exit. Exiting before decode invalidates the pending hit. Project/overlay/window inactivity stops the effect; suspended playback is not queued to sound later. Touch/keyboard role expansion uses the same effect. The visual animation is unchanged pending selection of a baseball-specific treatment.

Browser checks observed playing on hover, continued playback after exit, muted suppression, replay after unmute, and effect isolation when switching projects. Exactly one persistent HTML music element remains paused at its original time throughout these checks. All 41 tests, TypeScript and the production build pass. Tests cover lazy loading/cache, natural completion, shared mute, stop/cleanup, leaving during decode, and blocked-context behavior. Proof: previews/foul-balls-bat-hover.jpg.

### October 22 — near-full Afroman neon ignition

The sustained turn-on now starts at 90% visual brightness/glow and gently settles to 100% over the existing 600ms interval. The 45% startup flickers, 400ms dark pause, plink timing and independent zero-to-full buzz crescendo are unchanged. The game-derived loop follows as before. Browser inspection caught the first sustained phase at 90.7% halo strength and opacity 1. All 41 tests, TypeScript and production build pass. Proof: previews/afroman-near-full-ignition.jpg.

### October 22 — absolute tab-wave timeline, direct presses and full neon ignition

Removed TabMotion's per-face queues, delayed relative pulses and whenIdle barriers. They caused passing faces to stall or repeat hover movements and made the destination wait for previous descents. FolderTab is now a presentational face driven by one timestamped plan. The outgoing descent and first neighbour's rise start together at zero. Every stroke is 360ms, and subsequent arrivals including the destination start 140ms apart. Each passing face's downward target is applied exactly at its peak; no full-height hold is inserted. Hover previews do not override a running wave. A direct pointer press always targets halfway, including during a wave. The quarter-travel press state is removed.

Current-tab clicks clear the press on release without invoking selection. Landing also guards same-project selection before resetting elapsed time, collapsing roles, or starting a handoff. New destination requests preserve the current absolute timeline and queue the latest destination. The 500ms fan hold remains at halfway after actual scheduled strokes have finished.

Afroman sustained ignition is now 100% visual brightness/glow from its first lit frame. The dim blinks, dark beat, sound timing and independent buzz crescendo remain. Browser sampling confirmed full yellow #F5D504 and halo strength 1 at ignition.

Browser traces confirm forward/reverse sweeps, passing descents preceding destination arrival rather than blocking it, and simultaneous adjacent transforms in manual and real autoplay changes: outgoing/incoming travel sums to 12px, both with 360ms duration. A held click on the current Foul Balls tab targets halfway; release restores full while phase stays idle, roles stay idle and countdown remains at 77%, proving no project reload/reset. Replacement regression tests assert fixed arrival intervals, peak reversals, hover isolation and same-project no-op behavior. All 37 tests, TypeScript and production build pass. Proof: previews/afroman-full-ignition-fixed-tabs.jpg.


### October 22 — frame-accurate ignition and synchronized tab/content clocks

The neon visual sampler now emits exactly one half-bright render frame followed by one fully bright frame, then immediately interpolates downward through the game-derived color/halo cycle. Removed the upper brightness snap that hid small changes near full light. The visual cycle has no bright plateau; the independent 600ms audio crescendo, two dim buzz flickers, 400ms dark beat and sustained-turn-on plink are preserved. Regression tests cover 144Hz, 60Hz, 30Hz and slow render frames.

Each 360ms tab rise now starts precisely when its predecessor reaches its peak and begins descending. Letter-weight handoffs follow the same individual tab intervals and finish one frame before each peak, in either direction. Selection is separate from displayed content: destination arrival starts a real 360ms old-content exit, then swaps the theme/content and plays a 360ms entrance. This prevents adjacent changes from batching exit and entrance into one update. Both manual selection and autoplay use this sequence; the opaque connected folder surfaces remain intact.

Browser checks observed old role/media exit animations at 360ms, retained old labels during exit, and new role/media entrance animations at 360ms during adjacent manual changes, reverse sweeps and a real last-to-first autoplay wrap. Bold names were complete by each peak. Neon inspection confirmed continuous color/halo changes with opacity 1 and the audio engine running. All 39 tests, TypeScript and the production build pass. Proof: previews/neon-tab-timing-refined.jpg.


### October 22 — remove the perceived pause at tab peaks

The schedule already reversed each passing tab at its peak, but the ease-out curve had reduced its velocity almost to zero before the reversal, creating a visible pause. Passing/arrival phases now use linear transform timing, retaining eased hover/retraction outside the sweep. Shortened the shared stroke and exact handoff interval from 360ms to 280ms; bold letters still follow each stroke. Descriptor/media phases remain symmetric at the new shared duration, with a complete exit before swapping content. No peak hold was added; the next ascent and previous descent remain one scheduled event.

Browser checks in both directions confirmed 0.28s linear transforms during the wave and simultaneously descending/ascending neighboring faces. All 39 tests, TypeScript and the production build pass. Proof: previews/tab-wave-no-peak-pause.jpg.


### October 22 — match transition strokes to hover motion

Removed the transition-only linear timing override. Hover, pointer presses, scheduled ascents and descents now use the identical shared 280ms duration and cubic-bezier(.2,.75,.3,1) curve. The prior linear wave felt slower because it lacked hover's fast initial movement. The absolute handoff schedule remains unchanged: each descending passing face and next ascending face share a timestamp, with no added top hold. Browser-computed styles confirmed identical duration/easing in idle hover and the passing phase, including simultaneous neighboring transforms. All 39 tests, TypeScript and production build pass. Proof: previews/tabs-matched-hover-timing.jpg.


### October 22 — short complete strokes without an easing tail

The shared 280ms ease-out still covered most of its distance early and crawled near the endpoint. Replaced it with 140ms constant-speed travel for hover, presses and scheduled rises/descents. Each passing face reaches its actual top at 140ms, reverses immediately and starts its neighbor in that same scheduled event. The reverse trip also takes 140ms, with no eased plateau at either end. Bold letters use the shortened stroke clock.

Separated descriptor/media timing into projectTiming so their complete 280ms exit and 280ms entrance retain the previous readable pace. The overall transition cannot finish before the content entrance completes, even if tab timings change later. Browser-computed transforms confirmed 0.14s linear travel with neighboring faces descending/ascending during reverse travel. All 39 tests, TypeScript and production build pass. Proof: previews/tabs-fast-constant-speed.jpg.


### October 22 — quicker click dip and bounce

After clarification that the dip/rebound felt slow, added an 80ms direct-press stroke and retained that duration through the current tab's release bounce. Scheduled waves keep their approved 140ms clock; a press cannot change passing-tab intervals or let the destination outrun its bold-letter handoff. FolderTab keeps only a short release flag, canceled safely on re-press or unmount. Reduced motion remains immediate.

Browser-held clicks on the current Foul Balls tab showed 0.08s duration and halfway target during pointer-down, then 0.08s and full target immediately on release. Selection and idle phase stayed unchanged. A different-project press showed 0.08s during the dip and returned to the regular 0.14s wave duration on release. All 39 tests, TypeScript and production build pass. Proof: previews/tabs-quick-click.jpg.


### October 22 — larger baseline-anchored signature and compact role alignment

In the compact two-row breakpoint (680–1000px, or >1000px with height <=700px), magnified the actual shared signature ink by 10% around its ared baseline and right punctuation edge. Included the existing 3px ared translation in the scaling so complete ink width, not only the normalization factor, increases by exactly 10%. Retained an independent flow-bottom measurement so the greeting, comma, header and project preview keep their prior document coordinates. Desktop and narrow phone fitting retain their existing branch.

Compact ampersands use 80% of the prior size. Translated the role section as a complete visual unit to align the idle ampersand ink top with the measured p descender in multidisciplinary; the flow footprint stays fixed. Measurements ignore hover growth so expansion cannot retarget the row. Font-ready and ampersand resize observations keep alignment responsive.

At 900×800 the complete signature ink width ratio was 1.1000000000000003, the ared baseline difference was effectively zero (1.4e-14px), and hello/tagline/comma/heading/header/preview document top and left differences were all zero. Ampersand size changed from 108px to 86.4px. Alignment targets matched at 139.139px. Also checked the 680px compact edge, a 1200×650 short window and 390px phone with no horizontal overflow and all five project tabs present. A new geometry regression covers fixed baseline/right edge across multiple fit widths. All 40 tests, TypeScript and production build pass. Proof: previews/compact-greeting-adjusted-900.jpg and previews/compact-greeting-adjusted-1200.jpg.

Expanded-role design review (recommendation, not implemented): the current compact grid inherits desktop translate offsets, forcing collisions (notably Creative Producer/Animator) and pulling Composer out of its cell. Every word becomes its own line, and a fixed 190px expansion unnecessarily pushes down the preview. Prefer a shallow role ribbon in the space beneath the primary row: keep the two original roles shrinking at their anchors, keep the smaller central ampersand, then reveal additions in three equal columns and at most two rows (six Foul Balls additions). Use 18–20px accent text, allow a whole phrase per cell when it fits, remove desktop offsets/forced breaks, and stagger reveal very briefly. Keep hover plus tap/keyboard toggling and avoid growing the band beyond the existing whitespace. If later projects exceed six additions, use a second compact panel/page rather than an orbit or unreadably small type. The existing expanded view remains unchanged pending the next design choice.


### October 22 — horizontal ampersand sentence chain

Replaced the compact expanded grid with a measured chain bounded by the original descriptor pair. The pair shrinks to the same readable 18–22px visual size as its additions. The original ampersand shrinks for 200ms to approximately 1.5 times descriptor ink height, then slides for 220ms beside the first descriptor. New phrases and their separators appear in sequence at 85ms offsets with 180ms scale pops. The final separator sits immediately before the second original descriptor. Additional roles retain the project accent color. A reference sentence and wrapped layout are measured in clipped, inaccessible elements; measurements only update for content/font/resize changes. Font optical size is fixed to match the original ampersand, so all separator shapes match as their size changes.

Whole phrases wrap when a single line would need text below 18px. The first original descriptor keeps its anchor; the second stays at the right edge and moves only to the last line if wrapping is needed. The role band retains its original height; the former 190px expansion is gone. Exit reverses the token sequence before sliding/growing the original ampersand and restoring the pair. Project changes bypass the delayed hover exit to retain the existing synchronized content phases. Touch/keyboard toggling is retained, Escape closes expansion, and reduced motion removes the sequence. The Sleds uses an & in this compact chain (desktop logo flip unchanged); Afroman neon/audio remains on the moving shared ampersand.

Browser checks covered the full Foul Balls chain at 680×800 (18px, two lines), 900×800 (22px, two lines), and 1200×650 (18.41px, one line). At 900px the feature top stayed 295.4375px both closed and expanded; the 680px role band remained 124px high. Inspected staged entrance and reverse-opacity exit samples, right bookend alignment, zero horizontal overflow, keyboard toggling and Escape, Sleds' unflipped compact separator, Afroman's running neon engine, and one persistent music element. At 390×844 and 1456×900 the chain is hidden and the existing expansion remains, with no horizontal overflow; viewport overrides were reset afterward and the browser error log was empty. Regression tests cover bookends, separator counts/order, deduplication and readable type bounds. All 44 tests, TypeScript and production build pass. Proof: previews/horizontal-role-chain-900.jpg and previews/horizontal-role-chain-680.jpg.


### October 22 — compact brush and Sleds source refresh

Compact inline greetings use a 1.5× nib multiplier, with unchanged centerlines, ared baseline and flow geometry. Canvas paint bounds include the enlarged nib so the introductory drawing cannot clip. Other layouts retain their previous brush weight. The punctuation ratio is now a constant 1.18, matching the measured compact ratio (1.17956) across desktop and phone rather than deriving its height from each layout’s J position. Checked 900×800, 1456×1000 and 390×844: proportional punctuation and no horizontal overflow.

Refreshed horizontal Sleds wordmark and hover mascot from the source SVGs. SVG lettering now inherits its intended caption color; a physical underline responds to title/image hover and keyboard focus. Updated subtitle to “Rock ’n’ roll band outta Boston”. Imported two local MP3 tracks, five optimized release covers, album back-cover credits, contribution notes, and the supplied Linktree. Gallery images lazy-load; WAV and large image masters stay out of public. Browser verified all five images decoded, local Dirty Hearts playback, continuous playback on return to landing, and no console errors. All 44 existing tests, TypeScript and production build pass. Proof: previews/compact-signature-sleds-refresh.jpg and previews/sleds-records-refresh.jpg.


### October 22 — justified compact chain and descriptor frame stability

Replaced unequal within-group versus between-group spacing with measured token rows, each justified with identical gutters. Ampersands wrap with their following role; every continued row starts with an ampersand and ends with a role flush right. Uses fractional computed width to avoid subpixel right-edge drift. Regression verifies equal gutters, row-start separators and flush edges at three widths. Browser checked Foul Balls at 680×800 and 900×800, two rows and zero horizontal overflow.

Graphic Design’s alternating placement exposed content-dependent vertical measurements: the p descender in Graphic shortened the calculated line gap, unlike the first word Art in the opposite arrangement. Positioning now uses canonical Hg metrics for both cap height and descender clearance. At 1200×750, Graphic Design’s role frame top measured 271.671875px versus 271.6640625px between arrangements (subpixel rounding only); preview and header geometry stayed fixed. Previously the arrangement changed the frame top by about 6–7px. All 45 tests, TypeScript and production build pass; browser errors empty. Proof: previews/role-chain-justified-900.jpg and previews/role-chain-justified-680.jpg.


### October 22 — sequential neon sound and responsive effect ownership

NeonSound now schedules two independent 90ms half-volume buzz gates, the full plink at sustained ignition, and the continuous buzz at the plink’s exact decoded end (445.854ms for the supplied recording). No buzz loop overlaps the plink. The 600ms smooth crescendo is scheduled on Web Audio’s clock after that handoff; subsequent oscillation follows the game brightness curve. Late decoding skips expired flashes and seeks the remaining plink rather than restarting the sequence. Hover exit, mute and pending-decode cancellation remain independent of music playback. Tests cover exact source boundaries, gain ramp completion, late decode, cancellation and cleanup.

The dark-orange non-glowing outline now stays opaque at rest and through both unlit flicker beats over the black filled ampersand. The shared neon controller lives on the identity section. Compact chain layouts hide the outline layer, retain the normal orange filled ampersand, and apply the same flicker/color/halo sequence to the signature instead. Compact idle signatures remain fully glowing. Desktop/phone retain ampersand interaction. Browser checked desktop idle stroke rgb(140,62,11), black fill and opacity 1; compact orange amp, hidden SVG outline, idle yellow signature, running sound and changing signature stroke/halo; Escape stops audio and restores the signature. Narrow 390px check retains the dark idle ampersand outline and zero horizontal overflow. Browser errors empty. All 46 tests, TypeScript and build pass. Proof: previews/afroman-compact-signature-neon.jpg.


### October 22 — shared neon volume/brightness, idle tabs, mobile header

Removed the independent post-plink 600ms ramp and audio oscillation clock introduced in the previous revision. That ramp produced a perceived silent gap and placed volume peaks out of phase with the tube. Plink and sustained buzz now share a single gain bus, driven directly by the exact visual frame’s light level without smoothing lag. The buzz still begins at the decoded plink end, with no crossfade or overlap. PCM inspection found similar RMS at plink tail and buzz head (~0.025), so no source trimming is needed. Flash buzzes retain their two independent half-volume gates. Tests verify sample-accurate source adjacency, common plink/buzz gain routing, no added ramp from silence, matching brightness/volume at 30/60/144Hz, and cancellation. Subjective handoff listening can be confirmed by Jared.

Idle tabs now leave only the active face halfway visible; hover/keyboard preview and the autoplay lead wake it to full and reveal the rest halfway. Running waves preserve existing timing and press behavior. Added idle/wake/cleanup regression coverage. Browser verified active half at 10.5px translation, inactive hidden at 21px, then active full and four half on wake.

At <=540px the header is one row, 64px tall, with name/About/Contact. Featured Work is hidden because the name links home, and its now-empty home indicator is hidden. Other active navigation indicators retain their behavior. At 320px the brand and both links share a center line with no horizontal overflow. Proof: previews/mobile-single-row-header.jpg and previews/idle-halfway-project-tab.jpg. All 48 tests, TypeScript and production build pass.


### October 22 — restore Sleds hover mark, balanced desktop roles, effect unlock

Restored the earlier circular ampersand3 mark instead of the newly supplied sledboy. Removed its exported class/style fill and used currentColor; measured hover shows the powder theme color and centered 180-degree flip. Wordmark2 remains unchanged.

Desktop role frame now places the upper descriptor midway through the gap from the tagline bottom to the fixed lower descriptor, retaining the lower baseline at the image edge. At 1456×1000, Foul Balls gaps measured ~152.67px above and ~152.64px below. At 1200×750, the flipped Afroman pair remains balanced to within 1px; no horizontal overflow. Compact inline layouts bypass this adjustment.

Effects now register one shared capture-phase unlock handler for pointerdown, click, touchend and keydown, including gestures that happen before mount (via userActivation). The music Play path explicitly unlocks the registered effects too. Both hover engines attempt resume before asynchronous media preparation; neon no longer waits indefinitely for a blocked resume that could trigger stale playback later. Mute stays independent of unlock. Regression covers trusted versus synthetic gestures, all gesture paths, explicit music unlock, multi-engine ownership, and cleanup. Browser verified first bat play and neon running on a fresh page without mute/unmute. Browsers still require a recognized user gesture when autoplay policy disallows hover audio.

Foul Balls supporting player metadata and seek colors now use #30243d dark purple. Artist computed color verified rgb(48,36,61). All 49 tests, TypeScript and production build pass; browser error log empty. Proof: previews/desktop-roles-spacing-purple-player.jpg and previews/sleds-restored-hover-logo.jpg.


### October 22 — revert balanced desktop frame, lower its top 10px

Restored the previous signature/tagline-anchored top calculation, removing the midpoint balancing rule. Added 10px only to the desktop top edge; the zone still derives from the fixed image bottom. Compact row/inline layout is unchanged. At 1456×1000 Foul Balls’ lower baseline measured 660.7855px against image bottom 660.8125px (~0.03px rounding). TypeScript and build pass. Proof: previews/desktop-role-top-plus-10.jpg.


### October 22 — complementary, high-visibility player details

Foul Balls artist/project metadata and times use warm cream #fff6e8 (4.68:1 against #846393); Graphic Design uses warm white #fffefd (4.56:1 against #008477). Both seek fills use complementary peach #ffe4c4, with deep purple #201329 or navy #10233d remaining tracks. Fill/track contrast against player backgrounds exceeds 3:1 (4.10/3.53 for purple, 3.75/3.43 for teal). Seek tracks are 4px; handles are 12px with dark borders and pale centers. Browser confirmed both computed palettes and inspected seek progress after keyboard PageUp; screenshots show 4 seconds elapsed. Production build passes. Proof: previews/foul-balls-player-contrast.jpg and previews/design-player-contrast.jpg.


### October 22 — plain seek handles, release years, compact mobile player

Removed the dark seek-handle border on Foul Balls/Graphic Design. Played progress is Foul Balls tan #dcc1a2 or near-white #fffaf2 respectively; supporting metadata retains the high-visibility colors. Sleds metadata now reads The Sleds · 2024 or The Sleds · 2026 using track years, while links retain their project/music targets.

Player content height is consistently 74px. At <=679px, the track and controls share the first row (controls right-aligned), with seek/mute below. At 390×844, player spans y770–844; at 320×600 it spans y526–600. No horizontal overflow or title/control overlap. Browser verified The Sleds · 2026 and tan seek fill. Added viewport-fit=cover, bottom safe-area padding included in reserved player height, safe side margins, and narrow-layout top inset. The existing dynamic/small viewport sizing remains. No fixed Safari-toolbar height is guessed. A real iPhone Safari check remains needed; desktop viewport resizing cannot validate the browser toolbar or physical home indicator. TypeScript and build pass. Proof: previews/mobile-player-compact-390.jpg.

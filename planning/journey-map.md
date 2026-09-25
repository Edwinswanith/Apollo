# Walk Through Apollo: Journey Map (for approval)

Status: PLAN ONLY. No images generated, no videos generated, no site built, 0 credits spent.
Balance at time of writing: 686.8 Higgsfield credits (Plus plan).
Source frames: `Doctor_journey/1.png` to `8.png`, all 1672 x 941 (16:9), kept in the supplied order.

---

## 0. Frame-by-frame inspection

| # | Location | Camera position / height | Looking | Landmarks | Light | People | Signage / text in image | Composition |
|---|---|---|---|---|---|---|---|---|
| 1 | Outside, main gate on the approach road | Standing on the road just outside the gate, eye level ~1.6 m | Straight ahead up the driveway | Teal "Apollo Hospitals" gate beam on a white pillar with the flame/cross mark (left half), white multi-storey block (right), porte-cochere canopy with glass doors mid-distance right of centre, big trees at left | Hard late-morning sun from upper left, blue sky, dappled shadow on the road | Guard at far left, ~10 pedestrians, 2 cars under the canopy | "Apollo Hospitals" on the gate, mark on pillar and building | Gate fills the left 60%, the road and canopy lead the eye to the right third |
| 2 | Main lobby, just inside the entrance | Several metres into the lobby, eye level ~1.5 m | Diagonally across the lobby toward the reception desk, ~30 degrees right of the entrance axis | Teal glass feature wall with mark, marble reception desk, walnut pillars and slatted ceiling, glass entrance doors far left (daylight + green outside), kiosk right | Warm downlights plus daylight from the left | Seated visitors left, man in a light-blue shirt walking away toward the desk (centre), 2 staff at desk | Mark on feature wall and kiosk, kiosk screen UI | Desk centre-right, strong floor perspective, open floor at bottom |
| 3 | Reception desk, close | ~4 m from the counter, eye level ~1.5 m | Square-on to the desk (perpendicular) | Same teal wall + mark, long marble counter with 4 stations, 2 TV screens, queue stanchions | Warm, even, slightly brighter than 2 | Man in light-blue shirt at the centre counter (reads as the same man from 2), 2 women at counter, 4 staff | Mark on wall, soft UI on screens | Symmetrical-ish, counter runs across the frame |
| 4 | Waiting hall facing a (second) reception desk | Behind the rear row of waiting seats, eye level ~1.3 m | Toward a desk ~15 m away; a corridor opens on the right | Rows of grey/beige seats, walnut panels, teal wall with a DIFFERENT emblem (not the flame/cross mark), framed city painting left, corridor right with a nurse walking away | Warm downlights | ~8 seated visitors, 3 staff at desk, nurse and doctor in the corridor | Different emblem on the wall, TV with flowers | Seats fill the lower 60%, corridor is the exit on the right |
| 5 | Inpatient corridor | Centre of the corridor, eye level ~1.5 m | Straight down the corridor (one-point perspective) | Benches both sides, handrails, glass door right foreground, teal wall with a decorative emblem at the far end, window at the end | Warm, very even | Nurse (blue scrubs) and doctor (white coat) walking away centre, one man seated | Small door signs, far-end ceiling signs (unreadable) | Perfectly symmetrical, clear centre lane |
| 6 | Private patient room (empty) | Just inside the door, eye level ~1.5 m | Toward the window wall | Bed centre-left with headwall and monitor on the LEFT wall, sofa right, window centre with trees and city, TV right | Soft daylight from the window plus warm cove light | None | Monitor UI, bed labels (tiny) | Bed and window centre, calm and open |
| 7 | Patient room, bedside | Close, at the foot/side of the bed, eye level ~1.4 m | Across the bed toward the doctor | Window on the LEFT, headwall and vitals monitor on the RIGHT (mirror of 6), lilies, IV stand | Soft daylight from the left | Nurse with clipboard (left), senior doctor with glasses, cap, stethoscope (centre-left), patient in bed (right) | Vitals numbers on monitor (72 / 98 / 16) | Three people fill the frame, faces are the subject |
| 8 | Front desk / nurses' station with care team | Behind visitors at a white counter, eye level ~1.5 m | Across the counter to staff | White counter, teal blazers, the same senior doctor (glasses, cap, stethoscope) with a tablet, lots of wall graphics | Bright, even | ~10 people: 2 visitors in foreground (backs to camera), receptionists, nurses, doctor | HEAVY readable text: "Patient Flow OPD 12 / Diagnostics 6 / Admissions 4 / Discharges 3", "Care Connects Lives", "Better Care A Healthier Tomorrow", "Patients People Progress", "People Health Hope Always", wayfinding "Patient Rooms / Diagnostics / Pharmacy / Cafeteria" | Busy frame, very little calm space |

**Continuity gifts the images already carry (we build on these):**
- The man in the light-blue shirt walks toward the desk in 2 and is standing at the desk in 3.
- The nurse in blue scrubs walking away in 4's corridor is echoed by the nurse walking away in 5.
- The same senior doctor appears in 7 (bedside) and 8 (desk with tablet), in almost the same horizontal position (about 40% and 48% across). That makes a natural "follow the doctor" match-dissolve.

**Problems found in the supplied frames (must be settled before anything ships):**
1. **Invented facts in frame 8.** The "Patient Flow" screen shows patient counts, and the wall has slogans. Your brief says no generated factual content, so these need a clean-plate edit (blank screen, plain walls).
2. **The logo is not the same across the frames.** 1, 2 and 3 show a flame/cross mark. 4 shows a different emblem, and 5 has a decorative ornament. **Is the flame/cross mark your real logo?** If it is, we make 4 match it. If it isn't, the safest move is to remove marks from the images and show the real logo only in the HTML.
3. **None of the 8 frames shows a technology or treatment area** (no scanner, operating theatre, or diagnostics suite). Your conceptual map has a "treatment / technology" stop. See the options in section E.
4. **The people in the images are not real staff** as far as I can tell. They will never be captioned as named doctors. Named doctors come only from your approved content, as HTML.

---

## 1. The journey map

Legend: GREEN = direct, YELLOW = bridge or first/last-frame motion, RED = spatial discontinuity, handled as a deliberate chapter transition.

```
1.png  Gate, outside
  |
  |  T1  RED -> solved with 1 bridge frame (B1), becomes two YELLOW Veo walks
  |
2.png  Lobby
  |
  |  T2  YELLOW -> direct Veo first/last frame (no bridge unless the first try warps)
  |
3.png  Reception desk
  |
  |  T3  RED -> deliberate chapter transition in code ("checked in, take a seat")
  |
4.png  Waiting hall
  |
  |  T4  YELLOW -> 1 bridge frame (B4) at the corridor mouth, two short Veo walks
  |
5.png  Corridor
  |
  |  T5  YELLOW/RED -> code "head turn" to a bridge frame (B5) at a room doorway, then Veo through the door
  |
6.png  Patient room
  |
  |  T6  RED -> deliberate chapter transition in code (window-light dissolve), no Veo
  |
7.png  Doctor at the bedside
  |
  |  T7  RED -> deliberate chapter transition in code (match-dissolve on the doctor), no Veo
  |
8.png  Care team at the desk  = final destination, book-appointment settle
```

### T1: 1 -> 2 (gate -> lobby). RED, solved with a bridge
1. **What the visitor sees:** the gate and road, then the canopy and glass doors, then the lobby.
2. **Camera direction:** compatible only in general. 1 looks up the driveway; the doors are right of centre. 2 is already inside, turned about 30 degrees right of the entrance line.
3. **Architecture match:** the outside and inside are never seen together. The gap is roughly 40 to 60 m of walking plus a threshold.
4. **Bridge needed:** yes, **B1**: standing under the porte-cochere canopy, facing the glass sliding doors, with the lobby's warm light and teal wall glowing through the glass. It is built from frame 1 (facade, canopy, daylight) and frame 2 (the lobby interior seen through the glass).
5. **Camera movement:** Seg 1 is a slow forward walk up the driveway, veering gently right under the canopy, ending at B1. Seg 2 goes through the doors as they slide open, with a short exposure bloom as the eye adjusts from sun to warm indoor light, then a gentle turn right that ends on frame 2.
6. **Method:** Veo (2 segments, first + last frame).
7. **Risks:** the building facade warping during the approach, pedestrians or cars popping, and the gate sign lettering smearing as it leaves the frame. Fallback for Seg 2: replace it with a code exposure-bloom crossfade from B1 to 2. The doors are a real threshold, so a light flash reads as honest.

### T2: 2 -> 3 (lobby -> reception). YELLOW
1. **Sees:** walking up to the desk and squaring up to it.
2. **Direction:** compatible. About 8 m forward plus about 15 degrees of right turn.
3. **Architecture:** same materials and the same teal wall, but the desk is shorter in 2 and longer in 3, with screens and stanchions only in 3.
4. **Bridge:** not at first. Try Veo first/last frame directly. If the desk visibly stretches or melts, add bridge **B2** (the midpoint view) and split it into two walks.
5. **Movement:** a slow forward walk with a gentle settle to square-on. We follow the man in the light-blue shirt.
6. **Method:** Veo (1 segment).
7. **Risks:** the desk morphing as it lengthens, and staff appearing behind the counter. This is the transition most likely to need the B2 contingency.

### T3: 3 -> 4 (reception -> waiting hall). RED
1. **Sees:** the visitor is checked in and now sits and waits.
2. **Direction:** not compatible. 3 faces the desk from 4 m away. 4 faces a desk from 15 m back, across seat rows. Reaching 4 from 3 means walking backwards or a 180-degree loop.
3. **Architecture:** a different desk, and a different emblem on the teal wall.
4. **Bridge:** no. A bridge would fake a path that does not exist.
5. **Movement:** a code-driven lateral glide. 3 slides out to the left and softens (a static blur copy, crossfaded by opacity), and 4 slides in from the right. It reads as the visitor turning away from the desk toward the seats. Reading plateau for the Departments content sits here.
6. **Method:** deliberate chapter transition (deterministic web animation, fully reversible).
7. **Risks:** none on the media side. The emblem mismatch on 4 needs the clean-plate edit (see C).

### T4: 4 -> 5 (waiting hall -> corridor). YELLOW
1. **Sees:** crossing the hall and turning right into the corridor where the nurse went.
2. **Direction:** compatible. The corridor opens on 4's right edge, and 5 looks straight down a corridor.
3. **Architecture:** close but not identical. 4's corridor is narrower with no benches; 5 is wider with benches. The bridge frame reconciles them.
4. **Bridge:** yes, **B4**: standing at the corridor mouth, already turned right, with 5's corridor (benches, handrails, far teal wall) ahead and the edge of the waiting hall's walnut panelling on the left.
5. **Movement:** Seg 4a is a slow walk along the side of the seat rows with a gentle right turn, ending at B4. Seg 4b is a straight slow walk down the corridor, ending at 5.
6. **Method:** Veo (2 segments). If Seg 4a's turn warps, fall back to a code head-turn (like T5) from 4 to B4.
7. **Risks:** the turn is the main risk, since seated people and seat rows can smear during a rotation. Keep it gentle, about 45 degrees.

### T5: 5 -> 6 (corridor -> patient room). YELLOW/RED
1. **Sees:** turning to a room door and stepping inside.
2. **Direction:** 5 looks down the corridor; 6 looks into a room. That is a 90-degree turn plus a threshold.
3. **Architecture:** 5 has a glass door on the right, so a doorway exists in the world.
4. **Bridge:** yes, **B5**: standing in the corridor facing an open patient-room door, the doorframe edges in view, and 6's room composition (bed, window, sofa) visible through the opening.
5. **Movement:** 5 -> B5 is a **code head-turn** (a horizontal pan and crossfade, deterministic and reversible). A 90-degree rotation is exactly what Veo does worst. B5 -> 6 is a **Veo** slow forward step through the doorway, with the doorframe passing out of the edges of the frame.
6. **Method:** code transition + Veo (1 segment).
7. **Risks:** the doorframe bending as it passes. It's short and mostly at the edges, so the risk is low.

### T6: 6 -> 7 (empty room -> doctor at bedside). RED
1. **Sees:** the calm, empty room, then the care moment.
2. **Direction:** not compatible. 7 is a mirrored layout (window on the left, headwall on the right), versus 6 (headwall on the left).
3. **Architecture:** a different room, or the opposite side of it.
4. **Bridge:** no. Bridging would have people materialise in a room that also flips.
5. **Movement:** a code **window-light dissolve**. Hold on 6; the window light blooms softly (an opacity layer, not a filter animation), and 7 resolves out of the light. 7 then gets a very slow deterministic push-in (a scale of 1.00 to 1.04).
6. **Method:** deliberate chapter transition. No Veo, because faces and hands are the riskiest thing in AI video.
7. **Risks:** none on the media side.

### T7: 7 -> 8 (bedside -> care team at the desk). RED
1. **Sees:** following the same doctor from the bedside back to the team at the desk.
2. **Direction:** not compatible. It's a different space.
3. **Architecture:** different.
4. **Bridge:** no.
5. **Movement:** a code **match-dissolve centred on the doctor**. 7 scales and shifts slightly so the doctor sits where he stands in 8, then crossfades. 8 settles with a slow push-in and dims for the booking panel.
6. **Method:** deliberate chapter transition.
7. **Risks:** the frame-8 text problem (fake stats and slogans) must be cleaned first.

---

## A. Complete 1 -> 8 storyboard

| Ch | Frames | Motion | Content that settles here | Reading stop? |
|---|---|---|---|---|
| 1 Arrival | 1 (hold) | Still, slight load-in drift | Apollo introduction / positioning line (from approved copy) | Yes, short |
| 1 Arrival | 1 -> B1 | Veo walk up the drive | none (motion) | No |
| 2 Entrance | B1 -> 2 | Veo through the doors | "Find a doctor" / "Book appointment" actions arrive as the lobby opens | Yes, at 2 |
| 3 Reception | 2 -> 3 | Veo walk to the desk | Specialty picker (the one interactive moment) | Yes, long |
| 4 Waiting | 3 -> 4 | Code lateral glide | Your visit, step by step (what to bring, how it works) | Yes |
| 5 Corridor | 4 -> B4 -> 5 | Veo turn + walk | Doctors and clinical expertise (filtered by the specialty picked at reception) | Yes, long |
| 6 Room | 5 -> B5 (code turn), B5 -> 6 (Veo) | Turn, step inside | Inpatient care and facilities (and technology, see E) | Yes |
| 7 Care | 6 -> 7 | Window-light dissolve + slow push | Patient experience, trust, support (approved testimonials only) | Yes |
| 8 Destination | 7 -> 8 | Match-dissolve on the doctor + dim | Book appointment form, location, hours, contact, emergency | Final settle |

Rule for every stop: the camera slows and holds on a keyframe BEFORE text arrives, so nobody chases moving text.

## B. Missing keyframe list

| ID | What | Built from | Why |
|---|---|---|---|
| B1 | Under the canopy, facing the glass doors, lobby glowing inside | 1 + 2 | Closes the outside-to-inside gap |
| B4 | Corridor mouth, turned right, corridor ahead | 4 + 5 | Reconciles 4's narrow corridor with 5's wide one |
| B5 | Corridor, facing an open room door, room visible through it | 5 + 6 | A threshold to walk through into 6 |
| 8c | Frame 8 clean plate: blank "Patient Flow" screen, plain walls, no slogans | 8 | Removes invented facts |
| 4c | Frame 4 clean plate: emblem matched to the real logo (or removed) | 4 (+ 1 for the mark) | Brand consistency |
| B2 | Midpoint lobby to desk | 2 + 3 | CONTINGENCY ONLY, used if T2 warps |

## C. Higgsfield generation plan

Model: **GPT Image 2.5** (image editing with reference images), 16:9, 2k, high quality. **2.75 credits each** (checked with a free price preflight).
Every prompt carries: "no new text, no new logos, no lettering"; same marble, walnut, teal, and warm downlight grade; eye level about 1.5 m; the architecture preserved, not redesigned.

| Order | ID | Gap it solves | Surrounding frames | Camera | Cost |
|---|---|---|---|---|---|
| 1 | 8c | Invented stats and slogans | 7 -> [8] | Same as 8 | 2.75 |
| 2 | 4c | Emblem mismatch | 3 -> [4] -> 5 | Same as 4 | 2.75 |
| 3 | B1 | Outside to inside | 1 -> [B1] -> 2 | Eye level, about 6 m from the doors, square-on | 2.75 |
| 4 | B4 | Hall to corridor | 4 -> [B4] -> 5 | Eye level, at the corridor mouth, looking down it | 2.75 |
| 5 | B5 | Corridor to room | 5 -> [B5] -> 6 | Eye level, about 2 m from the open door, square-on | 2.75 |

I inspect each image myself (for warped architecture, stray text or marks, anatomy, and a matching grade) before showing it to you. Each one gets your approval before any video is made from it.

## D. Veo transition plan

**Route (approved): Veo 3.1 through the Gemini API**, using `image` (first frame) + `lastFrame` (last frame) so every walk lands exactly on the next approved keyframe. Default settings: `veo-3.1-generate-preview`, 1080p, 8 s, 16:9, `personGeneration: "allow_adult"`. Audio comes with the clip and is removed in the web encode. Prices are in section I-2. Higgsfield Veo is not used.

| Seg | Start -> End | Motion prompt (core) | Cost (Standard, 1080p, 8 s) |
|---|---|---|---|
| S1 | 1 -> B1 | First-person slow walk up the driveway, human-height camera, gentle right veer under the canopy, trees swaying, pedestrians walking naturally | $3.20 |
| S2 | B1 -> 2 | Glass doors slide open, a short exposure bloom from sunlight to warm indoor light, a slow step inside, a gentle turn right toward the reception | $3.20 |
| S3 | 2 -> 3 | Slow walk across the marble lobby behind the man in the light-blue shirt, settling square-on to the desk | $3.20 |
| S4 | 4 -> B4 | Slow walk past the seat rows, gentle 45-degree right turn into the corridor mouth | $3.20 |
| S5 | B4 -> 5 | Straight slow walk down the corridor, nurse and doctor walking away ahead | $3.20 |
| S6 | B5 -> 6 | One slow step through the open doorway, the doorframe passing the frame edges, daylight from the window | $3.20 |

Every prompt includes: one continuous shot, no cuts, controlled human-height walk, subtle natural sway (no artificial shake), people move naturally and never appear or vanish, architecture stays rigid, no text or lettering anywhere. Each segment passes the video gate (you watch it) before the next one runs. Chained segments are serial, and each takes a few minutes to render.

## E. Website / content mapping

| Stop | Content (HTML, never baked into media) | Needs from your approved source |
|---|---|---|
| 1 Gate | Hospital name, positioning line, persistent nav, emergency line in the header | Official name of this hospital/branch, positioning line, emergency number |
| 2 Lobby | "Find a doctor" search + "Book appointment" | How booking works today (existing booking system link? phone? form?) |
| 3 Reception | Departments / specialties, plus the **specialty picker** (the one interactive moment: pick what you need, and the rest of the walk tailors itself) | The real list of departments |
| 4 Waiting | Your visit, step by step (before you come, on arrival, at your consult) | OPD hours, what to bring, insurance/TPA info if approved |
| 5 Corridor | Doctors and expertise (cards: name, specialty, qualifications, OPD days) | Real doctor list with approved photos and credentials |
| 6 Room | Inpatient care, rooms, facilities | Approved facility and room information |
| 7 Care | Patient experience, trust, support services | Only real, approved testimonials; accreditations only if you supply them |
| 8 Desk | Book appointment form + address, map link, hours, phones, emergency | Address, phones, hours, where form submissions should go |

**Technology / treatment gap:** no supplied frame shows it. Options: (a) show that content at stop 6 over the room frame (it has monitors and equipment), with no new media, which I recommend; (b) generate one extra keyframe of a diagnostics or imaging suite in the same grade (2.75 credits + a code transition, no Veo); (c) leave it for an inner page.

**Placeholders:** until the approved content arrives, every factual slot is built as a visibly marked placeholder (`[Department from approved source]`). Nothing is invented.

**Inner pages (a deliberate deviation from this workflow's usual single page, stated openly):** because this is a hospital, `/doctors`, `/departments`, `/book`, `/locations`, `/contact` and `/emergency` are real standalone pages that work by direct URL, without the journey. Same plain HTML/CSS/JS, no build step.

## F. Desktop scroll architecture

- **Persistent header** (never hidden): logo (real, HTML/SVG), Find a doctor, Departments, Book appointment, Locations, Contact, and an Emergency number that is always visible. Plus a **"Skip the walk"** link and an 8-stop **chapter rail** (clickable, keyboard reachable) that jumps straight to any stop.
- **One pinned stage** that runs the whole journey, about 1800 to 2200 vh of scroll (a starting point, validated by the flick test). It has three layers: the video layer, the still keyframe layer (for code transitions and holds), and the content layer.
- **Video split into 3 chapter files**, each a scrub encode (keyframe every 8 frames, about 1600 px wide), fetched as Blobs one chapter ahead with an honest loading ring: A = S1+S2+S3 (gate to reception), B = S4+S5 (waiting to corridor), C = S6 (doorway). Target: under 25 MB total, and chapter A (the first) arrives first.
- **Scroll maps to a timeline** of segments: `video(A, t0..t1)`, `hold(frame 3)`, `code(glide 3->4)`, `video(B, ...)`, and so on. Each segment is a pure function of scroll progress, so **everything reverses on scroll-up**, the code transitions included.
- **Reading plateaus:** at every stop the video holds on the keyframe, then content assembles, sits fully visible for about 100 vh, and leaves before motion resumes.
- **Engineering standard:** the smoothed (lerped) time loop that rests when idle, gated seeks, DOM writes only on change, a legibility scrim per text band with a worst-frame contrast audit, and the page complete and usable even if no video ever loads.
- **Palette** from the frames themselves: ivory marble, walnut, the hospital teal, deep teal blazer, and soft daylight. It is calm and architectural, with no dark sci-fi, neon, or heavy glass effects.

## G. Mobile architecture

- No scroll-scrubbed video, and no multi-screen pinned stage.
- The same 1 -> 8 story as a normal vertical page: each stop is a chapter header image (the keyframe, cropped for portrait, WebP about 120 to 180 KB) with a gentle crossfade as it enters, followed by that stop's content in normal flow.
- Optional: 3 tiny muted loops (doors, corridor, doorway, 480p, under 1 MB each) that play once when scrolled into view. They are off if you'd rather keep payloads minimal.
- A sticky bottom bar: Call, Book, Directions. The emergency number stays in the header.
- Estimated page weight: about 1.5 to 2 MB total on mobile, images included.

## H. Reduced-motion architecture

- Decided live: the same five static-hero conditions in CSS and JS, including flipping reduced motion mid-session.
- **No video requested at all.** The 8 keyframes (plus the bridges, if they add clarity) become static chapter headers, with every piece of content visible in its final state.
- The chapter rail, skip link, nav, specialty picker, and booking form all work without animation.

## I. Estimated generation costs (UPDATED: two separate budgets, nothing submitted)

Decision (approved): Higgsfield makes images only. Every video runs through the Gemini API with Veo 3.1, first + last frame. No Higgsfield credits are spent on video.

### I-1. Higgsfield: images only (credits, from free preflights)

Model: GPT Image 2.5, 16:9, 2k, high quality = 2.75 credits each.

| Item | Qty | Each | Subtotal |
|---|---|---|---|
| 8c clean plate, 4c logo match, B1, B4, B5 | 5 | 2.75 | 13.75 |
| Contingency: 1 re-roll each + B2 if T2 warps | 6 | 2.75 | 16.5 |
| **Higgsfield worst case** | | | **30.25 credits** (of 686.8) |

### I-2. Gemini API: Veo 3.1 video (US dollars, Google's live pricing page, checked 2026-09-25)

Facts from Google's docs: model IDs `veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite-generate-preview`. First + last frame is supported (`image` + `lastFrame`). Durations 4, 6 or 8 s. **1080p only runs at 8 s.** 16:9. People in image-to-video need `personGeneration: "allow_adult"`. The price includes audio, which we strip in the web encode. You are billed only for videos that actually generate.

| Model | 720p | 1080p | One clip at 1080p / 8 s | 6 clips | 6 clips + 1 re-roll each |
|---|---|---|---|---|---|
| **Veo 3.1 Standard (recommended)** | $0.40/s | $0.40/s | **$3.20** | $19.20 | $38.40 |
| Veo 3.1 Fast | $0.10/s | $0.12/s | $0.96 | $5.76 | $11.52 |
| Veo 3.1 Lite | $0.05/s | $0.08/s | $0.64 | $3.84 | $7.68 |

Why Standard: 8 s at 1080p gives the sharpest frames behind text and the most footage per walk, and the representative test clip tells us whether Fast would be enough for the rest. The first step is ONE representative clip ($3.20 at Standard), shown to you with its first frame, last frame, model, prompt, resolution, duration and cost before it is submitted.

Google marks these models and prices as preview, so they can change. I re-check the live page and confirm the model ID with the API's model list right before each submission.

---

## Decisions (settled 2026-09-25)

1. Journey map: APPROVED as planned (classifications, bridges, code transitions unchanged).
2. Logo: the flame/cross mark in frames 1 to 3 IS the real logo. 4c makes frame 4 match it.
3. Approved content source: STILL NEEDED. All facts stay placeholders until it arrives.
4. Video route: Veo 3.1 through the Gemini API, first + last frame. Key read only from GEMINI_API_KEY, never printed, committed, put in source, or sent to the browser. Higgsfield is used for images only.
5. Technology gap: option (a), technology content shown at stop 6 over the room frame.
6. Process: image edits one at a time; then ONE representative Veo walk, fully specified and approved before submission; the site build waits until that transition is validated.

## Progress log

- 2026-09-25: Keyframes approved and saved in `review/keyframes/`: 8c (clean plate), 4c (real logo), B1 (canopy doors), B4 (corridor mouth), B5 (room doorway). All first-try, 13.75 Higgsfield credits total. B2 contingency not needed yet.
- 2026-09-25: Representative Veo walk APPROVED: S5 (B4 -> 5), `veo-3.1-generate-preview`, 1080p, 8 s, $3.20, prompt `review/veo-prompts/S5.txt`. Waiting for GEMINI_API_KEY to be set locally. Tool: `tools/veo.mjs` (key read from env only).
- 2026-09-25: S5 generated ($3.20). 0 to 6.0 s is clean (rigid architecture, natural walk); from about 6.1 s Veo dissolves into photo 5 because 5 contains people and signs that B4 does not. DECISION: use S5 trimmed to 0 to 6.0 s; the corridor reading stop holds on `review/keyframes/5v-corridor-stop.png` (the 5.95 s frame). Validated as the motion reference (prompt `review/veo-prompts/S5.txt`).
- RULE for remaining walks (approved): before each Veo clip, check the start and end frames hold the same people, vehicles and signage; if not, fix the end frame with a cheap Higgsfield edit first. One clip at a time, each shown before the next.
- 2026-09-25: 1c (photo 1 without cars, couple added) approved, 2.75 credits. S1 (1c -> B1) generated $3.20, APPROVED full 8 s, no dissolve. S2 (B1 -> 2) approved for submission.
- 2026-09-25: S2 (B1 -> 2): two attempts blocked by Google's filter (not billed); third attempt with a plainer prompt (`review/veo-prompts/S2b.txt`) generated, $3.20. Clean 0 to 6.75 s, dissolves after about 7.0 s because Veo's lobby differs from photo 2. DECISION: trim S2 at 6.75 s; at the lobby reading stop, a designed code dissolve from `review/keyframes/2v-lobby-veo.png` to photo 2; S3 continues from photo 2. Gemini total: $9.60.
- 2026-09-25: 3c (left visitor in blue sari, TV blank) approved, 2.75 credits. S3 (2 -> 3c) approved for submission.
- 2026-09-25: S3 (2 -> 3c) generated $3.20, APPROVED full 8 s (pans past a pillar to the long counter, no dissolve). Gemini total $12.80. S4 (4c -> B4) approved for submission.
- 2026-09-25: S4 (4c -> B4) generated $3.20. Clean 0 to 6.4 s; after that the pillar TV swaps and a seat fades in at the left edge. DECISION: trim S4 at 6.4 s and join into S5 with a 0.25 s moving crossfade. Gemini total $16.00. S6 (B5 -> 6) approved and submitted.
- NEW REQUIREMENT (user): the journey must finish on the Apollo Hospitals logo as the final closing frame.
- 2026-09-25: Closing frame E (`review/keyframes/E-logo-wall.png`, logo wall straight on, 2.75 credits) generated for the logo ending: after photo 8, a code dissolve to E with the booking CTA below the logo.
- 2026-09-25: S6 (B5 -> 6) generated $3.20. Clean 0 to 5.8 s (walks through the door and into the room); from 6.0 s it dissolves back toward photo 6. Proposed: trim at 5.8 s, room stop holds on `review/keyframes/6v-room-stop.png`. Gemini total $19.20. Higgsfield total 22 credits.
- 2026-09-25: S6 trimmed at 5.8 s APPROVED. Booking: every Book button goes to book.html, which will link to the hospital's existing booking system (placeholder until provided).
- 2026-09-25: SITE BUILT in `site/` (index + 6 inner pages). Journey video `site/assets/video/journey.mp4` (40.5 s, 1440x810, crf 28, -g 8, 22.8 MB). Self-test passed: every stop and transition checked in a real browser, video-missing fallback, phone static mode (no video download), reduced motion flipped live both ways, zero console errors, no sideways overflow, copy gate clean. Fixes made during test: rail fill, arrival panel placement, rail labels, busy-scene crossovers now pass through soft light, wide-screen static layout, card arrow overlap, current-page Book button colour.

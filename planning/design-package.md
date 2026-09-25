# Walk Through Apollo: Design Package

Every viewer-facing line here ships verbatim. Anything in [square brackets] is a placeholder for approved content and is styled on the page as a visible placeholder. No hospital facts are invented.

## 1. Brand premise
**Wayfinding.** A hospital visit is easier when you already know the way. The site walks you from the gate to the right doctor, and every stop answers the question you would ask at that spot. The signature element is a floor-guide line (the kind hospitals paint on the floor) running down the left edge: it fills as you walk and a small flame-gold dot marks "you are here". It is also the chapter navigation.

## 2. Palette (sampled from the frames)
```css
:root{
  --canvas:#F3EEE6;      /* warm marble ivory */
  --panel:#FBF8F3;       /* raised cards */
  --ink:#1B2A2F;         /* primary text */
  --ink-2:#4B585C;       /* secondary text */
  --teal:#13808B;        /* the hospital teal wall; CTA */
  --teal-deep:#0C5C66;   /* CTA hover, headings accents */
  --flame:#E9A23B;       /* logo flame; "you are here" only */
  --walnut:#6E4A2E;      /* fine rules, small details */
  --line:rgba(27,42,47,.14);
}
```

## 3. Type
- Display: Bricolage Grotesque 600 (warm, architectural, not a default).
- Body: Hanken Grotesk 400/500/600.
- Labels: IBM Plex Mono 500, small caps-style uppercase.

## 4. Journey map (scroll lengths are starting points)
| # | Segment | Frames | Length | Content |
|---|---|---|---|---|
| 1 | Hold | arrival (video t=0) | 110vh | Stop: Arrival |
| 2 | Video S1+S2 | 0 to 14.458 s | 480vh | none (walking) |
| 3 | Fade | lobby -> lobby-desk | 80vh | none |
| 4 | Hold | lobby-desk | 120vh | Stop: Lobby |
| 5 | Video S3 | 14.5 to 22.458 s | 260vh | none |
| 6 | Hold | reception (video end) | 130vh | Stop: Reception (specialty picker) |
| 7 | Glide | reception -> waiting | 110vh | none |
| 8 | Hold | waiting | 120vh | Stop: Your visit |
| 9 | Video S4+S5 | 22.5 to 34.625 s | 380vh | none |
| 10 | Hold | corridor (video end) | 130vh | Stop: Doctors |
| 11 | Turn | corridor -> doorway | 100vh | none |
| 12 | Video S6 | 34.667 to 40.458 s | 180vh | none |
| 13 | Hold | room (video end) | 130vh | Stop: Your room |
| 14 | Window light | room -> bedside | 120vh | none |
| 15 | Hold + slow push | bedside | 130vh | Stop: Care |
| 16 | Match dissolve on the doctor | bedside -> team | 110vh | none |
| 17 | Hold | team | 130vh | Stop: Visit us |
| 18 | Fade | team -> logo wall | 110vh | none |
| 19 | Hold (final) | logo wall | 110vh | Stop: Book |

Text only appears during holds. The camera never moves while you read.

## 5. Copy (verbatim)

**Draft notice:** "Draft preview. Anything in [brackets] is waiting for approved hospital content."

**Arrival:** kicker "Apollo Hospitals · [Branch name]". H1 "Your visit starts here." Body "Take a calm walk through the hospital before you arrive. Scroll to walk in, or skip straight to what you need." Buttons "Book an appointment", "Skip the walk".

**Lobby:** kicker "The lobby". H2 "Find the right doctor." Body "Search by a doctor's name or by what you need help with." Field label "Doctor or specialty", placeholder "For example, a doctor's name". Button "Search". Link "Or book an appointment".

**Reception (interactive moment):** kicker "Reception". H2 "What brings you in today?" Body "Pick an area and we will point you to the right doctors further along." Chips: "[Specialty 1]" to "[Specialty 6]". After a pick: "Noted. Doctors for {choice} are waiting in the corridor ahead." Link "See all departments".

**Your visit:** kicker "Your visit". H2 "Three simple steps." 1 "Book" / "Choose a time that suits you." 2 "Check in" / "Come to reception with [documents to bring]." 3 "See your doctor" / "Take a seat. Your doctor will call you in." Line "Outpatient hours: [hours]".

**Doctors:** kicker "Our doctors". H2 "Meet the people who will care for you." Cards x3: "[Doctor name]", "[Specialty]", "[Qualifications]", "[Consultation days]". Filter note "Showing doctors for {choice}". Link "See all doctors".

**Your room:** kicker "Staying with us". H2 "A calm room to rest and recover." Body "[Room types and facilities]". Sub-heading "Technology and treatments" / "[Approved technology and treatment information]".

**Care:** kicker "Care". H2 "Looked after, every step of the way." Body "[Patient support services]". Quote "[Approved patient story]" / "[Patient name, with consent]".

**Visit us:** kicker "Visit us". H2 "We are here when you need us." Rows: Address "[Hospital address]", Appointments "[Appointments phone]", Visiting hours "[Visiting hours]", Emergency "[Emergency number]". Button "Get directions".

**Book (final, under the logo):** H2 "Ready when you are." Buttons "Book an appointment", "Call [Appointments phone]".

**Essentials (skip target):** H2 "Everything in one place." Cards: Find a doctor / Departments / Book an appointment / Locations / Contact / Emergency.

**Footer:** "Apollo Hospitals · [Branch name]". "Some images on this site are AI-assisted visualisations based on photographs of the hospital." "Draft preview. Placeholder content in [brackets]."

**Booking:** every "Book an appointment" goes to `book.html`, which links to the hospital's existing booking system: "[Link to existing booking system]" and "[Appointments phone]".

## 6. Vector layer
- The floor-guide rail (SVG line + dots), self-filling with scroll.
- A thin teal wayfinding stroke under each stop kicker that draws itself on entry.
- Background environment: one fixed, very slow warm light drift on the canvas (below the journey and on inner pages).
All honor reduced motion (final states shown, drives stopped).

## 7. Engineering
Streamed Blob fetch with a loading ring and 20 s watchdog; dt-normalized lerp that rests; gated seeks with error escape; delta-gated DOM writes; still-image layer drives every code transition and is the complete fallback when the video is missing; five static-journey gates identical in CSS and JS, live via change listeners; reduced motion live both directions; overflow-x clip; semantic landmarks; skip link; focus-visible; 44px touch targets.

## 8. Copy gate
Zero em dashes, zero stock words (leverage, seamless, empower, unlock, robust, actionable, data-driven, solutions), plus the AI-tell sweep, before anyone sees it.

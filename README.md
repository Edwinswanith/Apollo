# Walk Through Apollo

A scroll-driven hospital website: visitors walk from the gate to the doctor, and the page ends on the Apollo Hospitals logo with a booking call to action.

Plain HTML, CSS and JavaScript. No framework, no build step.

**Demo content:** doctor names, phone numbers and addresses are samples. Emergency numbers are India's public lines (112, 108).

## Structure

```
site/                 the website (this is what gets deployed)
  index.html          the walk-through homepage
  doctors.html, departments.html, book.html,
  locations.html, contact.html, emergency.html
  assets/
    video/walk-a..d.mp4    the walk as four chapters, 1920x1080 (52 MB, laptops, desktops, tablets)
    video/walk-a..d-l.mp4  same chapters at 1280x720 (24 MB, landscape phones)
    video/walk-a..d-p.mp4  same chapters as a 9:16 centre crop (18 MB, portrait phones)
                           all encoded once from the full-quality Veo masters, identical frame timing
    stills/           chapter images (transitions, phone and reduced-motion versions)
    site.css, journey.css, site.js, journey.js
tools/
  build_pages.py      regenerates the inner pages (python tools/build_pages.py)
  veo.mjs             Veo 3.1 generator (reads GEMINI_API_KEY from the environment or .env; never committed)
planning/             journey map and design package
vercel.json           serves site/ as a static site
```

## Preview locally

```
cd site
npx http-server -p 8080
```

Open http://127.0.0.1:8080/. Opening index.html directly shows the still-image version, because browsers block the video fetch on file:// URLs.

## Deploy on Vercel

1. Import this repository in Vercel.
2. Framework preset: **Other**. No build command. `vercel.json` already sets the output directory to `site`.
3. Deploy.
4. After the first deploy, replace `https://example.com/` in the `og:url` and `og:image` tags in `site/index.html` (marked `DEPLOY STEP`) with the live URL, then push again.

## Behaviour

- The animated walk runs on every device: phones, tablets, laptops and desktops.
- Each screen shape loads the matching video set (portrait crop, 720p or 1080p); rotating mid-walk swaps sets and keeps your place.
- Phones and upright tablets show the text in a bottom sheet and the stop rail as a progress line across the top.
- Chapters stream into memory progressively (MediaSource / ManagedMediaSource, `*.frag.mp4`, frames identical to the `.mp4` files): the walk is usable as soon as the first fragments arrive. The chapter the visitor needs downloads first; the next one starts only after it completes. Browsers without MediaSource, or where it fails, use the original whole-file `.mp4` loader automatically.
- If the visitor scrolls past what has arrived, the walk holds the last arrived frame and catches up.
- Visitors who turned on reduce motion or data saver get a still-photo version with the same content.
- If any chapter fails to load, that walk crossfades still images and the rest of the journey still plays.

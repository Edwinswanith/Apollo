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
    video/walk-a..d.mp4 the walk as four chapter videos (1920x1080, 52 MB total),
                      encoded once from the full-quality Veo masters and loaded in order
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

- Laptops and desktops: the scroll-driven walk; chapter A streams behind a loading ring, B to D follow in the background.
- Phones, portrait tablets and reduced motion: a static chapter version; the video is never downloaded.
- If any chapter fails to load, that walk crossfades still images and the rest of the journey still plays.

# 回 — juman-portfolio

Personal site for **Juman Al-Huthaili** — Information Security student at the University of Hail.

Live: https://juman-portfolio.onrender.com

---

## The idea

回 (*huí*) means "to return". It is a square drawn inside a square: you go out, get lost,
and come back to the same place knowing more than when you left.

The site is built from nested frames. A fixed outer frame holds the name, the 回 mark, a
scroll-progress hairline and the chapter rail. The content lives inside it. When a visitor
reaches chapter 02 — the work that actually shipped — the whole page inverts from ink to
paper, frame included. You have stepped into the inner square. Then it returns to ink.

Type is **Fraunces** for display, **Archivo** for reading, and **JetBrains Mono** reserved
strictly for real machine data: prices, region names, currency codes, dates. The accent is
iris purple, and there is an iris drawn in the footer.

---

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies.

That is a deliberate choice, not a shortcut. The site has no server-side data and no dynamic
routes, so a framework would add a build pipeline and a `node_modules` folder while making
the page slower to load and harder to host. This version deploys by pushing a folder.

Total page weight is roughly 600 KB including nine screenshots, all of them lazy-loaded
below the fold.

---

## Files

```
index.html            the whole site, one page, nine chapters
404.html              custom not-found page
robots.txt            search engine rules
sitemap.xml           one URL, for search engines
render.yaml           Render blueprint: static site, caching and security headers
set-site-url.sh       swaps the site URL everywhere at once
assets/
  css/style.css       all styling, with the colour tokens at the top
  js/config.js        ← EVERY LINK LIVES HERE. This is the file you edit.
  js/main.js          lattice canvas, chapter tracking, mobile menu
  img/                screenshots (gp-* GamePrice, hui-* Huí), favicon, share image
```

### Editing links

Open `assets/js/config.js`. Change a value, save, done — it updates everywhere on the page.
If you empty a value (`""`), that link renders as "not published yet" instead of pointing at
a broken URL.

### Editing text

All copy lives in `index.html` in plain readable HTML. Search for the sentence you want to
change and change it.

### Editing colours

The top of `assets/css/style.css` has the full palette as named values. Changing `--iris`
changes the accent everywhere.

---

## Running it locally

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

---

## Deploying

The site is hosted on **Render** as a Static Site. There is no build step, so the
repository root is the publish directory.

1. Push to `main` on `JumanALH/juman-portfolio`.
2. On render.com: **New → Static Site**, connect the repository, then
   - Branch: `main`
   - Build command: *(empty)*
   - Publish directory: `.`
   - Auto-Deploy: on
   `render.yaml` describes exactly this, so **New → Blueprint** works too.
3. If the final URL is not `juman-portfolio.onrender.com`, run:
   ```bash
   bash set-site-url.sh https://your-real-url
   ```
   then commit and push. This keeps the canonical tag, share image and sitemap accurate.

### One thing to never do again

The first upload put every file in the repository root through the GitHub web
uploader, which silently dropped the `assets/` folders. The HTML still asked for
`assets/css/style.css`, so the deployed site loaded with no CSS, no JS and no
images. **Keep the folder structure.** Push with git, not by dragging files into
the browser.

---

## Checked before shipping

Reviewed at 1440, 1024, 768, 430 and 390px. No horizontal overflow at any width, no console
errors, no failed requests. Every image has alt text and explicit dimensions. Heading order
runs h1 → h2 → h3 with no skips. Keyboard tab order is logical and focus is always visible.
`prefers-reduced-motion` is honoured — all animation stops and content arrives already in
place. Every outbound link was requested and confirmed to resolve.

Nothing on this site is invented. The GamePrice screenshots were captured from the running
application and the numbers were counted from it rather than estimated. The Huí screenshots
are real too: the three browser shots come from the Huí build running locally, and the three
Unreal shots are unretouched captures from the packaged Unreal build at 2560×1440. The Huí
project itself is not in this repository — only the optimised images the page needs.

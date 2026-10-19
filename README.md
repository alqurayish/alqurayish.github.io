# alqurayish.github.io

Personal portfolio and resume of **Md Alqurayish Sharkar**, AI Product Engineer and Founder of D-SAi.

Live site: https://alqurayish.github.io/

## Structure

| Path | Purpose |
|---|---|
| `index.html` | All page content (single page with section anchors) |
| `assets/css/style.css` | Styles: tokens, layout, animation, print |
| `assets/js/main.js` | Navigation, scroll reveals, approach tabs, print helper |
| `assets/img/` | Portrait, product screenshots, social image, touch icon |
| `CV_of_Md_Alqurayish_Sharkar.pdf` | Downloadable resume |
| `favicon.svg`, `robots.txt`, `sitemap.xml`, `404.html` | Site metadata |
| `.nojekyll` | Serve files as-is (no Jekyll build) |

Plain HTML, CSS, and JavaScript. No build step and no dependencies.

## Edit and preview

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Publish

GitHub Pages serves the `main` branch from the repository root
(Settings → Pages → Deploy from a branch → `main` / `(root)`).

```bash
git add .
git commit -m "Describe the change"
git push
```

The live site updates within a minute or two.

## Updating the resume

Replace `CV_of_Md_Alqurayish_Sharkar.pdf` with the new file (same name), then update
the matching text in `index.html` and the `lastmod` date in `sitemap.xml`.

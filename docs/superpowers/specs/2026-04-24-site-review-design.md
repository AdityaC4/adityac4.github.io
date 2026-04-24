# Site Review Design

**Date:** 2026-04-24
**Branch:** phd-site
**Scope:** Bug fixes, quick wins (favicon, OG), accessibility, structured data, performance

---

## 1. Bug Fixes

### 1a. Delete `cv.html`
- File is a stub placeholder, not linked from `index.html`
- PDF CV at `assets/CV-AdityaPrashantChaudhari.pdf` is canonical and linked from homepage
- Action: delete `cv.html`

### 1b. Update footer date
- Footer currently reads "Last updated: March 2026"
- Action: update to "April 2026"

---

## 2. Quick Wins

### 2a. Favicon
- Add SVG favicon using initials "AC" inline as data URI in `index.html` head
- No new file required, no external dependency
- Tag: `<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,...">`

### 2b. Open Graph meta tags
Add to `index.html` `<head>`:

```html
<meta property="og:title" content="Aditya Chaudhari" />
<meta property="og:description" content="PhD Student in CS at UC Riverside. Research in formal methods, ML/NN, and compilers." />
<meta property="og:type" content="website" />
<meta property="og:image" content="assets/AdityaPrashantChaudhari.jpg" />
<meta name="twitter:card" content="summary" />
```

---

## 3. Accessibility

### 3a. Visited link contrast fix
- `a:visited` color `#ff0000` (red) = 3.9:1 contrast on white — fails WCAG AA (requires 4.5:1 for normal text)
- Fix: change to `#b30000` (dark red) = 5.9:1, passes AA
- `a:hover` and `a:focus` also use `#ff0000` — same fix applies

All other color combinations pass WCAG AA. Semantic HTML and ARIA usage is correct.

---

## 4. Structured Data (JSON-LD)

Add `Person` schema to `index.html` before `</head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Aditya Prashant Chaudhari",
  "url": "https://adityac4.github.io",
  "email": "achau177@ucr.edu",
  "affiliation": {
    "@type": "Organization",
    "name": "University of California, Riverside"
  },
  "sameAs": [
    "https://github.com/AdityaC4",
    "https://www.linkedin.com/in/AdityaC4/"
  ]
}
```

Benefits: Google Knowledge Panel eligibility, Google Scholar auto-detection.

---

## 5. Performance

### 5a. Image dimensions on `intro-photo`
- `AdityaPrashantChaudhari.jpg` is 864×1184px; rendered at 120px wide
- Add `width="120"` and `height="88"` to `<img>` tag (preserves 864:1184 aspect ratio at 120px)
- Prevents cumulative layout shift (CLS)

Site has no JS, no web fonts — no other performance work needed.

---

## Files Changed

| File | Action |
|---|---|
| `cv.html` | Delete |
| `index.html` | Update footer date, add favicon link, add OG tags, add JSON-LD, add img dimensions |
| `styles.css` | Fix visited/hover/focus link color |

---

## Out of Scope

- Content additions (research section, publications) — no papers yet, reasonable to leave commented
- Office info — TBD by user
- `dev-server.py` — dev tooling, not part of deployed site

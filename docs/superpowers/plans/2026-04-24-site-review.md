# Site Review Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix bugs, add favicon/OG/JSON-LD, fix accessibility contrast, and add image dimensions to eliminate layout shift.

**Architecture:** Pure static site — two files change (`index.html`, `styles.css`), one file deleted (`cv.html`). No build step, no dependencies. Dev server at `python3 dev-server.py` (port 8000, live reload).

**Tech Stack:** HTML5, CSS3, no JavaScript, no frameworks

---

### Task 1: Delete `cv.html`

**Files:**
- Delete: `cv.html`

- [ ] **Step 1: Delete the file**

```bash
git rm cv.html
```

Expected output: `rm 'cv.html'`

- [ ] **Step 2: Verify it's gone**

```bash
ls cv.html 2>&1 || echo "deleted"
```

Expected: `deleted`

- [ ] **Step 3: Commit**

```bash
git commit -m "remove: delete stale cv.html placeholder"
```

---

### Task 2: Update footer date

**Files:**
- Modify: `index.html` (line 168)

- [ ] **Step 1: Make the change**

In `index.html`, find:
```html
<p><strong>Last updated:</strong> March 2026</p>
```

Replace with:
```html
<p><strong>Last updated:</strong> April 2026</p>
```

- [ ] **Step 2: Verify**

```bash
grep "Last updated" index.html
```

Expected: `<p><strong>Last updated:</strong> April 2026</p>`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: update footer date to April 2026"
```

---

### Task 3: Fix link contrast colors

**Files:**
- Modify: `styles.css` (lines 22–27)

Current `a:visited`, `a:hover`, `a:focus` all use `#ff0000` (red) — 3.9:1 contrast on white, fails WCAG AA (requires 4.5:1 for normal text).

- [ ] **Step 1: Fix the colors**

In `styles.css`, find:
```css
a:visited {
  color: #ff0000;
}

a:hover,
a:focus {
  color: #ff0000;
}
```

Replace with:
```css
a:visited {
  color: #b30000;
}

a:hover,
a:focus {
  color: #b30000;
}
```

- [ ] **Step 2: Verify**

```bash
grep -n "#ff0000" styles.css
```

Expected: no output (all instances replaced)

- [ ] **Step 3: Visual check**

Start dev server: `python3 dev-server.py`
Open `http://127.0.0.1:8000` in browser.
- Hover over any link → should be dark red (not bright red)
- The [Email], [CV], [GitHub], [LinkedIn] links and "University of California, Riverside" link should all show dark red on hover

- [ ] **Step 4: Commit**

```bash
git add styles.css
git commit -m "fix: darken visited/hover/focus link color to pass WCAG AA contrast"
```

---

### Task 4: Add image dimensions to prevent layout shift

**Files:**
- Modify: `index.html` (the `<img>` tag for intro-photo)

Image is 864×1184px. Rendered at 120px wide. Height = round(120 × 1184/864) = 88px.

- [ ] **Step 1: Add dimensions**

In `index.html`, find:
```html
              <img
                src="assets/AdityaPrashantChaudhari.jpg"
                alt="Portrait of Aditya Chaudhari"
                class="intro-photo"
              />
```

Replace with:
```html
              <img
                src="assets/AdityaPrashantChaudhari.jpg"
                alt="Portrait of Aditya Chaudhari"
                class="intro-photo"
                width="120"
                height="88"
              />
```

- [ ] **Step 2: Verify**

```bash
grep -A5 'intro-photo' index.html | grep -E 'width|height'
```

Expected:
```
                width="120"
                height="88"
```

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: add explicit width/height to intro photo to prevent CLS"
```

---

### Task 5: Add SVG favicon

**Files:**
- Modify: `index.html` (inside `<head>`)

- [ ] **Step 1: Add favicon link tag**

In `index.html`, find:
```html
    <link rel="stylesheet" href="styles.css" />
```

Add immediately before it:
```html
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23000080'/%3E%3Ctext x='50%25' y='54%25' dominant-baseline='middle' text-anchor='middle' font-family='serif' font-size='32' fill='white'%3EAC%3C/text%3E%3C/svg%3E" />
```

This renders a navy rectangle with white "AC" initials in a serif font — matches site palette.

- [ ] **Step 2: Verify the tag is present**

```bash
grep 'rel="icon"' index.html
```

Expected: the full link tag with data URI

- [ ] **Step 3: Visual check**

With dev server running at `http://127.0.0.1:8000`, check the browser tab — should show a small navy "AC" icon.

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: add SVG favicon with AC initials"
```

---

### Task 6: Add Open Graph meta tags

**Files:**
- Modify: `index.html` (inside `<head>`, after `<meta name="description">`)

- [ ] **Step 1: Add OG tags**

In `index.html`, find:
```html
    <meta
      name="description"
      content="Official website of Aditya Prashant Chaudhari"
    />
```

Add immediately after it:
```html
    <meta property="og:title" content="Aditya Chaudhari" />
    <meta property="og:description" content="PhD Student in CS at UC Riverside. Research in formal methods, ML/NN, and compilers." />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="assets/AdityaPrashantChaudhari.jpg" />
    <meta name="twitter:card" content="summary" />
```

- [ ] **Step 2: Verify**

```bash
grep -c 'og:' index.html
```

Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add Open Graph and Twitter card meta tags"
```

---

### Task 7: Add JSON-LD structured data

**Files:**
- Modify: `index.html` (before `</head>`)

- [ ] **Step 1: Add JSON-LD script**

In `index.html`, find:
```html
  </head>
```

Add immediately before it:
```html
    <script type="application/ld+json">
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
    </script>
```

- [ ] **Step 2: Verify valid JSON**

```bash
python3 -c "
import re, json
html = open('index.html').read()
match = re.search(r'<script type=\"application/ld\+json\">(.*?)</script>', html, re.DOTALL)
json.loads(match.group(1))
print('JSON valid')
"
```

Expected: `JSON valid`

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "feat: add JSON-LD Person structured data for Google Knowledge Panel"
```

---

## Self-Review

**Spec coverage:**
- [x] Delete cv.html → Task 1
- [x] Footer date → Task 2
- [x] Link contrast fix → Task 3
- [x] Image dimensions → Task 4
- [x] Favicon → Task 5
- [x] OG tags → Task 6
- [x] JSON-LD → Task 7

**Placeholder scan:** No TBDs, all steps have exact content.

**Consistency:** No cross-task type/name references to check (pure HTML/CSS edits, no shared functions or variables).

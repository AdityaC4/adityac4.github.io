# July Launch Checklist

Goal: replace the current Zola site (live from `main`) with the new minimal static site
(built on the `phd-site` branch), then make it public.

**Until you do this, nothing changes** — the current site keeps serving. Deploy only happens
when something lands on `main`.

---

## 0. Before you merge (content sanity check)

- [ ] Landing copy still correct (`index.html`): bio says **incoming PhD**, News = **September 2026**, footer = update the "Last updated" month.
- [ ] CV PDF in `assets/CV-AdityaPrashantChaudhari.pdf` is the version you want public.
- [ ] Blog posts read OK at `blog/` (open them locally: `python3 dev-server.py` → http://127.0.0.1:8000/blog/).

---

## 1. Merge `phd-site` → `main`

```bash
git checkout main
git pull
git merge phd-site
git push origin main
```

This push triggers the new deploy workflow (`.github/workflows/pages-deploy.yml`).

---

## 2. Flip the GitHub Pages source (ONE-TIME, required)

The old site deployed from a branch (`gh-pages`, Zola output). The new workflow uses the
official GitHub Pages Actions path, so the source setting must change once:

1. GitHub repo → **Settings** → **Pages**
2. **Build and deployment** → **Source** → select **GitHub Actions**
3. Save.

Without this flip, the new workflow runs but the site won't publish.

---

## 3. Confirm the deploy succeeded

- [ ] Repo → **Actions** tab → the "Deploy static site to Pages" run is green.
- [ ] Visit https://adityac4.github.io/ — new minimal site loads.

---

## 4. Verify live URLs (these are the ones the CV / search engines point at)

- [ ] https://adityac4.github.io/ — landing page
- [ ] https://adityac4.github.io/blog/ — post list
- [ ] https://adityac4.github.io/pass_order_study.pdf — technical report (kept at root so the CV link survives)
- [ ] Each blog post opens and code blocks render
- [ ] CV [Email] / [CV] / [Blog] / [GitHub] / [LinkedIn] links work

---

## 5. Go public

- [ ] Post on LinkedIn with the site link.

---

## Notes / cleanup (optional)

- The old `gh-pages` branch (Zola build output) is now unused. Safe to delete later, or leave it.
- Adding a future blog post: copy `blog/_TEMPLATE.html`, rename with a date prefix
  (`YYYY-MM-DD-slug.html`), edit title/description/date, write the body, add one `<li>` to
  `blog/index.html`. No build step.
- This file (`JULY-LAUNCH.md`) is served publicly once live. Delete it after launch if you
  don't want it reachable.
```

# Scenario Reader — Towers of Creed

A single-page reader for the game scenario (Part I / Part II), meant to be shared with a
small circle of invited readers.

The scenario text lives **only** in the private `TowerDefense` repo. This public page
contains **no scenario text** — it fetches `Scenario Part1.md` / `Scenario Part2.md` live
from the private repo through the GitHub API, using an **access key** (a GitHub token) that
the reader enters. The key is stored only in that reader's browser (`localStorage`) and is
sent only to GitHub. Nothing is published in this repo except the reader code itself.

## Files

| File | What it is |
|------|-----------|
| `index.html` | The reader. Access-key gate → Part I / Part II tabs, table of contents, font/width/theme settings. Fully self-contained, no dependencies. |
| `logo.png` | *(optional)* Drop a game logo here and it replaces the ⚔ placeholder on the gate and header automatically. |

## The access key (GitHub token)

Create a **fine-grained Personal Access Token** and give it to your readers:

- GitHub → Settings → Developer settings → Personal access tokens → **Fine-grained tokens**
- **Repository access:** only the `TowerDefense` repo
- **Permissions:** `Contents` → **Read-only** (nothing else)
- Set a short **expiration** and **revoke it** when the readers are done.

> ⚠️ **Important scope note.** A `Contents: Read` token grants read access to the **entire**
> `TowerDefense` repo (all files, not just the scenario folder) — GitHub can't scope a token
> to a subfolder. So treat the key like a shared read password for the whole private repo:
> keep it read-only, short-lived, and revoke it after use. If that's too broad, move the
> scenario into its own dedicated private repo and issue the key for that repo instead.

Readers open the page, paste the key once, and read. The 🔒 button removes the key from
their browser. Because the same origin is used, a key already saved by the `lore-editor`
tool works here too.

## Adding a logo

Put a `logo.png` in this folder. It shows on the gate and in the header. If the file is
absent the reader falls back to the ⚔ mark — no code change needed.

## Hosting (GitHub Pages)

Enable Pages for this repo (Settings → Pages → deploy from `main`). The reader will be at:

```
https://<user>.github.io/tools/scenario-reader/
```

Share that link **plus the access key** with your readers (over separate channels is safest).

## Why this model (vs. a published encrypted file)

Reading live from the private repo means **no decryptable copy of the scenario is ever
published**. The trade-off is that access depends on a GitHub token; guard and rotate it as
described above.

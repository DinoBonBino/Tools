# Scenario Reader — Towers of Creed

A single-page, password-protected reader for the game scenario, meant to be shared
with a small circle of invited readers.

The scenario text lives **only** in the private `TowerDefense` repo. This public page
never contains the plaintext — it ships an **encrypted** bundle (`scenarios.enc.json`)
that is decrypted in the reader's browser after they type the password. Wrong password →
nothing is revealed (AES-GCM authentication fails).

## Files

| File | What it is |
|------|-----------|
| `index.html` | The reader. Password gate → Part I / Part II tabs, table of contents, font/width/theme settings. Fully self-contained, no dependencies. |
| `scenarios.enc.json` | The encrypted scenario bundle (ciphertext only — safe to be public). |
| `encrypt.mjs` | Node script that reads the private scenario `.md` files and regenerates `scenarios.enc.json`. |
| `logo.png` | *(optional)* Drop a game logo here and it replaces the ⚔ placeholder on the gate and header automatically. |

## How to set / change the password

The password is **not stored anywhere** — it only exists as the key that can decrypt the
bundle. To (re)set it, re-encrypt with your chosen password:

```bash
cd scenario-reader
node encrypt.mjs --pass "your-secret-password" --src /path/to/TowerDefense/_Design/scenario
git add scenarios.enc.json
git commit -m "Re-encrypt scenario bundle"
git push
```

`--src` defaults to `../../TowerDefense/_Design/scenario` (i.e. the private repo checked
out next to this one), so if your folders are laid out that way you can omit it.

Re-run this same command whenever the scenario text changes — it re-reads the `.md`
files and rebuilds the bundle.

## Adding a logo

Put a `logo.png` (or replace this and change the `src` in `index.html`) in this folder.
It shows on the password screen and in the header. If the file is absent the reader
falls back to the ⚔ mark — no code change needed.

## Hosting (GitHub Pages)

Enable Pages for this repo (Settings → Pages → deploy from `main`). The reader will be at:

```
https://<user>.github.io/tools/scenario-reader/
```

Share that link **plus the password** with your readers (over separate channels is
safest). They need no GitHub account and no token.

## Crypto details

- Key derivation: PBKDF2-SHA256, 250 000 iterations, 16-byte random salt.
- Encryption: AES-GCM 256-bit, 12-byte random IV.
- Parameters are defined once in `encrypt.mjs` and mirrored in `index.html` (`KDF`); keep
  them in sync if you change them.

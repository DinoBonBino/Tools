#!/usr/bin/env node
// Encrypt the private scenario markdown into scenarios.enc.json for the public reader.
//
// The plaintext scenarios live ONLY in the private TowerDefense repo. This script
// reads them from a local checkout, encrypts them with a passphrase (AES-GCM, key
// derived via PBKDF2-SHA256), and writes ciphertext next to index.html. Only the
// ciphertext is ever committed to the public Tools repo — the plaintext never is.
//
// Usage:
//   node encrypt.mjs --pass "your-passphrase" --src /path/to/TowerDefense/_Design/scenario
//   node encrypt.mjs --pass "your-passphrase"            # uses --src default below
//   PASS env var also works instead of --pass.
//
// Then commit the regenerated scenarios.enc.json.

import { readFile, writeFile } from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

// Which files become which part. Adjust titles/filenames if they change.
const PARTS = [
  { id: 'part1', title: 'Часть I',  file: 'Scenario Part1.md' },
  { id: 'part2', title: 'Часть II', file: 'Scenario Part2.md' },
];

// PBKDF2/AES-GCM parameters. MUST stay in sync with index.html decrypt().
const ITER = 250000;
const HASH = 'SHA-256';

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const pass = arg('pass', process.env.PASS);
const src  = resolve(arg('src', join(HERE, '..', '..', 'TowerDefense', '_Design', 'scenario')));
const out  = resolve(arg('out', join(HERE, 'scenarios.enc.json')));

if (!pass) {
  console.error('✗ No passphrase. Pass one with --pass "…" or the PASS env var.');
  process.exit(1);
}

const b64 = (buf) => Buffer.from(buf).toString('base64');

async function deriveKey(passphrase, salt) {
  const material = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITER, hash: HASH },
    material,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt']
  );
}

async function main() {
  const parts = [];
  for (const p of PARTS) {
    const md = await readFile(join(src, p.file), 'utf8');
    parts.push({ id: p.id, title: p.title, md });
    console.log(`  · ${p.file} → ${p.title} (${md.length.toLocaleString('en-US')} chars)`);
  }

  const plaintext = new TextEncoder().encode(
    JSON.stringify({ generated: new Date().toISOString(), parts })
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv   = crypto.getRandomValues(new Uint8Array(12));
  const key  = await deriveKey(pass, salt);
  const ct   = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext);

  const bundle = {
    v: 1,
    algo: 'AES-GCM',
    kdf: 'PBKDF2', hash: HASH, iter: ITER,
    salt: b64(salt),
    iv: b64(iv),
    ct: b64(ct),
  };

  await writeFile(out, JSON.stringify(bundle));
  console.log(`✓ Wrote ${out} (${(JSON.stringify(bundle).length / 1024).toFixed(1)} KB, encrypted)`);
}

main().catch((e) => { console.error('✗', e.message); process.exit(1); });

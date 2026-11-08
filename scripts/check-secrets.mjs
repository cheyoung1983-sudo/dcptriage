#!/usr/bin/env node
/**
 * Repo secret scanner. Fails (exit 1) if tracked/staged files contain likely secrets
 * or forbidden env files. Never prints matched values, only file:line and rule name.
 *
 *   node scripts/check-secrets.mjs           # scan all git-tracked files
 *   node scripts/check-secrets.mjs --staged  # scan staged files (pre-commit)
 *
 * Allow a reviewed false positive by adding `secret-scan:allow` on that line.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync, statSync } from 'node:fs';

const staged = process.argv.includes('--staged');
const git = (args) => execFileSync('git', args, { encoding: 'utf8' });
const files = (staged
  ? git(['diff', '--cached', '--name-only', '--diff-filter=ACMR'])
  : git(['ls-files'])
).split('\n').filter(Boolean);

const FORBIDDEN_FILES = [
  /(^|\/)\.env(\.(?!example$)[^/]+)?$/,
  /(^|\/)\.dev\.env\.json$/,
  /(^|\/)[^/]*\.env\.json$/,
  /\.(pem|p12|pfx|key)$/,
  /(^|\/)id_(rsa|ed25519|ecdsa)$/,
  /(^|\/)credentials\.json$/,
  /(^|\/)service-account[^/]*\.json$/,
];
const SKIP = [/^package-lock\.json$/, /\.(png|jpe?g|gif|webp|ico|svg|pdf|woff2?|ttf|mp3|mp4|zip)$/i, /^public\/sitemap\.xml$/];

const RULES = [
  ['private-key', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['aws-access-key', /\b(AKIA|ASIA)[0-9A-Z]{16}\b/],
  ['openai-key', /\bsk-(proj-|svcacct-)?[A-Za-z0-9_-]{20,}/],
  ['anthropic-key', /\bsk-ant-[A-Za-z0-9_-]{20,}/],
  ['google-api-key', /\bAIza[0-9A-Za-z_-]{35}\b/],
  ['github-token', /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{40,}/],
  ['slack-token', /\bxox[abprs]-[A-Za-z0-9-]{10,}/],
  ['slack-webhook', /hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/],
  ['stripe-key', /\b(sk|rk)_live_[A-Za-z0-9]{16,}/],
  ['twilio-key', /\bSK[0-9a-fA-F]{32}\b/],
  ['shopify-token', /\bshp(at|ss|ca|pa)_[a-fA-F0-9]{32}\b/],
  ['elevenlabs-key', /\bsk_[a-f0-9]{48}\b/],
  ['db-url-with-password', /\b(postgres(ql)?|mysql|mongodb(\+srv)?|redis|rediss):\/\/[^\s:@/'"]+:[^\s@/'"]{6,}@/],
  ['jwt', /\beyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/],
  // NAME_SECRET/TOKEN/PASSWORD/KEY = "long literal" (not process.env, not empty, not placeholder)
  ['hardcoded-credential', /\b[A-Za-z0-9_]*(SECRET|TOKEN|PASSWORD|PASSWD|API_?KEY|ONBOARDING_?CODE|PRIVATE_?KEY)[A-Za-z0-9_]*\b["']?\s*[:=]\s*["'`]([A-Za-z0-9+/=_\-.]{16,})["'`]/i],
];
const PLACEHOLDER = /(your|example|placeholder|changeme|xxxx|dummy|test|fake|sample|mock|<|\$\{)/i;
const LOCAL_DB = /@(localhost|127\.0\.0\.1|db|postgres)(:\d+)?\//;

const findings = [];
for (const f of files) {
  if (FORBIDDEN_FILES.some((r) => r.test(f))) { findings.push(`${f}: forbidden-file (env/key files must never be committed)`); continue; }
  if (SKIP.some((r) => r.test(f)) || !existsSync(f) || statSync(f).isDirectory() || statSync(f).size > 2_000_000) continue;
  let text;
  try { text = readFileSync(f, 'utf8'); } catch { continue; }
  if (text.includes('\u0000')) continue;
  text.split('\n').forEach((line, i) => {
    if (line.includes('secret-scan:allow')) return;
    for (const [name, re] of RULES) {
      const m = line.match(re);
      if (!m) continue;
      if (name === 'hardcoded-credential' && PLACEHOLDER.test(m[0])) continue;
      if (name === 'db-url-with-password' && LOCAL_DB.test(line)) continue;
      findings.push(`${f}:${i + 1}: ${name}`);
    }
  });
}

if (findings.length) {
  console.error(`✖ secret scan: ${findings.length} finding(s) (values hidden):`);
  for (const x of findings) console.error('  ' + x);
  console.error('Move the value to an env var (Vercel / .env.local, which is gitignored). If this is a reviewed false positive, add "secret-scan:allow" to the line.');
  process.exit(1);
}
console.log(`✔ secret scan: ${files.length} file(s) clean`);

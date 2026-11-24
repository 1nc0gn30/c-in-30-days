import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { curriculum } from '../src/data/curriculum.ts';
import { evaluateCCodeLocally, checkBalancedDelimiters } from '../src/services/cEvaluator.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

test('curriculum defines all 30 contiguous days with complete lessons, quizzes, and exercises', () => {
  assert.equal(curriculum.length, 30, 'Curriculum must have exactly 30 days');
  curriculum.forEach((day, idx) => {
    assert.equal(day.day, idx + 1, `Expected day ${idx + 1}`);
    assert.ok(day.title.length >= 4, `Day ${day.day} title missing`);
    assert.ok(day.lessonMarkdown.length >= 150, `Day ${day.day} lessonMarkdown too short`);
    assert.ok(day.quiz.length >= 2, `Day ${day.day} must have at least 2 quiz questions`);
    assert.ok(day.exercise.initialCode.length > 20, `Day ${day.day} starter code missing`);
    assert.ok(day.exercise.solutionCode.length > 20, `Day ${day.day} solution code missing`);
    assert.ok(day.exercise.rules.length >= 2, `Day ${day.day} verifier rules missing`);
  });
});

test('all 30 reference C11 solutions compile cleanly with gcc -Wall -Wextra -Werror -std=c11 and match expectedOutput', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'c30-gcc-'));
  try {
    for (const day of curriculum) {
      const slug = `day${String(day.day).padStart(2, '0')}`;
      const srcPath = path.join(tmpDir, `${slug}.c`);
      const binPath = path.join(tmpDir, slug);
      fs.writeFileSync(srcPath, day.exercise.solutionCode, 'utf8');

      execFileSync('gcc', ['-Wall', '-Wextra', '-Werror', '-std=c11', srcPath, '-o', binPath], {
        stdio: 'pipe',
      });

      const stdout = execFileSync(binPath, [], { encoding: 'utf8', timeout: 5000 }).trim();
      assert.equal(
        stdout,
        day.exercise.expectedOutput,
        `Day ${day.day} (${day.title}) stdout mismatch: got ${JSON.stringify(stdout)}, expected ${JSON.stringify(day.exercise.expectedOutput)}`
      );
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('local C11 evaluator passes all 30 reference solutions and rejects unmodified starters and broken syntax', () => {
  for (const day of curriculum) {
    const passRes = evaluateCCodeLocally(day.exercise, day.exercise.solutionCode);
    assert.equal(
      passRes.passed,
      true,
      `Day ${day.day} solution failed local evaluator: ${passRes.feedback}`
    );

    const starterRes = evaluateCCodeLocally(day.exercise, day.exercise.initialCode);
    assert.equal(
      starterRes.passed,
      false,
      `Day ${day.day} unmodified starter should not pass`
    );
  }

  const broken = checkBalancedDelimiters('int main(void) { printf("hi\\n"; return 0; }');
  assert.equal(broken.ok, false);
  assert.match(broken.error || '', /Unmatched|Unclosed/);
});

test('production SEO, AEO, Netlify, and Open-Access guardrails pass', () => {
  const robots = fs.readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8');
  for (const bot of ['User-agent: *', 'Googlebot', 'GPTBot', 'ClaudeBot', 'PerplexityBot', 'Applebot']) {
    assert.ok(robots.includes(bot), `robots.txt missing ${bot}`);
  }
  assert.ok(robots.includes('Crawl-delay: 0'), 'robots.txt must set Crawl-delay: 0');
  assert.ok(robots.includes('Sitemap: https://c-in-30.nealfrazier.tech/sitemap.xml'));

  const sitemap = fs.readFileSync(path.join(ROOT, 'public/sitemap.xml'), 'utf8');
  assert.ok(sitemap.includes('<loc>https://c-in-30.nealfrazier.tech/</loc>'));
  assert.ok(sitemap.includes('<lastmod>'));

  const netlifyToml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert.ok(netlifyToml.includes('publish = "dist"'));
  assert.ok(netlifyToml.includes('X-Frame-Options = "SAMEORIGIN"'));
  assert.ok(netlifyToml.includes('X-Content-Type-Options = "nosniff"'));
  assert.ok(netlifyToml.includes('Referrer-Policy = "strict-origin-when-cross-origin"'));
  assert.ok(netlifyToml.includes('to = "/index.html"'));

  const redirects = fs.readFileSync(path.join(ROOT, 'public/_redirects'), 'utf8').trim();
  assert.equal(redirects, '/* /index.html 200');

  assert.ok(fs.existsSync(path.join(ROOT, 'public/og-image.png')), 'public/og-image.png missing');
  assert.ok(fs.existsSync(path.join(ROOT, 'public/favicon.svg')), 'public/favicon.svg missing');

  const htmlPath = fs.existsSync(path.join(ROOT, 'dist/index.html'))
    ? path.join(ROOT, 'dist/index.html')
    : path.join(ROOT, 'index.html');
  const html = fs.readFileSync(htmlPath, 'utf8');

  assert.ok(html.includes('name="viewport"'));
  assert.ok(html.includes('property="og:image"'));
  assert.ok(html.includes('name="twitter:card" content="summary_large_image"'));
  assert.ok(html.includes('name="twitter:site" content="@1nc0gn30"'));

  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(ldMatch, 'Missing JSON-LD script block');
  const graph = JSON.parse(ldMatch[1])['@graph'];
  assert.ok(Array.isArray(graph), 'JSON-LD must declare @graph');
  assert.ok(graph.some((n) => n['@type'] === 'WebApplication'));
  assert.ok(graph.some((n) => n['@type'] === 'FAQPage' && Array.isArray(n.mainEntity) && n.mainEntity.length >= 2));

  const appSource = fs.readFileSync(path.join(ROOT, 'src/App.tsx'), 'utf8');
  assert.ok(appSource.includes('https://buy.stripe.com/3cIfZg27PdKo2D64Ocfw40X'), 'Missing Stripe Buy Us a Coffee link');
  assert.ok(appSource.includes('GG2eQbVh8ut1BK6j1A2tz7pSySdLpD38BgyEhGcxdXoK'), 'Missing Solana tip address');
  assert.ok(!/depay|paywall|license.?key/i.test(appSource), 'Must not include paywalls or DePay');
});

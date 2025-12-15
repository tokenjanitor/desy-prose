import { test, expect } from '@playwright/test';
import type { Server } from 'node:http';
import { cp, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { createStaticServer } from '../../scripts/static-server.ts';

test('element size properties inherit from the host and code does not scale twice', async ({ page }) => {
  await page.goto('/standalone.html');
  await page.setContent(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="/css/prose.css">
    <style>
      .host {
        --prose-font-size: 20px;
        --prose-h1-size: 2.5em;
        --prose-h2-size: 2em;
        --prose-h3-size: 1.75em;
        --prose-h4-size: 1.5em;
        --prose-h5-size: 1.25em;
        --prose-h6-size: 1.1em;
        --prose-small-size: 0.9em;
        --prose-code-size: 0.8em;
        --prose-table-size: 0.85em;
      }
    </style>
  </head>
  <body>
    <main class="host">
      <article class="prose">
        <h1>One</h1><h2>Two</h2><h3>Three</h3>
        <h4>Four</h4><h5>Five</h5><h6>Six</h6>
        <figure><figcaption>Caption</figcaption></figure>
        <p><small>Small text</small> and <code>inline code</code>.</p>
        <pre><code>preformatted code</code><samp>sample output</samp><kbd>keyboard input</kbd></pre>
        <table><tbody><tr><td>Table text</td></tr></tbody></table>
      </article>
    </main>
  </body>
</html>`);
  for (const [selector, size] of [
    ['h1', 50], ['h2', 40], ['h3', 35], ['h4', 30], ['h5', 25], ['h6', 22],
    ['figcaption', 18], ['small', 18], ['p code', 16], ['pre', 16],
    ['pre code', 16], ['pre samp', 16], ['pre kbd', 16], ['table', 17],
  ] as const) {
    await expect(page.locator(selector)).toHaveCSS('font-size', `${size}px`);
  }
  await page.addStyleTag({ content: 'h1 { --prose-h1-size: 3em; }' });
  await expect(page.locator('h1')).toHaveCSS('font-size', '60px');
});

test('a consumer can use only the copied css directory without examples, theme or JavaScript', async ({ browser }) => {
  const directory = await mkdtemp(resolve(tmpdir(), 'prose-consumer-'));
  const context = await browser.newContext({ javaScriptEnabled: false });
  let server: Server | undefined;
  try {
    await cp(resolve('css'), resolve(directory, 'css'), { recursive: true });
    await writeFile(resolve(directory, 'index.html'), `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <link rel="stylesheet" href="css/prose.css">
    <style>:root { --prose-color: #523b64; }</style>
  </head>
  <body>
    <article class="prose" data-paragraphs="space">
      <h1>A copied reading library</h1>
      <p>One public entry and local native imports.</p>
      <p>A second paragraph uses the spaced mode.</p>
      <aside data-prose-ui style="font: 16px/1.5 system-ui">
        <p>Embedded UI retains browser element defaults.</p>
      </aside>
    </article>
  </body>
</html>`);
    const preview = await createStaticServer([{ prefix: '/', directory }]);
    server = preview;
    await new Promise<void>((ready, reject) => {
      preview.once('error', reject);
      preview.listen(0, '127.0.0.1', ready);
    });
    const address = preview.address();
    if (!address || typeof address === 'string') throw new Error('Expected a TCP preview server.');
    const origin = `http://127.0.0.1:${address.port}`;
    const page = await context.newPage();
    const requests: string[] = [];
    const failed: string[] = [];
    page.on('request', request => requests.push(request.url()));
    page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
    await page.goto(origin);
    await expect(page.locator('.prose')).toHaveCSS('color', 'rgb(82, 59, 100)');
    await expect(page.locator('.prose > h1')).toHaveCSS('margin-block-start', '0px');
    expect(await page.locator('.prose > p').nth(1).evaluate(element => parseFloat(getComputedStyle(element).marginBlockStart))).toBeGreaterThan(0);
    await expect(page.locator('[data-prose-ui] p')).toHaveCSS('margin-block-start', '16px');
    expect(requests.every(url => url === origin + '/' || url.startsWith(origin + '/css/'))).toBe(true);
    expect(failed).toEqual([]);
  } finally {
    await context.close();
    if (server) await new Promise<void>((ready, reject) => server?.close(error => error ? reject(error) : ready()));
    await rm(directory, { recursive: true, force: true });
  }
});

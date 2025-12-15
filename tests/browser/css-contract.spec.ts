import { test, expect } from '@playwright/test';

test('post-heading rhythm includes supported structural wrappers and an opening rule stays flush', async ({ page }) => {
  await page.goto('/standalone.html');
  await page.setContent(`
    <link rel="stylesheet" href="/css/prose.css">
    <style>.prose { --prose-font-size: 20px; }</style>
    <article class="prose">
      <hr id="opening-rule">
      <h2>Direct paragraph</h2><p id="direct">Text</p>
      <h2>Generic wrapper</h2><div id="wrapper"><p>Text</p></div>
      <h2>Table wrapper</h2><div id="table" class="prose-table"><table><tr><td>Text</td></tr></table></div>
      <h2>Section</h2><section id="section"><p>Text</p></section>
      <h2>Aside</h2><aside id="aside"><p>Text</p></aside>
      <hr id="inner-rule">
    </article>
  `);
  for (const selector of ['#direct', '#wrapper', '#table', '#section', '#aside']) {
    await expect(page.locator(selector)).toHaveCSS('margin-block-start', '13px');
  }
  await expect(page.locator('#opening-rule')).toHaveCSS('margin-block-start', '0px');
  await expect(page.locator('#inner-rule')).toHaveCSS('margin-block-start', '30px');
  await page.addStyleTag({ content: '.prose { --prose-after-heading-space: 0.8em; }' });
  await expect(page.locator('#wrapper')).toHaveCSS('margin-block-start', '16px');
});

test('host design variables reach their consumers and leave excluded UI alone', async ({ page }) => {
  await page.goto('/standalone.html');
  await page.setContent(`
    <link rel="stylesheet" href="/css/prose.css">
    <style>
      .host {
        --prose-font-size: 20px;
        --prose-heading-space: 24px;
        --prose-list-indent: 40px;
        --prose-list-space: 12px;
        --prose-pre-padding: 24px;
        --prose-pre-line-height: 2;
        --prose-tab-size: 4;
        --prose-cell-padding: 8px 16px;
        --prose-table-rule-width: 3px;
        --prose-kbd-radius: 6px;
        --prose-rule-space: 40px;
        --prose-focus-width: 4px;
      }
    </style>
    <main class="host"><article class="prose">
      <p>Opening</p><h2>Heading</h2>
      <ul><li>One</li><li>Two</li></ul>
      <pre><samp>Output</samp></pre>
      <p><kbd>Enter</kbd> <a href="#target">A link</a></p>
      <table><tr><td>Value</td></tr></table><hr>
      <aside data-prose-ui><ul><li>UI one</li><li>UI two</li></ul></aside>
    </article></main>
  `);
  await expect(page.locator('h2')).toHaveCSS('margin-block-start', '24px');
  await expect(page.locator('article > ul')).toHaveCSS('padding-inline-start', '40px');
  await expect(page.locator('article > ul > li').nth(1)).toHaveCSS('margin-block-start', '12px');
  await expect(page.locator('pre')).toHaveCSS('padding', '24px');
  await expect(page.locator('pre')).toHaveCSS('line-height', '35px');
  await expect(page.locator('pre')).toHaveCSS('tab-size', '4');
  await expect(page.locator('td')).toHaveCSS('padding', '8px 16px');
  await expect(page.locator('td')).toHaveCSS('border-block-end-width', '3px');
  await expect(page.locator('p kbd')).toHaveCSS('border-radius', '6px');
  await expect(page.locator('hr')).toHaveCSS('margin-block-start', '40px');
  await page.locator('a').focus();
  await expect(page.locator('a')).toHaveCSS('outline-width', '4px');
  await expect(page.locator('[data-prose-ui] li').nth(1)).toHaveCSS('margin-block-start', '0px');
});

import { test, expect, type Page } from '@playwright/test';

const prose = '.theme-example > .prose';
const noOverflow = async (page: Page): Promise<void> => expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);

test('standalone defaults remain independent of the optional theme', async ({ page }) => {
  let themeRequests = 0;
  page.on('request', request => { if (request.url().includes('/theme/')) themeRequests++; });
  await page.goto('/standalone.html');
  await expect(page.locator('.prose')).toHaveCSS('color', 'rgb(37, 42, 50)');
  expect(await page.locator('.prose').evaluate(element => getComputedStyle(element).fontFamily)).toContain('system-ui');
  expect(themeRequests).toBe(0);
});

test('copied colors, fonts and local asset paths work independently', async ({ page, baseURL }) => {
  const failed: string[] = [];
  const external: string[] = [];
  page.on('response', response => { if (response.status() >= 400) failed.push(response.url()); });
  page.on('request', request => { if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url()); });
  await page.goto('/theme-lab.html');
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(23, 43, 58)');
  expect(await page.locator(prose).evaluate(element => getComputedStyle(element).fontFamily)).toContain('Source Serif 4');
  await expect(page.locator(prose + ' a')).toHaveCSS('color', 'rgb(9, 107, 104)');
  await expect(page.locator(prose + ' figcaption')).toHaveCSS('color', 'rgb(82, 99, 108)');
  await expect(page.locator(prose + ' pre')).toHaveCSS('background-color', 'rgb(231, 236, 232)');
  await expect(page.locator(prose + ' hr')).toHaveCSS('border-top-color', 'rgb(166, 180, 177)');
  await page.locator(prose + ' a').focus();
  await expect(page.locator(prose + ' a')).toHaveCSS('outline-color', 'rgb(9, 107, 104)');
  const loaded = await page.evaluate(async () => {
    return Promise.all(['Source Sans 3', 'Source Serif 4', 'Source Code Pro'].flatMap(name => ['normal', 'italic'].map(async style => {
      const faces = await document.fonts.load(style + ' 600 20px "' + name + '"', 'ÄÖÜ äöü ß ẞ');
      return faces.length > 0 && faces.every(face => face.status === 'loaded');
    })));
  });
  expect(loaded.every(Boolean)).toBe(true);
  expect(failed).toEqual([]);
  expect(external).toEqual([]);
});

test('the laboratory switches defaults without changing reading size, rhythm or paragraph treatment', async ({ page }) => {
  await page.goto('/theme-lab.html');
  const values = () => page.locator(prose).evaluate(element => {
    const style = getComputedStyle(element);
    const paragraphs = element.querySelectorAll('p');
    const second = paragraphs[1];
    if (!second) throw new Error('Expected a second paragraph.');
    return [style.fontSize, style.lineHeight, style.fontWeight, getComputedStyle(second).marginBlockStart, getComputedStyle(second).textIndent];
  });
  const shared = await values();
  await page.getByLabel('Appearance', { exact: true }).selectOption('default');
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(37, 42, 50)');
  expect(await page.locator(prose).evaluate(element => getComputedStyle(element).fontFamily)).toContain('system-ui');
  expect(await values()).toEqual(shared);
  await page.getByLabel('Appearance', { exact: true }).selectOption('shared');
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(23, 43, 58)');
  await page.getByLabel('Appearance', { exact: true }).selectOption('overrides');
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(82, 59, 100)');
  expect(await page.locator(prose).evaluate(element => getComputedStyle(element).fontFamily)).toContain('Georgia');
});

test('explicit public root and ancestor overrides retain priority', async ({ page }) => {
  await page.goto('/theme-lab.html');
  await page.addStyleTag({ content: ':root { --prose-color: #71432a; --prose-link-color: #71432a; --prose-font-family: Georgia, serif; --prose-font-size: 1.25rem; --prose-line-height: 1.9; }' });
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(113, 67, 42)');
  await expect(page.locator(prose + ' a')).toHaveCSS('color', 'rgb(113, 67, 42)');
  await expect(page.locator(prose)).toHaveCSS('font-size', '20px');
  await expect(page.locator(prose)).toHaveCSS('line-height', '38px');
  expect(await page.locator(prose).evaluate(element => getComputedStyle(element).fontFamily)).toContain('Georgia');
  await page.addStyleTag({ content: '.theme-example { --prose-color: #294e3b; --prose-font-mono: monospace; --prose-code-background: #e1e8df; }' });
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(41, 78, 59)');
  await expect(page.locator(prose + ' pre')).toHaveCSS('background-color', 'rgb(225, 232, 223)');
  await expect(page.locator(prose + ' code')).toHaveCSS('font-family', 'monospace');
});

test('load order and locally customized shared tokens retain the same integration contract', async ({ page }) => {
  await page.goto('/theme-lab.html');
  await page.locator('#prose-stylesheet').evaluate(element => { element.parentElement!.appendChild(element); });
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(23, 43, 58)');
  await page.addStyleTag({ content: '.prose { --desy-color-text: #294e3b; --desy-color-accent: #71432a; }' });
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(41, 78, 59)');
  await expect(page.locator(prose + ' a')).toHaveCSS('color', 'rgb(113, 67, 42)');
  await page.getByLabel('Appearance', { exact: true }).selectOption('default');
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(37, 42, 50)');
});

test('the themed specimen remains readable without JavaScript and without font delivery', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('A test base URL is required.');
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  let blocked = 0;
  await page.route('**/*.woff2', route => { blocked++; return route.abort(); });
  await page.goto('/theme-lab.html');
  await expect.poll(() => blocked).toBeGreaterThan(0);
  await expect(page.locator('[data-theme-controls]')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Ein Text darf seinen Ton behalten.' })).toBeVisible();
  await expect(page.locator(prose)).toHaveCSS('color', 'rgb(23, 43, 58)');
  await noOverflow(page);
  await context.close();
});

test('larger root text and narrow views preserve the themed reading content', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/theme-lab.html');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await expect(page.getByRole('heading', { name: 'Ein Text darf seinen Ton behalten.' })).toBeVisible();
  await noOverflow(page);
});

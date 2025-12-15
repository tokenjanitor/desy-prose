import { test, expect, type Page } from '@playwright/test';

test('the laboratory opens the original long read with working chapters and controls', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Reisehandbuch als Langtext', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Handbuch für ungeplante Zwischenstopps' })).toBeVisible();
  await page.getByRole('navigation', { name: 'Kapitel des Reisehandbuchs' }).getByRole('link', { name: 'Fahrplan für den äußeren Ring', exact: true }).click();
  await expect(page).toHaveURL(/#fahrplan$/);
  await expect(page.locator('#fahrplan')).toBeInViewport();
  await page.locator('#paragraphs').selectOption('indent');
  await expect(page.locator('[data-specimen]')).toHaveAttribute('data-paragraphs', 'indent');
  await page.locator('#fluid').uncheck();
  await page.locator('#size').evaluate(element => {
    (element as HTMLInputElement).value = '1.5';
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
  await expect(page.locator('[data-specimen]')).toHaveCSS('font-size', '24px');
  await page.getByRole('button', { name: 'Ausgangswerte wiederherstellen' }).click();
  await expect(page.locator('[data-specimen]')).toHaveAttribute('data-paragraphs', 'space');
  expect(errors).toEqual([]);
});

test('the long read retains wide tables inside keyboard-accessible scroll regions', async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto('/reisehandbuch.html');
  for (const name of ['Fahrplan des äußeren Rings', 'Vorratsliste für die Überfahrt']) {
    const region = page.getByRole('region', { name, exact: true });
    expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    await region.focus();
    await expect(region).toBeFocused();
    // This macOS WebKit runner does not scroll focused regions with arrow keys.
    if (browserName !== 'webkit') {
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
    }
    await region.hover();
    const previousScroll = await region.evaluate(element => element.scrollLeft);
    await page.mouse.wheel(180, 0);
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(previousScroll);
  }
  await expect(page.locator('td p').first()).toHaveCSS('font-variant-numeric', 'lining-nums tabular-nums');
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('the complete story and chapter navigation work without JavaScript', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('A test base URL is required.');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL, viewport: { width: 320, height: 900 } });
  const page = await context.newPage();
  const external: string[] = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== new URL(baseURL!).origin) external.push(request.url());
  });
  await page.goto('/reisehandbuch.html');
  await expect(page.locator('[data-controls]')).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Handbuch für ungeplante Zwischenstopps' })).toBeVisible();
  await page.getByRole('link', { name: 'Die Rückreise beginnt später', exact: true }).click();
  await expect(page).toHaveURL(/#rueckreise$/);
  await expect(page.locator('#rueckreise')).toBeInViewport();
  await expect(page.getByRole('table')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  expect(external).toEqual([]);
  await context.close();
});

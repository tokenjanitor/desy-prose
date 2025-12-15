import { test, expect, type Page } from '@playwright/test';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const specimen = '#panel-reading .prose';
const changeRange = async (page: Page, name: string, value: string) => {
  await page.locator(`#${name}`).evaluate((element, next) => {
    (element as HTMLInputElement).value = next;
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
};

test('controls change the rendered text and reset to the starting state', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('form')).toBeVisible();
  await page.locator('#fluid').uncheck();
  await changeRange(page, 'size', '1.5');
  await changeRange(page, 'leading', '1.9');
  await changeRange(page, 'measure', '48');
  await page.locator('#font').selectOption('sans');
  await page.locator('#paragraphs').selectOption('indent');
  await expect(page.locator(`${specimen} > p`).nth(1)).toHaveCSS('text-indent', '24px');
  await expect(page.locator(`${specimen} > p`).first()).toHaveCSS('font-size', '24px');
  expect(await page.locator(`${specimen} > p`).first().evaluate((element) => parseFloat(getComputedStyle(element).lineHeight))).toBeCloseTo(45.6, 2);
  await expect(page.locator(`${specimen} > p`).first()).toHaveCSS('text-indent', '0px');
  await page.locator('#alignment').selectOption('justify');
  await expect(page.locator(`${specimen} > p`).first()).toHaveCSS('text-align', 'justify');
  await page.getByRole('button', { name: 'Ausgangswerte wiederherstellen' }).click();
  await expect(page.locator('#fluid')).toBeChecked();
  await expect(page.locator('#size')).toBeDisabled();
  await expect(page.locator('#measure')).toHaveValue('65');
  await expect(page.locator(`${specimen} > p`).nth(1)).toHaveCSS('text-indent', '0px');
  expect(errors).toEqual([]);
});

test('example tabs support keyboard navigation and retain the chosen settings', async ({ page }) => {
  await page.goto('/');
  await page.locator('#paragraphs').selectOption('indent');
  await page.getByRole('tab', { name: 'Lesetext', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Elemente', exact: true })).toBeFocused();
  await expect(page.locator('#panel-elements')).toBeVisible();
  await expect(page.locator('#panel-reading')).toBeHidden();
  await page.keyboard.press('End');
  await expect(page.locator('#panel-edges')).toBeVisible();
  await expect(page.locator('#panel-edges article')).toHaveAttribute('data-paragraphs', 'indent');
  await page.getByRole('button', { name: 'Beispiel umschalten' }).click();
  await expect(page.getByRole('button', { name: 'Beispiel ist aktiv' })).toHaveAttribute('aria-pressed', 'true');
});

test('code size is not compounded and table paragraphs retain table numerals', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Elemente', exact: true }).click();
  const sizes = await page.locator('#panel-elements pre').evaluate((pre) => ({
    pre: getComputedStyle(pre).fontSize,
    code: getComputedStyle(pre.querySelector('code')!).fontSize,
  }));
  expect(sizes.code).toBe(sizes.pre);
  await expect(page.locator('#panel-elements td p').first()).toHaveCSS('font-variant-numeric', 'lining-nums tabular-nums');
});

test('all examples fit a narrow viewport, including long URLs and code', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  await page.locator('#fluid').uncheck();
  await changeRange(page, 'size', '1.75');
  for (const name of ['Lesetext', 'Elemente', 'Grenzfälle']) {
    await page.getByRole('tab', { name, exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  const pre = page.locator('#panel-edges pre');
  expect(await pre.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
});

test('the stylesheet works without JavaScript and leaves its host alone', async ({ browser, baseURL }) => {
  if (!baseURL) throw new Error('A test base URL is required.');
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const plain = await context.newPage();
  await plain.goto('/standalone.html');
  await expect(plain.getByRole('heading', { name: 'Ein Stylesheet. Ein Lesetext.' })).toBeVisible();
  await expect(plain.locator('main')).toHaveCSS('box-sizing', 'border-box');
  await expect(plain.locator('table')).toHaveCSS('border-collapse', 'collapse');
  await expect(plain.locator('#outside-prose')).toHaveCSS('margin-top', '16px');
  await plain.goto('/');
  await expect(plain.locator(specimen)).toBeVisible();
  await expect(plain.locator('[data-controls]')).toBeHidden();
  await context.close();
});

test('host variables follow the root font preference and excluded UI keeps its own rules', async ({ page }) => {
  await page.goto('/');
  await page.locator('#fluid').uncheck();
  await changeRange(page, 'size', '1.125');
  await page.addStyleTag({ content: 'html { font-size: 24px; }' });
  await expect(page.locator(`${specimen} > p`).first()).toHaveCSS('font-size', '27px');
  await page.getByRole('tab', { name: 'Grenzfälle', exact: true }).click();
  await expect(page.locator('[data-prose-ui] p')).toHaveCSS('margin-bottom', '18px');
  await expect(page.locator('[data-prose-ui] p')).toHaveCSS('text-indent', '0px');
});

test('the testbed opens directly from disk with working controls', async ({ page }) => {
  await page.goto(pathToFileURL(resolve('examples/index.html')).href);
  await expect(page.getByRole('form')).toBeVisible();
  await page.getByRole('tab', { name: 'Elemente', exact: true }).click();
  await expect(page.locator('#panel-elements')).toBeVisible();
  await page.locator('#paragraphs').selectOption('indent');
  await expect(page.locator('#panel-elements article')).toHaveAttribute('data-paragraphs', 'indent');
});

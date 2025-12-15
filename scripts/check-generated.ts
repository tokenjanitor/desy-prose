import { execFileSync } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const output = await mkdtemp(resolve(tmpdir(), 'prose-browser-check-'));
try {
  execFileSync(process.execPath, [fileURLToPath(new URL('./bin/tsc', import.meta.resolve('typescript/package.json'))), '-p', 'tsconfig.browser.json', '--outDir', output], { cwd: root, stdio: 'inherit' });
  for (const file of ['lab.js', 'theme-lab.js']) {
    const generated = await readFile(resolve(output, file));
    if (!generated.equals(await readFile(resolve(root, 'examples', file)))) {
      throw new Error('Generated browser output is stale: ' + file + '. Run npm run build:lab.');
    }
  }
  console.log('Browser output matches the checked TypeScript sources.');
} finally {
  await rm(output, { recursive: true, force: true });
}

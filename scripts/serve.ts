import { resolve } from 'node:path';
import { parseArgs } from 'node:util';
import { createStaticServer } from './static-server.ts';

const { values } = parseArgs({ options: {
  port: { type: 'string', default: '4321' },
  help: { type: 'boolean' },
} });
if (values.help) {
  console.log('Usage: node scripts/serve.ts [--port 4321]');
  process.exit(0);
}
const port = Number(values.port);
if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('Invalid port.');
const server = await createStaticServer([
  { prefix: '/css/', directory: resolve(import.meta.dirname, '../css') },
  { prefix: '/theme/', directory: resolve(import.meta.dirname, '../theme') },
  { prefix: '/', directory: resolve(import.meta.dirname, '../examples') },
]);
server.listen(port, '127.0.0.1', () => console.log('Prose preview: http://127.0.0.1:' + port + '/'));

import { readFile, realpath, stat } from 'node:fs/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { extname, isAbsolute, relative, resolve, sep } from 'node:path';

export interface Mount {
  prefix: string;
  directory: string;
  allowedTopLevel?: readonly string[];
}

const mimeTypes: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

function status(response: ServerResponse, code: number): void {
  response.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
  response.end(code === 404 ? 'Not found' : code === 405 ? 'Method not allowed' : 'Bad request');
}

async function respond(request: IncomingMessage, response: ServerResponse, mounts: readonly Mount[]): Promise<void> {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    status(response, 405);
    return;
  }
  let path: string;
  try {
    path = decodeURIComponent((request.url ?? '/').split('?')[0] ?? '/');
  } catch {
    status(response, 400);
    return;
  }
  const mount = mounts.find(candidate => path.startsWith(candidate.prefix));
  if (!mount || path.includes('\0')) { status(response, 404); return; }
  const local = path.slice(mount.prefix.length);
  const parts = local.split(/[\\/]/);
  if (parts.some(part => part.startsWith('.')) ||
      (mount.allowedTopLevel && !mount.allowedTopLevel.includes(parts[0] ?? ''))) {
    status(response, 404);
    return;
  }
  try {
    let file = await realpath(resolve(mount.directory, local));
    if ((await stat(file)).isDirectory()) file = await realpath(resolve(file, 'index.html'));
    const within = relative(mount.directory, file);
    // Resolve symlinks before checking the boundary, including directory indexes.
    if (isAbsolute(within) || within === '..' || within.startsWith('..' + sep) || !(await stat(file)).isFile()) {
      status(response, 404);
      return;
    }
    const body = await readFile(file);
    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(file)] ?? 'application/octet-stream',
      'Content-Length': body.byteLength,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && ['ENOENT', 'ENOTDIR', 'EACCES'].includes(String(error.code))) {
      status(response, 404);
      return;
    }
    throw error;
  }
}

export async function createStaticServer(mounts: readonly Mount[]): Promise<Server> {
  const canonical = await Promise.all(mounts.map(async mount => ({ ...mount, directory: await realpath(mount.directory) })));
  return createServer((request, response) => {
    void respond(request, response, canonical).catch((error: unknown) => {
      console.error(error instanceof Error ? error.message : String(error));
      if (!response.headersSent) response.writeHead(500);
      response.end();
    });
  });
}

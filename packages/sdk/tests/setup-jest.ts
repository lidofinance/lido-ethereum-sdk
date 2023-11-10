import dotenv from 'dotenv';
import path from 'path';
import fetch from 'node-fetch';

if (!globalThis.fetch) {
  const g = globalThis as any;
  g.fetch = fetch.default;
  g.Headers = fetch.Headers;
  g.Request = fetch.Request;
  g.Response = fetch.Response;
}

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

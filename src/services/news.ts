import { parseNewsFeed } from '../core/news.ts';
import type { NewsFeed } from '../core/news.ts';

export const MAX_NEWS_BODY_BYTES = 1024 * 1024;
export const NEWS_TIMEOUT_MS = 8000;
type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

function secureURL(value: string): URL {
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && !url.username && !url.password && url.hostname) return url;
  } catch { /* Report a safe configuration error without reflecting credentials. */ }
  throw new Error('The news feed must use an HTTPS URL without credentials.');
}

function utf8Bytes(text: string): number {
  // Works on React Native without requiring a TextEncoder polyfill.
  let size = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    size += code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4;
    if (size > MAX_NEWS_BODY_BYTES) return size;
  }
  return size;
}

async function readBody(response: Response): Promise<string> {
  const declaredSize = response.headers.get('content-length');
  if (declaredSize !== null && (!/^\d+$/.test(declaredSize) || Number(declaredSize) > MAX_NEWS_BODY_BYTES)) throw new Error('The news feed exceeds the size limit.');
  // A stream stops oversized downloads early on web. React Native responses
  // may only expose text(), so always enforce the actual UTF-8 byte count too.
  if (response.body?.getReader && typeof TextDecoder !== 'undefined') {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let size = 0;
    let text = '';
    try {
      while (true) {
        const chunk = await reader.read();
        if (chunk.done) break;
        size += chunk.value.byteLength;
        if (size > MAX_NEWS_BODY_BYTES) {
          void reader.cancel().catch(() => undefined);
          throw new Error('The news feed exceeds the size limit.');
        }
        text += decoder.decode(chunk.value, { stream: true });
      }
      return text + decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }
  const text = await response.text();
  if (text.length > MAX_NEWS_BODY_BYTES || utf8Bytes(text) > MAX_NEWS_BODY_BYTES) throw new Error('The news feed exceeds the size limit.');
  return text;
}

/** Fetch an editorial JSON feed; no device identifiers, account tokens or cookies. */
export async function fetchNewsFeed(url: string, fetcher: Fetcher = fetch): Promise<NewsFeed> {
  const endpoint = secureURL(url);
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => {
      reject(new Error('The news feed timed out. Try again later.'));
      controller.abort();
    }, NEWS_TIMEOUT_MS);
  });
  try {
    return await Promise.race([timeout, (async () => {
      const response = await fetcher(endpoint.href, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('The news feed is unavailable. Try again later.');
      if (response.url) secureURL(response.url);
      const body = await readBody(response);
      let value: unknown;
      try { value = JSON.parse(body); } catch { throw new Error('The news feed did not contain valid JSON.'); }
      return parseNewsFeed(value);
    })()]);
  } finally {
    clearTimeout(timer);
  }
}

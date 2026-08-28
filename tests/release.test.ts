import { describe, expect, it } from 'vitest';
import claimsText from '../.factory/claims.json?raw';
import indexHtml from '../index.html?raw';
import demoHtml from '../demo/index.html?raw';
import privacyHtml from '../privacy/index.html?raw';
import termsHtml from '../terms/index.html?raw';
import notFoundHtml from '../404.html?raw';
import hostConfigText from '../public/staticwebapp.config.json?raw';
import manifestText from '../public/manifest.webmanifest?raw';
import serviceWorkerText from '../public/sw.js?raw';
import e2eSource from './e2e/app.spec.ts?raw';

describe('release contracts', () => {
  it('lists every claim once and maps it to exactly one tagged browser test', () => {
    const claims = JSON.parse(claimsText) as { id: string; test: string; sandbox: string }[];
    expect(claims.length).toBeGreaterThan(0);
    expect(new Set(claims.map(claim => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.test).toContain(`--grep @claim:${claim.id}`);
      expect(claim.sandbox.length).toBeGreaterThan(20);
      expect(e2eSource.match(new RegExp(`@claim:${claim.id}(?![a-z-])`, 'g'))).toHaveLength(1);
    }
  });

  it('ships route-specific titles, canonical links, social art, and a real 404 document', () => {
    const pages = [indexHtml, demoHtml, privacyHtml, termsHtml];
    for (const page of pages) {
      expect(page).toMatch(/<html lang="en">/);
      expect(page).toMatch(/<title>[^<]+ — Headset Cue Check|<title>Headset Cue Check — [^<]+/);
      expect(page).toMatch(/rel="canonical"/);
      expect(page).toMatch(/property="og:image"/);
      expect(page).toMatch(/name="twitter:card"/);
      expect(page).toMatch(/rel="apple-touch-icon"/);
    }
    expect(notFoundHtml).toContain('<meta name="robots" content="noindex"');
    expect(notFoundHtml).toContain('<title>Page not found — Headset Cue Check</title>');
  });

  it('configures CSP, frame protection, manifest MIME, immutable assets, and no-cache updates', () => {
    const config = JSON.parse(hostConfigText) as {
      routes: { route: string; headers: Record<string, string> }[];
      globalHeaders: Record<string, string>;
      mimeTypes: Record<string, string>;
      responseOverrides: Record<string, { statusCode: number }>;
    };
    expect(config.globalHeaders['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    expect(config.routes.find(route => route.route === '/assets/*')?.headers['Cache-Control']).toContain('immutable');
    expect(config.routes.find(route => route.route === '/sw.js')?.headers['Cache-Control']).toContain('no-store');
    expect(config.responseOverrides['404'].statusCode).toBe(404);
    expect(indexHtml).not.toMatch(/\sstyle=/);
  });

  it('keeps the PWA install and offline assets versioned', () => {
    const manifest = JSON.parse(manifestText) as { start_url: string; display: string; icons: { sizes: string; purpose: string }[] };
    expect(manifest.start_url).toMatch(/\?source=installed-v\d+/);
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some(icon => icon.sizes === '192x192')).toBe(true);
    expect(manifest.icons.some(icon => icon.sizes === '512x512' && icon.purpose.includes('maskable'))).toBe(true);
    expect(serviceWorkerText).toContain("const VERSION = 'hcc-shell-v3'");
    expect(serviceWorkerText).toContain("'/offline.css'");
  });
});

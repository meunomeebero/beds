import react from '@vitejs/plugin-react';
import { mkdtemp, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { renderToStaticMarkup } from 'react-dom/server';
import * as React from 'react';
import { createServer, type Plugin, type ViteDevServer } from 'vite';
import { expect, test } from '@playwright/test';

type Theme = 'light' | 'dark';

type Slide = {
  title: string;
  description: string;
};

const repositoryRoot = fileURLToPath(new URL('../../../../', import.meta.url));
const longDescription = 'Conteúdo editorial deliberadamente longo para validar quebra, leitura contínua e contenção sem deslocar o viewport. '.repeat(3);

function cssStub(): Plugin {
  const cssModules = new Set<string>();
  return {
    name: 'ber41-css-stub',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('.css')) return null;
      const resolved = importer ? resolve(dirname(importer), source) : source;
      const id = `\0ber41-css:${cssModules.size}`;
      cssModules.add(id);
      void resolved;
      return id;
    },
    load(id) {
      return cssModules.has(id) ? 'export default {};' : null;
    },
  };
}

async function renderPagedCarousel(slides: Slide[], theme: Theme) {
  const cacheDir = await mkdtemp(join(tmpdir(), 'ber41-vite-'));
  let server: ViteDevServer | undefined;
  try {
    server = await createServer({
      configFile: false,
      root: repositoryRoot,
      cacheDir,
      plugins: [react(), cssStub()],
    });
    const beds = await server.ssrLoadModule('/packages/beds/src/index.ts') as {
      DesignSystemProvider: React.ComponentType<{ theme: Theme; brandColor?: string; children?: React.ReactNode }>;
      PagedCarousel: React.ComponentType<{
        label: string;
        previousLabel: string;
        nextLabel: string;
        slideLabel: (state: { index: number; count: number }) => string;
        children?: React.ReactNode;
      }>;
    };
    const children = slides.map((slide, index) => React.createElement('article', { key: `${slide.title}-${index}` },
      React.createElement('h2', null, slide.title),
      React.createElement('p', null, slide.description),
    ));
    return renderToStaticMarkup(
      React.createElement(beds.DesignSystemProvider, { theme, brandColor: '#ffa133' },
        React.createElement(beds.PagedCarousel, {
          label: 'BER-41 PagedCarousel',
          previousLabel: 'Anterior',
          nextLabel: 'Próxima',
          slideLabel: ({ index, count }) => `Etapa ${index} de ${count}`,
        }, ...children),
      ),
    );
  } finally {
    await server?.close();
    await rm(cacheDir, { recursive: true, force: true });
  }
}

function occurrences(markup: string, pattern: RegExp) {
  return markup.match(pattern)?.length ?? 0;
}

for (const theme of ['light', 'dark'] as const) {
  for (const fixture of [
    { name: 'zero slides', slides: [] as Slide[] },
    { name: 'one slide', slides: [{ title: 'Um único slide', description: longDescription }] },
  ]) {
    test(`SSR PagedCarousel ${fixture.name} is static and non-tabbable in ${theme}`, async () => {
      const markup = await renderPagedCarousel(fixture.slides, theme);
      expect(markup).not.toMatch(/tabindex="0"/);
      expect(markup).not.toContain('aria-live=');
      expect(occurrences(markup, /es-paged-carousel-control/g)).toBe(0);
      expect(occurrences(markup, /aria-roledescription="slide"/g)).toBe(fixture.slides.length);
      expect(occurrences(markup, /aria-current="true"/g)).toBe(fixture.slides.length === 1 ? 1 : 0);
      expect(occurrences(markup, /tabindex="0"/g)).toBe(0);
    });
  }

  test(`SSR PagedCarousel 2+ remains interactive in ${theme}`, async () => {
    const markup = await renderPagedCarousel([
      { title: 'Primeiro slide', description: 'Conteúdo inicial.' },
      { title: 'Segundo slide', description: 'Conteúdo intermediário.' },
      { title: 'Terceiro slide', description: 'Conteúdo final.' },
    ], theme);
    expect(markup).toMatch(/tabindex="0"/);
    expect(markup).toContain('aria-live="polite"');
    expect(occurrences(markup, /class="es-paged-carousel-control"/g)).toBe(2);
    expect(occurrences(markup, /aria-roledescription="slide"/g)).toBe(3);
    expect(occurrences(markup, /aria-current="true"/g)).toBe(1);
  });
}

test('browser PagedCarousel 2+ preserves initiator focus, RTL visual order and drag snap', async ({ page }) => {
  await page.goto('/?view=paged-carousel&theme=light');
  await page.addStyleTag({ content: '.es-root { direction: rtl; }' });
  const carousel = page.getByRole('region', { name: 'Etapas de introdução', exact: true });
  const previous = page.getByRole('button', { name: 'Etapa anterior', exact: true });
  const next = page.getByRole('button', { name: 'Próxima etapa', exact: true });
  const previousBox = await previous.boundingBox();
  const nextBox = await next.boundingBox();
  expect(previousBox).not.toBeNull();
  expect(nextBox).not.toBeNull();
  expect(previousBox!.x).toBeGreaterThan(nextBox!.x);
  await next.click();
  await expect(next).toBeFocused();
  await expect(page.getByRole('group', { name: 'Etapa 2 de 3' })).toHaveAttribute('aria-current', 'true');
  await carousel.focus();
  await carousel.press('ArrowLeft');
  await expect(carousel).toBeFocused();
  await expect(page.getByRole('group', { name: 'Etapa 3 de 3' })).toHaveAttribute('aria-current', 'true');
  await carousel.press('ArrowRight');
  await expect(carousel).toBeFocused();
  await expect(page.getByRole('group', { name: 'Etapa 2 de 3' })).toHaveAttribute('aria-current', 'true');

  await page.goto('/?view=paged-carousel&theme=light');
  const viewport = page.locator('.es-paged-carousel-viewport');
  const viewportBox = await viewport.boundingBox();
  expect(viewportBox).not.toBeNull();
  await page.mouse.move(viewportBox!.x + viewportBox!.width * .8, viewportBox!.y + viewportBox!.height / 2);
  await page.mouse.down();
  await page.mouse.move(viewportBox!.x + viewportBox!.width * .2, viewportBox!.y + viewportBox!.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(page.getByRole('group', { name: 'Etapa 2 de 3' })).toHaveAttribute('aria-current', 'true');
});

test('browser Carousel keeps underfilled content static and exposes one AX/Tab copy', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/data-patterns.html?theme=dark');
  const staticCarousel = page.getByRole('region', { name: 'Carrossel sem excedente', exact: true });
  await expect(staticCarousel).toHaveAttribute('tabindex', '-1');
  await expect(staticCarousel.locator('..')).toHaveAttribute('data-playback', 'static');
  await expect(staticCarousel.locator('.es-carousel-copy')).toHaveCount(1);
  await expect(staticCarousel.getByRole('button')).toHaveCount(0);

  const carousel = page.getByRole('region', { name: 'Carrossel de exemplos', exact: true });
  await expect(carousel.locator('.es-carousel-copy:not([aria-hidden="true"])')).toHaveCount(1);
  await expect(carousel.getByRole('button', { name: /^Marcar / })).toHaveCount(5);
  const action = carousel.getByRole('button', { name: 'Marcar Primeiro cartão de exemplo', exact: true });
  await action.click();
  await expect(action).toBeFocused();
});

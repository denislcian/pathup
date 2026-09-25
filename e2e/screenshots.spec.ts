import { expect, test, type Page } from '@playwright/test';

/**
 * README screenshots, taken from the demo on the production build. Skipped in normal runs:
 *   SCREENSHOTS=1 npx playwright test screenshots
 * They land in docs/screenshots/.
 */
test.skip(!process.env.SCREENSHOTS, 'Only when regenerating the README screenshots');

const OUT = 'docs/screenshots';

async function enterDemo(page: Page) {
  await page.goto('/bienvenida');
  await page.getByRole('button', { name: 'Probar sin cuenta' }).first().click();
  await expect(page.getByRole('heading', { name: 'Hola, Marcos' })).toBeVisible();
}

async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
  // Charts measure themselves after the first frame.
  await page.waitForTimeout(600);
}

test('desktop screens', async ({ page }, info) => {
  test.skip(info.project.name !== 'escritorio');
  await page.setViewportSize({ width: 1280, height: 800 });

  await page.goto('/bienvenida');
  await settle(page);
  await page.screenshot({ path: `${OUT}/landing.png` });

  await enterDemo(page);
  await settle(page);
  await page.screenshot({ path: `${OUT}/hoy.png` });

  await page
    .getByRole('button', { name: /^Empezar la sesión/ })
    .first()
    .click();
  await expect(page.getByText('Torso / Pierna · Semana 8 · Apretar')).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/registro.png` });
  await page.getByRole('button', { name: 'Descartar' }).click();
  await page.getByRole('button', { name: 'Descartar' }).last().click();

  await page.goto('/progreso');
  await expect(page.getByRole('heading', { name: 'Tus récords' })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/progreso.png` });

  await page.goto('/ejercicios/press-banca-barra');
  await expect(page.getByRole('heading', { name: 'Tu progreso' })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/ejercicio.png`, fullPage: true });

  await page.goto('/bienestar');
  await expect(page.getByRole('heading', { name: 'Preparación de hoy' })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/bienestar.png` });

  await page.goto('/programas');
  await expect(page.getByText('Recomendado para ti')).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/programas.png` });
});

test('phone screens', async ({ page }, info) => {
  test.skip(info.project.name !== 'movil');

  await enterDemo(page);
  await settle(page);
  await page.screenshot({ path: `${OUT}/movil-hoy.png` });

  await page
    .getByRole('button', { name: /^Empezar la sesión/ })
    .first()
    .click();
  await expect(page.getByText('Torso / Pierna · Semana 8 · Apretar')).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/movil-registro.png` });
  await page.getByRole('button', { name: 'Descartar' }).click();
  await page.getByRole('button', { name: 'Descartar' }).last().click();

  await page.goto('/ejercicios');
  await expect(page.getByRole('searchbox', { name: 'Buscar ejercicio' })).toBeVisible();
  await settle(page);
  await page.screenshot({ path: `${OUT}/movil-biblioteca.png` });
});

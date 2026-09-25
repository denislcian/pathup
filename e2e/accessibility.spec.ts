import { AxeBuilder } from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/**
 * Automated WCAG 2.2 AA audit (axe-core) of the main screens, on the production build and in the
 * demo so the signed-in screens have data. It does not replace trying the app with a screen
 * reader, but it catches contrast, names, roles and structure on every push.
 */

async function enterDemo(page: Page) {
  await page.goto('/bienvenida');
  await page.getByRole('button', { name: 'Probar sin cuenta' }).first().click();
  await expect(page.getByRole('heading', { name: 'Hola, Marcos' })).toBeVisible();
}

async function audit(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  // Readable in the report: which rule, how serious and where.
  const violations = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.slice(0, 3).map((node) => node.target.join(' ')),
  }));
  expect(violations).toEqual([]);
}

test('landing', async ({ page }) => {
  await page.goto('/bienvenida');
  await expect(page.getByRole('heading', { name: /Tu camino/ })).toBeVisible();
  await audit(page);
});

test('sign up', async ({ page }) => {
  await page.goto('/registro');
  await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
  await audit(page);
});

test.describe('signed-in screens, in the demo', () => {
  test.beforeEach(async ({ page }) => {
    await enterDemo(page);
  });

  test('today', async ({ page }) => {
    await audit(page);
  });

  test('workout logger', async ({ page }) => {
    await page
      .getByRole('button', { name: /^Empezar la sesión/ })
      .first()
      .click();
    await expect(page.getByText('Torso / Pierna · Semana 8 · Apretar')).toBeVisible();
    await audit(page);
  });

  test('exercise library', async ({ page }) => {
    await page.goto('/ejercicios');
    await expect(page.getByRole('searchbox', { name: 'Buscar ejercicio' })).toBeVisible();
    await audit(page);
  });

  for (const [name, path, heading] of [
    ['progress', '/progreso', 'Tus récords'],
    ['wellness', '/bienestar', 'Preparación de hoy'],
    ['exercise', '/ejercicios/press-banca-barra', 'Claves de técnica'],
    ['programmes', '/programas', 'Programas'],
    ['profile', '/perfil', 'Marcos'],
    ['history', '/historial/demo-w6-0', 'Torso A'],
  ] as const) {
    test(name, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
      await audit(page);
    });
  }
});

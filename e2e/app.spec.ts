import { expect, test, type Page } from '@playwright/test';

/** Errors React or the page throw: a hydration mismatch, a crash, an unhandled rejection. */
function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    // The service worker cannot register over plain http in some browsers; that is not our bug.
    if (message.type() === 'error' && !message.text().includes('ServiceWorker')) {
      errors.push(message.text());
    }
  });
  return errors;
}

async function enterDemo(page: Page) {
  await page.goto('/bienvenida');
  await page.getByRole('button', { name: 'Probar sin cuenta' }).first().click();
  await expect(page.getByRole('heading', { name: 'Hola, Marcos' })).toBeVisible();
}

test.describe('landing', () => {
  test('is pre-rendered and hydrates without errors', async ({ page }) => {
    const errors = collectErrors(page);

    // Search engines and link previews get the real content in the HTML itself.
    const response = await page.request.get('/bienvenida');
    expect(await response.text()).toContain('Tu camino,');

    await page.goto('/bienvenida');
    await expect(page.getByRole('heading', { name: /Tu camino/ })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Probar sin cuenta' }).first()).toBeEnabled();
    await page.waitForLoadState('networkidle');

    expect(errors).toEqual([]);
  });

  test.describe('in an English browser', () => {
    test.use({ locale: 'en-US' });

    test('hydrates the Spanish HTML and then switches to English', async ({ page }) => {
      const errors = collectErrors(page);

      // The HTML is Spanish whatever language the build machine speaks (the CI runner speaks English).
      const response = await page.request.get('/bienvenida');
      expect(await response.text()).toContain('Tu camino,');

      await page.goto('/bienvenida');
      await expect(page.getByRole('heading', { name: /Your path/ })).toBeVisible();
      await expect(page.locator('html')).toHaveAttribute('lang', 'en');
      await page.waitForLoadState('networkidle');

      expect(errors).toEqual([]);
    });
  });

  test('sends a visitor to sign up', async ({ page }) => {
    await page.goto('/bienvenida');
    await page.getByRole('button', { name: 'Empezar gratis' }).first().click();
    await expect(page.getByRole('heading', { name: 'Crea tu cuenta' })).toBeVisible();
  });
});

test.describe('deep links', () => {
  test('open an exercise, a workout and a programme directly, as after a reload', async ({
    page,
  }) => {
    await page.goto('/bienvenida');
    await page.getByRole('button', { name: 'Probar sin cuenta' }).first().click();
    await expect(page.getByRole('heading', { name: 'Hola, Marcos' })).toBeVisible();

    await page.goto('/ejercicios/press-banca-barra');
    await expect(page.getByRole('heading', { name: 'Claves de técnica' })).toBeVisible();

    await page.goto('/programas/torso-pierna');
    await expect(page.getByRole('heading', { name: 'Por qué funciona' })).toBeVisible();

    // Last week's Monday session always exists in the demo, whatever day it is today.
    await page.goto('/historial/demo-w6-0');
    await expect(page.getByRole('heading', { name: 'Torso A' }).first()).toBeVisible();
  });
});

test.describe('demo without an account', () => {
  test('trains a full session of the programme', async ({ page }) => {
    const errors = collectErrors(page);
    await enterDemo(page);

    await page
      .getByRole('button', { name: /^Empezar la sesión/ })
      .first()
      .click();
    await expect(page.getByText('Torso / Pierna · Semana 8 · Apretar')).toBeVisible();

    // First set of the first exercise: type it, tick it and see the rest timer start.
    const weight = page.getByLabel(/^Peso en kilos, serie 1 de/).first();
    await weight.fill('60');
    await page
      .getByLabel(/^Repeticiones, serie 1 de/)
      .first()
      .fill('6');
    await page
      .getByRole('checkbox', { name: /^Marcar como hecha la serie 1 de/ })
      .first()
      .click();
    await expect(page.getByRole('timer', { name: 'Descanso' })).toBeVisible();

    await page.getByRole('button', { name: 'Terminar' }).click();
    await expect(page.getByRole('heading', { name: 'Entreno guardado' }).first()).toBeVisible();
    await expect(page.getByText('Guardado en tu cuenta')).toBeVisible();

    expect(errors).toEqual([]);
  });

  test('finds an exercise and shows what it works', async ({ page }) => {
    await enterDemo(page);

    await page.goto('/ejercicios');
    await page.getByRole('searchbox', { name: 'Buscar ejercicio' }).fill('banca');
    await page.getByRole('link', { name: /^Press banca con barra/ }).click();

    await expect(page.getByRole('heading', { name: 'Claves de técnica' })).toBeVisible();
    await expect(page.getByRole('img', { name: /^Músculos principales: Pecho/ })).toBeVisible();
    // The demo has eight weeks of bench press, so the progress chart is there too.
    await expect(page.getByRole('heading', { name: 'Tu progreso' })).toBeVisible();
  });

  test('does the check-in and leaves without a trace', async ({ page }) => {
    await enterDemo(page);

    await page.goto('/bienestar');
    await expect(page.getByRole('heading', { name: 'Preparación de hoy' })).toBeVisible();

    await page.goto('/');
    await page.getByRole('button', { name: 'Salir de la demo' }).first().click();
    await expect(page.getByRole('heading', { name: /Tu camino/ })).toBeVisible();

    // A reload does not bring the demo back.
    await page.reload();
    await expect(page.getByRole('heading', { name: /Tu camino/ })).toBeVisible();
  });
});

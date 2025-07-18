import { test, expect } from '@playwright/test';

test.describe('Loan Calculator Modal UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
  });

  test('TC01: Calculator modal should be visible', async ({ page }) => {
    await test.step('Verify calculator modal and fields', async () => {
      await expect.soft(page.getByText('Vali sobiv summa ja periood')).toBeVisible();
      await expect.soft(page.getByTestId('bb-overlay').getByText('Laenusumma')).toBeVisible();
      await expect.soft(page.getByText('Periood', { exact: true })).toBeVisible();
      await expect.soft(page.getByTestId('bb-labeled-value__label')).toBeVisible();
      await expect.soft(page.getByRole('button', { name: 'JÄTKA' })).toBeVisible();
    });
  });

  test('TC03-A: User fills amount and period fields', async ({ page }) => {
    await test.step('Fill loan amount and period inputs', async () => {
      await page.getByRole('textbox', { name: 'Laenusumma' }).click();
      await page.getByRole('textbox', { name: 'Laenusumma' }).fill('8000');
      await page.getByRole('textbox', { name: 'Periood' }).click();
      await page.getByRole('textbox', { name: 'Periood' }).fill('50');
    });

    await test.step('Verify calculated monthly payment', async () => {
      await expect.soft(page.getByTestId('bb-labeled-value__value')).toBeVisible();
      await expect.soft(page.getByTestId('bb-labeled-value__value')).toContainText('€220.52');
    });
  });

  test('TC02: Click "JÄTKA" and verify main page updates', async ({ page }) => {
    await test.step('Fill loan amount and period', async () => {
      await page.getByRole('textbox', { name: 'Laenusumma' }).fill('8000');
      await page.getByRole('textbox', { name: 'Periood' }).fill('50');
    });

    await test.step('Click "JÄTKA"', async () => {
      await page.getByRole('button', { name: 'JÄTKA' }).click();
    });

    await test.step('Verify loan amount summary is updated on main page', async () => {
      await expect.soft(page.getByRole('button', { name: 'Laenusumma 8000 €' })).toBeVisible();
    });
  });

  test('TC03-B: Interact with the sliders', async ({ page }) => {
    await test.step('Click sliders inside modal', async () => {
      await page.locator('#header-calculator-amount').getByRole('slider').locator('div').click();
      await page.locator('.vue-slider-background').first().click();
      await page.locator('#header-calculator-period').getByRole('slider').locator('div').click();
    });
    await test.step('Verify calculated monthly payment', async () => {
      await expect.soft(page.getByTestId('bb-labeled-value__value')).toBeVisible();
      await expect.soft(page.getByTestId('bb-labeled-value__value')).toContainText('€367.43');

    });
  });

  test('TC05: Close modal and verify no changes occurred', async ({ page }) => {
    await test.step('Close modal', async () => {
      await page.getByRole('button', { name: 'Close modal' }).click();
    });

    await test.step('Check that previous loan amount selection is still visible', async () => {
      await expect.soft(page.getByRole('button', { name: 'Laenusumma 5000 €' })).toBeVisible();
    });
  });
});

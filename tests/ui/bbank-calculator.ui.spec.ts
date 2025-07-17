import { test, expect } from '@playwright/test';

test('Calculator modal interaction test', async ({ page }) => {
  await test.step('Navigate to loan application page', async () => {
    await page.goto('');
  });

  await test.step('Check that calculator modal is visible', async () => {
    await expect.soft(page.getByText('Vali sobiv summa ja periood')).toBeVisible();
    await expect.soft(page.getByTestId('bb-overlay').getByText('Laenusumma')).toBeVisible();
    await expect.soft(page.getByText('Periood', { exact: true })).toBeVisible();
    await expect.soft(page.getByTestId('bb-labeled-value__label')).toBeVisible();
    await expect.soft(page.getByRole('button', { name: 'JÄTKA' })).toBeVisible();
  });

  await test.step('Fill loan amount and period', async () => {
    await page.getByRole('textbox', { name: 'Laenusumma' }).click();
    await page.getByRole('textbox', { name: 'Laenusumma' }).fill('8000');
    await page.getByRole('textbox', { name: 'Periood' }).click();
    await page.getByRole('textbox', { name: 'Periood' }).fill('50');
    await expect.soft(page.getByTestId('bb-labeled-value__value')).toBeVisible();
    await expect.soft(page.getByTestId('bb-labeled-value__value')).toContainText('€220.52');
  });

  await test.step('Click "JÄTKA" to close modal and verify main page updates', async () => {
    await page.getByRole('button', { name: 'JÄTKA' }).click();
    await expect.soft(page.getByRole('button', { name: 'Laenusumma 8000 €' })).toBeVisible();
  });

  await test.step('Open modal again and interact with sliders', async () => {
    await page.getByRole('button', { name: 'Laenusumma 8000 €' }).click();
    await page.locator('#header-calculator-amount').getByRole('slider').locator('div').click();
    await page.locator('#header-calculator-amount').getByRole('slider').locator('div').click();
    await page.locator('.vue-slider-background').first().click();
  });

  await test.step('Close modal and verify there are no changes', async () => {
    await page.getByRole('button', { name: 'Close modal' }).click();
    await expect.soft(page.getByRole('button', { name: 'Laenusumma 8000 €' })).toBeVisible();
  });
});
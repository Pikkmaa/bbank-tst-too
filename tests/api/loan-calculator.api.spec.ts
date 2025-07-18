import { test, expect, request } from '@playwright/test';

const BASE_URL = 'https://taotlus.bigbank.ee/api/v1/loan/calculate';
const COMMON_HEADERS = {
  'Content-Type': 'application/json'
};

const defaultPayload = {
  currency: 'EUR',
  productType: 'SMALL_LOAN_EE01',
  maturity: 60,
  administrationFee: 3.99,
  conclusionFee: 100,
  amount: 5000,
  monthlyPaymentDay: 15,
  interestRate: 14.9
};

test.describe('Loan Calculator API', () => {

  test('Valid payload returns correct monthlyPayment and APR', async ({ request }) => {
    const response = await request.post(BASE_URL, {
      headers: COMMON_HEADERS,
      data: defaultPayload
    });

    expect(response.ok()).toBeTruthy();
    const body = await response.json();

    expect(body.monthlyPayment).toBeCloseTo(123.2, 1);
    expect(body.apr).toBeCloseTo(19.03, 2);
    expect(body.totalRepayableAmount).toBeGreaterThan(7000);
  });

  test('Missing required field returns 400', async ({ request }) => {
    const { amount, ...payloadWithoutAmount } = defaultPayload;
    const response = await request.post(BASE_URL, {
      headers: COMMON_HEADERS,
      data: payloadWithoutAmount
    });

    expect(response.status()).toBe(400);
  });

  test('Zero amount returns error or edge-case handling', async ({ request }) => {
    const payload = { ...defaultPayload, amount: 0 };
    const response = await request.post(BASE_URL, {
      headers: COMMON_HEADERS,
      data: payload
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('Negative interest rate returns error', async ({ request }) => {
    const payload = { ...defaultPayload, interestRate: -5 };
    const response = await request.post(BASE_URL, {
      headers: COMMON_HEADERS,
      data: payload
    });

    expect(response.status()).toBe(400);
  });

  test('Different maturity periods return correct responses', async ({ request }) => {
    const periods = [12, 24, 36, 60];

    for (const period of periods) {
      const payload = { ...defaultPayload, maturity: period };
      const response = await request.post(BASE_URL, {
        headers: COMMON_HEADERS,
        data: payload
      });

      expect(response.ok()).toBeTruthy();
      const body = await response.json();

      expect(body.monthlyPayment).toBeGreaterThan(0);
      expect(body.apr).toBeGreaterThan(0);
    }
  });
});
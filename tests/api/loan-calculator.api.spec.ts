import { test, expect } from '@playwright/test';

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

async function sendAndAttach(request, payload, info, title) {
  const response = await request.post(BASE_URL, {
    headers: COMMON_HEADERS,
    data: payload
  });

  await info.attach(`${title} - Request`, {
    contentType: 'application/json',
    body: JSON.stringify(payload, null, 2),
  });

  const responseBody = await response.json().catch(() => ({}));

  await info.attach(`${title} - Response`, {
    contentType: 'application/json',
    body: JSON.stringify(responseBody, null, 2),
  });

  return { response, body: responseBody };
}

test.describe('Loan Calculator API', () => {
  test('Valid payload returns correct monthlyPayment and APR', async ({ request }, testInfo) => {
    const { response, body } = await test.step('Send request and attach data', async () => {
      return await sendAndAttach(request, defaultPayload, testInfo, 'Valid payload');
    });

    await test.step('Verify response values', async () => {
      expect(response.ok()).toBeTruthy();
      expect(body.monthlyPayment).toBeCloseTo(123.2, 1);
      expect(body.apr).toBeCloseTo(19.03, 2);
      expect(body.totalRepayableAmount).toBeGreaterThan(7000);
    });
  });

  test('Missing required field returns 400', async ({ request }, testInfo) => {
    const { amount, ...payloadWithoutAmount } = defaultPayload;

    const { response } = await test.step('Send request without amount', async () => {
      return await sendAndAttach(request, payloadWithoutAmount, testInfo, 'Missing amount');
    });

    await test.step('Verify status is 400', async () => {
      expect(response.status()).toBe(400);
    });
  });

  test('Zero amount returns 500 and error', async ({ request }, testInfo) => {
    const payload = { ...defaultPayload, amount: 0 };

    const { response, body } = await test.step('Send request with zero amount', async () => {
      return await sendAndAttach(request, payload, testInfo, 'Zero amount');
    });

    await test.step('Assert error response structure and message', async () => {
      expect(response.status()).toBe(500);
      expect(body).toHaveProperty('error');
      expect(body.error).toMatchObject({
        code: 500,
        message: 'Well, we did not see this one coming',
      });
    });
  });

  test('Different maturity periods return correct responses', async ({ request }, testInfo) => {
    const periods = [12, 24, 36, 60];

    for (const period of periods) {
      await test.step(`Test maturity period: ${period}`, async () => {
        const payload = { ...defaultPayload, maturity: period };
        const { response, body } = await sendAndAttach(request, payload, testInfo, `Maturity ${period}`);
        expect(response.ok()).toBeTruthy();
        expect(body.monthlyPayment).toBeGreaterThan(0);
        expect(body.apr).toBeGreaterThan(0);
      });
    }
  });

  test('Amount under 500 returns 500 error', async ({ request }, testInfo) => {
    const payload = { ...defaultPayload, amount: 499 };

    const { response, body } = await test.step('Send request with amount under 500', async () => {
      return await sendAndAttach(request, payload, testInfo, 'Amount under 500');
    });

    await test.step('Verify error 500 with message', async () => {
      expect(response.status()).toBe(500);
      expect(body.error).toMatchObject({
        code: 500,
        message: 'Well, we did not see this one coming',
      });
    });
  });

  test('Amount over 30000 returns 500 error', async ({ request }, testInfo) => {
    const payload = { ...defaultPayload, amount: 30001 };

    const { response, body } = await test.step('Send request with amount over 30000', async () => {
      return await sendAndAttach(request, payload, testInfo, 'Amount over 30000');
    });

    await test.step('Verify error 500 with message', async () => {
      expect(response.status()).toBe(500);
      expect(body.error).toMatchObject({
        code: 500,
        message: 'Well, we did not see this one coming',
      });
    });
  });

  test('Negative maturity returns 500 error', async ({ request }, testInfo) => {
    const payload = { ...defaultPayload, maturity: -12 };

    const { response, body } = await test.step('Send request with negative maturity', async () => {
      return await sendAndAttach(request, payload, testInfo, 'Negative maturity');
    });

    await test.step('Verify error 500 with message', async () => {
      expect(response.status()).toBe(500);
      expect(body.error).toMatchObject({
        code: 500,
        message: 'Well, we did not see this one coming',
      });
    });
  });

  test('Negative amount returns 500 error', async ({ request }, testInfo) => {
    const payload = { ...defaultPayload, amount: -1000 };

    const { response, body } = await test.step('Send request with negative amount', async () => {
      return await sendAndAttach(request, payload, testInfo, 'Negative amount');
    });

    await test.step('Verify error 500 with message', async () => {
      expect(response.status()).toBe(500);
      expect(body.error).toMatchObject({
        code: 500,
        message: 'Well, we did not see this one coming',
      });
    });
  });

});

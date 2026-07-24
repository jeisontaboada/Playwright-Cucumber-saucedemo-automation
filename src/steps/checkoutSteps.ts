import { When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';
import { extractPrice } from '../utils/priceUtils';

// ─── When ───────────────────────────────────────────────────────────────────
When('el usuario procede al checkout', async function (this: CustomWorld) {
  await this.cartPage.proceedToCheckout();
});

When(
  'el usuario completa la información del checkout con:',
  async function (this: CustomWorld, dataTable: DataTable) {
    const data = dataTable.hashes()[0] as {
      firstName: string;
      lastName: string;
      postalCode: string;
    };
    await this.checkoutPage.fillCheckoutInformation(data.firstName, data.lastName, data.postalCode);
  },
);

When('el usuario continúa al resumen del checkout', async function (this: CustomWorld) {
  await this.checkoutPage.clickContinue();
});

When('el usuario finaliza la compra', async function (this: CustomWorld) {
  await this.checkoutPage.clickFinish();
  await this.checkoutPage.waitForOrderComplete();
});

When('el usuario cancela el checkout', async function (this: CustomWorld) {
  await this.checkoutPage.clickCancel();
});

When(
  'el usuario ingresa el nombre {string} en checkout',
  async function (this: CustomWorld, firstName: string) {
    if (firstName) await this.checkoutPage.enterFirstName(firstName); // string vacío es falsy — si firstName="" no llena el campo (ES-010)
  },
);

// ─── Then ───────────────────────────────────────────────────────────────────
Then('el usuario debería ver el resumen de la orden', async function (this: CustomWorld) {
  // waitForCheckoutSummary garantiza visibilidad; no hace falta isVisible adicional
  await this.checkoutPage.waitForCheckoutSummary();
});

Then(
  'el producto {string} debería estar en el resumen',
  async function (this: CustomWorld, productName: string) {
    const products = await this.checkoutPage.getSummaryProductNames();
    expect(products).toContain(productName);
  },
);

Then('el usuario debería ver la confirmación de la orden', async function (this: CustomWorld) {
  // waitForOrderComplete garantiza visibilidad; no hace falta isOrderComplete adicional
  await this.checkoutPage.waitForOrderComplete();
});

Then(
  'el mensaje de confirmación debería contener {string}',
  async function (this: CustomWorld, expectedText: string) {
    const header = await this.checkoutPage.getCompleteHeader();
    expect(header.toLowerCase()).toContain(expectedText.toLowerCase());
  },
);

// Nota: los steps de "el usuario debería ver un mensaje de error" y
// "el mensaje de error debería contener" están definidos en loginSteps.ts
// usando un selector genérico [data-test="error"] válido para toda la app.

Then(
  'el subtotal debería ser mayor a {float}',
  async function (this: CustomWorld, minValue: number) {
    const subtotalText = await this.checkoutPage.getSubtotal();
    const subtotal = extractPrice(subtotalText);
    expect(subtotal).toBeGreaterThan(minValue);
  },
);

Then(
  'el impuesto debería ser mayor a {float}',
  async function (this: CustomWorld, minValue: number) {
    const taxText = await this.checkoutPage.getTax();
    const tax = extractPrice(taxText);
    expect(tax).toBeGreaterThan(minValue);
  },
);

Then('el total debería ser igual al subtotal más el impuesto', async function (this: CustomWorld) {
  const subtotalText = await this.checkoutPage.getSubtotal();
  const taxText = await this.checkoutPage.getTax();
  const totalText = await this.checkoutPage.getTotal();

  const subtotal = extractPrice(subtotalText);
  const tax = extractPrice(taxText);
  const total = extractPrice(totalText); // toBeCloseTo y no toBe — floating point: 0.1+0.2 ≠ 0.3 en JS

  // Verifica la fórmula exacta: total = subtotal + tax (tolerancia de 1 centavo por redondeo)
  expect(total).toBeCloseTo(subtotal + tax, 2);
});

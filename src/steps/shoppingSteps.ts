import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// ─── When ───────────────────────────────────────────────────────────────────

When(
  'el usuario agrega el producto {string} al carrito',
  async function (this: CustomWorld, productName: string) {
    await this.productsPage.addProductToCart(productName);
    this.lastAddedProduct = productName; // guardado en World para que el siguiente step pueda verificar el botón sin parámetro extra
  },
);

When('el usuario navega al carrito', async function (this: CustomWorld) {
  await this.productsPage.goToCart();
  await this.cartPage.waitForCartPage();
});

When(
  'el usuario remueve el producto {string} del carrito',
  async function (this: CustomWorld, productName: string) {
    await this.cartPage.removeProductFromCart(productName);
  },
);

When(
  'el usuario hace click en {string}',
  async function (this: CustomWorld, buttonText: string) {
    if (buttonText === 'Continue Shopping') {
      await this.cartPage.continueShopping();
    } else {
      throw new Error(`Botón "${buttonText}" no implementado`);
    }
  },
);

// ─── Then ───────────────────────────────────────────────────────────────────

Then(
  'el contador del carrito debería mostrar {int}', // {int} convierte automáticamente a number — no hace falta parseInt
  async function (this: CustomWorld, expectedCount: number) {
    const actualCount = await this.productsPage.getCartItemCount();
    expect(actualCount).toBe(expectedCount);
  },
);

Then(
  'el botón del producto debería cambiar a {string}',
  async function (this: CustomWorld, expectedText: string) {
    if (!this.lastAddedProduct) {
      throw new Error(
        'No se registró ningún producto agregado al carrito en este escenario',
      );
    }
    const buttonText = await this.productsPage.getProductActionButtonText(
      this.lastAddedProduct,
    );
    expect(buttonText.trim().toLowerCase()).toBe(expectedText.toLowerCase());
  },
);

Then(
  'el producto {string} debería estar visible en el carrito',
  async function (this: CustomWorld, productName: string) {
    const isInCart = await this.cartPage.isProductInCart(productName);
    expect(isInCart).toBeTruthy();
  },
);

Then('el carrito debería estar vacío', async function (this: CustomWorld) {
  const isEmpty = await this.cartPage.isCartEmpty();
  expect(isEmpty).toBeTruthy();
});

Then(
  'el contador del carrito no debería ser visible',
  async function (this: CustomWorld) {
    const count = await this.productsPage.getCartItemCount();
    expect(count).toBe(0);
  },
);

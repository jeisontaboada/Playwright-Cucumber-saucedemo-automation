import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../support/world';

// ─── Given ───────────────────────────────────────────────────────────────────

Given('el usuario está en la página de login', async function (this: CustomWorld) {
  await this.loginPage.navigateToLogin();
});

// ─── When ───────────────────────────────────────────────────────────────────

When('el usuario ingresa credenciales válidas de usuario estándar', async function (this: CustomWorld) {
  await this.loginPage.login(process.env.STANDARD_USER!, process.env.PASSWORD!); // ! = sabemos que están en .env; si faltan, falla aquí y no silenciosamente
});

When('el usuario ingresa credenciales de usuario bloqueado', async function (this: CustomWorld) {
  await this.loginPage.login(process.env.LOCKED_USER!, process.env.PASSWORD!);
});

When('el usuario ingresa credenciales inválidas', async function (this: CustomWorld) {
  await this.loginPage.login(
    process.env.INVALID_USER  || 'invalid_user',       // || fallback: cualquier user inválido sirve
    process.env.INVALID_PASSWORD || 'wrong_password',  // || fallback: cualquier password inválido sirve
  );
});

When('el usuario cierra sesión', async function (this: CustomWorld) {
  await this.productsPage.logout();
});

When('el usuario hace click en login sin ingresar credenciales', async function (this: CustomWorld) {
  await this.loginPage.clickLoginButton();
});

// ─── Then ───────────────────────────────────────────────────────────────────

// Usado en Then (escenarios): verificación de resultado
Then('el usuario debería ver la página de productos', async function (this: CustomWorld) {
  await this.productsPage.waitForProductsPage();
});

// Usado en Background (precondición): confirma que el estado inicial está listo
Given('el usuario está en la página de productos', async function (this: CustomWorld) {
  await this.productsPage.waitForProductsPage();
});

Then('el usuario debería estar en la página de login', async function (this: CustomWorld) {
  // waitForLoginPage lanza error si el botón no aparece en el timeout — no hace falta isVisible adicional
  await this.loginPage.waitForLoginPage();
});

Then('el título de la página debería ser {string}', async function (this: CustomWorld, expectedTitle: string) {
  // .title es el selector compartido en todas las páginas de SauceDemo
  const titleLocator = this.page.locator('.title');
  await titleLocator.waitFor({ state: 'visible' });
  const actualTitle = (await titleLocator.textContent()) || '';
  expect(actualTitle.trim()).toBe(expectedTitle);
});

Then('el usuario debería ver un mensaje de error', async function (this: CustomWorld) {
  // [data-test="error"] es el selector de error común en login y checkout
  // waitFor lanza error si el elemento no aparece — no hace falta isVisible adicional
  await this.page.locator('[data-test="error"]').waitFor({ state: 'visible' });
});

Then('el mensaje de error debería contener {string}', async function (this: CustomWorld, expectedText: string) {
  // [data-test="error"] es el selector de error común en login y checkout
  const errorLocator = this.page.locator('[data-test="error"]');
  await errorLocator.waitFor({ state: 'visible' });
  const errorMessage = (await errorLocator.textContent()) || '';
  expect(errorMessage.toLowerCase()).toContain(expectedText.toLowerCase());
});

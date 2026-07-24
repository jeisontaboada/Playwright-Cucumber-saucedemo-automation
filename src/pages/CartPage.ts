import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  private readonly cartList = '.cart_list';
  private readonly cartItem = '.cart_item';
  private readonly checkoutButton = '#checkout';
  private readonly continueShoppingButton = '#continue-shopping';

  // XPath porque hay que subir del texto del producto al contenedor cart_item y bajar al botón
  private readonly removeButton = (productName: string) =>
    `//div[text()="${productName}"]/ancestor::div[contains(@class,"cart_item")]//button[contains(@id, "remove")]`;

  constructor(page: Page) {
    super(page);
  }

  async waitForCartPage(): Promise<void> {
    await this.waitForSelector(this.cartList);
  }

  async isProductInCart(productName: string): Promise<boolean> {
    return await this.isVisible(`//div[text()="${productName}"]`);
  }

  async removeProductFromCart(productName: string): Promise<void> {
    await this.click(this.removeButton(productName));
  }

  async isCartEmpty(): Promise<boolean> {
    const items = await this.page.locator(this.cartItem).all(); // .all() necesario para contar — isVisible no sirve cuando hay 0 elementos
    return items.length === 0;
  }

  async proceedToCheckout(): Promise<void> {
    await this.click(this.checkoutButton);
  }

  async continueShopping(): Promise<void> {
    await this.click(this.continueShoppingButton);
  }
}

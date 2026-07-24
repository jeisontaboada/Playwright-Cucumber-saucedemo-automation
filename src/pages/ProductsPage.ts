import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductsPage extends BasePage {
  private readonly inventoryContainer = '.inventory_container';
  private readonly inventoryList = '.inventory_list';
  private readonly shoppingCartBadge = '.shopping_cart_badge';
  private readonly shoppingCartLink = '.shopping_cart_link';
  private readonly burgerMenuButton = '#react-burger-menu-btn';
  private readonly logoutLink = '#logout_sidebar_link';

  // XPath porque hay que subir del texto del producto al contenedor y bajar al botón — CSS no puede
  private readonly addToCartButton = (productName: string) =>
    `//div[text()="${productName}"]/ancestor::div[contains(@class,"inventory_item")]//button[contains(@id, "add-to-cart")]`;
  private readonly removeButton = (productName: string) =>
    `//div[text()="${productName}"]/ancestor::div[contains(@class,"inventory_item")]//button[contains(@id, "remove")]`;

  constructor(page: Page) {
    super(page);
  }

  async waitForProductsPage(): Promise<void> {
    await this.waitForSelector(this.inventoryList);
  }

  async addProductToCart(productName: string): Promise<void> {
    await this.click(this.addToCartButton(productName));
  }

  async getCartItemCount(): Promise<number> {
    const isVisible = await this.isVisible(this.shoppingCartBadge); // el badge no existe si el carrito está vacío
    if (!isVisible) return 0;
    const text = await this.getText(this.shoppingCartBadge);
    return parseInt(text);
  }

  async goToCart(): Promise<void> {
    await this.click(this.shoppingCartLink);
  }

  async logout(): Promise<void> {
    await this.click(this.burgerMenuButton);
    await this.waitForSelector(this.logoutLink); // el menú tiene animación — sin esta espera el click falla
    await this.click(this.logoutLink);
  }

  // devuelve el texto del botón activo: "Add to cart" o "Remove"
  async getProductActionButtonText(productName: string): Promise<string> {
    const removeBtn = this.removeButton(productName);
    if (await this.isVisible(removeBtn)) {
      return await this.getText(removeBtn);
    }
    return await this.getText(this.addToCartButton(productName));
  }
}

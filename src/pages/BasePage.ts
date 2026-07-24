import { Page, Locator } from '@playwright/test';

// abstract: no se puede hacer new BasePage() — solo heredar
export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // evita repetir el typeof check en cada click/fill/getText/isVisible
  private resolve(locator: string | Locator): Locator {
    return typeof locator === 'string' ? this.page.locator(locator) : locator;
  }

  async goto(url: string): Promise<void> {
    await this.page.goto(url);
  }

  async click(locator: string | Locator): Promise<void> {
    await this.resolve(locator).click();
  }

  async fill(locator: string | Locator, text: string): Promise<void> {
    await this.resolve(locator).fill(text);
  }

  async getText(locator: string | Locator): Promise<string> {
    return (await this.resolve(locator).textContent()) || ''; // textContent() puede ser null
  }

  async isVisible(locator: string | Locator): Promise<boolean> {
    return this.resolve(locator).isVisible();
  }

  // waitFor visible = aserción implícita, lanza TimeoutError si no aparece
  async waitForSelector(locator: string | Locator): Promise<void> {
    await this.resolve(locator).waitFor({ state: 'visible' });
  }
}

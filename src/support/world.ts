import { setWorldConstructor, World } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

export class CustomWorld extends World {
  browser!: Browser;  // ! = se asignan en init(), no en el constructor
  context!: BrowserContext;
  page!: Page;

  loginPage!: LoginPage;
  productsPage!: ProductsPage;
  cartPage!: CartPage;
  checkoutPage!: CheckoutPage;

  lastAddedProduct?: string; // ? = puede no estar definido al inicio del escenario

  // init() y no constructor porque el constructor no puede ser async
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: process.env.HEADLESS === 'true',
    });

    this.context = await this.browser.newContext({
      baseURL: process.env.BASE_URL,
      viewport: {
        width:  parseInt(process.env.VIEWPORT_WIDTH  || '1920'),
        height: parseInt(process.env.VIEWPORT_HEIGHT || '1080'),
      },
      recordVideo: process.env.RECORD_VIDEO === 'true' ? { dir: 'videos/' } : undefined,
    });

    this.page = await this.context.newPage();
    this.page.setDefaultTimeout(parseInt(process.env.ACTION_TIMEOUT || '15000'));
    this.page.setDefaultNavigationTimeout(parseInt(process.env.NAVIGATION_TIMEOUT || '30000'));

    this.loginPage    = new LoginPage(this.page);
    this.productsPage = new ProductsPage(this.page);
    this.cartPage     = new CartPage(this.page);
    this.checkoutPage = new CheckoutPage(this.page);
  }

  // orden inverso a init(): page → context → browser — cerrarlo al revés lanza errores
  async cleanup(): Promise<void> {
    if (this.page) {
      await this.page.close();
    }

    if (this.context) {
      await this.context.close();
    }

    if (this.browser) {
      await this.browser.close();
    }
  }
}

setWorldConstructor(CustomWorld);

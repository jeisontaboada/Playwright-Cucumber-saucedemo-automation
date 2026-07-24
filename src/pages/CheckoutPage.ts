import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CheckoutPage extends BasePage {
  // ── Step One: Información del usuario ──────────────────────────────────────
  private readonly firstNameInput = '#first-name';
  private readonly lastNameInput = '#last-name';
  private readonly postalCodeInput = '#postal-code';
  private readonly continueButton = '#continue';
  private readonly cancelButton = '#cancel';

  // ── Step Two: Resumen de la orden ───────────────────────────────────────────
  private readonly summaryContainer = '.checkout_summary_container';
  private readonly summaryItemName = '.inventory_item_name';
  private readonly summarySubtotal = '.summary_subtotal_label';
  private readonly summaryTax = '.summary_tax_label';
  private readonly summaryTotal = '.summary_total_label';
  private readonly finishButton = '#finish';

  // ── Step Three: Confirmación ────────────────────────────────────────────────
  private readonly completeHeader = '.complete-header';

  constructor(page: Page) {
    super(page);
  }

  // ── Step One ────────────────────────────────────────────────────────────────

  async fillCheckoutInformation(
    firstName: string,
    lastName: string,
    postalCode: string,
  ): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
    await this.fill(this.lastNameInput, lastName);
    await this.fill(this.postalCodeInput, postalCode);
  }

  // método granular para el Scenario Outline de errores — solo llena el nombre, deja los otros vacíos
  async enterFirstName(firstName: string): Promise<void> {
    await this.fill(this.firstNameInput, firstName);
  }

  async clickContinue(): Promise<void> {
    await this.click(this.continueButton);
  }

  async clickCancel(): Promise<void> {
    await this.click(this.cancelButton);
  }

  // ── Step Two ─────────────────────────────────────────────────────────────────

  async waitForCheckoutSummary(): Promise<void> {
    await this.waitForSelector(this.summaryContainer);
  }

  async getSummaryProductNames(): Promise<string[]> {
    const items = await this.page.locator(this.summaryItemName).all();
    return Promise.all(items.map((item) => item.textContent().then((t) => t ?? ''))); // Promise.all lanza todos en paralelo — más rápido que for...of secuencial
  }

  async getSubtotal(): Promise<string> {
    return await this.getText(this.summarySubtotal);
  }

  async getTax(): Promise<string> {
    return await this.getText(this.summaryTax);
  }

  async getTotal(): Promise<string> {
    return await this.getText(this.summaryTotal);
  }

  async clickFinish(): Promise<void> {
    await this.click(this.finishButton);
  }

  // ── Step Three ───────────────────────────────────────────────────────────────

  async waitForOrderComplete(): Promise<void> {
    await this.waitForSelector(this.completeHeader);
  }

  async getCompleteHeader(): Promise<string> {
    return await this.getText(this.completeHeader);
  }
}

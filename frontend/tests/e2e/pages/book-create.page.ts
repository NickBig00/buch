import { expect, type Page } from '@playwright/test';

export class BookCreatePage {
  constructor(private readonly page: Page) {}

  async expectOnPage() {
    await expect(this.page.locator('mat-toolbar').getByText(/neues buch/i)).toBeVisible({
      timeout: 15_000,
    });
  }

  async createMinimalBook(params: {
    titel: string;
    isbn13: string;
    rating?: number;
    preis: number;
  }) {
    await this.expectOnPage();

    await this.page.getByLabel(/^Titel$/i).fill(params.titel);
    await this.page.getByLabel(/ISBN-13/i).fill(params.isbn13);

    if (params.rating !== undefined) {
      await this.page.getByLabel(/^Rating$/i).fill(String(params.rating));
    }
    await this.page.getByLabel(/^Preis$/i).fill(String(params.preis));

    const save = this.page.getByRole('button', { name: /speichern/i }).first();
    await expect(save).toBeVisible({ timeout: 10_000 });
    await save.click();
  }
}

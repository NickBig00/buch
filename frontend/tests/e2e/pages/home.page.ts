import { expect, type Page } from '@playwright/test';

export class HomePage {
	constructor(private readonly page: Page) {}

	async goto() {
		await this.page.goto('/home', { waitUntil: 'domcontentloaded' });
	}

	async searchAll() {
		// Einfachster Pfad: Button klicken und auf Tabelle warten.
		const searchButton = this.page.getByRole('button', { name: /^suchen$/i });
		await expect(searchButton).toBeVisible();
		await searchButton.click();

		const table = this.page.locator('table');
		await expect(table.first()).toBeVisible({ timeout: 15_000 });

		// Mindestens eine Zeile sollte erscheinen.
		const anyRow = this.page.locator('table tbody tr, mat-row');
		await expect(anyRow.first()).toBeVisible({ timeout: 15_000 });
	}

	async openFirstResult() {
		const anyRow = this.page.locator('table tbody tr, mat-row');
		await expect(anyRow.first()).toBeVisible({ timeout: 15_000 });
		await anyRow.first().click();
	}
}

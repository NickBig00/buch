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

	async setPageSize(size: number) {
		const paginator = this.page.locator('mat-paginator').first();
		await expect(paginator).toBeVisible({ timeout: 15_000 });

		// Angular Material legt im Paginator ein eigenes Touch-Target über den Select,
		// das normale Clicks auf <mat-select> abfangen kann.
		const touchTarget = paginator
			.locator('.mat-mdc-paginator-page-size .mat-mdc-paginator-touch-target')
			.first();
		const trigger = paginator.locator('.mat-mdc-paginator-page-size .mat-mdc-select-trigger').first();
		const select = paginator.locator('mat-select').first();

		if (await touchTarget.isVisible()) {
			await touchTarget.click();
		} else if (await trigger.isVisible()) {
			await trigger.click();
		} else {
			// Fallback: notfalls erzwingen, wenn das Overlay sonst blockiert.
			await expect(select).toBeVisible({ timeout: 15_000 });
			await select.click({ force: true });
		}

		const option = this.page.getByRole('option', { name: new RegExp(`^\\s*${size}\\s*$`) }).first();
		await expect(option).toBeVisible({ timeout: 15_000 });
		await option.click();		
	}

	async gotoNextPage() {
		const paginator = this.page.locator('mat-paginator').first();
		await expect(paginator).toBeVisible({ timeout: 15_000 });

		// Stabiler als Role/Label: Material setzt eine klare Klasse.
		const nextButton = paginator
			.locator(
				'button.mat-mdc-paginator-navigation-next, button[aria-label*="Nächste"], button[aria-label*="Next"]',
			)
			.first();
		await expect(nextButton).toBeVisible({ timeout: 15_000 });
		await expect(nextButton).toBeEnabled();
		await nextButton.click();
	}

	async gotoCreate() {
		const newButton = this.page.getByRole('button', { name: /^neu$/i }).first();
		await expect(newButton).toBeVisible({ timeout: 10_000 });
		await newButton.click();
	}
}

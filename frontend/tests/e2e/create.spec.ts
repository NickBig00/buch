import { test, expect } from './fixtures/app-fixture';

function generateIsbn13(): string {
	// 978 + 9 random digits + checksum
	const rand9 = String(Math.floor(Math.random() * 1_000_000_000)).padStart(9, '0');
	const base12 = `978${rand9}`;
	let sum = 0;
	for (let i = 0; i < 12; i++) {
		const digit = Number(base12[i]);
		sum += i % 2 === 0 ? digit : digit * 3;
	}
	const check = (10 - (sum % 10)) % 10;
	return `${base12}${check}`;
}

test('neu anlegen funktioniert (POST /rest)', async ({ doLogin, homePage, bookCreatePage, page }) => {
	await doLogin();
	await homePage.gotoCreate();
	await bookCreatePage.expectOnPage();

	const isbn13 = generateIsbn13();
	const postResponse = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/rest'));

	await bookCreatePage.createMinimalBook({
		titel: `E2E Buch ${Date.now()}`,
		isbn13,
		preis: 12.34,
		rating: 3,
	});

	await expect((await postResponse).ok()).toBeTruthy();
	await expect(page).toHaveURL(/\/home(\b|\/|\?|#)/);
});

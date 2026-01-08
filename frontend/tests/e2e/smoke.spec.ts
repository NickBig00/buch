import { test, expect } from './fixtures/app-fixture';

test('login -> suche -> detail', async ({ doLogin, homePage, page }) => {
	await doLogin();
	await homePage.searchAll();
	await homePage.openFirstResult();

	// Detail-Seite: URL enthält /books/
	await expect(page).toHaveURL(/\/books\//);
});

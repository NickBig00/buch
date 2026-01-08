import { expect, type Page } from '@playwright/test';

export class LoginPage {
	constructor(private readonly page: Page) {}

	async goto() {
		await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
	}

	async login(username: string, password: string) {
		const userInput = this.page.locator('input#username, input[name="username"]');
		const passInput = this.page.locator('input#password, input[name="password"]');
		const redirectUriError = this.page.locator('text=/Invalid parameter:\\s*redirect_uri/i').first();
		const loginFailed = this.page.locator('text=/Login fehlgeschlagen/i').first();

		// Falls wir bereits auf der Keycloak-Login-Form sind, direkt ausfüllen.
		const usernameVisible = await userInput.first().isVisible().catch(() => false);
		if (!usernameVisible) {
			// Sicherstellen, dass wir auf der App-Loginseite sind.
			if (!/\/login(\b|\/|\?|#)/.test(this.page.url())) {
				await this.goto();
			}

			// Login auslösen.
			const loginButton = this.page.getByRole('button', { name: /login/i }).first();
			await expect(loginButton).toBeVisible({ timeout: 10_000 });
			await loginButton.click();

			// Auf Keycloak-Form oder bekannte Fehler warten.
			const deadline = Date.now() + 30_000;
			while (Date.now() < deadline) {
				const url = this.page.url();
				if (url.startsWith('chrome-error://')) {
					throw new Error(
						'Chromium hat eine HTTPS/Zertifikats-Fehlerseite geladen (Keycloak). ' +
							'Keycloak muss laufen und TLS-Fehler müssen ignoriert werden (playwright.config.ts: ignoreHTTPSErrors).',
					);
				}

				if (await redirectUriError.isVisible().catch(() => false)) {
					throw new Error(
						'Keycloak hat die redirect_uri abgelehnt (Invalid parameter: redirect_uri). ' +
							'Im Keycloak-Client "buch-frontend" müssen Redirect URIs/Web Origins zur SPA-URL passen, z.B. https://localhost:4200/*.',
					);
				}

				if (await loginFailed.isVisible().catch(() => false)) {
					throw new Error(
						'Login in der SPA ist fehlgeschlagen (AuthService.login). ' +
							'Prüfe, ob Keycloak erreichbar ist und die redirect_uri in Keycloak erlaubt ist.',
					);
				}

				if (await userInput.first().isVisible().catch(() => false)) {
					break;
				}

				await this.page.waitForTimeout(200);
			}
		}

		// Falls schon eingeloggt, kann /login direkt auf /home gehen.
		if (/\/home(\b|\/|\?|#)/.test(this.page.url())) {
			return;
		}

		await expect(userInput.first()).toBeVisible({ timeout: 10_000 });
		await userInput.first().fill(username);
		await passInput.first().fill(password);

		const submit = this.page.locator('input#kc-login, button#kc-login, button[type="submit"], input[type="submit"]');
		await submit.first().click();
	}
}

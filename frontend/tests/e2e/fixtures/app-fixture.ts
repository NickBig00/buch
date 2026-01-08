import { test as base, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { BookCreatePage } from '../pages/book-create.page';
import { LoginPage } from '../pages/login.page';

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  bookCreatePage: BookCreatePage;
  doLogin: () => Promise<void>;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  bookCreatePage: async ({ page }, use) => {
    await use(new BookCreatePage(page));
  },
  doLogin: async ({ page, loginPage }, use) => {
    await use(async () => {
      const user = process.env.E2E_USER;
      const pass = process.env.E2E_PASS;

      if (!user || !pass) {
        test.skip(true, 'E2E_USER/E2E_PASS nicht gesetzt (Keycloak Login wird übersprungen).');
      }

      await loginPage.goto();
      await loginPage.login(user!, pass!);
      await expect(page).toHaveURL(/\/home(\b|\/|\?|#)/);
    });
  },
});

export { expect };

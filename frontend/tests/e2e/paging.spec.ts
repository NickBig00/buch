import { test, expect } from './fixtures/app-fixture';

function urlHasParams(urlString: string, expected: Record<string, string>) {
  const url = new URL(urlString);
  return Object.entries(expected).every(([k, v]) => url.searchParams.get(k) === v);
}

test('paging funktioniert (page=2 bei Next)', async ({ doLogin, homePage, page }) => {
  await doLogin();
  await homePage.searchAll();

  // Default in der App ist bereits pageSize=5.
  const page2Response = page.waitForResponse((r) => {
    if (r.request().method() !== 'GET') return false;
    if (!r.url().includes('/rest')) return false;
    return urlHasParams(r.url(), { page: '2', size: '5' });
  });
  const [response] = await Promise.all([page2Response, homePage.gotoNextPage()]);
  await expect(response.ok()).toBeTruthy();
});

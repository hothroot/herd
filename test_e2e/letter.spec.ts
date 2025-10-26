import { test, expect } from '@playwright/test';

/**
 * This test expts to be run against a server with
 * reacptcha enabled, but using the public test keys,
 * see https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha.-what-should-i-do
 */ 
test('create a letter', async ({ page }) => {
    await page.goto('/letter');

    // enter an incomplete address
    await page.locator('input[name="name"]').fill('John Doe');
    await page.locator('input[name="street"]').fill('100 Landsdowne');
    await page.locator('input[name="city"]').fill('Cambridge');
    await page.locator('input[name="state"]').fill('MA');
    await page.locator('input[name="zipcode"]').fill('02139');
    await page.locator('input[name="email"]').fill('foo@bar.baz');

    await expect(page.locator('#submit')).toBeEnabled();

    await Promise.all([
        page.waitForNavigation(),
        page.locator('#submit').click()
    ]);

    // see USPS error
    const uspsError = await page.locator('#usps-error');
    await expect(uspsError).toBeVisible();

    // correct the address, expecting pre-filled form for other fields
    await page.locator('input[name="line2"]').fill('Apartment 1211');

    await Promise.all([
        page.waitForNavigation(),
        page.locator('#submit').click(),
    ]);

    // be sent to Draft.tsx
    await expect(page).toHaveTitle(/Write your letter/);
    // with cannonicalized address
    const returnAddress = page.locator("#return-address");
    await expect(returnAddress).toContainText(/John Doe/);
    await expect(returnAddress).toContainText(/100 LANDSDOWNE ST/);
    await expect(returnAddress).toContainText(/APT 1211/);
    await expect(returnAddress).toContainText(/CAMBRIDGE/);
    await expect(returnAddress).toContainText(/MA/);
    await expect(returnAddress).toContainText(/02139-4227/);

    var messageText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '; // 57 characters

    await page.locator('#message').fill(messageText);
    await expect(page.locator('#submit')).toBeDisabled();  // too short

    await page.locator('#captcha').click();
    await expect(page.locator('#submit')).toBeDisabled();
    
    await page.locator('#message').fill(messageText + messageText); // 114
    await expect(page.locator('#submit')).toBeEnabled();

    await Promise.all([
        page.waitForNavigation(),
        page.locator('#submit').click(),
    ]);

    // be sent to Receipt.astro
    await expect(page).toHaveTitle(/Thank you for your letter/);

    // look for letter links
    const letters = page.getByRole('link').filter({ hasText: 'your letter to Senator'});
    const count = await letters.count();
    expect(count > 0 && count < 3);
    for (const letter of await letters.all()) {
       console.log(await letter.getAttribute('href'));
    }
});
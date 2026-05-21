const EMAIL_INPUT = 'input[name="identification"]';
const PASSWORD_INPUT = 'input[name="password"]';
const SUBMIT_BUTTON = 'button[type="submit"]';

async function navigateToLogin(driver, baseUrl) {
  await driver.url(`${baseUrl}/ghost/#/signin`);
  const emailEl = await driver.$(EMAIL_INPUT);
  await emailEl.waitForDisplayed({ timeout: 10000 });
}

async function login(driver, email, password) {
  const emailEl = await driver.$(EMAIL_INPUT);
  const passwordEl = await driver.$(PASSWORD_INPUT);
  const submitEl = await driver.$(SUBMIT_BUTTON);

  await emailEl.clearValue();
  await emailEl.setValue(email);
  await passwordEl.clearValue();
  await passwordEl.setValue(password);
  await submitEl.click();

  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/ghost/#/dashboard"),
    { timeout: 15000, timeoutMsg: "El dashboard no cargó después del login" },
  );
}

module.exports = { navigateToLogin, login };

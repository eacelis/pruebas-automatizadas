const SELECTORS = {
  settingsButton: '[data-test-nav="settings"]',
  editTitleButton:
    '[data-testid="title-and-description"] button[type="button"]',
  titleInput: 'input[placeholder="Site title"]',
  descriptionInput: 'input[placeholder="Site description"]',
  saveButton: "button=Save",
  siteTitleValue: '//h6[contains(., "Site title")]/following-sibling::div',
  siteDescriptionValue:
    '//h6[contains(., "Site description")]/following-sibling::div',
  siteTimeZone: "#timezone",
  siteTimeZoneOptions: '[data-testid="timezone-select"]',
  spaceTimeZones: '[data-testid="timezone"]',
  savedButton: "button=Saved",
  defaultRecipients: "#default-recipients",
  defaultRecipientsOptions: '[data-testid="default-recipients-select"]',
  spaceDefaultRecipients: '[data-testid="default-recipients"]',
  makeThisSitePrivate:
    '[data-testid="site-visibility-select"] [class*="-control"]',
  spaceMakeThisSitePrivate: '[data-testid="access"]',
  passwordInput: '[data-testid="site-access-code"]',
};

async function navigateToSettings(driver, baseUrl) {
  await driver.url(`${baseUrl}/ghost/#/settings`);
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/ghost/#/settings"),
    {
      timeout: 10000,
      timeoutMsg: "La página de settings no cargó",
    },
  );
  const titleSection = await driver.$('[data-testid="title-and-description"]');
  await titleSection.waitForDisplayed({ timeout: 15000 });
}

async function navigateToTitleAndDescription(driver, baseUrl) {
  let element = await driver.$(SELECTORS.editTitleButton);
  return await element.click();
}

async function clicEditTitleAndDescription(driver) {
  const editTitleButton = await driver.$(SELECTORS.editTitleButton);
  await editTitleButton.waitForClickable({ timeout: 10000 });
  await editTitleButton.click();
}

async function enterTitle(driver, title) {
  const titleInput = await driver.$(SELECTORS.titleInput);
  await titleInput.waitForDisplayed({ timeout: 10000 });
  await titleInput.click();
  const currentTitle = await titleInput.getValue();
  if (currentTitle && currentTitle.length > 0) {
    await driver.keys(Array(currentTitle.length).fill("Backspace"));
  }
  await titleInput.setValue(title);
}

async function enterDescription(driver, description) {
  const descriptionInput = await driver.$(SELECTORS.descriptionInput);
  await descriptionInput.waitForClickable({ timeout: 10000 });
  await descriptionInput.click();
  const currentDescription = await descriptionInput.getValue();
  if (currentDescription && currentDescription.length > 0) {
    await driver.keys(Array(currentDescription.length).fill("Backspace"));
  }
  await descriptionInput.setValue(description);
}

async function saveChanges(driver) {
  const saveButton = await driver.$(SELECTORS.saveButton);
  await saveButton.waitForClickable({ timeout: 10000 });
  await saveButton.click();
}

async function getSiteTitle(driver) {
  const siteTitle = await driver.$(SELECTORS.siteTitleValue);
  await siteTitle.waitForDisplayed({ timeout: 10000 });
  return await siteTitle.getText();
}

async function getSiteDescription(driver) {
  const siteDescription = await driver.$(SELECTORS.siteDescriptionValue);
  await siteDescription.waitForDisplayed({ timeout: 10000 });
  return await siteDescription.getText();
}

async function selectSiteTimeZoneOptions(driver) {
  const siteTimeZone = await driver.$(SELECTORS.spaceTimeZones);
  await siteTimeZone.waitForDisplayed({ timeout: 15000 });
  await siteTimeZone.scrollIntoView();
  const trigger = await driver.$(SELECTORS.siteTimeZone);
  await trigger.waitForClickable({ timeout: 10000 });
  await trigger.click();
}

async function selectRandomTimeZone(driver) {
  const control = await driver.$(
    `${SELECTORS.siteTimeZoneOptions} [class*="-control"]`,
  );

  const optionSelector = '[class*="-option"]';
  let options = await driver.$$(optionSelector);
  if (options.length === 0) {
    await control.waitForClickable({ timeout: 10000 });
    await control.click();
  }

  await driver.waitUntil(
    async () => (await driver.$$(optionSelector)).length > 0,
    {
      timeout: 5000,
      timeoutMsg: "Las opciones de la zona horaria no aparecieron",
    },
  );

  options = await driver.$$(optionSelector);
  const randomIndex = Math.floor(Math.random() * options.length);

  await options[randomIndex].scrollIntoView();
  await options[randomIndex].click();
}

async function isSavedButtonDisplayed(driver) {
  const savedButton = await driver.$(SELECTORS.savedButton);
  await savedButton.waitForDisplayed({ timeout: 10000 });
  return await savedButton.isDisplayed();
}

async function selectDefaultRecipients(driver) {
  const recipientsSection = await driver.$(SELECTORS.spaceDefaultRecipients);
  await recipientsSection.waitForDisplayed({ timeout: 15000 });
  await recipientsSection.scrollIntoView();
  const defaultRecipients = await driver.$(
    `${SELECTORS.defaultRecipientsOptions} [class*="-control"]`,
  );
  await defaultRecipients.waitForClickable({ timeout: 10000 });
  await defaultRecipients.click();
}

async function selectRandomDefaultRecipients(driver) {
  const control = await driver.$(
    `${SELECTORS.defaultRecipientsOptions} [class*="-control"]`,
  );

  const optionSelector = '[class*="-option"]';
  let options = await driver.$$(optionSelector);
  if (options.length === 0) {
    await control.waitForClickable({ timeout: 10000 });
    await control.click();
  }

  await driver.waitUntil(
    async () => (await driver.$$(optionSelector)).length > 0,
    {
      timeout: 5000,
      timeoutMsg: "Las opciones de receptores por defecto no aparecieron",
    },
  );

  options = await driver.$$(optionSelector);
  const randomIndex = Math.floor(Math.random() * options.length);

  await options[randomIndex].click();
}

async function selectMakeThisSitePrivate(driver) {
  const privateSection = await driver.$(SELECTORS.spaceMakeThisSitePrivate);
  await privateSection.waitForDisplayed({ timeout: 15000 });
  await privateSection.scrollIntoView();
  const makeThisSitePrivate = await driver.$(SELECTORS.makeThisSitePrivate);
  await makeThisSitePrivate.waitForClickable({ timeout: 10000 });
  await makeThisSitePrivate.click();
}

async function editMakeThisSitePrivate(driver) {
  const optionSelector = '[class*="-option"]';
  let options = await driver.$$(optionSelector);
  if (options.length === 0) {
    const makeThisSitePrivate = await driver.$(SELECTORS.makeThisSitePrivate);
    await makeThisSitePrivate.waitForClickable({ timeout: 10000 });
    await makeThisSitePrivate.click();
  }

  await driver.waitUntil(
    async () => (await driver.$$(optionSelector)).length > 0,
    {
      timeout: 5000,
      timeoutMsg: "Las opciones de acceso privado no aparecieron",
    },
  );

  options = await driver.$$(optionSelector);
  for (const option of options) {
    const text = await option.getText();
    if (text.includes("Private")) {
      await option.click();
      return;
    }
  }

  throw new Error("No se encontró la opción Private en acceso del sitio");
}

async function activateSitePassword(driver) {
  const passwordInput = await driver.$(SELECTORS.passwordInput);
  await passwordInput.waitForDisplayed({ timeout: 10000 });
}

async function setSitePassword(driver, password) {
  const passwordInput = await driver.$(SELECTORS.passwordInput);
  await passwordInput.waitForClickable({ timeout: 10000 });
  await passwordInput.click();
  const currentPassword = await passwordInput.getValue();
  if (currentPassword && currentPassword.length > 0) {
    await driver.keys(Array(currentPassword.length).fill("Backspace"));
  }
  await passwordInput.setValue(password);
}

module.exports = {
  navigateToSettings,
  clicEditTitleAndDescription,
  enterTitle,
  enterDescription,
  saveChanges,
  getSiteTitle,
  getSiteDescription,
  selectSiteTimeZoneOptions,
  selectRandomTimeZone,
  isSavedButtonDisplayed,
  selectDefaultRecipients,
  selectRandomDefaultRecipients,
  selectMakeThisSitePrivate,
  editMakeThisSitePrivate,
  setSitePassword,
  activateSitePassword,
};

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
  makeThisSitePrivate: "#locksite",
  spaceMakeThisSitePrivate: '[data-testid="locksite"]',
  editMakeThisSitePrivateButton:
    '[data-testid="locksite"] button[type="button"]',
  switchEnablePassword: 'button[role="switch"]',
  passwordInput: 'input[placeholder="Enter password"]',
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
  await control.waitForClickable({ timeout: 10000 });
  await control.click();

  const optionSelector = '[class*="-option"]';
  await driver.waitUntil(
    async () => (await driver.$$(optionSelector)).length > 0,
    {
      timeout: 5000,
      timeoutMsg: "Las opciones de la zona horaria no aparecieron",
    },
  );

  const options = await driver.$$(optionSelector);
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
  const defaultRecipients = await driver.$(SELECTORS.defaultRecipients);
  await defaultRecipients.waitForClickable({ timeout: 10000 });
  await defaultRecipients.click();
}

async function selectRandomDefaultRecipients(driver) {
  const control = await driver.$(
    `${SELECTORS.defaultRecipientsOptions} [class*="-control"]`,
  );
  await control.waitForClickable({ timeout: 10000 });
  await control.click();

  const optionSelector = '[class*="-option"]';
  await driver.waitUntil(
    async () => (await driver.$$(optionSelector)).length > 0,
    {
      timeout: 5000,
      timeoutMsg: "Las opciones de receptores por defecto no aparecieron",
    },
  );

  const options = await driver.$$(optionSelector);
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
  await driver.pause(2000);
}

async function editMakeThisSitePrivate(driver) {
  const editMakeThisSitePrivateButton = await driver.$(
    SELECTORS.editMakeThisSitePrivateButton,
  );
  await editMakeThisSitePrivateButton.waitForClickable({ timeout: 10000 });
  await editMakeThisSitePrivateButton.click();
}

async function activateSitePassword(driver) {
  const switchEnablePassword = await driver.$(SELECTORS.switchEnablePassword);
  await switchEnablePassword.waitForClickable({ timeout: 10000 });
  const state = await switchEnablePassword.getAttribute("data-state");
  if (state === "unchecked") {
    await switchEnablePassword.click();
  }
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

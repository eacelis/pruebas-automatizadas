const SELECTORS = {
  titleInput: '[data-test-editor-title-input]',
  titleInputAlt: 'textarea.gh-editor-title',
  editorBody: '.gh-koenig-editor-pane [contenteditable="true"]',
  publishFlowButton: '[data-test-button="publish-flow"]',
  publishFlowButtonAlt: 'button.gh-publish-trigger',
  continueButton: '[data-test-button="continue"]',
  confirmPublishButton: '[data-test-button="confirm-publish"]',
  closePublishFlowButton: '[data-test-button="close-publish-flow"]',
  publishAtSettingTitle: '[data-test-setting="publish-at"] [data-test-setting-title]',
  scheduleRadio: '[data-test-setting="publish-at"] [data-test-radio="schedule"]',
  dateInput: '[data-test-setting="publish-at"] [data-test-date-time-picker-date-input]',
  timeInput: '[data-test-setting="publish-at"] [data-test-date-time-picker-time-input]',
  publishAtForm: '[data-test-setting="publish-at"] .gh-publish-setting-form',
  updateButton: '[data-test-button="publish-save"]',
  breadcrumbButton: '[data-test-breadcrumb]',
};

async function findFirstExisting(driver, selectors) {
  for (const selector of selectors) {
    const elements = await driver.$$(selector);
    if (elements.length > 0) return elements[0];
  }
  return null;
}

async function fillTitle(driver, title) {
  const el = await findFirstExisting(driver, [
    SELECTORS.titleInput,
    SELECTORS.titleInputAlt,
  ]);
  await el.waitForDisplayed({ timeout: 10000 });
  await el.click();
  await driver.keys(['Control', 'a', 'Backspace']);
  await el.setValue(title);
  await driver.pause(500);
}

async function fillBody(driver, body) {
  const editor = await findFirstExisting(driver, [
    SELECTORS.editorBody,
    '.koenig-editor__editor',
  ]);
  await editor.waitForDisplayed({ timeout: 8000 });
  await editor.click();
  await driver.pause(300);
  await driver.keys(body);
  await driver.pause(500);
}

async function appendBody(driver, text) {
  const editor = await findFirstExisting(driver, [
    SELECTORS.editorBody,
    '.koenig-editor__editor',
  ]);
  await editor.waitForDisplayed({ timeout: 8000 });
  await editor.click();
  await driver.pause(300);
  await driver.keys(['End']);
  await driver.keys(['Enter']);
  await driver.pause(200);
  await driver.keys(text);
  await driver.pause(500);
}

async function openPublishFlow(driver) {
  const btn = await findFirstExisting(driver, [
    SELECTORS.publishFlowButton,
    SELECTORS.publishFlowButtonAlt,
  ]);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(1500);
}

async function continueToReview(driver) {
  const btn = await driver.$(SELECTORS.continueButton);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(1000);
}

async function confirmPublish(driver) {
  const btn = await driver.$(SELECTORS.confirmPublishButton);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(3000);
}

async function closePublishFlow(driver) {
  const btn = await driver.$(SELECTORS.closePublishFlowButton);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(1000);
}

async function publishNow(driver) {
  await openPublishFlow(driver);
  await continueToReview(driver);
  await confirmPublish(driver);
}

async function scheduleForLater(driver) {
  await openPublishFlow(driver);

  const settingTitle = await driver.$(SELECTORS.publishAtSettingTitle);
  await settingTitle.waitForClickable({ timeout: 10000 });
  await settingTitle.click();
  await driver.pause(1000);

  const form = await findFirstExisting(driver, [
    SELECTORS.publishAtForm,
    '[data-test-setting="publish-at"] fieldset',
  ]);
  await form.waitForDisplayed({ timeout: 10000 });

  const scheduleRadioParent = await driver.$('[data-test-setting="publish-at"] .gh-radio:nth-child(2)');
  await scheduleRadioParent.waitForClickable({ timeout: 10000 });
  await scheduleRadioParent.click();
  await driver.pause(500);

  const target = new Date(Date.now() + 24 * 60 * 60 * 1000);
  target.setMinutes(target.getMinutes() + 15);
  const pad = (v) => `${v}`.padStart(2, '0');
  const dateStr = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`;
  const timeStr = `${pad(target.getHours())}:${pad(target.getMinutes())}`;

  const dateInput = await driver.$(SELECTORS.dateInput);
  await dateInput.waitForDisplayed({ timeout: 10000 });
  await dateInput.click();
  await driver.keys(['Control', 'a', 'Backspace']);
  await dateInput.setValue(dateStr);
  await driver.pause(300);

  const timeInput = await driver.$(SELECTORS.timeInput);
  await timeInput.waitForDisplayed({ timeout: 10000 });
  await timeInput.click();
  await driver.keys(['Control', 'a', 'Backspace']);
  await timeInput.setValue(timeStr);
  await driver.keys('Tab');
  await driver.pause(500);

  await continueToReview(driver);
  await confirmPublish(driver);
}

async function exitEditor(driver) {
  const breadcrumb = await driver.$(SELECTORS.breadcrumbButton);
  await breadcrumb.waitForClickable({ timeout: 10000 });
  await breadcrumb.click();
  await driver.pause(1000);
}

async function updatePublishedPost(driver) {
  const btn = await driver.$(SELECTORS.updateButton);
  await btn.waitForClickable({ timeout: 15000 });
  await btn.click();
  await driver.pause(3000);
}

async function waitUntilDraftSaved(driver) {
  await driver.pause(2000);
  const bodyEl = await driver.$('body');
  await driver.waitUntil(
    async () => {
      const text = await bodyEl.getText();
      return /Draft/i.test(text);
    },
    { timeout: 15000, timeoutMsg: 'El borrador no se guardó' },
  );
}

module.exports = {
  fillTitle,
  fillBody,
  appendBody,
  openPublishFlow,
  continueToReview,
  confirmPublish,
  closePublishFlow,
  publishNow,
  scheduleForLater,
  exitEditor,
  updatePublishedPost,
  waitUntilDraftSaved,
};
const SELECTORS = {
  newMemberButton:
    'a[href="#/members/new"], a.gh-btn-primary[href="#/members/new"]',
  nameInput: "input#member-name",
  emailInput: "input#member-email",
  noteInput: "textarea#member-note",
  saveButton: "button.gh-btn-primary",
  actionsMenu: 'button[data-test-button="member-actions"]',
  confirmDeleteButton: "button.gh-btn-red",
  labelsInput: ".gh-member-label-input input",
  labelsOption: ".ember-power-select-option",
  appliedLabel: ".ember-power-select-multiple-option",
  membersTitle: "h2.gh-canvas-title",
  membersListContainer: ".members-list, .gh-list, main",
};

async function findFirstExisting(driver, selectors) {
  for (const selector of selectors) {
    const elements = await driver.$$(selector);
    if (elements.length > 0) return elements[0];
  }
  return null;
}

async function waitMembersListReady(driver) {
  const container = await findFirstExisting(driver, [
    SELECTORS.membersListContainer,
  ]);
  if (container) {
    await container.waitForDisplayed({ timeout: 15000 });
  }
  await driver.pause(1000);
}

async function navigateToMembers(driver, baseUrl) {
  await driver.url(`${baseUrl}/ghost/#/members`);
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/ghost/#/members"),
    { timeout: 10000 },
  );
  const title = await driver.$(SELECTORS.membersTitle);
  await title.waitForDisplayed({ timeout: 10000 });
  await waitMembersListReady(driver);
}

async function clickNewMember(driver) {
  let btn = await findFirstExisting(driver, [
    'a[href="#/members/new"]',
    'a.gh-btn-primary[href="#/members/new"]',
    "a[data-test-new-member-button]",
  ]);

  if (!btn) {
    btn = await driver.$("a=New member");
  }

  await btn.waitForDisplayed({ timeout: 12000 });
  await btn.scrollIntoView();
  await btn.click();
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/ghost/#/members/new"),
    { timeout: 12000 },
  );
}

async function fillMemberName(driver, name) {
  const input = await driver.$(SELECTORS.nameInput);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.clearValue();
  await input.setValue(name);
}

async function fillMemberEmail(driver, email) {
  const input = await driver.$(SELECTORS.emailInput);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.clearValue();
  await input.setValue(email);
}

async function fillMemberNote(driver, note) {
  const input = await driver.$(SELECTORS.noteInput);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.clearValue();
  await input.setValue(note);
}

async function saveMember(driver) {
  const btn = await driver.$(SELECTORS.saveButton);
  await btn.waitForClickable({ timeout: 8000 });
  await btn.click();
  await driver.pause(1500);
}

async function openMemberByEmail(driver, email) {
  await waitMembersListReady(driver);
  const row = await findFirstExisting(driver, [
    `a=${email}`,
    `td=${email}`,
    `[data-test-list="members-list-item"]*=${email}`,
  ]);
  if (!row) {
    throw new Error(
      `No se encontró el miembro con email "${email}" en la lista`,
    );
  }
  await row.waitForDisplayed({ timeout: 12000 });
  await row.scrollIntoView();

  const memberHref = await driver.execute((targetEmail) => {
    const rows = Array.from(
      document.querySelectorAll('[data-test-list="members-list-item"]'),
    );
    const row = rows.find((item) => item.textContent.includes(targetEmail));
    const link = row && (row.matches("a") ? row : row.querySelector("a"));
    return link ? link.getAttribute("href") : null;
  }, email);

  if (memberHref) {
    const currentUrl = await driver.getUrl();
    const baseUrl = currentUrl.split("/ghost/")[0];
    await driver.url(`${baseUrl}/ghost/${memberHref.replace(/^#?\/?/, "#/")}`);
  } else {
    await row.click();
  }

  await driver.waitUntil(
    async () => {
      const url = await driver.getUrl();
      return url.includes("/ghost/#/members/") && !url.includes("/new");
    },
    { timeout: 12000 },
  );
}

async function assignLabel(driver, labelName) {
  const input = await driver.$(SELECTORS.labelsInput);
  await input.waitForDisplayed({ timeout: 8000 });
  await input.setValue(labelName);
  await driver.pause(800);

  const options = await driver.$$(SELECTORS.labelsOption);
  if (options.length > 0) {
    await options[0].click();
  }
}

async function assertLabelApplied(driver, labelName) {
  const labels = await driver.$$(SELECTORS.appliedLabel);
  let found = false;
  for (const label of labels) {
    const text = await label.getText();
    if (text.includes(labelName)) {
      found = true;
      break;
    }
  }
  if (!found)
    throw new Error(
      `Label "${labelName}" no encontrada en el perfil del miembro`,
    );
}

async function clickActionsMenu(driver) {
  const btn = await driver.$(SELECTORS.actionsMenu);
  await btn.waitForClickable({ timeout: 8000 });
  await btn.click();
  await driver.pause(500);
}

async function clickDeleteMemberOption(driver) {
  const btn = await driver.$('[data-test-button="delete-member"]');
  await btn.waitForClickable({ timeout: 5000 });
  await btn.click();
  await driver.pause(500);
}

async function confirmDeletion(driver) {
  const btn = await driver.$(SELECTORS.confirmDeleteButton);
  await btn.waitForClickable({ timeout: 5000 });
  await btn.click();
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/ghost/#/members"),
    { timeout: 10000 },
  );
}

async function assertMemberVisible(driver, email) {
  await waitMembersListReady(driver);
  const match = await findFirstExisting(driver, [
    `a=${email}`,
    `td=${email}`,
    `[data-test-list="members-list-item"]*=${email}`,
  ]);
  if (!match)
    throw new Error(`Miembro con email "${email}" no encontrado en la tabla`);
  const isDisplayed = await match.isDisplayed();
  if (!isDisplayed)
    throw new Error(`Miembro con email "${email}" no está visible en la tabla`);
}

async function assertMemberNotVisible(driver, email) {
  await waitMembersListReady(driver);
  const matchingRows = await driver.$$(`a=${email}`);
  if (matchingRows.length > 0) {
    throw new Error(
      `Miembro "${email}" todavía aparece en la tabla tras la eliminación`,
    );
  }
}

async function assertMemberName(driver, expectedName) {
  const input = await driver.$(SELECTORS.nameInput);
  const value = await input.getValue();
  if (value !== expectedName) {
    throw new Error(
      `Nombre esperado "${expectedName}" pero se encontró "${value}"`,
    );
  }
}

async function assertMemberNote(driver, expectedNote) {
  const input = await driver.$(SELECTORS.noteInput);
  const value = await input.getValue();
  if (value !== expectedNote) {
    throw new Error(
      `Nota esperada "${expectedNote}" pero se encontró "${value}"`,
    );
  }
}

module.exports = {
  navigateToMembers,
  clickNewMember,
  fillMemberName,
  fillMemberEmail,
  fillMemberNote,
  saveMember,
  openMemberByEmail,
  assignLabel,
  assertLabelApplied,
  clickActionsMenu,
  clickDeleteMemberOption,
  confirmDeletion,
  assertMemberVisible,
  assertMemberNotVisible,
  assertMemberName,
  assertMemberNote,
};

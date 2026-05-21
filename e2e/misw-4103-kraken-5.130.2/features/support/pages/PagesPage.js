const SELECTORS = {
  pagesNav: '[data-test-nav="pages"]',
  newPageButton: 'a[href="#/editor/page"]',
  titleInput: "textarea.gh-editor-title",
  titleInputAlt: "input.gh-editor-title",
  editorBody: ".koenig-editor__editor",
  editorBodyAlt: "div.kg-prose",
  psmTrigger: "button[data-test-psm-trigger]",
  slugInput: 'input[name="post-setting-slug"]',
  publishMenu: 'button[data-test-button="publish-flow"]',
  publishMenuAlt: "button.gh-publish-trigger",
  publishContinue: 'button[data-test-button="continue"]',
  publishConfirm: 'button[data-test-button="confirm-publish"]',
  closePublishFlow: 'button[data-test-button="close-publish-flow"]',
  fileInput: 'input[type="file"]',
  actionsMenu: 'button[data-test-button="more"]',
  confirmDeleteButton: "button.gh-btn-red",
  pagesTitle: "h2.gh-canvas-title",
  draftsFilter: "select.gh-contentfilter-select",
  featureImage: ".gh-canvas-feature-image img",
};

async function findFirstExisting(driver, selectors) {
  for (const selector of selectors) {
    const elements = await driver.$$(selector);
    if (elements.length > 0) return elements[0];
  }
  return null;
}

async function navigateToPages(driver) {
  const attempts = 3;
  for (let i = 0; i < attempts; i++) {
    try {
      const pagesNav = await driver.$(SELECTORS.pagesNav);
      await pagesNav.waitForDisplayed({ timeout: 10000 });
      await pagesNav.scrollIntoView();
      try {
        await pagesNav.waitForClickable({ timeout: 3000 });
        await pagesNav.click();
      } catch (clickError) {
        await driver.url(
          `${new URL(await driver.getUrl()).origin}/ghost/#/pages`,
        );
      }

      const title = await driver.$(SELECTORS.pagesTitle);
      await title.waitForDisplayed({ timeout: 10000 });
      await driver.pause(800);
      return;
    } catch (error) {
      const closeFlow = await driver.$$(SELECTORS.closePublishFlow);
      if (closeFlow.length > 0) {
        await closeFlow[0].click();
        await driver.pause(600);
      } else {
        await driver.keys("Escape");
        await driver.pause(400);
      }
      if (i === attempts - 1) throw error;
    }
  }
}

async function clickNewPage(driver) {
  const btn = await findFirstExisting(driver, [
    SELECTORS.newPageButton,
    "a[data-test-new-page-button]",
  ]);
  if (!btn) throw new Error("No se encontró el botón New page");
  await btn.waitForClickable({ timeout: 12000 });
  await btn.scrollIntoView();
  await btn.click();
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/editor/page"),
    { timeout: 12000 },
  );
  await driver.pause(800);
}

async function fillTitle(driver, title) {
  const el = await findFirstExisting(driver, [
    SELECTORS.titleInput,
    SELECTORS.titleInputAlt,
  ]);
  await el.waitForDisplayed({ timeout: 8000 });
  await el.click();
  await driver.keys(["Control", "a", "Backspace"]);
  await el.setValue(title);
}

async function fillContent(driver, content) {
  const editor = await findFirstExisting(driver, [
    SELECTORS.editorBody,
    SELECTORS.editorBodyAlt,
  ]);
  await editor.click();
  await driver.pause(300);
  await driver.keys(content);
  await driver.pause(500);
}

async function setSlug(driver, slug) {
  const settingsBtn = await driver.$(SELECTORS.psmTrigger);
  await settingsBtn.waitForClickable({ timeout: 10000 });
  await settingsBtn.click();
  await driver.pause(800);
  const slugInput = await driver.$(SELECTORS.slugInput);
  await slugInput.waitForDisplayed({ timeout: 8000 });
  await slugInput.click();
  await driver.keys(["Control", "a", "Backspace"]);
  await slugInput.setValue(slug);
  await driver.keys("Tab");
  await driver.pause(500);
  await settingsBtn.click();
  await driver.pause(500);
}

async function uploadCoverImage(driver, absoluteFilePath) {
  const inputs = await driver.$$(SELECTORS.fileInput);
  if (inputs.length === 0) {
    throw new Error("No se encontró input[type=file] para cover image");
  }
  await inputs[0].setValue(absoluteFilePath);
  await driver.pause(2500);
}

async function publishPage(driver) {
  const btn = await findFirstExisting(driver, [
    SELECTORS.publishMenu,
    SELECTORS.publishMenuAlt,
  ]);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(1000);

  const cont = await driver.$$(SELECTORS.publishContinue);
  if (cont.length > 0) {
    await cont[0].click();
    await driver.pause(800);
  }
  const conf = await driver.$$(SELECTORS.publishConfirm);
  if (conf.length > 0) {
    await conf[0].click();
    await driver.pause(2000);
  }

  const closeFlow = await driver.$$(SELECTORS.closePublishFlow);
  if (closeFlow.length > 0) {
    await closeFlow[0].click();
    await driver.pause(800);
  }
}

async function unpublishPage(driver) {
  const btn = await findFirstExisting(driver, [
    SELECTORS.publishMenu,
    SELECTORS.publishMenuAlt,
  ]);
  await btn.waitForClickable({ timeout: 10000 });
  await btn.click();
  await driver.pause(800);

  const candidates = [
    "button*=Unpublish",
    "button*=Revert to draft",
    "button*=Convert to draft",
  ];
  let found = false;
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      await els[0].click();
      found = true;
      break;
    }
  }
  if (!found) throw new Error("No se encontró botón para despublicar");
  await driver.pause(2000);
}

async function filterByDrafts(driver) {
  await navigateToPages(driver);
  const select = await driver.$$(SELECTORS.draftsFilter);
  if (select.length > 0) {
    await select[0].selectByVisibleText("Draft pages");
    await driver.pause(1500);
  }
}

async function openPageByTitle(driver, title) {
  const candidates = [
    `a*=${title}`,
    `h3*=${title}`,
    `li.gh-list-row*=${title}`,
  ];
  let row = null;
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      row = els[0];
      break;
    }
  }
  if (!row) throw new Error(`No se encontró la página "${title}"`);
  await row.scrollIntoView();
  await row.click();
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/editor/page/"),
    { timeout: 12000 },
  );
  await driver.pause(1000);
}

async function deleteCurrentPage(driver) {
  const more = await driver.$(SELECTORS.actionsMenu);
  await more.waitForClickable({ timeout: 8000 });
  await more.click();
  await driver.pause(500);

  const delCandidates = ["button*=Delete page", "button*=Delete"];
  for (const sel of delCandidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      await els[0].click();
      break;
    }
  }
  await driver.pause(500);
  const confirm = await driver.$(SELECTORS.confirmDeleteButton);
  await confirm.waitForClickable({ timeout: 5000 });
  await confirm.click();
  await driver.pause(2000);
}

async function assertPageVisible(driver, title) {
  await navigateToPages(driver);
  const candidates = [
    `a*=${title}`,
    `h3*=${title}`,
    `li.gh-list-row*=${title}`,
  ];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) return;
  }
  throw new Error(`Página "${title}" no encontrada en el listado`);
}

async function assertPageNotVisible(driver, title) {
  await navigateToPages(driver);
  const candidates = [`a*=${title}`, `h3*=${title}`];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      throw new Error(`Página "${title}" todavía visible tras eliminación`);
    }
  }
}

async function assertCoverImagePresent(driver) {
  const candidates = [
    "img.gh-canvas-feature-image-wrapper",
    ".gh-canvas-feature-image img",
    "[data-test-feature-image] img",
  ];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      const src = await els[0].getAttribute("src");
      if (src && src.length > 0) return;
    }
  }
  throw new Error("Cover image no encontrada en la página");
}

async function assertPagePublic(driver, baseUrl, slug) {
  await driver.url(`${baseUrl}/${slug}/`);
  await driver.pause(1500);
  const bodyText = await (await driver.$("body")).getText();
  if (/Page not found|404/i.test(bodyText)) {
    throw new Error(`URL /${slug}/ devuelve contenido 404`);
  }
}

async function assertPageNotPublic(driver, baseUrl, slug) {
  await driver.url(`${baseUrl}/${slug}/`);
  await driver.pause(1500);
  const bodyText = await (await driver.$("body")).getText();
  if (!/Page not found|404/i.test(bodyText)) {
    throw new Error(
      `Se esperaba 404 en /${slug}/ pero la página todavía existe`,
    );
  }
}

module.exports = {
  navigateToPages,
  clickNewPage,
  fillTitle,
  fillContent,
  setSlug,
  uploadCoverImage,
  publishPage,
  unpublishPage,
  filterByDrafts,
  openPageByTitle,
  deleteCurrentPage,
  assertPageVisible,
  assertPageNotVisible,
  assertCoverImagePresent,
  assertPagePublic,
  assertPageNotPublic,
};

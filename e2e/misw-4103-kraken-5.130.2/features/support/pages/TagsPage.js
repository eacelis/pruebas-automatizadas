const SELECTORS = {
    tagsNav: '[data-test-nav="tags"]',
    newTagButton: 'a[href="#/tags/new"]',
    nameInput: 'input#tag-name',
    nameInputAlt: 'input[name="name"]',
    slugInput: 'input#tag-slug',
    slugInputAlt: 'input[name="slug"]',
    descriptionInput: 'textarea#tag-description',
    descriptionInputAlt: 'textarea[name="description"]',
    colorInput: 'input[name="accent-color"]',
    saveButton: 'button.gh-btn-primary',
    metaTitleInput: 'input#meta-title',
    metaTitleInputAlt: 'input[name="metaTitle"]',
    metaDescriptionInput: 'textarea#meta-description',
    metaDescriptionInputAlt: 'textarea[name="metaDescription"]',
    fileInput: 'input[type="file"]',
    actionsMenu: 'button[data-test-button="more"]',
    confirmDeleteButton: 'button.gh-btn-red',
    tagsTitle: 'h2.gh-canvas-title',
};

async function findFirstExisting(driver, selectors) {
    for (const selector of selectors) {
        const elements = await driver.$$(selector);
        if (elements.length > 0) return elements[0];
    }
    return null;
}

async function navigateToTags(driver) {
    const tagsNav = await driver.$(SELECTORS.tagsNav);
    await tagsNav.waitForClickable({ timeout: 10000 });
    await tagsNav.click();
    const title = await driver.$(SELECTORS.tagsTitle);
    await title.waitForDisplayed({ timeout: 10000 });
    await driver.pause(1000);
}

async function clickNewTag(driver) {
    const btn = await findFirstExisting(driver, [
        SELECTORS.newTagButton,
        'a[data-test-new-tag-button]',
    ]);
    if (btn) {
        await btn.waitForClickable({ timeout: 12000 });
        await btn.scrollIntoView();
        await btn.click();
    } else {
        const url = await driver.getUrl();
        const baseUrl = url.split('/ghost/')[0];
        await driver.url(`${baseUrl}/ghost/#/tags/new`);
    }
    await driver.waitUntil(
        async () => (await driver.getUrl()).includes('/tags/new'),
        { timeout: 12000 }
    );
    const nameInput = await findFirstExisting(driver, [
        SELECTORS.nameInput,
        SELECTORS.nameInputAlt,
    ]);
    await nameInput.waitForDisplayed({ timeout: 12000 });
    await driver.pause(800);
}

async function fillName(driver, name) {
    const input = await findFirstExisting(driver, [
        SELECTORS.nameInput,
        SELECTORS.nameInputAlt,
    ]);
    await input.waitForDisplayed({ timeout: 8000 });
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(name);
}

async function fillSlug(driver, slug) {
    const input = await findFirstExisting(driver, [
        SELECTORS.slugInput,
        SELECTORS.slugInputAlt,
    ]);
    if (!input) return;
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(slug);
    await driver.keys('Tab');
    await driver.pause(300);
}

async function fillDescription(driver, description) {
    const input = await findFirstExisting(driver, [
        SELECTORS.descriptionInput,
        SELECTORS.descriptionInputAlt,
    ]);
    if (!input) return;
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(description);
}

async function expandSeoSection(driver) {
    const candidates = ['button*=Expand', 'a*=Expand', 'button*=Show more'];
    for (const sel of candidates) {
        const els = await driver.$$(sel);
        if (els.length > 0) {
            await els[0].click();
            await driver.pause(400);
            return;
        }
    }
}

async function fillMetaTitle(driver, metaTitle) {
    await expandSeoSection(driver);
    const input = await findFirstExisting(driver, [
        SELECTORS.metaTitleInput,
        SELECTORS.metaTitleInputAlt,
        'input[data-test-input="meta-title"]',
    ]);
    if (!input) throw new Error('No se encontró input de meta title');
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(metaTitle);
}

async function fillMetaDescription(driver, metaDescription) {
    const input = await findFirstExisting(driver, [
        SELECTORS.metaDescriptionInput,
        SELECTORS.metaDescriptionInputAlt,
        'textarea[data-test-input="meta-description"]',
    ]);
    if (!input) throw new Error('No se encontró textarea de meta description');
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(metaDescription);
}

async function uploadTagImage(driver, absoluteFilePath) {
    const inputs = await driver.$$(SELECTORS.fileInput);
    if (inputs.length === 0) {
        throw new Error('No se encontró input[type=file] para imagen del tag');
    }
    await inputs[0].setValue(absoluteFilePath);
    await driver.pause(2500);
}

async function setColorHex(driver, hex) {
    const input = await driver.$(SELECTORS.colorInput);
    await input.waitForDisplayed({ timeout: 8000 });
    await input.click();
    await driver.keys(['Control', 'a', 'Backspace']);
    await input.setValue(hex);
    await driver.keys('Tab');
    await driver.pause(400);
}

async function save(driver) {
    const btn = await driver.$(SELECTORS.saveButton);
    await btn.waitForClickable({ timeout: 8000 });
    await btn.click();
    await driver.pause(2000);
}

async function openTagBySlug(driver, baseUrl, slug) {
    await driver.url(`${baseUrl}/ghost/#/tags/${slug}`);
    await driver.pause(2000);
    const nameInput = await findFirstExisting(driver, [
        SELECTORS.nameInput,
        SELECTORS.nameInputAlt,
    ]);
    await nameInput.waitForDisplayed({ timeout: 10000 });
}

async function deleteCurrentTag(driver) {
    const more = await driver.$(SELECTORS.actionsMenu);
    await more.waitForClickable({ timeout: 8000 });
    await more.click();
    await driver.pause(500);
    const delCandidates = ['button*=Delete tag', 'button*=Delete'];
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

async function assertTagVisible(driver, name) {
    await navigateToTags(driver);
    const candidates = [`a*=${name}`, `h3*=${name}`, `li.gh-list-row*=${name}`];
    for (const sel of candidates) {
        const els = await driver.$$(sel);
        if (els.length > 0) return;
    }
    throw new Error(`Tag "${name}" no encontrado en el listado`);
}

async function assertTagNotVisible(driver, name) {
    await navigateToTags(driver);
    const candidates = [`a*=${name}`, `h3*=${name}`];
    for (const sel of candidates) {
        const els = await driver.$$(sel);
        if (els.length > 0) {
            throw new Error(`Tag "${name}" todavía visible tras eliminación`);
        }
    }
}

async function assertSeoPersisted(driver, expectedTitle, expectedDescription) {
    await expandSeoSection(driver);
    const titleInput = await findFirstExisting(driver, [
        SELECTORS.metaTitleInput,
        SELECTORS.metaTitleInputAlt,
    ]);
    const descInput = await findFirstExisting(driver, [
        SELECTORS.metaDescriptionInput,
        SELECTORS.metaDescriptionInputAlt,
    ]);
    const t = await titleInput.getValue();
    const d = await descInput.getValue();
    if (t !== expectedTitle) {
        throw new Error(`Meta title esperado "${expectedTitle}" pero fue "${t}"`);
    }
    if (d !== expectedDescription) {
        throw new Error(`Meta description esperado "${expectedDescription}" pero fue "${d}"`);
    }
}

async function assertColorPersisted(driver, expectedHex) {
    const input = await driver.$(SELECTORS.colorInput);
    const value = (await input.getValue()) || '';
    const v = value.toLowerCase().replace('#', '');
    if (v !== expectedHex.toLowerCase()) {
        throw new Error(`Color esperado "${expectedHex}" pero fue "${value}"`);
    }
}

async function assertTagImagePresent(driver) {
    const candidates = [
        'img[data-test-tag-image]',
        '.gh-image-uploader img',
        '.gh-canvas-feature-image img',
    ];
    for (const sel of candidates) {
        const els = await driver.$$(sel);
        if (els.length > 0) {
            const src = await els[0].getAttribute('src');
            if (src && src.length > 0) return;
        }
    }
    throw new Error('Imagen del tag no encontrada');
}

module.exports = {
    navigateToTags,
    clickNewTag,
    fillName,
    fillSlug,
    fillDescription,
    fillMetaTitle,
    fillMetaDescription,
    uploadTagImage,
    setColorHex,
    save,
    openTagBySlug,
    deleteCurrentTag,
    assertTagVisible,
    assertTagNotVisible,
    assertSeoPersisted,
    assertColorPersisted,
    assertTagImagePresent,
};

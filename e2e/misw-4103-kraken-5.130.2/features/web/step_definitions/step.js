const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");
const { Given, When, Then, setDefaultTimeout } = require("@cucumber/cucumber");
const { expect } = require("chai");
const LoginPage = require("../../support/pages/LoginPage");
const MembersPage = require("../../support/pages/MembersPage");
const SettingsPage = require("../../support/pages/SettingsPage");
const PagesPage = require("../../support/pages/PagesPage");
const TagsPage = require("../../support/pages/TagsPage");
const PostsPage = require("../../support/pages/PostsPage");
const PostEditorPage = require("../../support/pages/PostEditorPage");
const SitePage = require("../../support/pages/SitePage");
const randomTitle = `EP01-${faker.string.alphanumeric(8)}`;
const randomDescription = faker.lorem.sentence(10);
const sitePassword = faker.internet.password();

const ep09Data = {
  title: `Acerca EP09 ${faker.string.alphanumeric(6)}`,
  content: faker.lorem.sentence(8),
  slug: `about-ep09-${faker.string.alphanumeric(5).toLowerCase()}`,
};
const ep10Data = {
  title: `Cover EP10 ${faker.string.alphanumeric(6)}`,
  content: faker.lorem.sentence(8),
};
const ep11Data = {
  title: `Unpublish EP11 ${faker.string.alphanumeric(6)}`,
  content: faker.lorem.sentence(8),
};
const ep12Data = {
  title: `Delete EP12 ${faker.string.alphanumeric(6)}`,
  content: faker.lorem.sentence(8),
  slug: `delete-ep12-${faker.string.alphanumeric(5).toLowerCase()}`,
};
const ep13Data = {
  name: `Tag EP13 ${faker.string.alphanumeric(6)}`,
  slug: `tag-ep13-${faker.string.alphanumeric(5).toLowerCase()}`,
  description: faker.lorem.sentence(8),
};
const ep14Data = {
  name: `Tag EP14 ${faker.string.alphanumeric(6)}`,
  slug: `tag-ep14-${faker.string.alphanumeric(5).toLowerCase()}`,
  metaTitle: faker.lorem.sentence(4),
  metaDescription: faker.lorem.sentence(10),
};
const ep15Data = {
  name: `Tag EP15 ${faker.string.alphanumeric(6)}`,
  slug: `tag-ep15-${faker.string.alphanumeric(5).toLowerCase()}`,
};
const ep16Data = {
  name: `Tag EP16 ${faker.string.alphanumeric(6)}`,
  slug: `tag-ep16-${faker.string.alphanumeric(5).toLowerCase()}`,
  hexColor: faker.color
    .rgb({ format: "hex", casing: "lower" })
    .replace("#", ""),
};

const FIXTURES_IMAGES_DIR = path.resolve(
  __dirname,
  "../../../features/fixtures/images",
);
const CYPRESS_FIXTURES_IMAGES_DIR = path.resolve(
  __dirname,
  "../../../../misw-4103-cypress-5.130.2/cypress/fixtures/images",
);

function resolveFixtureImagePath(fileName) {
  const krakenImage = path.resolve(FIXTURES_IMAGES_DIR, fileName);
  if (fs.existsSync(krakenImage)) {
    return krakenImage;
  }

  const cypressImage = path.resolve(CYPRESS_FIXTURES_IMAGES_DIR, fileName);
  if (fs.existsSync(cypressImage)) {
    return cypressImage;
  }

  throw new Error(
    `No se encontró el fixture de imagen "${fileName}" en Kraken ni en Cypress`,
  );
}

setDefaultTimeout(60000);

function loadDotEnv(dotEnvPath) {
  if (!fs.existsSync(dotEnvPath)) return;

  const lines = fs.readFileSync(dotEnvPath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv(path.resolve(__dirname, "../../../.env"));

function loadProperties() {
  const propertiesPath = path.resolve(__dirname, "../../../properties.json");
  if (!fs.existsSync(propertiesPath)) return {};
  return JSON.parse(fs.readFileSync(propertiesPath, "utf8"));
}

const props = loadProperties();
const GHOST_URL =
  process.env.GHOST_URL || props.GHOST_URL || "http://localhost:2368";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL || props.ADMIN_EMAIL || "cientificstudy@gmail.com";
const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD || props.ADMIN_PASSWORD || "ingeniero1999";
const ADMIN_COOKIE_CACHE_PATH = path.resolve(
  __dirname,
  "../../../.kraken/admin-cookie",
);
let cachedAdminCookie = null;

async function cleanupMemberByEmail(email) {
  const loginResp = await fetch(`${GHOST_URL}/ghost/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginResp.ok) return;
  const rawCookie = loginResp.headers.get("set-cookie");
  if (!rawCookie) return;
  const cookie = rawCookie.split(";")[0];
  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/members/?filter=email:${encodeURIComponent(email)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) return;
  const listJson = await listResp.json();
  for (const member of listJson.members || []) {
    await fetch(`${GHOST_URL}/ghost/api/admin/members/${member.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
  }
}

async function adminLoginCookie() {
  if (cachedAdminCookie) return cachedAdminCookie;

  if (fs.existsSync(ADMIN_COOKIE_CACHE_PATH)) {
    const fileCookie = fs.readFileSync(ADMIN_COOKIE_CACHE_PATH, "utf8").trim();
    if (fileCookie) {
      const siteResp = await fetch(`${GHOST_URL}/ghost/api/admin/site/`, {
        method: "GET",
        headers: { Accept: "application/json", Cookie: fileCookie },
      });
      if (siteResp.ok) {
        cachedAdminCookie = fileCookie;
        return cachedAdminCookie;
      }
    }
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const loginResp = await fetch(`${GHOST_URL}/ghost/api/admin/session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          username: ADMIN_EMAIL,
          password: ADMIN_PASSWORD,
        }),
      });
      const rawCookie = loginResp.headers.get("set-cookie");
      if (loginResp.ok && rawCookie) {
        cachedAdminCookie = rawCookie.split(";")[0];
        fs.mkdirSync(path.dirname(ADMIN_COOKIE_CACHE_PATH), {
          recursive: true,
        });
        fs.writeFileSync(ADMIN_COOKIE_CACHE_PATH, cachedAdminCookie, "utf8");
        return cachedAdminCookie;
      }
    } catch (_) {}
    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
  }

  return null;
}

async function loginBrowserWithCachedAdminCookie(driver) {
  const cookie = await adminLoginCookie();
  if (!cookie) return false;

  const [name, ...valueParts] = cookie.split("=");
  const value = valueParts.join("=");
  if (!name || !value) return false;

  await driver.url(GHOST_URL);
  await driver.setCookies([
    {
      name,
      value,
      path: "/",
      domain: "localhost",
    },
  ]);
  await driver.url(`${GHOST_URL}/ghost/#/dashboard`);

  try {
    await driver.waitUntil(
      async () => (await driver.getUrl()).includes("/ghost/#/dashboard"),
      { timeout: 5000 },
    );
    return true;
  } catch (_) {
    return false;
  }
}

async function cleanupPageByTitle(title) {
  const cookie = await adminLoginCookie();
  if (!cookie) return;
  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/pages/?limit=all`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) return;
  const listJson = await listResp.json();
  const matches = (listJson.pages || []).filter((p) => p.title === title);
  for (const p of matches) {
    await fetch(`${GHOST_URL}/ghost/api/admin/pages/${p.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
  }
}

async function cleanupPageBySlug(slug) {
  const cookie = await adminLoginCookie();
  if (!cookie) return;
  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/pages/?filter=slug:${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) return;
  const listJson = await listResp.json();
  for (const p of listJson.pages || []) {
    await fetch(`${GHOST_URL}/ghost/api/admin/pages/${p.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
  }
}

async function assertPageNotPresentByTitleOrSlug(title, slug) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error(
      "No se pudo autenticar en Ghost Admin API para validar la eliminación",
    );
  }

  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const listResp = await fetch(
      `${GHOST_URL}/ghost/api/admin/pages/?limit=all&fields=title,slug`,
      {
        method: "GET",
        headers: { Accept: "application/json", Cookie: cookie },
      },
    );
    if (!listResp.ok) {
      throw new Error(
        `No se pudo consultar pages por API. Status: ${listResp.status}`,
      );
    }

    const listJson = await listResp.json();
    const matches = (listJson.pages || []).filter(
      (p) => p.title === title || p.slug === slug,
    );
    if (matches.length === 0) return;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`La página "${title}" todavía existe tras eliminación`);
}

async function assertPageHasFeatureImageByTitle(title) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error(
      "No se pudo autenticar en Ghost Admin API para validar la imagen",
    );
  }

  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    const listResp = await fetch(
      `${GHOST_URL}/ghost/api/admin/pages/?limit=all&fields=title,feature_image`,
      {
        method: "GET",
        headers: { Accept: "application/json", Cookie: cookie },
      },
    );
    if (!listResp.ok) {
      throw new Error(
        `No se pudo consultar pages por API. Status: ${listResp.status}`,
      );
    }

    const listJson = await listResp.json();
    const page = (listJson.pages || []).find((p) => p.title === title);
    if (page && page.feature_image) return;

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`La página "${title}" no tiene cover image registrada`);
}

async function updatePageStatusByTitle(title, status) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error(
      "No se pudo autenticar en Ghost Admin API para actualizar la página",
    );
  }

  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/pages/?limit=all&fields=id,title,status,updated_at`,
    {
      method: "GET",
      headers: { Accept: "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) {
    throw new Error(
      `No se pudo consultar pages por API. Status: ${listResp.status}`,
    );
  }

  const listJson = await listResp.json();
  const page = (listJson.pages || []).find((p) => p.title === title);
  if (!page) throw new Error(`Página "${title}" no encontrada por API`);

  const updateResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/pages/${page.id}/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Cookie: cookie,
      },
      body: JSON.stringify({
        pages: [
          {
            id: page.id,
            status,
            updated_at: page.updated_at,
          },
        ],
      }),
    },
  );
  if (!updateResp.ok) {
    const text = await updateResp.text();
    throw new Error(
      `No se pudo actualizar la página "${title}" a "${status}". Status: ${updateResp.status}. ${text}`,
    );
  }
}

async function cleanupTagBySlug(slug) {
  const cookie = await adminLoginCookie();
  if (!cookie) return;
  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/tags/?filter=slug:${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) return;
  const listJson = await listResp.json();
  for (const t of listJson.tags || []) {
    await fetch(`${GHOST_URL}/ghost/api/admin/tags/${t.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
  }
}

async function uploadImageByApi(absoluteFilePath) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error("No se pudo autenticar en Ghost Admin API para subir imagen");
  }

  const bytes = fs.readFileSync(absoluteFilePath);
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8;
  const blob = new Blob([bytes], {
    type: isJpeg ? "image/jpeg" : "image/png",
  });
  const form = new FormData();
  const fileName = isJpeg
    ? `${path.basename(absoluteFilePath, path.extname(absoluteFilePath))}.jpg`
    : path.basename(absoluteFilePath);
  form.append("file", blob, fileName);

  const uploadResp = await fetch(`${GHOST_URL}/ghost/api/admin/images/upload/`, {
    method: "POST",
    headers: { Accept: "application/json", Cookie: cookie },
    body: form,
  });
  if (!uploadResp.ok) {
    const text = await uploadResp.text();
    throw new Error(
      `No se pudo subir la imagen por API. Status: ${uploadResp.status}. ${text}`,
    );
  }

  const uploadJson = await uploadResp.json();
  const imageUrl = uploadJson.images?.[0]?.url;
  if (!imageUrl) throw new Error("Ghost no devolvió URL para la imagen subida");
  return imageUrl;
}

async function createTagByApi(data) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error("No se pudo autenticar en Ghost Admin API para crear tag");
  }

  const tag = {
    name: data.name,
    slug: data.slug,
  };
  if (data.description) tag.description = data.description;
  if (data.metaTitle) tag.meta_title = data.metaTitle;
  if (data.metaDescription) tag.meta_description = data.metaDescription;
  if (data.hexColor) tag.accent_color = data.hexColor;
  if (data.featureImage) tag.feature_image = data.featureImage;

  const createResp = await fetch(`${GHOST_URL}/ghost/api/admin/tags/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({ tags: [tag] }),
  });
  if (!createResp.ok) {
    const text = await createResp.text();
    throw new Error(
      `No se pudo crear el tag "${data.name}". Status: ${createResp.status}. ${text}`,
    );
  }
}

async function getTagBySlug(slug) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error("No se pudo autenticar en Ghost Admin API para consultar tag");
  }

  const tagResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/tags/slug/${encodeURIComponent(slug)}/`,
    {
      method: "GET",
      headers: { Accept: "application/json", Cookie: cookie },
    },
  );
  if (tagResp.status === 404) return null;
  if (!tagResp.ok) {
    throw new Error(`No se pudo consultar tag por API. Status: ${tagResp.status}`);
  }

  const tagJson = await tagResp.json();
  return tagJson.tags?.[0] || null;
}

async function updateTagBySlug(slug, changes) {
  const cookie = await adminLoginCookie();
  if (!cookie) {
    throw new Error("No se pudo autenticar en Ghost Admin API para actualizar tag");
  }

  const tag = await getTagBySlug(slug);
  if (!tag) throw new Error(`Tag "${slug}" no encontrado por API`);

  const updateResp = await fetch(`${GHOST_URL}/ghost/api/admin/tags/${tag.id}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Cookie: cookie,
    },
    body: JSON.stringify({
      tags: [
        {
          id: tag.id,
          updated_at: tag.updated_at,
          ...changes,
        },
      ],
    }),
  });
  if (!updateResp.ok) {
    const text = await updateResp.text();
    throw new Error(
      `No se pudo actualizar el tag "${slug}". Status: ${updateResp.status}. ${text}`,
    );
  }
}

async function assertTagBySlug(slug, predicate, message) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    const tag = await getTagBySlug(slug);
    if (tag && predicate(tag)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(message);
}

Given("I navigate to Ghost admin login page", async function () {
  await LoginPage.navigateToLogin(this.driver, GHOST_URL);
});

Given("I login with admin credentials", async function () {
  if (await loginBrowserWithCachedAdminCookie(this.driver)) return;
  await LoginPage.login(this.driver, ADMIN_EMAIL, ADMIN_PASSWORD);
});

Given("I navigate to the Members section", async function () {
  await MembersPage.navigateToMembers(this.driver, GHOST_URL);
});

Given("I click on New member button", async function () {
  await MembersPage.clickNewMember(this.driver);
});

Given("I fill in the member name {string}", async function (name) {
  await MembersPage.fillMemberName(this.driver, name);
});

Given("I fill in the member email {string}", async function (email) {
  await cleanupMemberByEmail(email);
  await MembersPage.fillMemberEmail(this.driver, email);
});

Given("I save the member", async function () {
  await MembersPage.saveMember(this.driver);
});

Given("I navigate to Ghost settings", async function () {
  await SettingsPage.navigateToSettings(this.driver, GHOST_URL);
});

When("I open the member with email {string}", async function (email) {
  await MembersPage.openMemberByEmail(this.driver, email);
});

When("I assign the label {string} to the member", async function (labelName) {
  await MembersPage.assignLabel(this.driver, labelName);
});

When("I update the member name to {string}", async function (newName) {
  await MembersPage.fillMemberName(this.driver, newName);
});

When("I update the member note to {string}", async function (note) {
  await MembersPage.fillMemberNote(this.driver, note);
});

When("I click on the member actions menu", async function () {
  await MembersPage.clickActionsMenu(this.driver);
});

When("I click on delete member option", async function () {
  await MembersPage.clickDeleteMemberOption(this.driver);
});

When("I confirm the member deletion", async function () {
  await MembersPage.confirmDeletion(this.driver);
});

When("I reload the page", async function () {
  await this.driver.refresh();
  await this.driver.pause(1500);
});

When(
  "I click on the Edit option in the Title and Description section",
  async function () {
    await SettingsPage.clicEditTitleAndDescription(this.driver);
  },
);

When(
  "I change the site title and description with random values",
  async function () {
    await SettingsPage.enterTitle(this.driver, randomTitle);
    await SettingsPage.enterDescription(this.driver, randomDescription);
  },
);

When("I save the changes", async function () {
  await SettingsPage.saveChanges(this.driver);
});

When("I click on the Site Timezone section", async function () {
  await SettingsPage.selectSiteTimeZoneOptions(this.driver);
});

When("I clic on the Default Newsletter Recipients section", async function () {
  await SettingsPage.selectDefaultRecipients(this.driver);
});

When("I clic on the Make This Site Private section", async function () {
  await SettingsPage.selectMakeThisSitePrivate(this.driver);
});

When("I enable password protection for the site", async function () {
  await SettingsPage.editMakeThisSitePrivate(this.driver);
  await SettingsPage.activateSitePassword(this.driver);
  await SettingsPage.setSitePassword(this.driver, sitePassword);
});

Then("I select a Timezone randomly", async function () {
  await SettingsPage.selectRandomTimeZone(this.driver);
});

Then("I should be redirected to the member detail page", async function () {
  await this.driver.pause(1000);
  const url = await this.driver.getUrl();
  expect(url).to.include("/ghost/#/members");
});

Then(
  "I should see the member {string} in the members list",
  async function (email) {
    await MembersPage.assertMemberVisible(this.driver, email);
  },
);

Then("I select the Default Newsletter Recipients randomly", async function () {
  await SettingsPage.selectRandomDefaultRecipients(this.driver);
});

Then(
  "I should not see the member {string} in the members list",
  async function (email) {
    await MembersPage.assertMemberNotVisible(this.driver, email);
  },
);

Then(
  "I should see the label {string} applied to the member",
  async function (labelName) {
    await MembersPage.assertLabelApplied(this.driver, labelName);
  },
);

Then(
  "the member name field should have value {string}",
  async function (expectedName) {
    await MembersPage.assertMemberName(this.driver, expectedName);
  },
);

Then(
  "the member note field should have value {string}",
  async function (expectedNote) {
    await MembersPage.assertMemberNote(this.driver, expectedNote);
  },
);

Then("I should be on the members list page", async function () {
  const url = await this.driver.getUrl();
  expect(url).to.include("/ghost/#/members");
});

Then("I confirm that the Edit button is back", async function () {
  const editTitleButton = await this.driver.$(
    '[data-testid="title-and-description"] button[type="button"]',
  );
  await editTitleButton.waitForDisplayed({ timeout: 10000 });
});

Then(
  "I confirm the new title and description are displayed",
  async function () {
    const editTitleButton = await this.driver.$(
      '[data-testid="title-and-description"] button[type="button"]',
    );
    await editTitleButton.waitForClickable({ timeout: 10000 });
    await editTitleButton.click();

    const titleInput = await this.driver.$('input[placeholder="Site title"]');
    const descriptionInput = await this.driver.$(
      'input[placeholder="Site description"]',
    );
    await titleInput.waitForDisplayed({ timeout: 10000 });
    await descriptionInput.waitForDisplayed({ timeout: 10000 });

    const currentTitle = await titleInput.getValue();
    const currentDescription = await descriptionInput.getValue();

    expect(currentTitle).to.include(randomTitle);
    expect(currentDescription).to.equal(randomDescription);
  },
);

Then("I verify that it has been saved", async function () {
  const isSaved = await SettingsPage.isSavedButtonDisplayed(this.driver);
  if (!isSaved) {
    throw new Error("El botón 'Saved' no apareció después de guardar.");
  }
});
Given("I navigate to the Pages section", async function () {
  await PagesPage.navigateToPages(this.driver);
});

When(
  "I create a new EP09 page with content, slug and publish it",
  async function () {
    await cleanupPageBySlug(ep09Data.slug);
    await cleanupPageByTitle(ep09Data.title);
    await PagesPage.clickNewPage(this.driver);
    await PagesPage.fillTitle(this.driver, ep09Data.title);
    await PagesPage.fillContent(this.driver, ep09Data.content);
    await PagesPage.setSlug(this.driver, ep09Data.slug);
    await PagesPage.publishPage(this.driver);
  },
);

When(
  "I create a new EP10 page with cover image and publish it",
  async function () {
    await cleanupPageByTitle(ep10Data.title);
    await PagesPage.clickNewPage(this.driver);
    await PagesPage.fillTitle(this.driver, ep10Data.title);
    await PagesPage.fillContent(this.driver, ep10Data.content);
    const absPath = resolveFixtureImagePath("cover.png");
    await PagesPage.uploadCoverImage(this.driver, absPath);
    await PagesPage.publishPage(this.driver);
  },
);

When("I create and publish a new EP11 page", async function () {
  await cleanupPageByTitle(ep11Data.title);
  await PagesPage.clickNewPage(this.driver);
  await PagesPage.fillTitle(this.driver, ep11Data.title);
  await PagesPage.fillContent(this.driver, ep11Data.content);
  await PagesPage.publishPage(this.driver);
});

When("I unpublish the EP11 page", async function () {
  await updatePageStatusByTitle(ep11Data.title, "draft");
});

When("I create and publish a new EP12 page", async function () {
  await cleanupPageBySlug(ep12Data.slug);
  await cleanupPageByTitle(ep12Data.title);
  await PagesPage.clickNewPage(this.driver);
  await PagesPage.fillTitle(this.driver, ep12Data.title);
  await PagesPage.fillContent(this.driver, ep12Data.content);
  await PagesPage.setSlug(this.driver, ep12Data.slug);
  await PagesPage.publishPage(this.driver);
});

When("I open and delete the EP12 page", async function () {
  await cleanupPageBySlug(ep12Data.slug);
  await cleanupPageByTitle(ep12Data.title);
  await PagesPage.navigateToPages(this.driver);
});

When("I filter pages by drafts", async function () {
  await PagesPage.filterByDrafts(this.driver);
});

Then("I should see the EP09 page in the pages list", async function () {
  await PagesPage.assertPageVisible(this.driver, ep09Data.title);
});

Then("the EP09 page should be publicly accessible", async function () {
  await PagesPage.assertPagePublic(this.driver, GHOST_URL, ep09Data.slug);
});

Then("the page should display a cover image", async function () {
  await assertPageHasFeatureImageByTitle(ep10Data.title);
});

Then("I should see the EP11 page as a draft", async function () {
  const els = await this.driver.$$(`a*=${ep11Data.title}`);
  if (els.length === 0) {
    throw new Error(
      `No se encontró la página "${ep11Data.title}" en el filtro de borradores`,
    );
  }
});

Then("the EP12 page should not be in the pages list", async function () {
  await assertPageNotPresentByTitleOrSlug(ep12Data.title, ep12Data.slug);
});

Then("the EP12 page URL should return 404", async function () {
  await assertPageNotPresentByTitleOrSlug(ep12Data.title, ep12Data.slug);
});

Given("I navigate to the Tags section", async function () {
  await TagsPage.navigateToTags(this.driver);
});

When(
  "I create a new EP13 tag with name, slug and description",
  async function () {
    await cleanupTagBySlug(ep13Data.slug);
    await createTagByApi(ep13Data);
  },
);

When("I create a new EP14 tag", async function () {
  await cleanupTagBySlug(ep14Data.slug);
  await createTagByApi(ep14Data);
});

When("I add SEO metadata to the EP14 tag", async function () {
  await updateTagBySlug(ep14Data.slug, {
    meta_title: ep14Data.metaTitle,
    meta_description: ep14Data.metaDescription,
  });
});

When("I create a new EP15 tag with image", async function () {
  await cleanupTagBySlug(ep15Data.slug);
  const absPath = resolveFixtureImagePath("tag.png");
  const featureImage = await uploadImageByApi(absPath);
  await createTagByApi({ ...ep15Data, featureImage });
});

When("I create a new EP16 tag with hex color", async function () {
  await cleanupTagBySlug(ep16Data.slug);
  await createTagByApi({ ...ep16Data, hexColor: ep16Data.hexColor });
});

Then("I should see the EP13 tag in the tags list", async function () {
  await assertTagBySlug(
    ep13Data.slug,
    (tag) => tag.name === ep13Data.name && tag.description === ep13Data.description,
    `Tag "${ep13Data.name}" no encontrado por API`,
  );
});

Then("the EP14 tag SEO metadata should be persisted", async function () {
  await assertTagBySlug(
    ep14Data.slug,
    (tag) =>
      tag.meta_title === ep14Data.metaTitle &&
      tag.meta_description === ep14Data.metaDescription,
    `SEO metadata del tag "${ep14Data.name}" no persistió`,
  );
});

Then("the EP15 tag should display an image", async function () {
  await assertTagBySlug(
    ep15Data.slug,
    (tag) => Boolean(tag.feature_image),
    `El tag "${ep15Data.name}" no tiene imagen registrada`,
  );
});

Then("the EP16 tag color should be persisted", async function () {
  await assertTagBySlug(
    ep16Data.slug,
    (tag) =>
      (tag.accent_color || "").toLowerCase().replace("#", "") ===
      ep16Data.hexColor.toLowerCase(),
    `Color del tag "${ep16Data.name}" no persistió`,
  );
});

const ep05Data = {
  title: `EP05 post ${Date.now()}-${faker.string.alphanumeric(4)}`,
  body: `bodyEP05${faker.string.alphanumeric(8)}`,
};
const ep06Data = {
  title: `EP06 post ${Date.now()}-${faker.string.alphanumeric(4)}`,
  body: `bodyEP06${faker.string.alphanumeric(8)}`,
};
const ep07Data = {
  title: `EP07 post ${Date.now()}-${faker.string.alphanumeric(4)}`,
  body: `bodyEP07${faker.string.alphanumeric(8)}`,
};
const ep08Data = {
  title: `EP08 post ${Date.now()}-${faker.string.alphanumeric(4)}`,
  body: `bodyEP08${faker.string.alphanumeric(8)}`,
  updatedBody: `updatedEP08${faker.string.alphanumeric(8)}`,
};

async function cleanupPostsByTitlePrefix(driver, prefix) {
  const cookie = await adminLoginCookie();
  if (!cookie) return;
  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/posts/?limit=all&fields=id,title`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    },
  );
  if (!listResp.ok) return;
  const listJson = await listResp.json();
  const matches = (listJson.posts || []).filter(
    (p) => p.title && p.title.startsWith(prefix),
  );
  for (const p of matches) {
    await fetch(`${GHOST_URL}/ghost/api/admin/posts/${p.id}/`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json", Cookie: cookie },
    });
  }
}

async function assertPostBodyContainsByTitle(title, expectedBodyText) {
  const cookie = await adminLoginCookie();
  if (!cookie)
    throw new Error(
      "No se pudo autenticar en Ghost Admin API para validar el post",
    );

  const listResp = await fetch(
    `${GHOST_URL}/ghost/api/admin/posts/?limit=all&fields=id,title,lexical,mobiledoc`,
    { headers: { Cookie: cookie, Accept: "application/json" } },
  );

  if (!listResp.ok) {
    throw new Error(
      `No se pudo consultar posts por API. Status: ${listResp.status}`,
    );
  }

  const data = await listResp.json();
  const posts = data.posts || [];
  const match = posts.find((p) => p.title === title);

  if (!match) {
    throw new Error(`Post "${title}" no encontrado en Admin API`);
  }

  const contentDump = `${match.lexical || ""}\n${match.mobiledoc || ""}`;
  if (!contentDump.includes(expectedBodyText)) {
    throw new Error(
      `El post "${title}" no contiene el contenido esperado "${expectedBodyText}"`,
    );
  }
}

When(
  "I create a new post with title {string} and body {string}",
  async function (titleLabel, bodyLabel) {
    let data;
    if (titleLabel.includes("EP05")) {
      data = ep05Data;
    } else if (titleLabel.includes("EP06")) {
      data = ep06Data;
    } else if (titleLabel.includes("EP07")) {
      data = ep07Data;
    } else if (titleLabel.includes("EP08")) {
      data = ep08Data;
    } else {
      throw new Error(`Unknown post label: ${titleLabel}`);
    }

    this.postMessage_title = data.title;

    await PostsPage.navigateToPosts(this.driver);
    await PostsPage.clickNewPost(this.driver);
    await PostEditorPage.fillTitle(this.driver, data.title);
    await PostEditorPage.fillBody(this.driver, data.body);
    await PostEditorPage.waitUntilDraftSaved(this.driver);
  },
);

When("I publish the post immediately", async function () {
  await PostEditorPage.publishNow(this.driver);
  await PostEditorPage.closePublishFlow(this.driver);
  await this.driver.pause(2000);
});

When("I leave the editor without publishing", async function () {
  await PostEditorPage.waitUntilDraftSaved(this.driver);
  await PostEditorPage.exitEditor(this.driver);
  await this.driver.pause(2000);
});

When("I schedule the post for later", async function () {
  await PostEditorPage.waitUntilDraftSaved(this.driver);
  await PostEditorPage.scheduleForLater(this.driver);
  await PostEditorPage.closePublishFlow(this.driver);
  await this.driver.pause(2000);
});

Given(
  "I have a published post with title {string} and body {string}",
  async function (titleLabel, bodyLabel) {
    this.postMessage_title = ep08Data.title;

    await PostsPage.navigateToPosts(this.driver);
    await PostsPage.clickNewPost(this.driver);
    await PostEditorPage.fillTitle(this.driver, ep08Data.title);
    await PostEditorPage.fillBody(this.driver, ep08Data.body);
    await PostEditorPage.waitUntilDraftSaved(this.driver);
    await PostEditorPage.publishNow(this.driver);
    await PostEditorPage.closePublishFlow(this.driver);
    await this.driver.pause(2000);
  },
);

When(
  "I update the published post body to {string}",
  async function (updatedBodyLabel) {
    await PostsPage.navigateToPosts(this.driver);
    await PostsPage.openPostByTitle(this.driver, ep08Data.title);
    await this.driver.pause(1000);
    await PostEditorPage.appendBody(this.driver, ep08Data.updatedBody);
    await PostEditorPage.updatePublishedPost(this.driver);
    await this.driver.pause(2000);
  },
);

Then(
  "I should see the post in the public site with title {string}",
  async function (titleLabel) {
    const title = this.postMessage_title || ep05Data.title;
    await PostsPage.assertPostInAllPosts(this.driver, title);
  },
);

Then(
  "I should see the post in drafts with title {string}",
  async function (titleLabel) {
    const title = this.postMessage_title || ep06Data.title;
    await PostsPage.assertPostInDrafts(this.driver, GHOST_URL, title);
  },
);

Then(
  "I should see the post in scheduled posts with title {string}",
  async function (titleLabel) {
    const title = this.postMessage_title || ep07Data.title;
    await PostsPage.assertPostInScheduled(this.driver, GHOST_URL, title);
  },
);

Then(
  "I should see the updated content in the public site with title {string} and content {string}",
  async function (titleLabel, contentLabel) {
    await assertPostBodyContainsByTitle(ep08Data.title, ep08Data.updatedBody);
  },
);

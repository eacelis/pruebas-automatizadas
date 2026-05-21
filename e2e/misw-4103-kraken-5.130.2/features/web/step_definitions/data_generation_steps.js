const fs = require("fs");
const path = require("path");
const { Given, When, Then, setDefaultTimeout } = require("@cucumber/cucumber");
const { expect } = require("chai");
const TagsPage = require("../../support/pages/TagsPage");
const MembersPage = require("../../support/pages/MembersPage");
const PostsPage = require("../../support/pages/PostsPage");
const PostEditorPage = require("../../support/pages/PostEditorPage");

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
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(path.resolve(__dirname, "../../../.env"));

function loadProperties() {
  const p = path.resolve(__dirname, "../../../properties.json");
  if (!fs.existsSync(p)) return {};
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

const props = loadProperties();
const GHOST_URL = process.env.GHOST_URL || props.GHOST_URL || "http://localhost:2368";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || props.ADMIN_EMAIL || "cientificstudy@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || props.ADMIN_PASSWORD || "ingeniero1999";

async function getAdminCookie() {
  const loginResp = await fetch(`${GHOST_URL}/ghost/api/admin/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!loginResp.ok) return null;
  const raw = loginResp.headers.get("set-cookie");
  return raw ? raw.split(";")[0] : null;
}

async function cleanupMemberByEmail(email) {
  try {
    const cookie = await getAdminCookie();
    if (!cookie) return;
    const listResp = await fetch(
      `${GHOST_URL}/ghost/api/admin/members/?filter=email:${encodeURIComponent(email)}`,
      { headers: { "Content-Type": "application/json", Cookie: cookie } }
    );
    if (!listResp.ok) return;
    const json = await listResp.json();
    for (const m of json.members || []) {
      await fetch(`${GHOST_URL}/ghost/api/admin/members/${m.id}/`, {
        method: "DELETE",
        headers: { Cookie: cookie },
      });
    }
  } catch (_) {}
}

Given("I navigate to the new tag form", async function () {
  await TagsPage.navigateToTags(this.driver);
  await TagsPage.clickNewTag(this.driver);
});

When("I navigate to posts", async function () {
  await PostsPage.navigateToPosts(this.driver);
});

When("I click on new post button", async function () {
  await PostsPage.clickNewPost(this.driver);
});

When("I type the tag name {string}", async function (name) {
  if (name && name.trim().length > 0) {
    await TagsPage.fillName(this.driver, name);
  }
});

When("I submit the tag form", async function () {
  await TagsPage.save(this.driver);
});

Then("the tag creation should result in {string}", async function (expectedResult) {
  const url = await this.driver.getUrl();
  if (expectedResult === "success") {
    if (url.includes("/tags/new")) {
      throw new Error(`Se esperaba que el tag se guardara pero URL es: ${url}`);
    }
  } else {
    if (!url.includes("/tags/new")) {
      throw new Error(`Se esperaba error de validación pero el tag fue guardado (URL: ${url})`);
    }
  }
});

When("I fill in the member email field for apriori {string}", async function (email) {
  if (email && email.trim().length > 0) {
    if (!email.includes(" ") && email.includes("@") && email.split("@")[1].length > 0) {
      await cleanupMemberByEmail(email);
    }
    await MembersPage.fillMemberEmail(this.driver, email);
  }
});

Then("the member creation should result in {string}", async function (expectedResult) {
  const url = await this.driver.getUrl();
  if (expectedResult === "success") {
    if (url.includes("/members/new")) {
      throw new Error(`Se esperaba que el member se guardara pero URL sigue en /members/new`);
    }
  } else {
    if (!url.includes("/members/new")) {
      throw new Error(`Se esperaba error de validación pero el member fue guardado (URL: ${url})`);
    }
  }
});

When("I fill the tag name with the dynamic value", async function () {
  if (this.dynamicTag && this.dynamicTag.name) {
    await TagsPage.fillName(this.driver, this.dynamicTag.name);
  }
});

When("I fill the tag name with the dynamic value for {string}", async function (expectedResult) {
  if (expectedResult === "success") {
    const suffix = Date.now().toString(36);
    const name = (this.dynamicTag && this.dynamicTag.name) || `dyn-tag-${suffix}`;
    await TagsPage.fillName(this.driver, name);
  }
});

When("I fill the tag name with the invalid dynamic value", async function () {});

Then("the dynamic tag should be saved successfully", async function () {
  const url = await this.driver.getUrl();
  if (url.includes("/tags/new")) {
    throw new Error(`El tag dinámico no fue guardado — URL sigue en /tags/new`);
  }
});

Then("the tag creation should show a validation error", async function () {
  const url = await this.driver.getUrl();
  if (!url.includes("/tags/new")) {
    throw new Error(`Se esperaba error de validación pero URL es: ${url}`);
  }
});

When("I fill the member name with the dynamic value", async function () {
  const name = (this.dynamicMember && this.dynamicMember.name) || "Dynamic Member";
  await MembersPage.fillMemberName(this.driver, name);
});

When("I fill the member email with the dynamic value", async function () {
  if (this.dynamicMember && this.dynamicMember.email) {
    await cleanupMemberByEmail(this.dynamicMember.email);
    await MembersPage.fillMemberEmail(this.driver, this.dynamicMember.email);
  }
});

When("I fill the member email with the dynamic value for {string}", async function (expectedResult) {
  if (expectedResult === "success") {
    const email = (this.dynamicMember && this.dynamicMember.email) || `dynamic-${Date.now()}@pruebas.com`;
    await cleanupMemberByEmail(email);
    await MembersPage.fillMemberEmail(this.driver, email);
  } else {
    await MembersPage.fillMemberEmail(this.driver, `invalid-${Date.now()}`);
  }
});

When("I fill the member email with the invalid dynamic value", async function () {
  if (this.dynamicMember && this.dynamicMember.email) {
    await MembersPage.fillMemberEmail(this.driver, this.dynamicMember.email);
  }
});

Then("the dynamic member should be saved successfully", async function () {
  const url = await this.driver.getUrl();
  if (url.includes("/members/new")) {
    throw new Error(`El member dinámico no fue guardado — URL sigue en /members/new`);
  }
});

Then("the member creation should show a validation error", async function () {
  const url = await this.driver.getUrl();
  if (!url.includes("/members/new")) {
    throw new Error(`Se esperaba error de validación pero el member fue guardado (URL: ${url})`);
  }
});

When("I fill the post title with the random value", async function () {
  if (this.randomData && this.randomData.title) {
    await PostEditorPage.fillTitle(this.driver, this.randomData.title);
  }
});

When("I fill the post body with the random value", async function () {
  if (this.randomData && this.randomData.content) {
    await PostEditorPage.fillBody(this.driver, this.randomData.content);
  }
});

When("I wait for the post draft to be auto-saved", async function () {
  await PostEditorPage.waitUntilDraftSaved(this.driver);
});

Then("the post editor should not show any crash error", async function () {
  const url = await this.driver.getUrl();
  if (!url.includes("/editor/post")) {
    throw new Error(`Se esperaba estar en el editor de posts pero URL es: ${url}`);
  }
  const errorAlerts = await this.driver.$$('.gh-alert-red');
  if (errorAlerts.length > 0) {
    let text = "";
    try { text = await errorAlerts[0].getText(); } catch (_) {}
    throw new Error(`Se encontró un error inesperado en el editor: ${text}`);
  }
});

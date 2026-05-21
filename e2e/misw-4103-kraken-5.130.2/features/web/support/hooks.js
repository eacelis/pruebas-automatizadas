const { After, AfterStep, Before } = require("@cucumber/cucumber");
const { faker } = require("@faker-js/faker");
const { WebClient } = require("kraken-node");
const fs = require("fs");
const path = require("path");

function loadProperties() {
  try {
    const propertiesPath = path.resolve(__dirname, "../../../properties.json");
    return JSON.parse(fs.readFileSync(propertiesPath, "utf8"));
  } catch (_) {
    return {};
  }
}

function safeName(value) {
  return String(value || "step")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase()
    .slice(0, 120);
}

function scenarioIdFromPickle(pickle) {
  const tags = (pickle && pickle.tags) || [];
  const tag = tags
    .map((item) => item.name || "")
    .find((name) => /^@(TC|EP)-?\d+/i.test(name));

  if (tag) {
    return tag.replace(/^@/, "").replace(/^([A-Za-z]+)(\d+)$/, "$1-$2").toUpperCase();
  }

  return safeName((pickle && pickle.name) || "scenario");
}

function withTimeout(promise, timeoutMs) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("operation timed out")), timeoutMs),
    ),
  ]);
}

const props = loadProperties();
const screenshotBaseDir =
  process.env.SCREENSHOT_DIR || props.SCREENSHOT_DIR || "../../screenshots/5.130.2/kraken";

Before(async function ({ pickle } = {}) {
  this.userId = this.userId || 1;
  this.testScenarioId = this.testScenarioId || `web-${Date.now()}`;
  this.scenarioId = scenarioIdFromPickle(pickle);
  this.stepNames = ((pickle && pickle.steps) || []).map((step) => step.text);
  this.stepNumber = 0;
  this.deviceClient = new WebClient("chrome", {}, this.userId);
  this.driver = await this.deviceClient.startKrakenForUserId(this.userId);
});

AfterStep(async function () {
  if (!this.driver) return;

  this.stepNumber = (this.stepNumber || 0) + 1;
  const stepName = safeName(
    (this.stepNames && this.stepNames[this.stepNumber - 1]) || `step_${this.stepNumber}`
  );
  const filename = `${String(this.stepNumber).padStart(2, "0")}_${stepName}.png`;
  const directory = path.resolve(process.cwd(), screenshotBaseDir, this.scenarioId || "scenario");
  const filePath = path.join(directory, filename);

  fs.mkdirSync(directory, { recursive: true });
  try {
    const screenshot = await withTimeout(this.driver.takeScreenshot(), 5000);
    fs.writeFileSync(filePath, screenshot, "base64");
  } catch (_) {}
});

After(async function () {
  try {
    await withTimeout(this.deviceClient.stopKrakenForUserId(this.userId), 8000);
  } catch (_) {}
});

Before({ tags: '@dynamic-tag' }, function () {
  const suffix = faker.string.alphanumeric(8).toLowerCase();
  this.dynamicTag = {
    name: `dyn-tag-${suffix}`,
    expected: 'success'
  };
});

Before({ tags: '@dynamic-invalid-tag' }, function () {
  this.dynamicTag = {
    name: '',
    expected: 'error'
  };
});

Before({ tags: '@dynamic-member' }, function () {
  this.dynamicMember = {
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    expected: 'success'
  };
});

Before({ tags: '@dynamic-invalid-member' }, function () {
  this.dynamicMember = {
    email: faker.string.alphanumeric(10),
    name: faker.person.fullName(),
    expected: 'error'
  };
});

Before({ tags: '@random' }, function () {
  this.randomData = {
    title: faker.lorem.words(faker.number.int({ min: 2, max: 10 })),
    content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }))
  };
});

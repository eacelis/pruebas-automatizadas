const { defineConfig } = require("cypress");
const fs = require("fs");
const path = require("path");

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

loadDotEnv(path.resolve(__dirname, ".env"));

const ghostUrl = process.env.GHOST_URL || "http://localhost:2369";
const ghostAdminUrl = process.env.GHOST_ADMIN_URL || `${ghostUrl}/ghost`;
const adminEmail = process.env.GHOST_ADMIN_EMAIL || "cientificstudy@gmail.com";
const adminPassword = process.env.GHOST_ADMIN_PASSWORD || "ingeniero1999";

module.exports = defineConfig({
  reporter: "cypress-mochawesome-reporter",
  reporterOptions: {
    charts: true,
    reportPageTitle: "Reporte de Pruebas Ghost",
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
  },
  trashAssetsBeforeRuns: false,
  e2e: {
    baseUrl: "http://localhost:2369",
    specPattern: "cypress/e2e/**/*.cy.js",
    screenshotsFolder: "../../screenshots/6.36.0/cypress",
    videosFolder: "cypress/videos",
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    viewportWidth: 1280,
    viewportHeight: 800,
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
  },
  env: {
    GHOST_URL: ghostUrl,
    GHOST_ADMIN_URL: ghostAdminUrl,
    ADMIN_EMAIL: adminEmail,
    ADMIN_PASSWORD: adminPassword,
  },
});

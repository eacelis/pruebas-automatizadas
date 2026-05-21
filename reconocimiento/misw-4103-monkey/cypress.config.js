const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "monkey-cypress.io.github.thesoftwaredesignlab",
  reporter: require.resolve("mochawesome"),
  reporterOptions: {
    reportDir: "cypress/results",
    reportFilename: "monkey-test-[datetime]",
    overwrite: false,
    json: true,
    charts: true,
  },
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: "http://localhost:2368",
    viewportWidth: 1920,
    viewportHeight: 1080,
  },
  env: {
    // ── Credenciales Ghost Admin ──────────────────────────────────────────────
    // Usadas en el bloque before() de monkey.cy.js como pre-condición de login.
    // Requiere que Ghost corra con: security__staffDeviceVerification=false
    adminEmail: "cientificstudy@gmail.com",
    adminPassword: "ingeniero1999",

    // ── Configuración de reproducibilidad ─────────────────────────────────────
    // Semillas específicas por funcionalidad para patrones de acción diferenciados
    // seeds: {
    //   dashboard: 0xf1ae533d,  // F1 Dashboard
    //   posts: 0xdeadbeef,      // F2 Posts
    //   pages: 0xcafe1234,      // F3 Pages
    //   tags: 0xabad1dea,       // F4 Tags
    //   members: 0x1337c0de,    // F5 Members
    // },
    seeds: {
      dashboard: 0xc0ffee42, // F1 Dashboard
      posts: 0x1a2b3c4d, // F2 Posts
      pages: 0x5e6f7a8b, // F3 Pages
      tags: 0x9c0d1e2f, // F4 Tags
      members: 0x3f4a5b6c, // F5 Members
    },
    delay: 1000,

    // ── Acciones del monkey ───────────────────────────────────────────────────
    actions: {
      click: 0,
      scroll: 10,
      keypress: 0,
      viewport: 2,
      navigation: 8,
      smartClick: 20,
      smartCleanup: 0,
      smartInput: 5,
    },
  },
  pageLoadTimeout: 120000,
  screenshotsFolder: "cypress/results/screenshots",
  videosFolder: "cypress/results/videos",
  video: true,
  videoCompression: 32,
});

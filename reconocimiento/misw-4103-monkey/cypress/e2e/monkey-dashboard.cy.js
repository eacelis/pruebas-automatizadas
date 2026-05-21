// Funcionalidad: F1 Dashboard | Semilla: 0xf1ae533d | Ruta: /ghost/#/dashboard

import { faker } from "@faker-js/faker";

function jsf32(a, b, c, d) {
  return function () {
    a |= 0;
    b |= 0;
    c |= 0;
    d |= 0;
    var t = (a - ((b << 27) | (b >>> 5))) | 0;
    a = b ^ ((c << 17) | (c >>> 15));
    b = (c + d) | 0;
    c = (d + t) | 0;
    d = (a + t) | 0;
    return (d >>> 0) / 4294967296;
  };
}

describe("monkey - F1 Dashboard", () => {
  cy.on("uncaught:exception", (value) => {
    cy.addActionContext({ title: "Uncaught exception", value });
  });
  cy.on("window:alert", (value) => {
    cy.addActionContext({ title: "Window alert", value });
  });
  cy.on("fail", (value) => {
    cy.addActionContext({ title: "Fail", value });
    return false;
  });

  const SEED = Cypress.env("seeds").dashboard;
  const delay = Cypress.env("delay");
  const actions = Cypress.env("actions");

  const state = {
    viewport: {},
    pos: { x: 0, y: 0 },
  };

  let random, randInt;

  before(() => {
    random = jsf32(0xf1ae533d, SEED, SEED, SEED);
    randInt = (min, max) => Math.round(random() * (max - min)) + min;
    faker.seed(SEED);

    cy.window().updateViewport(state);
    cy.wait(delay);
    cy.addActionContext({
      title: "Before All",
      value: {
        viewport: `${state.viewport.w}x${state.viewport.h}`,
        seed: SEED,
        delay,
      },
    });

    cy.visit("/ghost/#/signin");

    cy.get("[data-test-input='email']", { timeout: 15000 })
      .should("be.visible")
      .type(Cypress.env("adminEmail"), { log: false });

    cy.get("[data-test-input='password']")
      .should("be.visible")
      .type(Cypress.env("adminPassword"), { log: false });

    cy.get("[data-test-button='sign-in']").click();

    cy.url({ timeout: 15000 }).should("include", "/ghost/#/dashboard");
    cy.wait(delay);

    cy.visit("/ghost/#/dashboard");
    cy.url().should("include", "/ghost/#/dashboard");
  });

  after(() => {
    cy.addActionContext("videos/monkey-dashboard.cy.js.mp4");
  });

  const events = {
    click: (cb) => cy.window().rElement(randInt, state).rClick(randInt, cb),
    scroll: (cb) => cy.rScroll(randInt, state, cb),
    keypress: (cb) => cy.window().rKeypress(randInt, cb),
    viewport: (cb) => cy.rViewport(randInt, cb).updateViewport(state),
    navigation: (cb) => cy.rNavigation(randInt, cb),

    smartClick: (cb) => cy.window().rClickable(randInt).rClick(randInt, cb),
    smartCleanup: (cb) => cy.rCleanup(randInt, cb),
    smartInput: (cb) => cy.rInput(randInt, cb),
  };

  it("test random events", function () {
    const addActionContext = (details) => cy.addActionContext(details);

    // Extracts available actions with remaining counts and calculates total actions left.
    let [names, actionsLeft] = Object.entries(actions).reduce(
      (acc, a) => {
        if (a[1] > 0) return [[...acc[0], a[0]], acc[1] + a[1]];
        return acc;
      },
      [[], 0],
    );
    const availableActions = names.length - 1;

    let index;
    while (actionsLeft > 0) {
      cy.addActionContext({
        title: "Actions left",
        value: names.reduce((acc, a) => {
          acc[a] = actions[a];
          return acc;
        }, {}),
      });

      index = names[randInt(0, availableActions)];
      if (actions[index] > 0) {
        events[index](addActionContext);
        cy.wait(delay);

        actions[index]--;
        actionsLeft--;
      } else {
        // remove the action from the list once it is exhausted
        delete actions[index];
        names = names.filter((n) => n !== index);
      }
    }
  });
});

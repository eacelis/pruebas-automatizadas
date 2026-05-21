class LoginPage {
  get emailInput() {
    return cy
      .get(
        '[data-test-input="email"], input[name="identification"], input[name="email"]',
      )
      .first();
  }
  get passwordInput() {
    return cy.get('[data-test-input="password"], input[name="password"]').first();
  }
  get submitButton() {
    return cy.get('[data-test-button="sign-in"], button[type="submit"]').first();
  }

  get adminUrl() {
    return Cypress.env("GHOST_ADMIN_URL") || `${Cypress.config("baseUrl")}/ghost`;
  }

  navigate() {
    cy.visit(`${this.adminUrl}/#/signin`);
    cy.location("hash", { timeout: 15000 }).then((hash) => {
      if (hash.includes("/setup")) {
        throw new Error(
          "Ghost está en la pantalla de setup inicial. Configura la cuenta de administrador antes de ejecutar las pruebas E2E.",
        );
      }
    });
    cy.url().should("include", "/ghost");
    cy.screenshotStep("navigateToLogin");
  }

  login(email, password) {
    this.navigate();
    cy.location("hash", { timeout: 15000 }).then((hash) => {
      if (hash.includes("/dashboard")) {
        return;
      }

      this.emailInput.should("be.visible").clear().type(email);
      this.passwordInput.should("be.visible").clear().type(password);
      this.submitButton.click();
    });

    cy.url({ timeout: 15000 }).should("include", "/ghost/#/dashboard");
    cy.screenshotStep("login");
  }

  loginWithEnvCredentials() {
    const email = Cypress.env("ADMIN_EMAIL");
    const password = Cypress.env("ADMIN_PASSWORD");

    if (!email || !password) {
      throw new Error(
        "Faltan ADMIN_EMAIL y ADMIN_PASSWORD en la configuración de Cypress.",
      );
    }

    this.login(email, password);
  }
}

module.exports = new LoginPage();

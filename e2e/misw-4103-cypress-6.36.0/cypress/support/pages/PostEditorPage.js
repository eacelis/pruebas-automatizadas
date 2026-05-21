class PostEditorPage {
  get titleInput() {
    return cy.get("[data-test-editor-title-input]").first();
  }

  get bodyEditor() {
    return cy.get('.gh-koenig-editor-pane [contenteditable="true"]').first();
  }

  get publishFlowButton() {
    return cy.get('[data-test-button="publish-flow"]:visible').first();
  }

  get continueButton() {
    return cy.get('[data-test-button="continue"]').first();
  }

  get confirmPublishButton() {
    return cy.get('[data-test-button="confirm-publish"]').first();
  }

  get closePublishFlowButton() {
    return cy.get('[data-test-button="close-publish-flow"]').first();
  }

  get publishFlowModal() {
    return cy.get('[data-test-modal="publish-flow"]', { timeout: 15000 });
  }

  get updateButton() {
    return cy.get('[data-test-button="publish-save"]').first();
  }

  get breadcrumbButton() {
    return cy.get("[data-test-breadcrumb]").first();
  }

  get scheduleRadio() {
    return cy
      .get('[data-test-setting="publish-at"] [data-test-radio="schedule"]')
      .parent(".gh-radio");
  }

  get publishAtSettingTitle() {
    return cy
      .get('[data-test-setting="publish-at"] [data-test-setting-title]')
      .first();
  }

  get dateInput() {
    return cy
      .get(
        '[data-test-setting="publish-at"] [data-test-date-time-picker-date-input]',
      )
      .first();
  }

  get timeInput() {
    return cy
      .get(
        '[data-test-setting="publish-at"] [data-test-date-time-picker-time-input]',
      )
      .first();
  }

  get publishAtForm() {
    return cy
      .get('[data-test-setting="publish-at"] .gh-publish-setting-form')
      .filter(":visible")
      .first();
  }

  get savedStatus() {
    return cy.get("body", { timeout: 20000 });
  }

  trackPostRequests() {
    cy.intercept("POST", "**/ghost/api/admin/posts/**").as("createPost");
    cy.intercept("PUT", "**/ghost/api/admin/posts/**").as("updatePost");
  }

  enterTitle(title) {
    this.titleInput.should("be.visible").clear().type(title);
    cy.screenshotStep("enterTitle");
  }

  enterBody(body) {
    this.bodyEditor.should("be.visible").click();
    cy.focused().type(body, {
      delay: 10,
      parseSpecialCharSequences: false,
    });
    cy.screenshotStep("enterBody");
  }

  appendBody(body) {
    this.bodyEditor.should("be.visible").click();
    cy.focused().type(`{end}{enter}`, { delay: 0 });
    cy.focused().type(body, {
      delay: 10,
      parseSpecialCharSequences: false,
    });
    cy.screenshotStep("appendBody");
  }

  waitForDraftCreation() {
    cy.wait("@createPost", { timeout: 20000 })
      .its("response.statusCode")
      .should((statusCode) => {
        expect([200, 201]).to.include(statusCode);
      });
  }

  waitForPostUpdate() {
    cy.wait("@updatePost", { timeout: 20000 })
      .its("response.statusCode")
      .should((statusCode) => {
        expect([200, 201]).to.include(statusCode);
      });
  }

  waitUntilDraftIsSaved() {
    this.savedStatus.should(($body) => {
      const text = $body.text();
      expect(text).to.match(/Draft(?:\s*-\s*Saved)?/);
    });
  }

  openPublishFlow() {
    this.publishFlowButton.should("be.visible").click({ force: true });
    this.publishFlowModal.should("be.visible");
    this.continueButton.should("be.visible");
    cy.screenshotStep("openPublishFlow");
  }

  continueToFinalReview() {
    this.continueButton.should("be.visible").click();
    cy.screenshotStep("continueToFinalReview");
  }

  confirmPublish() {
    this.confirmPublishButton.should("be.visible").click();
    cy.screenshotStep("confirmPublish");
  }

  publishNow() {
    this.openPublishFlow();
    this.continueToFinalReview();
    this.confirmPublish();
    this.waitForPostUpdate();
  }

  scheduleForLater(date, time) {
    this.openPublishFlow();
    this.publishAtSettingTitle.should("be.visible").click({ force: true });
    this.publishAtForm.should("be.visible");
    this.scheduleRadio.should("be.visible").click();
    this.dateInput.should("be.visible").clear().type(date);
    this.timeInput.should("be.visible").clear().type(time).blur();
    this.continueToFinalReview();
    this.confirmPublish();
    this.waitForPostUpdate();
    cy.screenshotStep("scheduleForLater");
  }

  closePublishFlow() {
    this.closePublishFlowButton.should("be.visible").click({ force: true });
    cy.screenshotStep("closePublishFlow");
  }

  returnToPostsList() {
    this.breadcrumbButton.should("be.visible").click();
    cy.screenshotStep("returnToPostsList");
  }

  savePublishedChanges() {
    this.updateButton.should("be.visible").click();
    // Ghost can persist this change via autosave without emitting a consistent
    // update request alias, so avoid a hard network wait here.
    cy.wait(1200);
    cy.screenshotStep("savePublishedChanges");
  }
}

module.exports = new PostEditorPage();

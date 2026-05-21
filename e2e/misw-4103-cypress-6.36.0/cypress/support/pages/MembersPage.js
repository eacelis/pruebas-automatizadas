class MembersPage {
  get newMemberButton() {
    return cy
      .get(
        'a[href="#/members/new"], a[href="#/members/new/"], a[href^="#/members/new"], a[data-test-new-member-button]',
      )
      .first();
  }
  get nameInput() {
    return cy.get("input#member-name");
  }
  get emailInput() {
    return cy.get("input#member-email");
  }
  get noteInput() {
    return cy.get("textarea#member-note");
  }
  get saveButton() {
    return cy.get("button.gh-btn-primary").contains("Save");
  }
  get actionsMenu() {
    return cy.get('button[data-test-button="member-actions"]');
  }
  get deleteMenuItem() {
    return cy.get('button[data-test-button="delete-member"]');
  }
  get confirmDeleteButton() {
    return cy.get("button.gh-btn-red").contains("Delete member");
  }
  get labelsInput() {
    return cy.get(".gh-member-label-input input");
  }
  appliedLabel(labelName) {
    return cy.get(".ember-power-select-multiple-option").contains(labelName);
  }

  memberRowByEmail(email) {
    return cy.contains(
      '[data-test-list="members-list-item"], tr, .gh-list-data, td',
      email,
      { timeout: 20000 },
    );
  }

  waitMembersListLoaded() {
    cy.wait("@getMembers", { timeout: 20000 });
  }

  navigateToMembers() {
    cy.intercept("GET", "**/ghost/api/admin/members/**").as("getMembers");
    cy.visit("/ghost/#/members");
    cy.url().should("include", "/ghost/#/members");
    this.waitMembersListLoaded();
    this.newMemberButton.should("be.visible");
    cy.screenshotStep("navigateToMembers");
  }

  openNewMemberForm() {
    this.navigateToMembers();
    this.newMemberButton.click();
    cy.url().should("include", "/ghost/#/members/new");
    cy.screenshotStep("openNewMemberForm");
  }

  createMember(name, email) {
    this.openNewMemberForm();
    this.nameInput.clear({ force: true }).type(name, { force: true });
    this.emailInput.clear({ force: true }).type(email, { force: true });
    cy.intercept("POST", "**/ghost/api/admin/members/**").as("createMember");
    this.saveButton.click();
    cy.wait("@createMember", { timeout: 20000 })
      .its("response.statusCode")
      .should("eq", 201);
    cy.url().should("not.include", "/new");
    cy.screenshotStep("createMember");
  }

  openMemberByEmail(email) {
    this.navigateToMembers();
    this.memberRowByEmail(email).scrollIntoView().click({ force: true });
    cy.url().should("include", "/ghost/#/members/");
    cy.screenshotStep("openMemberByEmail");
  }

  editNameAndNote(newName, note) {
    this.nameInput.clear({ force: true }).type(newName, { force: true });
    this.noteInput.clear({ force: true }).type(note, { force: true });
    this.saveButton.click();
    cy.screenshotStep("editNameAndNote");
  }

  deleteCurrentMember() {
    this.actionsMenu.click();
    this.deleteMenuItem.click();
    cy.intercept("DELETE", "**/ghost/api/admin/members/**").as("deleteMember");
    this.confirmDeleteButton.click();
    cy.wait("@deleteMember", { timeout: 20000 })
      .its("response.statusCode")
      .should("eq", 204);
    cy.url().should("include", "/ghost/#/members");
    cy.screenshotStep("deleteCurrentMember");
  }

  assertMemberVisible(email) {
    this.navigateToMembers();
    this.memberRowByEmail(email).should("exist");
    cy.screenshotStep("assertMemberVisible");
  }

  assertMemberNotVisible(email) {
    this.navigateToMembers();
    cy.contains(
      '[data-test-list="members-list-item"], tr, .gh-list-data, td',
      email,
    ).should("not.exist");
    cy.screenshotStep("assertMemberNotVisible");
  }

  assertMemberName(expectedName) {
    this.nameInput.should("have.value", expectedName);
    cy.screenshotStep("assertMemberName");
  }
}

module.exports = new MembersPage();

class PostsPage {
  get adminUrl() {
    return Cypress.env("GHOST_ADMIN_URL") || `${Cypress.config("baseUrl")}/ghost`;
  }

  get postsTitle() {
    return cy.get("main, .gh-canvas, .gh-main").first();
  }

  get newPostButton() {
    return cy
      .get(
        '[data-test-nav="new-story"], a[href="#/editor/post"], a[href="#/editor/post/"], a[data-test-new-post-button]',
      )
      .first();
  }

  postTitle(title) {
    return cy.contains("h3.gh-content-entry-title", title, { timeout: 20000 });
  }

  navigateToPosts(filter = "") {
    const query = filter ? `?type=${filter}` : "";

    cy.visit(`${this.adminUrl}/#/posts${query}`);
    this.postsTitle.should("be.visible");
    cy.screenshotStep(`navigateToPosts${filter ? `_${filter}` : ""}`);
  }

  navigateToDrafts() {
    this.navigateToPosts("draft");
  }

  navigateToScheduled() {
    this.navigateToPosts("scheduled");
  }

  openNewPostEditor() {
    this.navigateToPosts();
    this.newPostButton.should("be.visible").click();
    cy.location("hash", { timeout: 15000 }).should("include", "/editor/post");
    cy.screenshotStep("openNewPostEditor");
  }

  openPostByTitle(title, filter = "") {
    this.navigateToPosts(filter);
    this.postTitle(title).click();
    cy.location("hash", { timeout: 15000 }).should("include", "/editor/post");
    cy.screenshotStep("openPostByTitle");
  }

  assertPostVisibleInList(title, filter = "") {
    this.navigateToPosts(filter);
    this.postTitle(title).scrollIntoView().should("exist");
  }
}

module.exports = new PostsPage();

class SitePage {
  get siteUrl() {
    return Cypress.env("GHOST_URL") || Cypress.config("baseUrl");
  }

  visitHome() {
    cy.visit(this.siteUrl);
  }

  findPostElementAcrossPages(title, page = 1, maxPages = 5) {
    const base = this.siteUrl.replace(/\/$/, "");
    const url = page === 1 ? base : `${base}/page/${page}/`;

    cy.visit(url);

    return cy.get("body", { timeout: 20000 }).then(($body) => {
      const matches = $body
        .find("a, h1, h2, h3")
        .filter((_, el) => Cypress.$(el).text().includes(title));

      if (matches.length > 0) {
        return cy.wrap(matches.first());
      }

      if (page < maxPages) {
        return this.findPostElementAcrossPages(title, page + 1, maxPages);
      }

      throw new Error(
        `No se encontró el post "${title}" en el sitio público (revisadas ${maxPages} páginas)`,
      );
    });
  }

  assertPostVisible(title) {
    this.findPostElementAcrossPages(title).should("be.visible");
  }

  openPostByTitle(title) {
    this.findPostElementAcrossPages(title).then(($match) => {
      const link = $match.is("a") ? $match : $match.closest("a");

      if (link.length > 0) {
        cy.wrap(link).click({ force: true });
        return;
      }

      cy.wrap($match).click({ force: true });
    });
  }

  assertPostContent(body) {
    cy.contains("p, div", body, { timeout: 20000 }).should("be.visible");
  }
}

module.exports = new SitePage();

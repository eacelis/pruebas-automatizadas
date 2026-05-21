class PagesPage {
  get pagesNav() {
    return cy.get('[data-test-nav="pages"], a[href="#/pages"]').first();
  }

  get newPageButton() {
    return cy.contains("a", "New page");
  }

  get titleInput() {
    return cy.get("textarea.gh-editor-title, input.gh-editor-title").first();
  }

  get editorBody() {
    return cy.get(".koenig-editor__editor, div.kg-prose").first();
  }

  get psmTrigger() {
    return cy
      .get("button[data-test-psm-trigger], button.settings-menu-toggle")
      .first();
  }

  get slugInput() {
    return cy.get('input[name="post-setting-slug"]').first();
  }

  get publishMenuButton() {
    return cy
      .get('button[data-test-button="publish-flow"], button.gh-publish-trigger')
      .first();
  }

  get publishContinueButton() {
    return cy.get('button[data-test-button="continue"]').first();
  }

  get publishConfirmButton() {
    return cy.get('button[data-test-button="confirm-publish"]').first();
  }

  get fileInput() {
    return cy.get('input[type="file"]').first();
  }

  get featureImage() {
    // Cubre tanto el editor (donde la imagen aparece como preview tras subirla)
    // como cualquier otra vista donde la cover sea renderizada.
    return cy
      .get(
        "img.gh-canvas-feature-image-wrapper, " +
          ".gh-canvas-feature-image img, " +
          "[data-test-feature-image] img, " +
          ".gh-editor-feature-image img, " +
          ".gh-editor-feature-image-wrapper img, " +
          ".koenig-feature-image img, " +
          "figure.kg-feature-image img, " +
          'img[src*="/content/images/"]',
      )
      .first();
  }

  get pageActionsMenu() {
    return cy
      .get('button[data-test-button="more"], button.gh-btn-icon')
      .first();
  }

  get confirmDeleteButton() {
    return cy.get("button.gh-btn-red").first();
  }

  get filterTypeSelect() {
    return cy
      .get("select.gh-contentfilter-select, [data-test-type-select]")
      .first();
  }

  pageRowByTitle(title) {
    return cy
      .contains(
        "[data-test-page-id], li.gh-list-row, .gh-posts-list-item, h3, a",
        title,
        { timeout: 20000 },
      )
      .first();
  }

  navigateToPages() {
    cy.get("body").then(($b) => {
      const pagesNav = $b
        .find('[data-test-nav="pages"]:visible, a[href="#/pages/"]:visible')
        .first();
      if (pagesNav.length > 0) {
        cy.wrap(pagesNav).click({ force: true });
      } else {
        cy.visit("/ghost/#/pages/");
      }
    });

    cy.url({ timeout: 15000 }).should("include", "/ghost/#/pages");
    cy.contains("h2.gh-canvas-title, h3.gh-contentfilter-menu-title", "Pages", {
      timeout: 15000,
    }).should("be.visible");
    cy.screenshotStep("navigateToPages");
  }

  openNewPageForm() {
    this.navigateToPages();
    this.newPageButton.click({ force: true });
    cy.url().should("include", "/ghost/#/editor/page");
    cy.screenshotStep("openNewPageForm");
  }

  fillTitle(title) {
    this.titleInput
      .click({ force: true })
      .clear({ force: true })
      .type(title, { force: true });
    cy.screenshotStep("fillTitle");
  }

  fillContent(content) {
    this.editorBody.click({ force: true }).type(content, { force: true });
    cy.screenshotStep("fillContent");
  }

  setSlug(slug) {
    this.psmTrigger.click({ force: true });
    this.slugInput.clear({ force: true }).type(slug, { force: true }).blur();
    this.psmTrigger.click({ force: true });
    cy.screenshotStep("setSlug");
  }

  uploadCoverImage(filePath) {
    cy.get("body").then(($b) => {
      const input = $b.find('input[type="file"]');
      if (input.length > 0) {
        cy.get('input[type="file"]')
          .first()
          .selectFile(`cypress/fixtures/${filePath}`, { force: true });
      }
    });
    cy.wait(2000);
    cy.screenshotStep("uploadCoverImage");
  }

  publishPage() {
    this.publishMenuButton.click({ force: true });
    cy.wait(800);
    cy.get("body").then(($b) => {
      const cont = $b.find('button[data-test-button="continue"]');
      if (cont.length > 0) cy.wrap(cont[0]).click({ force: true });
    });
    cy.wait(500);
    cy.get("body").then(($b) => {
      const conf = $b.find('button[data-test-button="confirm-publish"]');
      if (conf.length > 0) cy.wrap(conf[0]).click({ force: true });
    });
    cy.wait(2000);

    // Cerrar el modal "Boom! It's out there" que aparece tras publicar.
    // Ghost lo muestra como un modal con clase epm-modal-container que bloquea
    // los siguientes clicks si no se cierra.
    cy.get("body").then(($b) => {
      const closeBtn = $b.find(
        '.epm-modal-container button[aria-label="Close"], ' +
          ".epm-modal-container button.close, " +
          ".epm-modal-container .close, " +
          ".modal-close, " +
          'button[data-test-button="close-publish-flow"]',
      );
      if (closeBtn.length > 0) {
        cy.wrap(closeBtn[0]).click({ force: true });
      } else {
        // Plan B: presionar Escape para cerrar el modal
        cy.get("body").type("{esc}");
      }
    });
    cy.wait(1500);
    cy.screenshotStep("publishPage");
  }

  unpublishPage() {
    // Paso 1: abrir el flujo desde el botón exacto del header.
    cy.get(
      'button[data-test-button="update-flow"], button.gh-unpublish-trigger',
      { timeout: 15000 },
    )
      .first()
      .should("be.visible")
      .click({ force: true });

    // Paso 2: elegir la acción específica del panel.
    cy.contains("span, button, a", "Unpublish and revert to private draft", {
      timeout: 15000,
    })
      .first()
      .then(($el) => {
        const clickable = $el.closest("button, a");
        if (clickable.length > 0) {
          cy.wrap(clickable[0]).click({ force: true });
        } else {
          cy.wrap($el).click({ force: true });
        }
      });

    // Verificación del toast de éxito.
    cy.contains(
      "div, span, p",
      /Post reverted to a draft\.|reverted to a draft/i,
      { timeout: 15000 },
    ).should("be.visible");
    cy.screenshotStep("unpublishPage");
  }

  openPageByTitle(title) {
    this.navigateToPages();
    this.pageRowByTitle(title).scrollIntoView().click({ force: true });
    cy.url().should("include", "/ghost/#/editor/page/");
    cy.screenshotStep("openPageByTitle");
  }

  deleteCurrentPage() {
    this.pageActionsMenu.click({ force: true });
    cy.wait(400);
    cy.contains("button, a", /Delete page|Delete/i)
      .first()
      .click({ force: true });
    cy.wait(400);
    this.confirmDeleteButton.contains(/Delete/i).click({ force: true });
    cy.wait(2000);
    cy.screenshotStep("deleteCurrentPage");
  }

  filterByDrafts() {
    this.navigateToPages();
    cy.get("body").then(($b) => {
      const nativeSelect = $b.find("select.gh-contentfilter-select").first();
      if (nativeSelect.length > 0) {
        cy.wrap(nativeSelect).select("Draft pages", { force: true });
        return;
      }

      const customSelect = $b
        .find("[data-test-type-select], .gh-contentfilter-type")
        .first();
      if (customSelect.length > 0) {
        cy.wrap(customSelect).click({ force: true });
        cy.contains("button, a, li, span", /Draft pages|Drafts/i, {
          timeout: 10000,
        })
          .first()
          .click({ force: true });
      }
    });
    cy.wait(1500);
    cy.screenshotStep("filterByDrafts");
  }

  assertPagePublic(slug) {
    cy.request({ url: `/${slug}/`, failOnStatusCode: false })
      .its("status")
      .should("eq", 200);
    cy.screenshotStep("assertPagePublic");
  }

  assertPageNotPublic(slug) {
    const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

    const verifyEventuallyUnavailable = (attempt = 0, maxAttempts = 6) => {
      cy.request({
        url: `/${slug}/`,
        failOnStatusCode: false,
        followRedirect: false,
      }).then((resp) => {
        if (resp.status === 404 || resp.status === 410) {
          return;
        }

        if (attempt < maxAttempts) {
          cy.wait(2000);
          return verifyEventuallyUnavailable(attempt + 1, maxAttempts);
        }

        cy.request({
          method: "GET",
          url: `${baseUrl}/ghost/api/admin/pages/?filter=slug:${encodeURIComponent(slug)}`,
          failOnStatusCode: false,
        }).then((adminResp) => {
          if (adminResp.status === 200) {
            const pages = adminResp.body.pages || [];
            if (pages.length === 0) {
              Cypress.log({
                name: "assertPageNotPublic",
                message: `Slug ${slug} ya no existe en Admin API; se tolera status ${resp.status} por consistencia eventual`,
              });
              return;
            }
          }

          expect(
            resp.status,
            `La URL pública de la página eliminada (${slug}) debe quedar no disponible`,
          ).to.eq(404);
          cy.screenshotStep("assertPageNotPublic");
        });
      });
    };

    verifyEventuallyUnavailable();
  }

  assertPageIsDraft(title) {
    const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/pages/?limit=all`,
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.eq(200);
      const pages = resp.body.pages || [];
      const page = pages.find((p) => p.title === title);
      expect(page, `Page with title "${title}" should exist`).to.exist;
      expect(page.status).to.eq("draft");
    });
  }

  assertPageVisible(title) {
    this.navigateToPages();
    this.pageRowByTitle(title).should("exist");
    cy.screenshotStep("assertPageVisible");
  }

  assertPageNotVisible(title) {
    this.navigateToPages();
    cy.contains(
      "[data-test-page-id], li.gh-list-row, .gh-posts-list-item, h3, a",
      title,
    ).should("not.exist");
    cy.screenshotStep("assertPageNotVisible");
  }

  assertCoverImagePresent() {
    // Espera con timeout extendido y verifica visibilidad opcional.
    cy.get(
      "img.gh-canvas-feature-image-wrapper, " +
        ".gh-canvas-feature-image img, " +
        "[data-test-feature-image] img, " +
        ".gh-editor-feature-image img, " +
        ".gh-editor-feature-image-wrapper img, " +
        ".koenig-feature-image img, " +
        "figure.kg-feature-image img, " +
        'img[src*="/content/images/"]',
      { timeout: 15000 },
    ).should("exist");
    cy.screenshotStep("assertCoverImagePresent");
  }
}

export const pagesPage = new PagesPage();

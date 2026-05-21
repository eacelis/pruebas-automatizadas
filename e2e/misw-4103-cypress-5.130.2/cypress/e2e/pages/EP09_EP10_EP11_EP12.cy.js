import { pagesPage } from "../../support/pages/PagesPage";
import { faker } from "@faker-js/faker";

describe("F3: Diseñar una nueva página estática (Page)", () => {
  before(() => {
    // Antes de todo
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  it("EP09 — Creación de una página estática con un slug de URL específico.", () => {
    const title = `Acerca EP09 ${faker.string.alphanumeric(6)}`;
    const content = faker.lorem.sentence(8);
    const slug = `about-ep09-${faker.string.alphanumeric(5).toLowerCase()}`;

    cy.cleanupPageBySlug(slug);
    cy.cleanupPageByTitle(title);

    pagesPage.openNewPageForm();
    pagesPage.fillTitle(title);
    pagesPage.fillContent(content);
    pagesPage.setSlug(slug);
    pagesPage.publishPage();

    pagesPage.assertPageVisible(title);
    pagesPage.assertPagePublic(slug);
  });

  it("EP10 — Inclusión de una imagen de portada en la configuración de la página.", () => {
    const title = `Cover EP10 ${faker.string.alphanumeric(6)}`;
    const content = faker.lorem.sentence(8);

    cy.cleanupPageByTitle(title);

    pagesPage.openNewPageForm();
    pagesPage.fillTitle(title);
    pagesPage.fillContent(content);
    pagesPage.uploadCoverImage("images/cover.png");

    // Validar que la imagen se cargó y aparece en el editor
    // ANTES de publicar, porque después de publicar Ghost redirige al listado.
    pagesPage.assertCoverImagePresent();

    pagesPage.publishPage();
  });

  it("EP11 — Conversión de una página publicada de vuelta a borrador (Unpublish).", () => {
    const title = `Unpublish EP11 ${faker.string.alphanumeric(6)}`;
    const content = faker.lorem.sentence(8);

    cy.cleanupPageByTitle(title);

    pagesPage.openNewPageForm();
    pagesPage.fillTitle(title);
    pagesPage.fillContent(content);
    pagesPage.publishPage();

    pagesPage.openPageByTitle(title);
    pagesPage.unpublishPage();
    pagesPage.assertPageIsDraft(title);
  });

  it("EP12 — Eliminación de una página estática existente.", () => {
    const title = `Delete EP12 ${faker.string.alphanumeric(6)}`;
    const content = faker.lorem.sentence(8);
    const slug = `delete-ep12-${faker.string.alphanumeric(5).toLowerCase()}`;

    cy.cleanupPageBySlug(slug);
    cy.cleanupPageByTitle(title);

    pagesPage.openNewPageForm();
    pagesPage.fillTitle(title);
    pagesPage.fillContent(content);
    pagesPage.setSlug(slug);
    pagesPage.publishPage();

    pagesPage.openPageByTitle(title);
    pagesPage.deleteCurrentPage();

    pagesPage.assertPageNotVisible(title);
    pagesPage.assertPageNotPublic(slug);
  });
});

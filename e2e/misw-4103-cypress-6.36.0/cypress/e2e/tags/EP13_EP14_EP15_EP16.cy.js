import { tagsPage } from "../../support/pages/TagsPage";
import { faker } from '@faker-js/faker';

describe("F4: Crear un nuevo tag (Etiqueta)", () => {
    before(() => {
        // Antes de todo
    });

    beforeEach(() => {
        cy.loginAsAdmin();
    });

    afterEach(() => {
        cy.signOutAdmin();
    });

    it("EP13 — Creación de un nuevo Tag con nombre y descripción.", () => {
        const name = `Tag EP13 ${faker.string.alphanumeric(6)}`;
        const slug = `tag-ep13-${faker.string.alphanumeric(5).toLowerCase()}`;
        const description = faker.lorem.sentence(8);

        cy.cleanupTagBySlug(slug);

        tagsPage.openNewTagForm();
        tagsPage.fillBasicData(name, slug, description);
        tagsPage.save();

        tagsPage.assertTagVisible(name);
    });

    it("EP14 — Configuración de metadatos SEO (Meta Title/Description) para un Tag.", () => {
        const name = `Tag EP14 ${faker.string.alphanumeric(6)}`;
        const slug = `tag-ep14-${faker.string.alphanumeric(5).toLowerCase()}`;
        const metaTitle = faker.lorem.sentence(4);
        const metaDescription = faker.lorem.sentence(10);

        cy.cleanupTagBySlug(slug);

        tagsPage.openNewTagForm();
        tagsPage.fillBasicData(name, slug);
        tagsPage.save();

        tagsPage.openTagBySlug(slug);
        tagsPage.fillSeoMetadata(metaTitle, metaDescription);
        tagsPage.save();

        tagsPage.openTagBySlug(slug);
        tagsPage.assertSeoPersisted(metaTitle, metaDescription);
    });

    it("EP15 — Asignación de una imagen representativa al Tag.", () => {
        const name = `Tag EP15 ${faker.string.alphanumeric(6)}`;
        const slug = `tag-ep15-${faker.string.alphanumeric(5).toLowerCase()}`;

        cy.cleanupTagBySlug(slug);

        tagsPage.openNewTagForm();
        tagsPage.fillBasicData(name, slug);
        tagsPage.uploadTagImage("images/tag.png");
        tagsPage.save();

        tagsPage.openTagBySlug(slug);
        tagsPage.assertTagImagePresent();
    });

    it("EP16 — Modificación del color identificador del Tag mediante selector hexadecimal.", () => {
        const name = `Tag EP16 ${faker.string.alphanumeric(6)}`;
        const slug = `tag-ep16-${faker.string.alphanumeric(5).toLowerCase()}`;
        const hexColor = faker.color.rgb({ format: 'hex', casing: 'lower' }).replace('#', '');

        cy.cleanupTagBySlug(slug);

        tagsPage.openNewTagForm();
        tagsPage.fillBasicData(name, slug);
        tagsPage.setColorHex(hexColor);
        tagsPage.save();

        tagsPage.openTagBySlug(slug);
        tagsPage.assertColorPersisted(hexColor);
    });
});
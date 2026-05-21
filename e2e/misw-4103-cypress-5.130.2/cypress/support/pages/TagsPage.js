class TagsPage {

    get tagsNav() {
        return cy.get('[data-test-nav="tags"], a[href="#/tags"]').first();
    }

    get newTagButton() {
        return cy.contains('a', 'New tag');
    }

    get nameInput() {
        return cy.get('input#tag-name, input[name="name"]').first();
    }

    get slugInput() {
        return cy.get('input#tag-slug, input[name="slug"]').first();
    }

    get descriptionInput() {
        return cy.get('textarea#tag-description, textarea[name="description"]').first();
    }

    get colorInput() {
        return cy.get('input[name="accent-color"], input[data-test-input="accentColor"]').first();
    }

    get saveButton() {
        // Selector confirmado del HTML real de Ghost 5.130:
        // <button data-test-button="save" class="gh-btn gh-btn-primary ...">
        return cy.get('button[data-test-button="save"]').first();
    }

    get expandSeoButton() {
        return cy.contains('button, a', /Expand|Show more|Meta data/i).first();
    }

    get metaTitleInput() {
        return cy.get('input#meta-title, input[name="metaTitle"], input[data-test-input="meta-title"]').first();
    }

    get metaDescriptionInput() {
        return cy.get('textarea#meta-description, textarea[name="metaDescription"], textarea[data-test-input="meta-description"]').first();
    }

    get tagImage() {
        return cy.get('img[data-test-tag-image], .gh-image-uploader img, .gh-canvas-feature-image img').first();
    }

    get fileInput() {
        return cy.get('input[type="file"]').first();
    }

    get tagActionsMenu() {
        return cy.get('button[data-test-button="more"], button.gh-btn-icon').first();
    }

    get confirmDeleteButton() {
        return cy.get('button.gh-btn-red').first();
    }

    tagRowByName(name) {
        return cy.contains(
            'li.gh-list-row, .gh-tags-list-item, h3, a, td',
            name,
            { timeout: 20000 }
        ).first();
    }

    navigateToTags() {
        this.tagsNav.click();
        cy.url().should('include', '/ghost/#/tags');
        cy.get('h2.gh-canvas-title', { timeout: 15000 }).should('contain', 'Tags');
        cy.screenshotStep('navigateToTags');
    }

    openNewTagForm() {
        this.navigateToTags();
        this.newTagButton.click({ force: true });
        cy.url().should('include', '/ghost/#/tags/new');
        cy.screenshotStep('openNewTagForm');
    }

    fillBasicData(name, slug, description) {
        this.nameInput.clear({ force: true });
        if (name && name.trim().length > 0) {
            this.nameInput.type(name, { force: true });
        }
        if (slug) this.slugInput.clear({ force: true }).type(slug, { force: true });
        if (description) this.descriptionInput.clear({ force: true }).type(description, { force: true });
        cy.screenshotStep('fillBasicData');
    }

    assertErrorVisible() {
        cy.get('p.response, .gh-alert-red, [data-test-error], .error', { timeout: 8000 })
          .filter(':visible')
          .should('have.length.above', 0);
        cy.screenshotStep('assertErrorVisible');
    }

    expandSeoSection() {
        cy.get('body').then(($b) => {
            const expand = $b.find('button:contains("Expand"), a:contains("Expand")');
            if (expand.length > 0) cy.wrap(expand[0]).click({ force: true });
        });
        cy.wait(400);
        cy.screenshotStep('expandSeoSection');
    }

    fillSeoMetadata(metaTitle, metaDescription) {
        this.expandSeoSection();
        this.metaTitleInput.clear({ force: true }).type(metaTitle, { force: true });
        this.metaDescriptionInput.clear({ force: true }).type(metaDescription, { force: true });
        cy.screenshotStep('fillSeoMetadata');
    }

    uploadTagImage(filePath) {
        cy.get('input[type="file"]').first().selectFile(`cypress/fixtures/${filePath}`, { force: true });
        cy.wait(2000);
        cy.screenshotStep('uploadTagImage');
    }

    setColorHex(hex) {
        this.colorInput.clear({ force: true }).type(hex, { force: true }).blur();
        cy.screenshotStep('setColorHex');
    }

    save() {
        cy.intercept('POST', '**/ghost/api/admin/tags/**').as('createTag');
        cy.intercept('PUT', '**/ghost/api/admin/tags/**').as('updateTag');
        this.saveButton.click({ force: true });
        cy.wait(2000);
        cy.screenshotStep('saveTag');
    }

    openTagBySlug(slug) {
        cy.visit(`/ghost/#/tags/${slug}`);
        cy.wait(1500);
        cy.screenshotStep('openTagBySlug');
    }

    deleteCurrentTag() {
        this.tagActionsMenu.click({ force: true });
        cy.wait(400);
        cy.contains('button', /Delete tag/i).first().click({ force: true });
        cy.wait(400);
        this.confirmDeleteButton.contains(/Delete/i).click({ force: true });
        cy.wait(2000);
        cy.screenshotStep('deleteCurrentTag');
    }

    assertTagVisible(name) {
        this.navigateToTags();
        this.tagRowByName(name).should('exist');
        cy.screenshotStep('assertTagVisible');
    }

    assertTagNotVisible(name) {
        this.navigateToTags();
        cy.contains(
            'li.gh-list-row, .gh-tags-list-item, h3, a, td',
            name
        ).should('not.exist');
        cy.screenshotStep('assertTagNotVisible');
    }

    assertSeoPersisted(metaTitle, metaDescription) {
        this.expandSeoSection();
        this.metaTitleInput.should('have.value', metaTitle);
        this.metaDescriptionInput.should('have.value', metaDescription);
        cy.screenshotStep('assertSeoPersisted');
    }

    assertColorPersisted(hex) {
        this.colorInput.invoke('val').then((val) => {
            const v = (val || '').toLowerCase().replace('#', '');
            expect(v).to.eq(hex.toLowerCase());
        });
        cy.screenshotStep('assertColorPersisted');
    }

    assertTagImagePresent() {
        this.tagImage.should('exist');
        cy.screenshotStep('assertTagImagePresent');
    }
}

export const tagsPage = new TagsPage();

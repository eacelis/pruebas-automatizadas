class SettingsPage {

    get exitButton() {
        return cy.get('[data-testid="exit-settings"]');
    }

    get settingsButton() {
        return cy.get('[data-test-nav="settings"]');
    }

    get editTitleButton() {
        return cy.get('[data-testid="title-and-description"]').contains('button', 'Edit');
    }

    get titleInput() {
        return cy.get('input[placeholder="Site title"]');
    }

    get descriptionInput() {
        return cy.get('input[placeholder="Site description"]');
    }

    get saveButton() {
        return cy.contains('button', 'Save');
    }

    get siteTitle() {
        return cy.contains('h6', 'Site title').parent();
    }
    
    get siteDescription() {
        return cy.contains('h6', 'Site description').parent();
    }

    get timeZone() {
        return cy.get('#timezone');
    }

    get spaceTimeZones() {
        return cy.get('[data-testid="timezone"]');
    }

    get defaultRecipients() {
        return cy.get('#default-recipients');
    }

    get spaceDefaultRecipients() {
        return cy.get('[data-testid="default-recipients"]');
    }

    get makeThisSitePrivate() {
        return cy.get('[data-testid="site-visibility-select"]').find('[class*="-control"]');
    }

    get spaceMakeThisSitePrivate() {
        return cy.get('[data-testid="access"]');
    }

    get editMakeThisSitePrivateButton() {
        return cy.get('[data-testid="locksite"]').contains('button', 'Edit');
    }

    get switchEnablePassword() {
        return this.spaceMakeThisSitePrivate.find('button[role="switch"]');
    }

    get passwordInput() {
        return cy.get('[data-testid="site-access-code"]');
    }

    navigateToSettings() {
        cy.visit("/ghost/#/settings");
        cy.url().should("include", "/ghost/#/settings");
        cy.get('[data-testid="title-and-description"]', { timeout: 15000 }).should('be.visible');
        cy.screenshotStep("navigateToSettings");
    }

    changeTitleAndDescription(title, description) {
        this.editTitleButton.click();
        this.titleInput.clear().type(title);
        this.descriptionInput.clear().type(description);
        cy.screenshotStep("changeTitleAndDescription");
    }

    saveChangesTitleAndDescription() {
        this.saveButton.click();
        this.editTitleButton.should('exist');
        cy.screenshotStep("saveChangesTitleAndDescription");
    }

    verifyTitleAndDescription(title, description) {
        cy.contains('h6', 'Site title').parent().should('contain', title);
        cy.contains('h6', 'Site description').parent().should('contain', description);
    }

    exitSettings() {
        this.exitButton.click();
        cy.location("hash", { timeout: 15000 }).should((hash) => {
            expect(hash).to.match(/^#\/(dashboard|analytics)/);
        });
        cy.screenshotStep("exitSettings");
    }

    selectSiteTimeZone() {
        this.spaceTimeZones.scrollIntoView();
        this.timeZone.click({ force: true });
        cy.screenshotStep("selectSiteTimeZone");
    }

    selectRandomTimeZone() {
        cy.get('[data-testid="timezone-select"]').find('[class*="-control"]').click();
        cy.get('[class*="-option"]').then(($options) => {
            const randomIndex = Math.floor(Math.random() * $options.length);
            cy.wrap($options).eq(randomIndex).click({ force: true });
        });
        cy.screenshotStep("selectRandomTimeZone");
    }

    saveChanges() {
        this.saveButton.click();
        cy.screenshotStep("saveChanges");
    }

    selectDefaultRecipients() {
        this.spaceDefaultRecipients.scrollIntoView();
        cy.get('[data-testid="default-recipients-select"]').find('[class*="-control"]').click({ force: true });
        cy.screenshotStep("selectDefaultRecipients");
    }

    selectRandomDefaultRecipients() {
        cy.get('body').then(($body) => {
            if ($body.find('[class*="-option"]').length === 0) {
                cy.get('[data-testid="default-recipients-select"]').find('[class*="-control"]').click({ force: true });
            }
        });
        cy.get('[class*="-option"]').then(($options) => {
            const randomIndex = Math.floor(Math.random() * $options.length);
            cy.wrap($options).eq(randomIndex).click({ force: true });
        });
        cy.screenshotStep("selectRandomDefaultRecipients");
    }

    selectMakeThisSitePrivate() {
        this.spaceMakeThisSitePrivate.scrollIntoView();
        this.makeThisSitePrivate.click({ force: true });
        cy.screenshotStep("selectMakeThisSitePrivate");
    }

    changeMakeThisSitePrivate() {
        cy.get('[class*="-option"]').contains('Private').click({ force: true });
        cy.screenshotStep("changeMakeThisSitePrivate");
    }

    activateSitePassword() {
        this.passwordInput.should('be.visible');
        cy.screenshotStep("activateSitePassword");
    }

    setSitePassword(password) {
        this.activateSitePassword();
        this.passwordInput.should('be.visible').clear().type(password);
        cy.screenshotStep("setSitePassword");
    }

}

export const settingsPage = new SettingsPage();

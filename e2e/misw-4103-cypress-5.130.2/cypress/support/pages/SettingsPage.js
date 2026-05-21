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
        return cy.get('#locksite');
    }

    get spaceMakeThisSitePrivate() {
        return cy.get('[data-testid="locksite"]');
    }

    get editMakeThisSitePrivateButton() {
        return cy.get('[data-testid="locksite"]').contains('button', 'Edit');
    }

    get switchEnablePassword() {
        return this.spaceMakeThisSitePrivate.find('button[role="switch"]');
    }

    get passwordInput() {
        return this.spaceMakeThisSitePrivate.find('input[placeholder="Enter password"]');
    }

    navigateToSettings() {
        this.settingsButton.click();
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
        cy.url().should("include", "/ghost/#/dashboard");
        cy.screenshotStep("exitSettings");
    }

    selectSiteTimeZone() {
        this.spaceTimeZones.scrollIntoView();
        this.timeZone.click({ force: true });
        cy.screenshotStep("selectSiteTimeZone");
    }

    selectRandomTimeZone() {
        cy.get('[data-testid="timezone-select"]').find('[class*="-control"]').click({ force: true });
        cy.get('[data-testid="timezone-select"] [class*="-option"]', { timeout: 15000 }).should('have.length.greaterThan', 0).then(($options) => {
            const randomIndex = Math.floor(Math.random() * $options.length);
            cy.wrap($options).eq(randomIndex).click({ force: true });
        });
        cy.screenshotStep("selectRandomTimeZone");
    }

    saveChanges() {
        this.saveButton.click();
        cy.contains('Saved', { timeout: 20000 }).should('be.visible');
        cy.screenshotStep("saveChanges");
    }

    selectDefaultRecipients() {
        this.spaceDefaultRecipients.scrollIntoView();
        cy.get('[data-testid="default-recipients-select"]').find('[class*="-control"]').click({ force: true });
        cy.screenshotStep("selectDefaultRecipients");
    }

    selectRandomDefaultRecipients() {
        cy.get('[data-testid="default-recipients-select"] [class*="-option"]', { timeout: 15000 }).should('have.length.greaterThan', 0).then(($options) => {
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
        this.editMakeThisSitePrivateButton.scrollIntoView().click({ force: true });
        cy.screenshotStep("changeMakeThisSitePrivate");
    }

    activateSitePassword() {
        this.switchEnablePassword.then(($btn) => {
            const state = $btn.attr('data-state');
            
            if (state === 'unchecked') {
                cy.wrap($btn).click();
            }
        });
        cy.screenshotStep("activateSitePassword");
    }

    setSitePassword(password) {
        this.activateSitePassword();
        this.passwordInput.scrollIntoView().clear({ force: true }).type(password, { force: true });
        cy.screenshotStep("setSitePassword");
    }

}

export const settingsPage = new SettingsPage();
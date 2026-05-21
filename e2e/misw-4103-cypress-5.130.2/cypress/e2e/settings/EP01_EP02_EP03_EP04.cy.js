const LoginPage = require("../../support/pages/LoginPage");
import { settingsPage } from "../../support/pages/SettingsPage";

import { faker } from '@faker-js/faker';

describe("F1: Gestionar la configuración general del sitio", () => {
    before(() => {
        // Antes de todo
    });

    beforeEach(() => {
        cy.loginAsAdmin();
    });

    afterEach(() => {
        cy.signOutAdmin();
    });

    it("EP01 — Actualización del título y descripción corta del sitio.", () => {
        const randomTitle = faker.lorem.sentence(4);
        const randomDescription = faker.lorem.sentence(10);
        settingsPage.navigateToSettings();
        settingsPage.changeTitleAndDescription(randomTitle, randomDescription);
        settingsPage.saveChangesTitleAndDescription();
        settingsPage.siteTitle.should('contain', randomTitle);
        settingsPage.siteDescription.should('contain', randomDescription);
        settingsPage.exitSettings();
    });
    it("EP02 — Modificación de la zona horaria del sitio.", () => {
        settingsPage.navigateToSettings();
        settingsPage.selectSiteTimeZone();
        settingsPage.selectRandomTimeZone();
        settingsPage.saveChanges();
        settingsPage.exitSettings();
    });
    
    it("EP03 — Configuración de destinatarios predeterminados (Default recipients).", () => {
        settingsPage.navigateToSettings();
        settingsPage.selectDefaultRecipients();
        settingsPage.selectRandomDefaultRecipients();
        settingsPage.saveChanges();
        settingsPage.exitSettings();
    });
    
    it("EP04 — Habilitación del acceso privado al sitio.", () => {
        const randomPassword = faker.lorem.word();
        settingsPage.navigateToSettings();
        settingsPage.selectMakeThisSitePrivate();
        settingsPage.changeMakeThisSitePrivate();
        settingsPage.setSitePassword(randomPassword);
        settingsPage.saveChanges();
        settingsPage.exitSettings();
    });
});
class DashboardPage {
    get userAccount() {
        return cy.get('[data-test-nav="arrow-down"]').first();
    }

    get signOutButton() {
        return cy.contains('a', 'Sign out').first();
    }

    deployUserAccountOptions() {
        cy.visit('/ghost/#/dashboard');
        cy.url().should('include', '/ghost/#/dashboard');
        this.userAccount.should('be.visible').click();
        cy.screenshotStep('deployUserAccountOptions');
    }

    /**
     * Cierra sesión usando la API admin directamente.
     * Evita los problemas del DOM de Ghost 5.130.2 donde el botón "Sign out"
     * a veces aparece duplicado o no es visible cuando se viene del editor.
     */
    signOut() {
        const baseUrl = Cypress.config('baseUrl');
        cy.request({
            method: 'DELETE',
            url: `${baseUrl}/ghost/api/admin/session/`,
            failOnStatusCode: false,
        });
        cy.clearCookies();
        cy.clearLocalStorage();
    }
}

export const dashboardPage = new DashboardPage();
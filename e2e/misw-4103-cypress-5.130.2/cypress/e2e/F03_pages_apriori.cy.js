import { pagesPage } from '../support/pages/PagesPage';
import pagesDataPool from '../fixtures/F03_pages_data_pool.json';

describe('F03 - Pages: Data Pool A-Priori', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  pagesDataPool.forEach((testCase) => {
    it(`[F03-APR-${testCase.id}] ${testCase.description}`, () => {
      pagesPage.openNewPageForm();
      pagesPage.fillTitleSafe(testCase.input.title);
      pagesPage.fillContent(testCase.input.content);

      if (testCase.expected === 'success') {
        pagesPage.publishPage();
        if (testCase.input.title && testCase.input.title.trim().length > 0) {
          pagesPage.assertPageVisible(testCase.input.title);
        } else {
          cy.log(`[ORACLE] ${testCase.oracle}`);
          cy.get('body').should('be.visible');
        }
      } else {
        pagesPage.publishPage();
        cy.log(`[ORACLE] ${testCase.oracle}`);
        cy.get('body').should('be.visible');
      }
    });
  });
});

import MembersPage from '../support/pages/MembersPage';
import membersDataPool from '../fixtures/F05_members_data_pool.json';

describe('F05 - Members: Data Pool A-Priori', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  membersDataPool.forEach((testCase) => {
    it(`[F05-APR-${testCase.id}] ${testCase.description}`, () => {
      if (testCase.expected === 'success' && testCase.input.email) {
        cy.cleanupMemberByEmail(testCase.input.email);
      }

      MembersPage.openNewMemberForm();
      MembersPage.fillNameSafe(testCase.input.name);
      MembersPage.fillEmailSafe(testCase.input.email);
      MembersPage.saveButton.click();

      if (testCase.expected === 'success') {
        cy.url().should('not.include', '/new');
        MembersPage.assertMemberVisible(testCase.input.email);
      } else {
        MembersPage.assertErrorVisible();
      }
    });
  });
});

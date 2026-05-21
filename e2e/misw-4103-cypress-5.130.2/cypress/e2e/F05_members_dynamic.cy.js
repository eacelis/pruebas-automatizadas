import MembersPage from '../support/pages/MembersPage';
import {
  generateValidMember,
  generateValidMemberWithNote,
  generateMemberWithSpecialEmail,
  generateInvalidMember_BadEmail,
  generateInvalidMember_EmptyEmail,
  generateInvalidMember_NoAtEmail,
  generateInvalidMember_EmailWithSpaces,
} from '../support/dataGenerators';

describe('F05 - Members: Datos Dinámicos (Online Faker)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('[F05-DYN-01] Member con email válido generado dinámicamente', () => {
    const data = generateValidMember();
    cy.cleanupMemberByEmail(data.input.email);
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    cy.url().should('not.include', '/new');
    MembersPage.assertMemberVisible(data.input.email);
  });

  it('[F05-DYN-02] Member con nota generado dinámicamente', () => {
    const data = generateValidMemberWithNote();
    cy.cleanupMemberByEmail(data.input.email);
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    cy.url().should('not.include', '/new');
    MembersPage.assertMemberVisible(data.input.email);
  });

  it('[F05-DYN-03] Member con email especial (+ en local-part) generado dinámicamente', () => {
    const data = generateMemberWithSpecialEmail();
    cy.cleanupMemberByEmail(data.input.email);
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    cy.url().should('not.include', '/new');
    MembersPage.assertMemberVisible(data.input.email);
  });

  it('[F05-DYN-04] Member con segundo email válido generado dinámicamente', () => {
    const data = generateValidMember();
    cy.cleanupMemberByEmail(data.input.email);
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    cy.url().should('not.include', '/new');
    MembersPage.assertMemberVisible(data.input.email);
  });

  it('[F05-DYN-05] Member inválido — email sin @ generado dinámicamente', () => {
    const data = generateInvalidMember_BadEmail();
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    MembersPage.assertErrorVisible();
  });

  it('[F05-DYN-06] Member inválido — email vacío generado dinámicamente', () => {
    const data = generateInvalidMember_EmptyEmail();
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    MembersPage.assertErrorVisible();
  });

  it('[F05-DYN-07] Member inválido — email con espacios generado dinámicamente', () => {
    const data = generateInvalidMember_EmailWithSpaces();
    MembersPage.openNewMemberForm();
    MembersPage.fillNameSafe(data.input.name);
    MembersPage.fillEmailSafe(data.input.email);
    MembersPage.saveButton.click();
    MembersPage.assertErrorVisible();
  });
});

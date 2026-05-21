const LoginPage = require("../../support/pages/LoginPage");
const MembersPage = require("../../support/pages/MembersPage");

describe("F5 — Gestión de Miembros (Members)", () => {
  let data;

  before(() => {
    cy.fixture("members").then((fixture) => {
      data = fixture;
    });
  });

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("EP17 — Registro manual de un nuevo miembro con email válido", () => {
    const { name, email } = data.EP17;

    cy.cleanupMemberByEmail(email);
    MembersPage.openNewMemberForm();

    MembersPage.nameInput.type(name, { force: true });
    MembersPage.emailInput.type(email, { force: true });
    MembersPage.saveButton.click();

    cy.url().should("not.include", "/new");
    MembersPage.assertMemberVisible(email);
  });

  it("EP18 — Asignación de etiquetas (Labels) internas a un miembro registrado", () => {
    const { name, email, label } = data.EP18;

    cy.cleanupMemberByEmail(email);
    MembersPage.createMember(name, email);

    MembersPage.openMemberByEmail(email);
    MembersPage.labelsInput.type(label);
    cy.get(".ember-power-select-option")
      .first()
      .then(($opt) => {
        const text = $opt.text().trim();
        if (text.toLowerCase().includes(label.toLowerCase())) {
          cy.wrap($opt).click();
        } else {
          cy.contains(
            ".ember-power-select-option",
            `Add label "${label}"`,
          ).click();
        }
      });
    MembersPage.saveButton.click();

    cy.reload();
    MembersPage.appliedLabel(label).should("exist");
  });

  it("EP19 — Edición del nombre y notas de contacto de un miembro existente", () => {
    const { name, email, updatedName, note } = data.EP19;

    cy.cleanupMemberByEmail(email);
    MembersPage.createMember(name, email);

    MembersPage.openMemberByEmail(email);
    MembersPage.editNameAndNote(updatedName, note);

    cy.reload();
    MembersPage.assertMemberName(updatedName);
    MembersPage.noteInput.should("have.value", note);
  });

  it("EP20 — Eliminación de un miembro de la base de datos de suscripciones", () => {
    const { name, email } = data.EP20;

    cy.cleanupMemberByEmail(email);
    MembersPage.createMember(name, email);

    MembersPage.openMemberByEmail(email);
    MembersPage.deleteCurrentMember();

    MembersPage.assertMemberNotVisible(email);
  });
});

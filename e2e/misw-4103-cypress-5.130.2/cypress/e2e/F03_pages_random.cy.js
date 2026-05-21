import { faker } from '@faker-js/faker';
import { pagesPage } from '../support/pages/PagesPage';

describe('F03 - Pages: Pseudo-aleatoria (Faker sin oráculo definido)', () => {
  const ITERATIONS = 7;

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  for (let i = 0; i < ITERATIONS; i++) {
    it(`[F03-RND-${String(i + 1).padStart(2, '0')}] Página con datos aleatorios — iteración ${i + 1}`, () => {
      const title = faker.lorem.words(faker.number.int({ min: 2, max: 10 }));
      const content = faker.lorem.sentences(faker.number.int({ min: 1, max: 4 }));

      pagesPage.openNewPageForm();
      pagesPage.fillTitleSafe(title);
      pagesPage.fillContent(content);
      pagesPage.publishPage();

      cy.get('.gh-alert-red').should('not.exist');
    });
  }
});

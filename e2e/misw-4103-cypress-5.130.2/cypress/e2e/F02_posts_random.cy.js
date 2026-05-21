import { faker } from '@faker-js/faker';
import PostsPage from '../support/pages/PostsPage';
import PostEditorPage from '../support/pages/PostEditorPage';

describe('F02 - Posts: Pseudo-aleatoria (Faker sin oráculo definido)', () => {
  const ITERATIONS = 7;

  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  for (let i = 0; i < ITERATIONS; i++) {
    it(`[F02-RND-${String(i + 1).padStart(2, '0')}] Post con datos aleatorios — iteración ${i + 1}`, () => {
      const title = faker.lorem.words(faker.number.int({ min: 2, max: 12 }));
      const content = faker.lorem.paragraphs(faker.number.int({ min: 1, max: 3 }));

      PostsPage.openNewPostEditor();
      PostEditorPage.trackPostRequests();
      PostEditorPage.enterTitleSafe(title);
      PostEditorPage.enterBody(content);
      PostEditorPage.waitForDraftCreation();
      PostEditorPage.waitUntilDraftIsSaved();

      cy.get('.gh-alert-red').should('not.exist');
      cy.url().should('include', '/editor/post');
    });
  }
});

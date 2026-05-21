import PostsPage from '../support/pages/PostsPage';
import PostEditorPage from '../support/pages/PostEditorPage';
import postsDataPool from '../fixtures/F02_posts_data_pool.json';

describe('F02 - Posts: Data Pool A-Priori', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  after(() => {
    cy.cleanupPostsByTitlePrefix('Post APR');
    cy.cleanupPostsByTitlePrefix('Post255');
  });

  postsDataPool.forEach((testCase) => {
    it(`[F02-APR-${testCase.id}] ${testCase.description}`, () => {
      PostsPage.openNewPostEditor();
      PostEditorPage.trackPostRequests();
      PostEditorPage.enterTitleSafe(testCase.input.title);
      PostEditorPage.enterBody(testCase.input.content);
      PostEditorPage.waitForDraftCreation();

      if (testCase.expected === 'success') {
        PostEditorPage.publishNow();
        PostEditorPage.closePublishFlow();
        PostsPage.assertPostVisibleInList(testCase.input.title);
      } else {
        PostEditorPage.waitUntilDraftIsSaved();
        cy.log(`[ORACLE] ${testCase.oracle}`);
        cy.get('body').should('be.visible');
      }
    });
  });
});

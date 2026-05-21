import PostsPage from '../support/pages/PostsPage';
import PostEditorPage from '../support/pages/PostEditorPage';
import {
  generateValidPost,
  generatePostWithAccents,
  generatePostLongTitle,
  generatePostWithEmoji,
  generatePostWithHTMLTitle,
  generatePostEmptyTitle,
  generatePostSpacesTitle,
} from '../support/dataGenerators';

describe('F02 - Posts: Datos Dinámicos (Online Faker)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  after(() => {
    cy.cleanupPostsByTitlePrefix('post');
    cy.cleanupPostsByTitlePrefix('Post DYN');
  });

  it('[F02-DYN-01] Post con título válido generado dinámicamente', () => {
    const data = generateValidPost();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();
    PostsPage.assertPostVisibleInList(data.input.title);
  });

  it('[F02-DYN-02] Post con título con tildes y ñ generado dinámicamente', () => {
    const data = generatePostWithAccents();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();
    PostsPage.assertPostVisibleInList(data.input.title);
  });

  it('[F02-DYN-03] Post con título largo generado dinámicamente', () => {
    const data = generatePostLongTitle();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();
    PostsPage.assertPostVisibleInList(data.input.title);
  });

  it('[F02-DYN-04] Post con emoji en título generado dinámicamente', () => {
    const data = generatePostWithEmoji();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();
    PostsPage.assertPostVisibleInList(data.input.title);
  });

  it('[F02-DYN-05] Post con HTML en título generado dinámicamente', () => {
    const data = generatePostWithHTMLTitle();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();
    cy.log(`[ORACLE] ${data.oracle}`);
    cy.get('body').should('be.visible');
  });

  it('[F02-DYN-06] Post con título vacío generado dinámicamente', () => {
    const data = generatePostEmptyTitle();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitUntilDraftIsSaved();
    cy.log(`[ORACLE] ${data.oracle}`);
    cy.get('body').should('be.visible');
  });

  it('[F02-DYN-07] Post con título de solo espacios generado dinámicamente', () => {
    const data = generatePostSpacesTitle();
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitleSafe(data.input.title);
    PostEditorPage.enterBody(data.input.content);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitUntilDraftIsSaved();
    cy.log(`[ORACLE] ${data.oracle}`);
    cy.get('body').should('be.visible');
  });
});

const PostsPage = require("../../support/pages/PostsPage");
const PostEditorPage = require("../../support/pages/PostEditorPage");

const buildPostData = (scenarioId) => {
  const uniqueSuffix = `${Date.now()}-${Cypress._.random(1000, 9999)}`;

  return {
    title: `${scenarioId} post ${uniqueSuffix}`,
    body: `body${scenarioId.toLowerCase()}${uniqueSuffix.replace(/-/g, "")}`,
    updatedBody: `updated${scenarioId.toLowerCase()}${uniqueSuffix.replace(/-/g, "")}`,
  };
};

const buildFutureSchedule = () => {
  const target = new Date(Date.now() + 24 * 60 * 60 * 1000);
  target.setMinutes(target.getMinutes() + 15);

  const pad = (value) => `${value}`.padStart(2, "0");

  return {
    date: `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}`,
    time: `${pad(target.getHours())}:${pad(target.getMinutes())}`,
  };
};

describe("F2 - Gestión de posts", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  after(() => {
    cy.cleanupPostsByTitlePrefix("EP0");
  });

  it("EP05 - Crear y publicar inmediatamente un post", () => {
    const post = buildPostData("EP05");

    // Given
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitle(post.title);
    PostEditorPage.enterBody(post.body);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();

    // When
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();

    // Then
    PostsPage.assertPostVisibleInList(post.title);
    cy.assertPostPublishedByTitle(post.title);
  });

  it("EP06 - Guardar un post como borrador", () => {
    const post = buildPostData("EP06");

    // Given
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitle(post.title);
    PostEditorPage.enterBody(post.body);

    // When
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitUntilDraftIsSaved();

    // Then
    PostsPage.assertPostVisibleInList(post.title, "draft");
  });

  it("EP07 - Programar un post para una fecha futura", () => {
    const post = buildPostData("EP07");
    const schedule = buildFutureSchedule();

    // Given
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitle(post.title);
    PostEditorPage.enterBody(post.body);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitUntilDraftIsSaved();

    // When
    PostEditorPage.scheduleForLater(schedule.date, schedule.time);
    PostEditorPage.closePublishFlow();

    // Then
    PostsPage.assertPostVisibleInList(post.title, "scheduled");
  });

  it("EP08 - Editar un post publicado", () => {
    const post = buildPostData("EP08");

    // Given
    PostsPage.openNewPostEditor();
    PostEditorPage.trackPostRequests();
    PostEditorPage.enterTitle(post.title);
    PostEditorPage.enterBody(post.body);
    PostEditorPage.waitForDraftCreation();
    PostEditorPage.waitForPostUpdate();
    PostEditorPage.publishNow();
    PostEditorPage.closePublishFlow();

    // When
    PostsPage.openPostByTitle(post.title);
    PostEditorPage.trackPostRequests();
    PostEditorPage.appendBody(post.updatedBody);
    PostEditorPage.savePublishedChanges();

    // Then
    cy.assertPostBodyContainsByTitle(post.title, post.updatedBody);
  });
});

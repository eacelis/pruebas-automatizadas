const SELECTORS = {
  postsNav: '[data-test-nav="posts"]',
  newPostButton: 'a[href="#/editor/post"]',
  postsTitle: "h2.gh-canvas-title",
  draftsFilter: "select.gh-contentfilter-select",
  postRow: "li.gh-list-row",
};

async function findFirstExisting(driver, selectors) {
  for (const selector of selectors) {
    const elements = await driver.$$(selector);
    if (elements.length > 0) return elements[0];
  }
  return null;
}

async function navigateToPosts(driver) {
  const currentUrl = await driver.getUrl();
  const origin = new URL(currentUrl).origin;
  await driver.url(`${origin}/ghost/#/posts`);
  const title = await driver.$(SELECTORS.postsTitle);
  await title.waitForDisplayed({ timeout: 10000 });
  await driver.pause(1000);
}

async function navigateToPostsFiltered(driver, baseUrl, filter) {
  await driver.url(`${baseUrl}/ghost/#/posts?type=${filter}`);
  const title = await driver.$(SELECTORS.postsTitle);
  await title.waitForDisplayed({ timeout: 10000 });
  await driver.pause(1500);
}

async function clickNewPost(driver) {
  const btn = await findFirstExisting(driver, [
    SELECTORS.newPostButton,
    "a[data-test-new-post-button]",
    "a=New post",
  ]);
  if (!btn) throw new Error("No se encontró el botón New post");
  await btn.waitForClickable({ timeout: 12000 });
  await btn.scrollIntoView();
  await btn.click();
  await driver.waitUntil(
    async () => (await driver.getUrl()).includes("/editor/post"),
    { timeout: 12000 },
  );
  await driver.pause(1000);
}

async function openPostByTitle(driver, title) {
  const rows = await driver.$$("li.gh-list-row");
  for (const row of rows) {
    const rowText = await row.getText();
    if (!rowText.includes(title)) continue;

    const editorLinks = await row.$$('a[href*="#/editor/post/"]');
    if (editorLinks.length > 0) {
      const href = await editorLinks[0].getAttribute("href");
      if (href) {
        if (href.startsWith("http")) {
          await driver.url(href);
        } else {
          const currentUrl = await driver.getUrl();
          const origin = new URL(currentUrl).origin;
          const target = href.startsWith("#")
            ? `${origin}/ghost/${href}`
            : `${origin}${href}`;
          await driver.url(target);
        }
      } else {
        await editorLinks[0].scrollIntoView();
        await editorLinks[0].click();
      }

      await driver.waitUntil(
        async () => (await driver.getUrl()).includes("/editor/post"),
        { timeout: 12000 },
      );
      await driver.pause(1000);
      return;
    }
  }

  const fallbackAnchors = await driver.$$("a.gh-list-data");
  for (const anchor of fallbackAnchors) {
    const text = await anchor.getText();
    if (!text.includes(title)) continue;
    await anchor.scrollIntoView();
    await anchor.click();
    await driver.waitUntil(
      async () => (await driver.getUrl()).includes("/editor/post"),
      { timeout: 12000 },
    );
    await driver.pause(1000);
    return;
  }

  throw new Error(`No se encontró el post "${title}" en la lista`);
}

async function openFirstPost(driver) {
  const directEditorLinks = await driver.$$(
    'li.gh-list-row a[href*="#/editor/post/"]',
  );
  if (directEditorLinks.length > 0) {
    const href = await directEditorLinks[0].getAttribute("href");
    if (href) {
      if (href.startsWith("http")) {
        await driver.url(href);
      } else {
        const currentUrl = await driver.getUrl();
        const origin = new URL(currentUrl).origin;
        const target = href.startsWith("#")
          ? `${origin}/ghost/${href}`
          : `${origin}${href}`;
        await driver.url(target);
      }
      await driver.waitUntil(
        async () => (await driver.getUrl()).includes("/editor/post"),
        { timeout: 12000 },
      );
      await driver.pause(1000);
      return;
    }
  }

  const candidates = [
    "li.gh-list-row:first-child a",
    "li.gh-list-row:first-child h3",
    "li.gh-list-row:first-child",
  ];

  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) {
      await els[0].scrollIntoView();
      await els[0].click();
      await driver.waitUntil(
        async () => (await driver.getUrl()).includes("/editor/post"),
        { timeout: 12000 },
      );
      await driver.pause(1000);
      return;
    }
  }

  throw new Error("No se pudo abrir el primer post de la lista");
}

async function assertPostInDrafts(driver, baseUrl, title) {
  await navigateToPostsFiltered(driver, baseUrl, "draft");
  const candidates = [`h3*=${title}`, `a*=${title}`];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) return;
  }
  throw new Error(`Post "${title}" no encontrado en borradores`);
}

async function assertPostInScheduled(driver, baseUrl, title) {
  await navigateToPostsFiltered(driver, baseUrl, "scheduled");
  const candidates = [`h3*=${title}`, `a*=${title}`];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) return;
  }
  throw new Error(`Post "${title}" no encontrado en programados`);
}

async function assertPostInAllPosts(driver, title) {
  await navigateToPosts(driver);
  const candidates = [`h3*=${title}`, `a*=${title}`];
  for (const sel of candidates) {
    const els = await driver.$$(sel);
    if (els.length > 0) return;
  }
  throw new Error(`Post "${title}" no encontrado en la lista de posts`);
}

module.exports = {
  navigateToPosts,
  navigateToPostsFiltered,
  clickNewPost,
  openPostByTitle,
  openFirstPost,
  assertPostInDrafts,
  assertPostInScheduled,
  assertPostInAllPosts,
};

async function visitHome(driver, baseUrl) {
  await driver.url(baseUrl);
  await driver.pause(2000);
}

async function findPostElementAcrossPages(driver, baseUrl, title) {
  const candidates = [`h2*=${title}`, `h3*=${title}`, `a*=${title}`];
  for (let page = 1; page <= 5; page += 1) {
    const pageUrl =
      page === 1 ? baseUrl : `${baseUrl.replace(/\/$/, "")}/page/${page}/`;
    await driver.url(pageUrl);
    await driver.pause(1500);

    for (const sel of candidates) {
      const els = await driver.$$(sel);
      if (els.length > 0) {
        return els[0];
      }
    }
  }
  return null;
}

async function assertPostVisible(driver, baseUrl, title) {
  const postElement = await findPostElementAcrossPages(driver, baseUrl, title);
  if (!postElement) {
    throw new Error(`Post "${title}" no visible en el sitio público`);
  }
}

async function assertPostContains(driver, baseUrl, title, content) {
  const postElement = await findPostElementAcrossPages(driver, baseUrl, title);
  if (!postElement) {
    throw new Error(`Post "${title}" no encontrado en el sitio público`);
  }

  await postElement.click();
  await driver.pause(2000);

  const bodyText = await (await driver.$("body")).getText();
  if (!bodyText.includes(content)) {
    throw new Error(
      `Contenido "${content}" no encontrado en el post "${title}"`,
    );
  }
}

module.exports = {
  visitHome,
  assertPostVisible,
  assertPostContains,
};

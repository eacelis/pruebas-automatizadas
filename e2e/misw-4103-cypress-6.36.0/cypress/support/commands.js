const LoginPage = require("./pages/LoginPage");
import { dashboardPage } from "./pages/Dashboard";

Cypress.Commands.add("loginAsAdmin", () => {
  LoginPage.loginWithEnvCredentials();
});

Cypress.Commands.add("signOutAdmin", () => {
  dashboardPage.signOut();
});

Cypress.Commands.add("screenshotStep", (stepName) => {
  const sanitizedName = stepName
    .toString()
    .trim()
    .replace(/[^a-zA-Z0-9\-\_ ]+/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 80);

  const runnable = cy.state("runnable");
  let scenarioPath = "unknown_scenario";

  if (runnable && typeof runnable.titlePath === "function") {
    const currentTest = cy.state("test");
    let titlePath = currentTest && typeof currentTest.titlePath === "function"
      ? currentTest.titlePath()
      : runnable.titlePath();

    scenarioPath = titlePath
      .filter(
        (part) => !/^(before each hook|after each hook|before all hook|after all hook)$/i.test(part),
      )
      .map((part) =>
        part
          .toString()
          .trim()
          .replace(/[^a-zA-Z0-9\-\_ ]+/g, "")
          .replace(/\s+/g, "_")
          .slice(0, 80),
      )
      .filter(Boolean)
      .join("/");

    if (!scenarioPath) {
      scenarioPath = "unknown_scenario";
    }
  }

  const screenshotPath = `${scenarioPath}/step_${sanitizedName}`;

  cy.log(`Screenshot step: ${stepName} -> ${screenshotPath}`);
  cy.document().its("readyState").should("equal", "complete");
  cy.get("body", { timeout: 15000 }).should("be.visible");
  cy.wait(500);
  cy.screenshot(screenshotPath, { capture: "viewport", overwrite: true });
});

function ensureAdminApiSession() {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");
  const adminEmail = Cypress.env("ADMIN_EMAIL");
  const adminPassword = Cypress.env("ADMIN_PASSWORD");

  return cy
    .request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/users/me/`,
      failOnStatusCode: false,
    })
    .then((meResp) => {
      if (meResp.status === 200) {
        return;
      }
      return cy.request({
        method: "POST",
        url: `${baseUrl}/ghost/api/admin/session`,
        body: { username: adminEmail, password: adminPassword },
        failOnStatusCode: false,
      });
    });
}

Cypress.Commands.add("cleanupPostsByTitlePrefix", (prefix) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  ensureAdminApiSession().then(() => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/posts/?limit=all&fields=id,title`,
      failOnStatusCode: false,
    }).then((listResp) => {
      if (listResp.status !== 200) return;
      const posts = listResp.body.posts || [];
      posts
        .filter((p) => p.title && p.title.startsWith(prefix))
        .forEach((post) => {
          cy.request({
            method: "DELETE",
            url: `${baseUrl}/ghost/api/admin/posts/${post.id}/`,
            failOnStatusCode: false,
          });
        });
    });
  });
});

Cypress.Commands.add("assertPostPublishedByTitle", (title) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  const verify = (attempt = 0, maxAttempts = 6) => {
    ensureAdminApiSession().then(() => {
      cy.request({
        method: "GET",
        url: `${baseUrl}/ghost/api/admin/posts/?limit=all&fields=id,title,status`,
        failOnStatusCode: false,
      }).then((resp) => {
        expect(resp.status).to.eq(200);

        const posts = resp.body.posts || [];
        const post = posts.find((p) => p.title === title);

        if (post && post.status === "published") {
          return;
        }

        if (attempt < maxAttempts) {
          cy.wait(2000);
          return verify(attempt + 1, maxAttempts);
        }

        throw new Error(
          `El post \"${title}\" no está publicado según Admin API`,
        );
      });
    });
  };

  verify();
});

Cypress.Commands.add(
  "assertPostBodyContainsByTitle",
  (title, expectedBodyText) => {
    const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

    const verify = (attempt = 0, maxAttempts = 6) => {
      ensureAdminApiSession().then(() => {
        cy.request({
          method: "GET",
          url: `${baseUrl}/ghost/api/admin/posts/?limit=all&fields=id,title,lexical,mobiledoc,html`,
          failOnStatusCode: false,
        }).then((resp) => {
          expect(resp.status).to.eq(200);

          const posts = resp.body.posts || [];
          const post = posts.find((p) => p.title === title);

          if (!post) {
            if (attempt < maxAttempts) {
              cy.wait(2000);
              return verify(attempt + 1, maxAttempts);
            }
            throw new Error(`No se encontró el post \"${title}\" en Admin API`);
          }

          const contentDump = `${post.lexical || ""}\n${post.mobiledoc || ""}\n${post.html || ""}`;

          if (contentDump.includes(expectedBodyText)) {
            return;
          }

          if (attempt < maxAttempts) {
            cy.wait(2000);
            return verify(attempt + 1, maxAttempts);
          }

          throw new Error(
            `El post \"${title}\" no contiene el texto esperado \"${expectedBodyText}\" según Admin API`,
          );
        });
      });
    };

    verify();
  },
);

Cypress.Commands.add("cleanupMemberByEmail", (email) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  ensureAdminApiSession().then(() => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/members/?filter=email:${encodeURIComponent(email)}`,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((listResp) => {
      if (listResp.status !== 200) return;
      const members = listResp.body.members || [];
      members.forEach((member) => {
        cy.request({
          method: "DELETE",
          url: `${baseUrl}/ghost/api/admin/members/${member.id}/`,
          failOnStatusCode: false,
        });
      });
    });
  });
});

Cypress.Commands.add("cleanupPageBySlug", (slug) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  ensureAdminApiSession().then(() => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/pages/?filter=slug:${encodeURIComponent(slug)}`,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((listResp) => {
      if (listResp.status !== 200) return;
      const pages = listResp.body.pages || [];
      pages.forEach((page) => {
        cy.request({
          method: "DELETE",
          url: `${baseUrl}/ghost/api/admin/pages/${page.id}/`,
          failOnStatusCode: false,
        });
      });
    });
  });
});

Cypress.Commands.add("cleanupPageByTitle", (title) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  ensureAdminApiSession().then(() => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/pages/?limit=all`,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((listResp) => {
      if (listResp.status !== 200) return;
      const pages = (listResp.body.pages || []).filter(
        (p) => p.title === title,
      );
      pages.forEach((page) => {
        cy.request({
          method: "DELETE",
          url: `${baseUrl}/ghost/api/admin/pages/${page.id}/`,
          failOnStatusCode: false,
        });
      });
    });
  });
});

Cypress.Commands.add("cleanupTagBySlug", (slug) => {
  const baseUrl = Cypress.env("GHOST_URL") || Cypress.config("baseUrl");

  ensureAdminApiSession().then(() => {
    cy.request({
      method: "GET",
      url: `${baseUrl}/ghost/api/admin/tags/?filter=slug:${encodeURIComponent(slug)}`,
      headers: { "Content-Type": "application/json" },
      failOnStatusCode: false,
    }).then((listResp) => {
      if (listResp.status !== 200) return;
      const tags = listResp.body.tags || [];
      tags.forEach((tag) => {
        cy.request({
          method: "DELETE",
          url: `${baseUrl}/ghost/api/admin/tags/${tag.id}/`,
          failOnStatusCode: false,
        });
      });
    });
  });
});

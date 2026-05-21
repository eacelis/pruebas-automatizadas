/**
 * Generates a unique CSS selector path for a given DOM element.
 */
const cssSelectorPath = (element) => {
  if (!element) return;

  const getSelector = (el) => {
    if (el.id) return `#${el.id}`;
    return el.tagName.toLowerCase();
  };

  let [curr, selector, path] = [element, "", []];
  while (curr) {
    selector = getSelector(curr);
    if (selector.includes("#")) {
      path.unshift(selector);
      break;
    }

    const siblings = Array.from(curr.parentNode?.children || []);
    const sameTagSiblings = siblings.filter((s) => s.tagName === curr.tagName);

    if (sameTagSiblings.length > 1) {
      selector += `:nth-of-type(${sameTagSiblings.indexOf(curr) + 1})`;
    }

    path.unshift(selector);
    curr = curr.parentElement;
  }
  return path.join(" > ");
};

Cypress.Commands.add(
  "rElement",
  { prevSubject: Window },
  (win, randomFn, state) => {
    state.pos.x = randomFn(0, state.viewport.w);
    state.pos.y = randomFn(0, state.viewport.h);
    const element = win.document.elementFromPoint(state.pos.x, state.pos.y);
    let target = cssSelectorPath(element);

    const candidate = target
      ? cy.get(target).then(($candidates) => {
          return $candidates
            .filter((_i, candidate) => !Cypress.dom.isHidden(candidate))
            .first();
        })
      : undefined;

    return cy.wrap({
      element: candidate,
      pos: state.pos,
      type: "Random Position",
    });
  },
);

Cypress.Commands.add("rClickable", { prevSubject: Window }, (win, randomFn) => {
  const tags = ["a", "button", "input", "select", "textarea"];
  const target = tags[randomFn(0, tags.length - 1)];
  const type = `Clickable ${target} Element`;

  if (!Cypress.$(target).length) return cy.wrap({ element: null, type });

  const element = cy.get(target).then(($candidates) => {
    const $visibleCandidates = $candidates.filter((_i, $c) => {
      const isHidden = Cypress.dom.isHidden($c);
      const display = win.getComputedStyle($c).display;
      return !isHidden && display !== "none";
    });

    const candidate = $visibleCandidates.length
      ? $visibleCandidates[randomFn(0, $visibleCandidates.length - 1)]
      : undefined;

    return candidate;
  });

  return cy.wrap({ element, type });
});

// ── MODIFICACIÓN: se agrega .first() en cada acción que usa element
// para garantizar que trigger/click/dblclick/rightclick operan sobre
// un único elemento. Esto evita el error:
// "cy.trigger() can only be called on a single element"
// que ocurre en el admin de Ghost donde el selector CSS retorna
// múltiples elementos del mismo tipo (ej. 23 elementos <a>).
Cypress.Commands.add(
  "rClick",
  { prevSubject: true },
  ({ element, pos, type }, randomFn, callback) => {
    const actions = !!element
      ? [
          () => element.first().click({ force: true }),
          () => element.first().dblclick({ force: true }),
          () => element.first().rightclick({ force: true }),
          () => element.first().trigger("mouseover", { force: true }),
        ]
      : [
          () => cy.get("body").click(pos.x, pos.y, { force: true }),
          () => cy.get("body").dblclick(pos.x, pos.y, { force: true }),
          () => cy.get("body").rightclick(pos.x, pos.y, { force: true }),
          () =>
            cy.get("body").trigger("mouseover", pos.x, pos.y, { force: true }),
        ];
    const names = ["single click", "double click", "right click", "hover"];
    const index = randomFn(0, actions.length - 1);

    const isExecutable = !!element || !!pos;
    if (isExecutable) actions[index]();

    callback({
      title: "Click",
      value: {
        type: type,
        subtype: isExecutable ? names[index] : "not executable",
        ...(pos && { position: `(${pos.x}, ${pos.y})` }),
      },
    });
  },
);

const scrollDown = (randomFn, state) => {
  const maxScrollableY = Math.min(state.viewport.maxY, state.viewport.h);
  state.pos.y = randomFn(state.pos.y, maxScrollableY);
  cy.log("scroll down");
};

const scrollRight = (randomFn, state) => {
  const maxScrollableX = Math.min(state.viewport.maxX, state.viewport.w);
  state.pos.x = randomFn(state.pos.x, maxScrollableX);
  cy.log("scroll right");
};

const scrollUp = (randomFn, state) => {
  state.pos.y = randomFn(0, state.pos.y);
  cy.log("scroll up");
};

const scrollLeft = (randomFn, state) => {
  state.pos.x = randomFn(0, state.pos.x);
  cy.log("scroll left");
};

Cypress.Commands.add("rScroll", (randomFn, state, callback) => {
  const actions = [scrollDown, scrollRight, scrollUp, scrollLeft];
  const names = ["scroll down", "scroll right", "scroll up", "scroll left"];
  const previousPosition = `(${state.pos.x}, ${state.pos.y})`;

  const index = randomFn(0, actions.length - 1);
  actions[index](randomFn, state);
  cy.scrollTo(state.pos.x, state.pos.y, {
    duration: 500,
    ensureScrollable: false,
  });

  callback({
    title: "Scroll",
    value: {
      type: names[index],
      previousPosition,
      newPosition: `(${state.pos.x}, ${state.pos.y})`,
    },
  });
});

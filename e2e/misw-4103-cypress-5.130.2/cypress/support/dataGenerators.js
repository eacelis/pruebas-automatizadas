import { faker } from '@faker-js/faker';

export function generateValidPost() {
  const title = faker.lorem.words({ min: 2, max: 8 });
  return {
    input: { title, content: faker.lorem.paragraphs(1) },
    expected: 'success',
    oracle: `post aparece en listado con título "${title}"`
  };
}

export function generatePostWithAccents() {
  const title = `Post DYN ${faker.lorem.word()} ñoño corazón`;
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost acepta títulos con caracteres especiales del español'
  };
}

export function generatePostLongTitle() {
  const title = faker.lorem.words(20).slice(0, 200);
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost acepta títulos de post de hasta 255 caracteres'
  };
}

export function generatePostWithEmoji() {
  const title = `Post DYN 🚀 ${faker.lorem.words(3)} 🎯`;
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost acepta emoji en título de post'
  };
}

export function generatePostWithHTMLTitle() {
  const word = faker.lorem.word();
  const title = `<b>${word}</b> post sanitizado`;
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost sanitiza HTML en título de post sin ejecutar scripts'
  };
}

export function generatePostEmptyTitle() {
  return {
    input: { title: '', content: faker.lorem.sentence() },
    expected: 'error',
    oracle: 'Ghost muestra error o guarda como (Untitled) cuando el título está vacío'
  };
}

export function generatePostSpacesTitle() {
  return {
    input: { title: '   ', content: faker.lorem.sentence() },
    expected: 'error',
    oracle: 'Ghost trata título de solo espacios como inválido o vacío'
  };
}

export function generateValidPage() {
  const title = `Página DYN ${faker.lorem.words(3)}`;
  return {
    input: { title, content: faker.lorem.paragraphs(1) },
    expected: 'success',
    oracle: `página aparece en listado con título "${title}"`
  };
}

export function generatePageWithAccents() {
  const title = `Página DYN Ñ ${faker.lorem.word()}`;
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost acepta títulos de página con caracteres españoles'
  };
}

export function generatePageLongTitle() {
  const title = faker.lorem.words(25).slice(0, 200);
  return {
    input: { title, content: faker.lorem.sentence() },
    expected: 'success',
    oracle: 'Ghost acepta títulos de página de hasta 255 caracteres'
  };
}

export function generateValidTag() {
  const suffix = faker.string.alphanumeric(8).toLowerCase();
  const name = `tag-dyn-valid-${suffix}`;
  return {
    input: { name, slug: `tag-dyn-${suffix}`, description: faker.lorem.sentence() },
    expected: 'success',
    oracle: `tag "${name}" visible en el listado de tags`
  };
}

export function generateValidTagShortName() {
  const name = faker.word.noun().toLowerCase().slice(0, 20) + `-dyn-${faker.string.alphanumeric(5)}`;
  return {
    input: { name, slug: `tag-short-${faker.string.alphanumeric(5).toLowerCase()}` },
    expected: 'success',
    oracle: `tag con nombre corto dinámico "${name}" visible en listado`
  };
}

export function generateTagWithSpecialChars() {
  const suffix = faker.string.alphanumeric(6).toLowerCase();
  const name = `tag & dyn ${suffix}`;
  return {
    input: { name, slug: `tag-special-dyn-${suffix}` },
    expected: 'success',
    oracle: 'Ghost acepta caracteres especiales en nombre de tag dinámico'
  };
}

export function generateInvalidTag_EmptyName() {
  return {
    input: { name: '', slug: '' },
    expected: 'error',
    oracle: "Ghost muestra error: You must specify a name for the tag"
  };
}

export function generateInvalidTag_SpacesName() {
  return {
    input: { name: '   ', slug: '' },
    expected: 'error',
    oracle: 'Ghost trata nombre de solo espacios como inválido'
  };
}

export function generateValidMember() {
  const email = faker.internet.email().toLowerCase();
  const name = faker.person.fullName();
  return {
    input: { email, name },
    expected: 'success',
    oracle: `member con email "${email}" aparece en listado`
  };
}

export function generateValidMemberWithNote() {
  const email = faker.internet.email().toLowerCase();
  const name = faker.person.fullName();
  const note = faker.lorem.sentence();
  return {
    input: { email, name, note },
    expected: 'success',
    oracle: `member con email "${email}" registrado con nota`
  };
}

export function generateMemberWithSpecialEmail() {
  const local = `${faker.internet.username()}+${faker.string.alphanumeric(4)}`.toLowerCase();
  const email = `${local}@${faker.internet.domainName()}`;
  return {
    input: { email, name: faker.person.fullName() },
    expected: 'success',
    oracle: `Ghost acepta email con + en local-part: "${email}"`
  };
}

export function generateInvalidMember_BadEmail() {
  const badEmail = faker.lorem.word() + faker.string.alphanumeric(5);
  return {
    input: { email: badEmail, name: faker.person.fullName() },
    expected: 'error',
    oracle: `Ghost rechaza email sin @: "${badEmail}"`
  };
}

export function generateInvalidMember_EmptyEmail() {
  return {
    input: { email: '', name: faker.person.fullName() },
    expected: 'error',
    oracle: 'Ghost requiere email obligatorio para registrar un member'
  };
}

export function generateInvalidMember_NoAtEmail() {
  const badEmail = faker.lorem.word() + '@';
  return {
    input: { email: badEmail, name: faker.person.fullName() },
    expected: 'error',
    oracle: `Ghost rechaza email sin dominio: "${badEmail}"`
  };
}

export function generateInvalidMember_EmailWithSpaces() {
  const badEmail = `${faker.lorem.word()} ${faker.lorem.word()}@${faker.internet.domainName()}`;
  return {
    input: { email: badEmail, name: faker.person.fullName() },
    expected: 'error',
    oracle: `Ghost rechaza email con espacios: "${badEmail}"`
  };
}

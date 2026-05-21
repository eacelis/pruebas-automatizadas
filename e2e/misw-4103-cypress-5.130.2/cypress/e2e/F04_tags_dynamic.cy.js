import { tagsPage } from '../support/pages/TagsPage';
import {
  generateValidTag,
  generateValidTagShortName,
  generateTagWithSpecialChars,
  generateInvalidTag_EmptyName,
  generateInvalidTag_SpacesName,
} from '../support/dataGenerators';

describe('F04 - Tags: Datos Dinámicos (Online Faker)', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  it('[F04-DYN-01] Tag válido con nombre generado dinámicamente', () => {
    const data = generateValidTag();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, data.input.description);
    tagsPage.save();
    tagsPage.assertTagVisible(data.input.name);
  });

  it('[F04-DYN-02] Tag con nombre corto generado dinámicamente', () => {
    const data = generateValidTagShortName();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, '');
    tagsPage.save();
    tagsPage.assertTagVisible(data.input.name);
  });

  it('[F04-DYN-03] Tag con nombre que incluye caracteres especiales', () => {
    const data = generateTagWithSpecialChars();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, '');
    tagsPage.save();
    tagsPage.assertTagVisible(data.input.name);
  });

  it('[F04-DYN-04] Segundo tag válido con nombre único dinámico', () => {
    const data = generateValidTag();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, data.input.description);
    tagsPage.save();
    tagsPage.assertTagVisible(data.input.name);
  });

  it('[F04-DYN-05] Tercer tag válido con slug dinámico', () => {
    const data = generateValidTag();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, '');
    tagsPage.save();
    tagsPage.assertTagVisible(data.input.name);
  });

  it('[F04-DYN-06] Tag inválido — nombre vacío generado dinámicamente', () => {
    const data = generateInvalidTag_EmptyName();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, '');
    tagsPage.save();
    tagsPage.assertErrorVisible();
  });

  it('[F04-DYN-07] Tag inválido — nombre solo espacios generado dinámicamente', () => {
    const data = generateInvalidTag_SpacesName();
    tagsPage.openNewTagForm();
    tagsPage.fillBasicData(data.input.name, data.input.slug, '');
    tagsPage.save();
    tagsPage.assertErrorVisible();
  });
});

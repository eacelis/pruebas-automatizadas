import { tagsPage } from '../support/pages/TagsPage';
import tagsDataPool from '../fixtures/F04_tags_data_pool.json';

describe('F04 - Tags: Data Pool A-Priori', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  afterEach(() => {
    cy.signOutAdmin();
  });

  tagsDataPool.forEach((testCase) => {
    it(`[F04-APR-${testCase.id}] ${testCase.description}`, () => {
      tagsPage.openNewTagForm();
      tagsPage.fillBasicData(
        testCase.input.name,
        testCase.input.slug,
        testCase.input.description || ''
      );
      tagsPage.save();

      if (testCase.expected === 'success') {
        tagsPage.assertTagVisible(testCase.input.name);
      } else {
        tagsPage.assertErrorVisible();
      }
    });
  });
});

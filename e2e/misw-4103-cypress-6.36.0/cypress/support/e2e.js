import "./commands";
import 'cypress-mochawesome-reporter/register';

Cypress.on('uncaught:exception', (err) => {
  if (!err || !err.message) return true;

  const ignored = [
    /TransitionAborted/,
    /AbortError/,
    /play\(\) request was interrupted/,
    /user is not permitted to perform this operation/,
    /TaskInstance.? 'autosaveTask' was canceled/,
    /Cannot read properties of null \(reading 'recipientFilter'\)/,
    /object in path "post" could not be found/,
  ];

  if (ignored.some((rgx) => rgx.test(err.message))) {
    return false;
  }
  return true;
});
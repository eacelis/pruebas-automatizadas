
Feature: F04-APR-04 - Tags con Data Pool A-Priori

  @F04-APR-04 @web @user1
  Scenario: [F04-APR-04] Tag name de 192 chars (supera límite)
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I type the tag name "tag192kraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    And I submit the tag form
    Then the tag creation should result in "error"


Feature: F04-APR-12 - Tags con Data Pool A-Priori

  @F04-APR-12 @web @user1
  Scenario: [F04-APR-12] Tag name válido muy corto (1 char)
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I type the tag name "Z"
    And I submit the tag form
    Then the tag creation should result in "success"


Feature: F04-APR-07 - Tags con Data Pool A-Priori

  @F04-APR-07 @web @user1
  Scenario: [F04-APR-07] Tag name válido con números
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I type the tag name "tag-numerico-2024-krapr07"
    And I submit the tag form
    Then the tag creation should result in "success"

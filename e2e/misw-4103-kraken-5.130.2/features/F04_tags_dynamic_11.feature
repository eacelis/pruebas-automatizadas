
Feature: F04-DYN-11 - Tags con datos dinámicos

  @F04-DYN-11 @dynamic-invalid-tag @web @user1
  Scenario: [F04-DYN-11] Tag inválido con nombre vacío generado dinámicamente
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I fill the tag name with the invalid dynamic value
    And I submit the tag form
    Then the tag creation should show a validation error

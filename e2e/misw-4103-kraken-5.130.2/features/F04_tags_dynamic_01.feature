
Feature: F04-DYN-01 - Tags con datos dinámicos

  @F04-DYN-01 @dynamic-tag @web @user1
  Scenario: [F04-DYN-01] Tag con nombre dinámico válido generado en runtime
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I fill the tag name with the dynamic value
    And I submit the tag form
    Then the dynamic tag should be saved successfully

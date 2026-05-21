
Feature: F05-DYN-11 - Members con datos dinámicos

  @F05-DYN-11 @dynamic-invalid-member @web @user1
  Scenario: [F05-DYN-11] Member inválido con email sin @ generado dinámicamente
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    When I fill the member name with the dynamic value
    And I fill the member email with the invalid dynamic value
    And I save the member
    Then the member creation should show a validation error

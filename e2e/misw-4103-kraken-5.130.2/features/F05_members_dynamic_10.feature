
Feature: F05-DYN-10 - Members con datos dinámicos

  @F05-DYN-10 @dynamic-member @web @user1
  Scenario: [F05-DYN-10] Member con email dinámico válido
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    When I fill the member name with the dynamic value
    And I fill the member email with the dynamic value
    And I save the member
    Then the dynamic member should be saved successfully


Feature: F05-APR-04 - Members con Data Pool A-Priori

  @F05-APR-04 @web @user1
  Scenario: [F05-APR-04] Email vacío
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    And I fill in the member name "Member APR KR04"
    And I fill in the member email field for apriori ""
    And I save the member
    Then the member creation should result in "error"

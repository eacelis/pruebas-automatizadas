
Feature: F05-APR-01 - Members con Data Pool A-Priori

  @F05-APR-01 @web @user1
  Scenario: [F05-APR-01] Email válido formato correcto
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    And I fill in the member name "Member APR KR01"
    And I fill in the member email field for apriori "member.apr.kr01@pruebas.com"
    And I save the member
    Then the member creation should result in "success"

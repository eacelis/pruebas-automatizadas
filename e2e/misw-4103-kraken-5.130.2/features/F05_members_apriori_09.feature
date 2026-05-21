
Feature: F05-APR-09 - Members con Data Pool A-Priori

  @F05-APR-09 @web @user1
  Scenario: [F05-APR-09] Nombre con caracteres especiales válidos
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    And I fill in the member name "María García López"
    And I fill in the member email field for apriori "member.apr.kr09@pruebas.com"
    And I save the member
    Then the member creation should result in "success"

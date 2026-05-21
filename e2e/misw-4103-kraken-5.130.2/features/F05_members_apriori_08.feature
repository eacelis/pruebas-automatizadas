
Feature: F05-APR-08 - Members con Data Pool A-Priori

  @F05-APR-08 @web @user1
  Scenario: [F05-APR-08] Email con punto al inicio (inválido RFC)
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    And I fill in the member name "Member APR KR08"
    And I fill in the member email field for apriori ".member@test.com"
    And I save the member
    Then the member creation should result in "error"

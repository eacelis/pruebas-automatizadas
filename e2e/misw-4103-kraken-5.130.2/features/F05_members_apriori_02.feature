
Feature: F05-APR-02 - Members con Data Pool A-Priori

  @F05-APR-02 @web @user1
  Scenario: [F05-APR-02] Email sin @ (inválido)
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    Given I click on New member button
    And I fill in the member name "Member APR KR02"
    And I fill in the member email field for apriori "emailsinarroba"
    And I save the member
    Then the member creation should result in "error"

Feature: F3: Diseñar una nueva página estática (Page):

    @EP09 @web @user1
    Scenario: Creación de una página estática con un slug de URL específico.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Pages section
    When I create a new EP09 page with content, slug and publish it
    Then I navigate to the Pages section
    And I should see the EP09 page in the pages list
    And the EP09 page should be publicly accessible

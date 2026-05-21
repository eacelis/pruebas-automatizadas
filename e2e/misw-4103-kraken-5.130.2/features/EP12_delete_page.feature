Feature: F3: Diseñar una nueva página estática (Page):

    @EP12 @web @user1
    Scenario: Eliminación de una página estática existente.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Pages section
    When I create and publish a new EP12 page
    And I open and delete the EP12 page
    Then the EP12 page should not be in the pages list
    And the EP12 page URL should return 404

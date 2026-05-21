Feature: F3: Diseñar una nueva página estática (Page):

    @EP11 @web @user1
    Scenario: Conversión de una página publicada de vuelta a borrador (Unpublish).
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Pages section
    When I create and publish a new EP11 page
    And I unpublish the EP11 page
    Then I filter pages by drafts
    And I should see the EP11 page as a draft

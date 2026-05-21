Feature: F3: Diseñar una nueva página estática (Page):

    @EP10 @web @user1
    Scenario: Inclusión de una imagen de portada en la configuración de la página.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Pages section
    When I create a new EP10 page with cover image and publish it
    Then the page should display a cover image

Feature: F1: Gestionar la configuración general del sitio:
    
    @EP01 @web @user1
    Scenario: Actualización del título y descripción corta del sitio.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to Ghost settings
    When I click on the Edit option in the Title and Description section
    And I change the site title and description with random values
    And I save the changes
    Then I confirm that the Edit button is back
    And I confirm the new title and description are displayed

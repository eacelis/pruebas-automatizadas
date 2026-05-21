Feature: F1: Gestionar la configuración general del sitio:
    
    @EP03 @web @user1
    Scenario: Configuración de destinatarios predeterminados (Default recipients).
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to Ghost settings
    When I clic on the Default Newsletter Recipients section
    And I select the Default Newsletter Recipients randomly
    And I save the changes
    Then I verify that it has been saved
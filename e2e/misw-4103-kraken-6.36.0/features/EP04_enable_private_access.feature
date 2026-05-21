Feature: F1: Gestionar la configuración general del sitio:
    
    @EP04 @web @user1
    Scenario: Habilitación del acceso privado al sitio
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to Ghost settings
    When I clic on the Make This Site Private section
    And I enable password protection for the site
    And I save the changes
    Then I verify that it has been saved
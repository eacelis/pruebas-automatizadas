Feature: F1: Gestionar la configuración general del sitio:
    
    @EP02 @web @user1
    Scenario: Modificación de la zona horaria del sitio.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to Ghost settings
    When I click on the Site Timezone section
    And I select a Timezone randomly
    And I save the changes
    Then I verify that it has been saved

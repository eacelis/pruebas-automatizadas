Feature: F4: Crear un nuevo tag (Etiqueta):

    @EP16 @web @user1
    Scenario: Modificación del color identificador del Tag mediante selector hexadecimal.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    When I create a new EP16 tag with hex color
    Then the EP16 tag color should be persisted

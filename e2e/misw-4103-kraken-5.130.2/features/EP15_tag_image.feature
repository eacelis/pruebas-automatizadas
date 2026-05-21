Feature: F4: Crear un nuevo tag (Etiqueta):

    @EP15 @web @user1
    Scenario: Asignación de una imagen representativa al Tag.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    When I create a new EP15 tag with image
    Then the EP15 tag should display an image

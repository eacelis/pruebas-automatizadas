Feature: F4: Crear un nuevo tag (Etiqueta):

    @EP13 @web @user1
    Scenario: Creación de un nuevo Tag con nombre y descripción.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    When I create a new EP13 tag with name, slug and description
    Then I should see the EP13 tag in the tags list

Feature: EP19 - Edición del nombre y notas de contacto de un miembro existente
  Como administrador de Ghost
  Quiero editar el nombre y las notas de contacto de un miembro existente
  Para que la información adicional se actualice y persista en el perfil

  @EP19 @user1 @web
  Scenario: Edición exitosa de nombre y nota de un miembro existente
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    And I click on New member button
    And I fill in the member name "Maria Torres EP19"
    And I fill in the member email "maria.torres.ep19@test.com"
    And I save the member
    When I navigate to the Members section
    And I open the member with email "maria.torres.ep19@test.com"
    And I update the member name to "Maria Torres Actualizada EP19"
    And I update the member note to "Nota de contacto actualizada en prueba EP19"
    And I save the member
    Then I reload the page
    And the member name field should have value "Maria Torres Actualizada EP19"
    And the member note field should have value "Nota de contacto actualizada en prueba EP19"

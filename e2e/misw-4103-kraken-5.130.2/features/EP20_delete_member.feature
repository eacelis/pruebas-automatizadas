Feature: EP20 - Eliminación de un miembro de la base de datos de suscripciones
  Como administrador de Ghost
  Quiero eliminar un miembro de la base de datos
  Para que el registro sea removido permanentemente del listado de miembros

  @EP20 @user1 @web
  Scenario: Eliminación exitosa de un miembro registrado
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    And I click on New member button
    And I fill in the member name "Pedro Ruiz EP20"
    And I fill in the member email "pedro.ruiz.ep20@test.com"
    And I save the member
    When I navigate to the Members section
    And I open the member with email "pedro.ruiz.ep20@test.com"
    And I click on the member actions menu
    And I click on delete member option
    And I confirm the member deletion
    Then I should be on the members list page
    And I should not see the member "pedro.ruiz.ep20@test.com" in the members list

Feature: EP17 - Registro manual de un nuevo miembro con email válido
  Como administrador de Ghost
  Quiero registrar manualmente un nuevo miembro con un email válido
  Para que el miembro se cree correctamente y aparezca en la tabla de gestión de audiencia

  @EP17 @user1 @web
  Scenario: Registro exitoso de un nuevo miembro con email válido
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    When I navigate to the Members section
    And I click on New member button
    And I fill in the member name "Ana García EP17"
    And I fill in the member email "ana.garcia.ep17@test.com"
    And I save the member
    Then I should be redirected to the member detail page
    And I navigate to the Members section
    And I should see the member "ana.garcia.ep17@test.com" in the members list

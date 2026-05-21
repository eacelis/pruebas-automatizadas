Feature: EP18 - Asignación de etiquetas (Labels) internas a un miembro registrado
  Como administrador de Ghost
  Quiero asignar etiquetas internas a un miembro registrado
  Para categorizar al miembro mediante etiquetas para segmentación futura

  @EP18 @user1 @web
  Scenario: Asignación exitosa de una etiqueta a un miembro existente
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Members section
    And I click on New member button
    And I fill in the member name "Carlos López EP18"
    And I fill in the member email "carlos.lopez.ep18@test.com"
    And I save the member
    When I navigate to the Members section
    And I open the member with email "carlos.lopez.ep18@test.com"
    And I assign the label "VIP" to the member
    And I save the member
    Then I reload the page
    And I should see the label "VIP" applied to the member

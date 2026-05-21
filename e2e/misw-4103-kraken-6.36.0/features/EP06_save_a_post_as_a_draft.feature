Feature: F2 - Gestión de posts en Ghost 5.130.2

  @user1 @web
  Scenario: EP06 - Guardado de un post como borrador para edición posterior
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    When I create a new post with title "EP06 Post borrador" and body "Contenido borrador EP06"
    And I leave the editor without publishing
    Then I should see the post in drafts with title "EP06 Post borrador"

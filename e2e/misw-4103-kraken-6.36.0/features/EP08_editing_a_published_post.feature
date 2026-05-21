Feature: F2 - Gestión de posts en Ghost 5.130.2

  @user1 @web
  Scenario: EP08 - Edición de un post ya publicado para actualizar su contenido
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I have a published post with title "EP08 Post original" and body "Contenido original EP08"
    When I update the published post body to "Contenido actualizado EP08"
    Then I should see the updated content in the public site with title "EP08 Post original" and content "Contenido actualizado EP08"
Feature: F2 - Gestión de posts en Ghost 5.130.2

  @user1 @web
  Scenario: EP05 - Creación y publicación inmediata de un nuevo post con título y cuerpo
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    When I create a new post with title "EP05 Post publicado" and body "Contenido del post EP05"
    And I publish the post immediately
    Then I should see the post in the public site with title "EP05 Post publicado"
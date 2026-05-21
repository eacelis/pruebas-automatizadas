Feature: F2 - Gestión de posts en Ghost 5.130.2

  @user1 @web
  Scenario: EP07 - Programación de publicación para una fecha futura
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    When I create a new post with title "EP07 Post programado" and body "Contenido programado EP07"
    And I schedule the post for later
    Then I should see the post in scheduled posts with title "EP07 Post programado"

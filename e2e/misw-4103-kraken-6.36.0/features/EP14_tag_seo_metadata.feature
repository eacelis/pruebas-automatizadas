Feature: F4: Crear un nuevo tag (Etiqueta):

    @EP14 @web @user1
    Scenario: Configuración de metadatos SEO (Meta Title/Description) para un Tag.
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    When I create a new EP14 tag
    And I add SEO metadata to the EP14 tag
    Then the EP14 tag SEO metadata should be persisted

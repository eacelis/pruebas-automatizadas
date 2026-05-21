
Feature: F04-APR-09 - Tags con Data Pool A-Priori

  @F04-APR-09 @web @user1
  Scenario: [F04-APR-09] Tag name con tildes y ñ
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    And I navigate to the Tags section
    Given I navigate to the new tag form
    When I type the tag name "tag-español-ñoño-krapr09"
    And I submit the tag form
    Then the tag creation should result in "success"

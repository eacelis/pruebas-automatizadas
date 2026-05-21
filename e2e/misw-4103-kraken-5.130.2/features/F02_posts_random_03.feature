
Feature: F02-RND-03 - Posts con datos pseudo-aleatorios

  @F02-RND-03 @random @web @user1
  Scenario: [F02-RND-03] Post con datos completamente aleatorios - iteración 03
    Given I navigate to Ghost admin login page
    And I login with admin credentials
    When I navigate to posts
    And I click on new post button
    And I fill the post title with the random value
    And I fill the post body with the random value
    And I wait for the post draft to be auto-saved
    Then the post editor should not show any crash error

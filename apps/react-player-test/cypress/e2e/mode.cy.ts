/**
 * Copyright 2023 Design Barn Inc.
 */

describe('Mode', () => {
  const testId = 'testPlayer';

  it('should be able to change mode to `bounce`', () => {
    cy.load({
      testId,
      mode: 'bounce',
    });
    cy.window().its(`dotLottiePlayer.${testId}.mode`).should('equal', 'bounce');
  });

  it('should be able to change mode to `normal`', () => {
    cy.load({
      testId,
      mode: 'normal',
    });
    cy.window().its(`dotLottiePlayer.${testId}.mode`).should('equal', 'normal');
  });

  it('should be reactive', () => {
    cy.load({
      testId,
      autoplay: true,
      loop: true,
      controls: true,
      mode: 'normal',
    });
    cy.window().its(`dotLottiePlayer.${testId}.mode`).should('equal', 'normal');

    cy.updateProp('mode', 'bounce');
    cy.window().its(`dotLottiePlayer.${testId}.mode`).should('equal', 'bounce');
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

describe('Speed', () => {
  const testId = 'testPlayer';

  it('should be able to change speed to 1', () => {
    cy.load({
      testId,
      speed: 1,
    });
    cy.window().its(`dotLottiePlayer.${testId}.speed`).should('equal', 1);
  });

  it('should be able to change speed to 2', () => {
    cy.load({
      testId,
      speed: 2,
    });
    cy.window().its(`dotLottiePlayer.${testId}.speed`).should('equal', 2);
  });

  it('should be reactive', () => {
    cy.load({
      testId,
      speed: 1,
    });
    cy.window().its(`dotLottiePlayer.${testId}.speed`).should('equal', 1);

    cy.updateProp('speed', 3);
    cy.window().its(`dotLottiePlayer.${testId}.speed`).should('equal', 3);
  });
});

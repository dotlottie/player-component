describe('Direction', () => {
  const testId = 'testPlayer';
  it('should be able to change direction to 1', () => {
    cy.load({
      testId,
      autoplay: true,
      loop: true,
      controls: true,
      direction: 1,
    });
    cy.window().its(`dotLottiePlayer.${testId}.direction`).should('equal', 1);
  });

  it('should be able to change direction to -1', () => {
    cy.load({
      testId,
      autoplay: true,
      loop: true,
      controls: true,
      direction: -1,
    });

    cy.window().its(`dotLottiePlayer.${testId}.direction`).should('equal', -1);
  });

  it('should be reactive', () => {
    cy.load({ testId, autoplay: true, loop: true, controls: true, direction: 1 });
    cy.window().its(`dotLottiePlayer.${testId}.direction`).should('equal', 1);

    cy.updateProp('direction', -1);
    cy.window().its(`dotLottiePlayer.${testId}.direction`).should('equal', -1);
  });
});

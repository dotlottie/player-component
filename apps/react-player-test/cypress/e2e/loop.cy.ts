describe('Loop', () => {
  const testId = 'testPlayer';
  it('should not loop if `loop` = `false`', () => {
    cy.load({
      testId,
      src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
      autoplay: true,
      loop: false,
      controls: true,
      speed: 100,
    });

    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', false);
  });

  it('should loop if `loop` = `true`', () => {
    cy.load({
      testId,
      src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
      autoplay: true,
      loop: true,
      controls: true,
      speed: 100,
    });

    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', true);
  });

  it('should be reative', () => {
    cy.load({
      testId,
      src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
      autoplay: true,
      loop: true,
      controls: true,
      speed: 100,
    });
    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', true);

    cy.updateProp('loop', false); // set loop to false
    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', false);
  });
});

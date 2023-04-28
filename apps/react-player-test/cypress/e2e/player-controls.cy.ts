import { PlayerState } from 'react-player';

describe('Controls', () => {
  const testId = 'testPlayer';

  it('should render controls with `controls` prop', () => {
    cy.load({
      controls: true,
    });
    cy.get('[aria-label="lottie-animation-controls"]').should('exist');
  });

  it('should not render controls without `controls` prop', () => {
    cy.load({
      controls: false,
    });
    cy.get('[aria-label="lottie-animation-controls"]').should('not.exist');
  });

  it('should be reactive', () => {
    cy.load({
      controls: true,
    });
    cy.get('[aria-label="lottie-animation-controls"]').should('exist');

    cy.updateProp('controls', false).get('[aria-label="lottie-animation-controls"]').should('not.exist');
  });

  it('should be able to play when autoplay disabled', () => {
    cy.load({
      autoplay: false,
      loop: true,
      controls: true,
    });

    //Not initially
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('not.equal', PlayerState.Playing);

    //play
    cy.get('[aria-label="play-pause"]').click();
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);
  });

  it('should be able to pause and play', () => {
    cy.load({
      autoplay: true,
      loop: true,
      controls: true,
    });

    //playing initially
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);

    // pause
    cy.get('[aria-label="play-pause"]').click();
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Paused);

    //play
    cy.get('[aria-label="play-pause"]').click();
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);
  });

  it('should be able to stop', () => {
    cy.load({
      autoplay: true,
      loop: true,
      controls: true,
    });

    //playing initially
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);

    // pause
    cy.get('[aria-label="stop"]').click();
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Stopped);

    //play
    cy.get('[aria-label="stop"]').click();
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);
  });

  it('should be able toggle looping', () => {
    cy.load({
      testId,
      src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
      autoplay: true,
      loop: true,
      controls: true,
      speed: 100,
    });

    //playing initially
    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', true);

    // Toggle loop
    cy.get('[aria-label="loop-toggle"]').click();
    cy.window().its(`dotLottiePlayer.${testId}.loop`).should('equal', false);
  });
});

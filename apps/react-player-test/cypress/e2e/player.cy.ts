import { PlayerState } from 'react-player';
describe('Player', () => {
  const testId = 'testPlayer';
  const dotLottieContainerSelector = `[data-testid=${testId}]`;

  it('should mount', () => {
    cy.load({
      testId,
      src: 'https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie',
      loop: true,
      controls: true,
      autoplay: true,
      direction: -1,
      mode: 'bounce',
      playOnHover: false,
    });
    cy.get(dotLottieContainerSelector).should('not.be.empty');
  });

  it('should be able to play lottie.json', () => {
    cy.load({
      testId,
      src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
      autoplay: true,
      loop: true,
    });

    cy.get(dotLottieContainerSelector).should('not.be.empty');
    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('equal', PlayerState.Playing);
  });

  it('shows error when url is invalid', () => {
    cy.visit('/', {
      qs: {
        testId,
        src: 'https://invalid.lottie',
        loop: true,
        controls: true,
        autoplay: true,
        direction: -1,
        mode: 'bounce',
        playOnHover: false,
      },
    });
    cy.get('[data-testid="error"]').should('exist');
  });
});

import { PlayerState } from 'react-player';

describe('Autoplay', () => {
  // Autoplay

  it('should not play when `autoplay` = `false`', () => {
    cy.load({
      loop: true,
      controls: true,
      autoplay: false,
      direction: -1,
      mode: 'bounce',
      playOnHover: false,
    });

    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('not.equal', PlayerState.Playing);
  });

  it('should not play when `autoplay` = `false`', () => {
    cy.load({
      loop: true,
      controls: true,
      autoplay: false,
      direction: -1,
      mode: 'bounce',
      playOnHover: false,
    });

    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('not.equal', PlayerState.Playing);
  });

  it('should not player when `playOnHover` = `true` eventhough `autoplay` = `true`', () => {
    cy.load({
      loop: true,
      controls: true,
      direction: -1,
      mode: 'bounce',
      // Should not play in this case
      autoplay: true,
      playOnHover: true,
    });

    cy.get('[data-player-state]').invoke('attr', 'data-player-state').should('not.equal', PlayerState.Playing);
  });
});

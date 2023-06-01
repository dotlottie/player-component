/**
 * Copyright 2022 Design Barn Inc.
 */

const { WatchDirectoryFlags } = require('typescript');

context('Player component DOM check', () => {
  beforeEach(() => {
    cy.visit('http://localhost:8000/');
  });

  it('1.1 Loads an animation using the "load" method of the player.', () => {
    cy.get('#player-one').should('have.length', 1);
  });

  it('1.2 Loads an animation using the "load" method of the player with invalid json.', function (done) {
    cy.get('#player-two').then(($el) => {
      const playerTwo = $el.get(0);

      console.log(playerTwo.currentState);
      playerTwo.addEventListener(
        'error',
        () => {
          console.log('caught');
          expect(playerTwo.currentState).to.eq('error');
          done();
        },
        { once: true },
      );
    });
  });

  it('1.3 Loads an animation using the "load" method of the player with invalid url.', function (done) {
    cy.get('#player-three').then(($el) => {
      const playerThree = $el.get(0);

      playerThree.addEventListener(
        'error',
        () => {
          console.log('error');
          expect(playerThree.currentState).to.eq('error');
          done();
        },
        { once: true },
      );
    });
  });

  it('1.4 looks inside shadow-dom div for animation class', () => {
    cy.get('#player-one dotlottie-player').shadow().find('.main').should('have.class', 'main');
  });

  it.skip('1.5 looks inside shadow-dom for aria-label', () => {
    cy.get('#player-one dotlottie-player').shadow().find('#animation-container').should('have.attr', 'aria-label');
  });

  it('1.6 looks inside shadow-dom for controls', () => {
    cy.wait(100);
    cy.get('#test-player').shadow().find('#animation-container').should('have.class', 'main controls');
  });

  it('1.7 looks inside shadow-dom controls for buttons', () => {
    cy.wait(100);
    cy.get('#test-player').shadow().find('#lottie-controls').children().should('have.length', 4);
  });
});

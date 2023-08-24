/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';

import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: exploding_pigeon (onClick, onComplete)', () => {
  it('should be able set activeStateId exploding_pigeon', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="exploding_pigeon"
          src={`/lf_interactivity_page.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', 'exploding_pigeon');
  });

  it('should transition on click', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="exploding_pigeon"
          src={`/lf_interactivity_page.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    // eslint-disable-next-line no-warning-comments
    // TODO: increase speed. to make the tests faster.

    // State: running
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="direction"]').should('have.value', 1);

    // State: exploding
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="loop"]').should('have.value', 3);
    cy.get('[name="direction"]').should('have.value', 1);

    // State: feathers
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="direction"]').should('have.value', 1);
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';

import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: state_toggle (onClick)', () => {
  it('should be able set activeStateId state_toggle', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="state_toggle"
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

    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', 'state_toggle');
  });

  it('should transition on click', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="state_toggle"
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

    // State: startIdle
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="frame"]').should('have.value', 0);

    // State: playSun
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="frame"]').should('have.value', 29);

    // State: playReverse
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="frame"]').should('have.value', 0);
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';

import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: state_toggle (onMouseEnter, onMouseLeave)', () => {
  it('should be able set activeStateId play_on_hold_pause', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="play_on_hold_pause"
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
    cy.get('[name="activeStateId"]').should('have.value', 'play_on_hold_pause');
  });

  it('should transition on mouseneter and on mouseleve', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="play_on_hold_pause"
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

    // State: idleState
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="loop"]').should('have.value', 'false');

    // State: playState
    cy.get('.animation').trigger('mouseenter');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="direction"]').should('have.value', 1);

    // State: idleState
    cy.get('.animation').trigger('mouseleave');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="loop"]').should('have.value', 'false');
  });
});

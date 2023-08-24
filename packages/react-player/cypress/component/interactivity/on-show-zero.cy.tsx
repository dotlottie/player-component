/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';

import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: onShowZero (onShow)', () => {
  it('should be able set activeStateId onShowZero', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="onShowZero"
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
    cy.get('[name="activeStateId"]').should('have.value', 'onShowZero');
  });

  it('should change state onShow', () => {
    cy.mount(
      <div style={{ height: '2000px', display: 'flex', alignItems: 'flex-end' }}>
        <PlayerStateWrapper>
          <DotLottiePlayer
            activeStateId="onShowZero"
            src={`/lf_interactivity_page.lottie`}
            style={{ height: '400px', display: 'inline-block' }}
            loop
            autoplay
          >
            <Controls />
          </DotLottiePlayer>
          ,
        </PlayerStateWrapper>
        ,
      </div>,
    );

    // State: intialState
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="loop"]').should('have.value', 'false');

    // State: playState
    cy.scrollTo('bottom', { duration: 200 });
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 4);
  });
});

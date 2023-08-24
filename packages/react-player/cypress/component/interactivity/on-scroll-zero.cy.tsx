/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';

import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: onScrollZero (playOnScroll)', () => {
  it('should be able set activeStateId onScrollZero', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeStateId="onScrollZero"
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

    cy.get('[name="activeStateId"]').should('have.value', 'onScrollZero');
  });

  it('should change frame on scroll', () => {
    cy.mount(
      <div style={{ height: '2000px', display: 'flex', alignItems: 'flex-end' }}>
        <PlayerStateWrapper>
          <DotLottiePlayer
            activeStateId="onScrollZero"
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

    // State: onScrollState
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="frame"]').should('have.value', 0);

    // frame should change on scroll
    cy.scrollTo('bottom', { duration: 50 });
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="speed"]').should('not.have.value', 0);
  });
});

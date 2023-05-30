/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('[dolottie-player]: Background', () => {
  it('should not play when `autoplay` = `false`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing)
  });

  it('should able set background color', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          background="rgb(26, 189, 70)"
          autoplay
          testId="testPlyer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(26, 189, 70)');
  });

});

/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Direction', () => {
  it('should be able to change direction to 1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          direction={1}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', 1)

  });

  it('should be able to change direction to -1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          direction={-1}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', -1)
  });

});

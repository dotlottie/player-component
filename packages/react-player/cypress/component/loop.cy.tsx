/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Loop', () => {
  it('should not loop if `loop` = `false`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 'false')
  });

  it('should not without `loop` prop', () => {
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

    cy.get('[name="loop"]').should('have.value', 'false')
  });

  it('should loop if `loop` = `true`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 'true')
  });
});

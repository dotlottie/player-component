/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode } from 'common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Mode', () => {
  it('defaults to `normal`', () => {
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

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal)
  });

  it('should be able to change mode to `bounce`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          mode={PlayMode.Bounce}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce)
  });

  it('should be able to change mode to `normal`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          mode={PlayMode.Normal}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal)
  });

});

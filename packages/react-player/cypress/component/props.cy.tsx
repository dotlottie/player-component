/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode } from '@dotlottie/common';
import React from 'react';

import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Override playMode', () => {
  it('should override the manifest playMode', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/speed_3_bounce_and_reverse_playback.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          playMode={PlayMode.Normal}
        ></DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });
});

describe('Override speed', () => {
  it('should override the manifest playMode', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/speed_3_bounce_and_reverse_playback.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          speed={5}
        ></DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="speed"]').should('have.value', 1);
  });
});

describe('Override loop', () => {
  it('should override the manifest playMode', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/speed_3_bounce_and_reverse_playback.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={5}
        ></DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 5);
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Light', () => {
  it('should load lottie-web light svg renderer and play animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          light
          renderer="svg"
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
  it('should load lottie-web light canvas renderer and play animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          light
          renderer="canvas"
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
  it('should load lottie-web light html renderer and play animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          light
          renderer="html"
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
});

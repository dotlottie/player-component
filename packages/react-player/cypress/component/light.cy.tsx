/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Light', () => {
  it('should load lottie-web light and play animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer light src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
});

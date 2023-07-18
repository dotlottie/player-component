/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Player', () => {
  it('should mount', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[data-testid="testPlayer"]').should('not.be.empty');
  });

  it('should be able to play lottie.json', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src="/toaster.json" style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to play .lottie', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('shows error when url is invalid', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src="https://invalid.lottie"
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[data-testid="error"]').should('exist');
  });

  it('should be able to load valid json urls with additional query params', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src="/toaster.json?version=12&gzip=true"
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to load valid .lottie urls with additional query params', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src="/cool-dog.lottie?version=12&gzip=true"
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should error for invalid .lottie files', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src="/fake.lottie"
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[data-testid="error"]').should('exist');
  });
});

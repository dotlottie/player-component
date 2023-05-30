/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Controls', () => {
  it('should render controls.', () => {
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
    cy.get('[aria-label="lottie-animation-controls"]').should('exist');
  });

  it('should not render controls without `controls` prop', () => {
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
    cy.get('[aria-label="lottie-animation-controls"]').should('exist');

  });

  it('should dispaly all buttons by default', () => {
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
    cy.get('[aria-label="play-pause"]').should('exist');
    cy.get('[aria-label="stop"]').should('exist');
    cy.get('[aria-label="loop-toggle"]').should('exist');
    cy.get('[aria-label="lottie-seek-input"]').should('exist');
  });

  it('should dispaly buttons specifiied. [`loop`]', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls buttons={['loop']} />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );
    cy.get('[aria-label="play-pause"]').should('not.exist');
    cy.get('[aria-label="stop"]').should('not.exist');

    cy.get('[aria-label="loop-toggle"]').should('exist');
    cy.get('[aria-label="lottie-seek-input"]').should('exist');
  });

  it('only display seek when buttons props empty', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls buttons={[]} />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[aria-label="play-pause"]').should('not.exist');
    cy.get('[aria-label="stop"]').should('not.exist');
    cy.get('[aria-label="loop-toggle"]').should('not.exist');
    cy.get('[aria-label="loop-toggle"]').should('not.exist');

    cy.get('[aria-label="lottie-seek-input"]').should('exist');
  });

  it('should start to play when play button is pressed.', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          loop
          style={{ height: '400px', display: 'inline-block' }}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    // Not playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready)

    cy.get('[aria-label="play-pause"]').click()
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing)
  });

  it('should be able to pause', () => {
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

    // Playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing)

    cy.get('[aria-label="play-pause"]').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused)
  });

  it('should be able to stop', () => {
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

    // Playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing)

    cy.get('[aria-label="stop"]').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Stopped)
  });

  it('should be able toggle looping', () => {
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

    // Loop is true initially
    cy.get('[name="loop"]').should('have.value', 'true')

    cy.get('[aria-label="loop-toggle"]').click();
    cy.get('[name="loop"]').should('have.value', 'false')
  });
});

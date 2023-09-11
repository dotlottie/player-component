/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React, { useRef } from 'react';
import { DotLottieRefProps } from '../../dist';

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

  it('should not render twice with multiple render calls', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="render"
            onClick={(): void => {
              lottieRef.current?.play('wifi');
              lottieRef.current?.setDefaultTheme('dark-wifi');
            }}
          >
            Next
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps): void => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              testId="testPlayer"
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[data-testid="render"]').click({ force: true });
    cy.get('[data-testid="testPlayer"] .animation > svg').should('have.length', 1);
  });
});

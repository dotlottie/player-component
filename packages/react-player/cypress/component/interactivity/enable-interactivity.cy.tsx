/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { useRef } from 'react';

import { type DotLottieRefProps } from '../../../dist';
import { Controls } from '../../../src/controls';
import { DotLottiePlayer } from '../../../src/react-player';
import { PlayerStateWrapper } from '../../support/player-state-wrapper';

describe('Interactivity: enter/exit interactivity', () => {
  it('should be able to enter and exit interactivity mode', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="start_interactivity"
            onClick={(): void => {
              lottieRef.current?.enterInteractiveMode('state_toggle');
            }}
          >
            Exit Interactivity
          </button>
          <button
            data-testid="exit_interactivity"
            onClick={(): void => {
              lottieRef.current?.exitInteractiveMode();
            }}
          >
            Start Interactivity
          </button>
          <PlayerStateWrapper
            onRef={(ref): void => {
              if (ref) {
                lottieRef.current = ref;
              }
            }}
          >
            <DotLottiePlayer
              src={`/lf_interactivity_page.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              speed={3}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
            ,
          </PlayerStateWrapper>
          ,
        </>
      );
    }
    cy.mount(<Wrapper />);

    // Before interactivity
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', '');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 3);

    // Start Interactivity
    cy.get('[data-testid="start_interactivity"]').click();
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', 'state_toggle');
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="frame"]').should('have.value', 0);
    cy.get('[name="speed"]').should('have.value', 1);

    // State: playSun
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="frame"]').should('have.value', 29);
    cy.get('[name="speed"]').should('have.value', 1);

    // State: playReverse
    cy.get('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="frame"]').should('have.value', 0);
    cy.get('[name="speed"]').should('have.value', 1);

    // Exit interactivity
    cy.get('[data-testid="exit_interactivity"]').click();
    cy.get('[name="activeStateId"]').should('have.value', '');
    // Playback options are lost. ?
    // cy.get('[name="loop"]').should('have.value', 'true');
    // cy.get('[name="autoplay"]').should('have.value', 'true');
    // cy.get('[name="speed"]').should('have.value', 3);
  });

  it('should be able change between interactivity states', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="start_toggle"
            onClick={(): void => {
              lottieRef.current?.enterInteractiveMode('state_toggle');
            }}
          >
            Start Toggle
          </button>
          <button
            data-testid="start_exploding_pigeon"
            onClick={(): void => {
              lottieRef.current?.enterInteractiveMode('exploding_pigeon');
            }}
          >
            Start Exploding Pigeon
          </button>
          <button
            data-testid="exit_interactivity"
            onClick={(): void => {
              lottieRef.current?.exitInteractiveMode();
            }}
          >
            Exit Interactivity
          </button>
          <PlayerStateWrapper
            onRef={(ref): void => {
              if (ref) {
                lottieRef.current = ref;
              }
            }}
          >
            <DotLottiePlayer
              src={`/lf_interactivity_page.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              speed={3}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
            ,
          </PlayerStateWrapper>
          ,
        </>
      );
    }
    cy.mount(<Wrapper />);

    // Before interactivity
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', '');

    // Start Interactivity
    cy.get('[data-testid="start_toggle"]').click();
    cy.get('[name="activeStateId"]').should('have.value', 'state_toggle');

    // State: playSun
    cy.get('[data-testid="start_exploding_pigeon"]').click();
    cy.get('[name="activeStateId"]').should('have.value', 'exploding_pigeon');

    // Exit interactivity
    cy.get('[data-testid="exit_interactivity"]').click();
    cy.get('[name="activeStateId"]').should('have.value', '');
  });
});

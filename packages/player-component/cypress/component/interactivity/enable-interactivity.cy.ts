/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

import type { DotLottiePlayer } from '../../..';

describe('Interactivity: enter/exit interactivity', () => {
  it('should be able to enter and exit interactivity mode', () => {
    cy.mount(
        html`
          <button
            data-testid="start_interactivity"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer).enterInteractiveMode('state_toggle');
            }}
          >
            Start Interactivity
          </button>
          <button
            data-testid="exit_interactivity"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer).exitInteractiveMode();
            }}
          >
            Exit Interactivity
          </button>
          <dotlottie-player data-testid="testPlayer" autoplay loop speed="3" controls style="height: 200px;" src="/lf_interactivity_page.lottie">
          </dotlottie-player>
        `
        );

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
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'false');
    cy.get('[name="frame"]').should('have.value', 29);
    cy.get('[name="speed"]').should('have.value', 1);

    // State: playReverse
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click();
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

});

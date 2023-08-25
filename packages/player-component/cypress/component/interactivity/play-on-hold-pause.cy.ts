/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Interactivity: state_toggle (onMouseEnter, onMouseLeave)', () => {
  it('should be able set activeStateId play_on_hold_pause', () => {
    cy.mount(
      // eslint-disable-next-line no-secrets/no-secrets
      html`
        <dotlottie-player activeStateId="play_on_hold_pause" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', "play_on_hold_pause");
  });

  it('should transition on mouseneter and on mouseleve', () => {
    cy.mount(
      // eslint-disable-next-line no-secrets/no-secrets
      html`
        <dotlottie-player activeStateId="play_on_hold_pause" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );
  
    // State: idleState
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="autoplay"]').should('have.value', "false");
    cy.get('[name="loop"]').should('have.value', "false");

    // State: playState
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').trigger('mouseenter');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="loop"]').should('have.value', "false");
    cy.get('[name="direction"]').should('have.value', 1);

    // State: idleState
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').trigger('mouseleave');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="autoplay"]').should('have.value', "false");
    cy.get('[name="loop"]').should('have.value', "false");
  });
});

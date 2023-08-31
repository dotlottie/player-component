/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Interactivity: state_toggle (onClick)', () => {
  it('should be able set activeStateId state_toggle', () => {
    cy.mount(
      html`
        <dotlottie-player activeStateId="state_toggle" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', "state_toggle");
  });

  it('should transition on click', () => {
    cy.mount(
      html`
        <dotlottie-player activeStateId="state_toggle" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    // eslint-disable-next-line no-warning-comments
    // TODO: increase animation speed. to make the tests faster.
  
    // State: startIdle
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="frame"]').should('have.value', 0);

    // State: playSun

    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click({force:true});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', "false");
    cy.get('[name="autoplay"]').should('have.value', "false");
    cy.get('[name="frame"]').should('have.value', 30);

    // State: playReverse
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click({force:true});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="loop"]').should('have.value', "false");
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="frame"]').should('have.value', 0);
  });
});

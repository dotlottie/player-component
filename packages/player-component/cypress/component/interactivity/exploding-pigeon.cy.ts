/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Interactivity: exploding_pigeon (onClick, onComplete)', () => {
  it('should be able set activeStateId exploding_pigeon', () => {
    cy.mount(
      // eslint-disable-next-line no-secrets/no-secrets
      html`
        <dotlottie-player activeStateId="exploding_pigeon" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="activeStateId"]').should('have.value', "exploding_pigeon");
  });

  it('should transition on click', () => {
    cy.mount(
    // eslint-disable-next-line no-secrets/no-secrets
      html`
        <dotlottie-player activeStateId="exploding_pigeon" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    // eslint-disable-next-line no-warning-comments
    // TODO: increase speed. to make the tests faster.
  
    // State: running
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="loop"]').should('have.value', "true");
    cy.get('[name="direction"]').should('have.value', 1);

    // State: exploding
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="loop"]').should('have.value', 3);
    cy.get('[name="direction"]').should('have.value', 1);

    // State: feathers
    cy.get('[data-testid="testPlayer"]').shadow().find('.animation').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="loop"]').should('have.value', "false");
    cy.get('[name="direction"]').should('have.value', 1);
  });
});

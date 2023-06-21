/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Player', () => {
  it('should mount', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[data-testid="testPlayer"]').shadow().find('#animation').should('exist');
  });

  it('should be able to play lottie.json', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          loop
          controls
          style="height: 200px;"
          src="/telented-man.json"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to play .lottie', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('shows error when url is invalid', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" loop controls style="height: 200px;" src="https://invalid.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Error);
    cy.get('[data-testid="testPlayer"]').shadow().find('.error').should('exist');
  });
});

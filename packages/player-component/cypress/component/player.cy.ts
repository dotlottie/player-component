/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import { html } from 'lit';

describe('Player', () => {
  it('should mount', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
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
          src="https://lottie.host/cf7b43d1-3d6b-407a-970b-6305b18bebfa/uB1Jboo1o1.json"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to play .lottie', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
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

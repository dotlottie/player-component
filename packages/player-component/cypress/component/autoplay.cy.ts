/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import { html } from 'lit';

describe('Autoplay', () => {
  it('should play with `autoplay` prop', () => {
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

  it('should not play when `autoplay` = `false`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
  });

  it('should not play when `playOnHover` = `true` even though `autoplay` = `true`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          hover
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
  });
});

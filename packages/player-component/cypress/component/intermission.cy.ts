/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('Intermission', () => {
  it('intermission should default to `0`', () => {
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

    cy.get('[name="intermission"]').should('have.value', 0);
  });

  it('should be able to set intermission', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          intermission=${1000}
          autoplay
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="intermission"]').should('have.value', 1000);
  });
});

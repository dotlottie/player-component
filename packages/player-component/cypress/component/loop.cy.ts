/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('Loop', () => {
  it('should default to `false`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="loop"]').should('have.value', 'false');
  });

  it('should be able to set `loop` = `true`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          loop
          autoplay
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="loop"]').should('have.value', 'true');
  });

  it('should be able to set number loops', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          loop=${3}
          autoplay
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="loop"]').should('have.value', 3);
  });
});

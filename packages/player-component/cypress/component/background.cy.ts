/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('Background', () => {
  it('should able set background color', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          background="rgb(26, 189, 70)"
          autoplay
          loop
          controls
          style="height: 200px;"
          src="https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[data-testid="testPlayer"]')
      .shadow()
      .find('.animation')
      .should('have.css', 'background-color')
      .and('eq', 'rgb(26, 189, 70)');
  });
});

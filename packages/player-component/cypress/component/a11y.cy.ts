/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('a11y', () => {
  beforeEach(() => {
    cy.injectAxe();
  });

  it('Has no detectable a11y violations on load', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="player" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );
      
    cy.checkA11y('[data-testid="player"]'); 
  });
});


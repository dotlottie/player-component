/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode } from 'common';
import { html } from 'lit';

describe('Mode', () => {
  it('mode should default to `normal`', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });

  it('should be able to change mode to `bounce`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          playMode=${PlayMode.Bounce}
          autoplay
          controls
          style="height: 200px;"
          src="/cool-dog.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
  });

  it('should be able to change mode to `normal`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          mode=${PlayMode.Normal}
          autoplay
          controls
          style="height: 200px;"
          src="/cool-dog.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });
});

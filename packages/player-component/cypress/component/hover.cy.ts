/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import { html } from 'lit';

describe('Hover', () => {
  it('hover should default to `false`', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="hover"]').should('have.value', 'false');
  });

  it('should not play when `hover` = `true`', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          hover
          autoplay
          loop
          controls
          style="height: 200px;"
          src="/cool-dog.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="hover"]').should('have.value', 'true');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
  });

  it('should play on hover when `hover` is enabled', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          hover
          autoplay
          loop
          controls
          style="height: 200px;"
          src="/cool-dog.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]')
      .shadow()
      .find('.animation > *')
      .trigger('mouseenter');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]')
      .shadow()
      .find('.animation > *')
      .trigger('mouseleave');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Stopped);
  });
});

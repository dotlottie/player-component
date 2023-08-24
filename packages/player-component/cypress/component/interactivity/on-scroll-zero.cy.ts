/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Interactivity: onScrollZero (playOnScroll)', () => {
  it('should be able set activeStateId onScrollZero', () => {
    cy.mount(
      html`
        <dotlottie-player activeStateId="onScrollZero" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="activeStateId"]').should('have.value', "onScrollZero");
  });

  it('should change frame on scroll', () => {
    cy.mount(
      html`
        <div style="height: 2000px; display: flex; align-items: flex-end;">
          <dotlottie-player activeStateId="onScrollZero" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
          </dotlottie-player>
        </div>
      `,
    );

    // State: onScrollState
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="frame"]').should('have.value', 0);

    // frame should change on scroll
    cy.scrollTo('bottom', {duration: 50});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Stopped);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="speed"]').should('not.have.value', 0);
  });
});

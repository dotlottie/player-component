/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Interactivity: onShowZero (onShow)', () => {
  it('should be able set activeStateId onShowZero', () => {
    cy.mount(
      html`
        <dotlottie-player activeStateId="onShowZero" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="activeStateId"]').should('have.value', "onShowZero");
  });

  it('should change state onShow', () => {
    cy.mount(
      html`
        <div style="height: 2000px; display: flex; align-items: flex-end;">
          <dotlottie-player activeStateId="onShowZero" data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/lf_interactivity_page.lottie">
          </dotlottie-player>
        </div>
      `,
    );

    // State: intialState
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "false");
    cy.get('[name="loop"]').should('have.value', "false");

    // State: playState
    cy.scrollTo('bottom', {duration: 200});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="autoplay"]').should('have.value', "true");
    cy.get('[name="loop"]').should('have.value', "true");
    cy.get('[name="speed"]').should('have.value', 4);
  });
});

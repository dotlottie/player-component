/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('Audio', () => {
  it('Howler should be present in the window if theres audio inside the animation', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/audio.lottie">
        </dotlottie-player>
      `,
    );

    cy.window().its('Howler').its('_howls').should('have.length', 1);
    cy.window().should('have.property', 'Howl');
  });

  it('Howler should not have any howls loaded if the active animation is changed', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );
  
    cy.window().its('Howler').its('_howls').should('have.length', 0);
  });
});

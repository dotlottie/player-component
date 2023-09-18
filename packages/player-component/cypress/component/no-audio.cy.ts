/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('No audio', () => {  
  it('Howler should not be present in the window if theres audio inside the animation', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.window().should('not.have.property', 'Howler');
  });
})

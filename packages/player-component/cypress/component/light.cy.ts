import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Light', () => {
  it('should load lottie-web light and play animation', () => {
    cy.mount(
      html`
        <dotlottie-player 
          light
          data-testid="testPlayer" 
          autoplay 
          loop 
          controls 
          style="height: 200px;" 
          src="/cool-dog.lottie" 
        ></dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
});

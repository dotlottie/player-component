import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Light', () => {
  it('should load lottie-web light svg renderer and play animation', () => {
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
  it('should load lottie-web light canvas renderer and play animation', () => {
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
          renderer="canvas"
        ></dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
  it('should load lottie-web light html renderer and play animation', () => {
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
          renderer="html"
        ></dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });
});

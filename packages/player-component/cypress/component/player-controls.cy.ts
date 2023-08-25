/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import { html } from 'lit';

describe('Controls', () => {
  it('should not render controls by default', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="lottie-animation-controls"]').should('not.exist');
  });

  it('should render controls when controls = `true`', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="lottie-animation-controls"]').should('exist');
  });

  it('should start to play when play button is pressed.', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" controls loop style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );
    // Not playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="play / pause animation"]').click({force: true});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to pause', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    // Playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="play / pause animation"]').click({force: true});
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
  });

  it('should be able toggle looping', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // Loop is true initially
    // cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="loop-toggle"]').should('have.class', 'active');
    cy.get('[name="loop"]').should('have.value', 'true');

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="loop-toggle"]').click({force: true});
    cy.get('[name="loop"]').should('have.value', 'false');
    // cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="loop-toggle"]').should('not.have.class', 'active');
  });

  it('should be able to go to previous animation', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" activeAnimationId="lottie2" autoplay loop controls style="height: 200px;" src="/big-dotlottie.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="Previous animation"]').click({force: true});

    cy.get('[name="currentAnimationId"]').should('have.value', 'lottie1');
  })

  it('should be able to go to next animation', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" activeAnimationId="lottie2" autoplay loop controls style="height: 200px;" src="/big-dotlottie.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="Next animation"]').click();

    cy.get('[name="currentAnimationId"]').should('have.value', 'lottie3');
  })

  it('should be able to switch animation', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" activeAnimationId="lottie2" autoplay loop controls style="height: 200px;" src="/big-dotlottie.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="options"]').click({force: true});

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="animations"]').click({force: true});
    
    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="lottie4"]').click({force: true});

    cy.get('[name="currentAnimationId"]').should('have.value', 'lottie4');
  })

  it('should be able to switch themes', () => {
    cy.mount(
      html`
        <dotlottie-player data-testid="testPlayer" activeAnimationId="lottie2" autoplay loop controls style="height: 200px;" src="/big-dotlottie.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="options"]').click({force: true});

    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="Themes"]').click({force: true});
    
    cy.get('[data-testid="testPlayer"]').shadow().find('[aria-label="theme2"]').click({force: true});

    cy.get('[name="defaultTheme"]').should('have.value', 'theme2');
  })

});

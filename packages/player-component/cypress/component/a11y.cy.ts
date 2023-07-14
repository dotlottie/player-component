/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Result } from 'axe-core'

import { html } from 'lit';


function logA11yViolations(violations: Result[]) {
  cy.task(
    'log',
    `${violations.length} accessibility violation${violations.length === 1 ? '' : 's'} ${
      violations.length === 1 ? 'was' : 'were'
    } detected`,
  );
  // pluck specific keys to keep the table readable
  const violationData = violations.map(({ id, impact, description, nodes }) => ({
    id,
    impact,
    description,
    nodes: nodes.length,
  }));

  cy.task('table', violationData);
}

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
      
    cy.checkA11y('[data-testid="player"]', {}, logA11yViolations); 
  });
});


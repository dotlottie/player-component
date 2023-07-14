/**
 * Copyright 2023 Design Barn Inc.
 */
import type { Result } from 'axe-core';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';

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
      <DotLottiePlayer
        data-testid="player"
        src={`/cool-dog.lottie`}
        style={{ height: '400px', display: 'inline-block' }}
        autoplay
      >
        <Controls />
      </DotLottiePlayer>,
    );

    cy.checkA11y('[data-testid="player"]', {}, logA11yViolations, true);
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';

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

    cy.checkA11y('[data-testid="player"]');
  });
});

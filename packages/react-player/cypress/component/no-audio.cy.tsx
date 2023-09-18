/**
 * Copyright 2023 Design Barn Inc.
 */

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('No audio', () => {
  it('Howler should not be present in the window if theres no audio inside the animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.window().should('not.have.property', 'Howler');
  });
});

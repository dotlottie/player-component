/**
 * Copyright 2023 Design Barn Inc.
 */

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Audio', () => {
  it('Howl should be present in the window if theres audio inside the animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/audio.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 1);
  });

  it('Howler should not have any howls loaded if the active animation is changed', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.window().its('Howler').its('_howls').should('have.length', 0);
  });
});

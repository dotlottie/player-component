/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode } from '@dotlottie/common';
import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Mode', () => {
  it('mode should default to `normal`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });

  it('should be able to change mode to `bounce`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          playMode={PlayMode.Bounce}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
  });

  it('should be able to change mode to `normal`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          playMode={PlayMode.Normal}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });

  it('mode should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [mode, setMode] = useState(PlayMode.Normal);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setMode(PlayMode.Bounce);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              playMode={mode}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);

    cy.get('[data-testid="update"]').click({ force: true }).click({ force: true });
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
  });
});

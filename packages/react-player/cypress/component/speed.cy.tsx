/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Speed', () => {
  it('default speed should be 1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="speed"]').should('have.value', 1);
  });

  it('should be able to change speed to 2', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          speed={2}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="speed"]').should('have.value', 2);
  });

  it('speed should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [speed, setSpeed] = useState(1);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setSpeed(3);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              speed={speed}
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

    cy.get('[name="speed"]').should('have.value', 1);

    cy.get('[data-testid="update"]').click({ force: true });
    cy.get('[name="speed"]').should('have.value', 3);
  });
});

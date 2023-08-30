/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';
import { PlayerState } from '@dotlottie/common';

describe('Direction', () => {
  it('direction should default to 1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', 1);
  });

  it('should be able to change direction to 1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          direction={1}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', 1);
  });

  it('should be able to change direction to -1', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          direction={-1}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', -1);
  });

  it('should be able to change direction to -1 and be in completed state', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
          loop={false}
          speed={5}
          direction={-1}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="direction"]').should('have.value', -1);
    cy.get('[name="frame"]').should('have.value', 0);
    cy.get('[name="currentState"]').should('have.value', PlayerState.Completed);
  });

  it('direction should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [direction, setDirection] = useState<1 | -1>(1);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setDirection(-1);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
              direction={direction}
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="direction"]').should('have.value', 1);

    cy.get('[data-testid="update"]').click({ force: true });
    cy.get('[name="direction"]').should('have.value', -1);
  });
});

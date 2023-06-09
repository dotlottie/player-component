/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Hover', () => {
  it('hover should default to `false`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="hover"]').should('have.value', 'false');
  });

  it('should not play when `hover` = `true`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          playOnHover={true}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="hover"]').should('have.value', 'true');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);
    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);
  });

  it('should play on hover when `hover` is enabled', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          playOnHover={true}
          autoplay
          testId="testPlayer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('not.have.value', PlayerState.Playing);

    cy.get('[data-testid="animation"] > *').trigger('mouseenter');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[data-testid="animation"] > *').trigger('mouseleave');
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
  });

  it('hover should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [hover, setHover] = useState(false);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setHover(true);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              autoplay
              playOnHover={hover}
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="hover"]').should('have.value', 'false');

    cy.get('[data-testid="update"]').click();
    cy.get('[name="hover"]').should('have.value', 'true');
  });
});

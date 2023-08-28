/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Loop', () => {
  it('should not loop if `loop` = `false`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={false}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 'false');
  });

  it('should not loop without `loop` prop', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 'false');
  });

  it('should loop if `loop` = `true`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 'true');
  });

  it('should be able to set number loops', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop={3}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="loop"]').should('have.value', 3);
  });

  it('loop should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [loop, setLoop] = useState(true);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setLoop(false);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              autoplay
              loop={loop}
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="loop"]').should('have.value', 'true');

    cy.get('[data-testid="update"]').click({ force: true });
    cy.get('[name="loop"]').should('have.value', 'false');
  });
});

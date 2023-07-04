/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Intermission', () => {
  it('intermission should default to `0`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="intermission"]').should('have.value', 0);
  });
  it('should be able to set intermission', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          intermission={1000}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="intermission"]').should('have.value', 1000);
  });

  it('intermission should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [intermission, setIntermission] = useState(1000);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setIntermission(2000);
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              autoplay
              intermission={intermission}
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="intermission"]').should('have.value', 1000);

    cy.get('[data-testid="update"]').click();
    cy.get('[name="intermission"]').should('have.value', 2000);
  });
});

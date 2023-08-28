/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Background', () => {
  it('should able set background color', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          src={`/cool-dog.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          background="rgb(26, 189, 70)"
          autoplay
          testId="testPlyer"
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(26, 189, 70)');
  });

  it('background should be reactive.', () => {
    function Wrapper(): JSX.Element {
      const [background, setBackground] = useState('rgb(26, 189, 70)');

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setBackground('rgb(30, 100, 100)');
            }}
          >
            Update
          </button>
          <PlayerStateWrapper>
            <DotLottiePlayer
              src={`/cool-dog.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              background={background}
              testId="testPlayer"
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(26, 189, 70)');

    cy.get('[data-testid="update"]').click({ force: true });
    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(30, 100, 100)');
  });
});

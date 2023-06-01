/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from 'common';
import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('[dolottie-player]: Background', () => {
  it('should not play when `autoplay` = `false`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should able set background color', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          // eslint-disable-next-line no-secrets/no-secrets
          src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
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

  it('shoud be reactive.', () => {
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
              // eslint-disable-next-line no-secrets/no-secrets
              src={`https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie`}
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

    cy.get('[data-testid="update"]').click();
    cy.get('[data-testid="animation"]').should('have.css', 'background-color').and('eq', 'rgb(30, 100, 100)');
  });
});

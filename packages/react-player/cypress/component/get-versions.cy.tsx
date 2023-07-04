/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottiePlayer as commonPlayer, PlayerState } from '@dotlottie/common';
import React, { useRef } from 'react';

import pkg from '../../package.json';
import { Controls } from '../../src/controls';
import type { DotLottieRefProps } from '../../src/hooks/use-dotlottie-player';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('getVersions', () => {
  it('should return the versions of the player and lottie-web', () => {
    function Wrapper(): JSX.Element {
      const resultRef = useRef<HTMLDivElement>(null);
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <div id="versionsResult" data-testid="versionsResult" ref={resultRef}></div>
          <button
            data-testid="versions"
            onClick={(): void => {
              if (!lottieRef.current) return;
              const version = lottieRef.current.getVersions();

              if (version && resultRef.current) {
                resultRef.current.innerHTML = `${version.dotLottieReactVersion} + ${version.lottieWebVersion}`;
              }
            }}
          >
            getVersions
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps | undefined): void => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer src={`/cool-dog.lottie`} autoplay>
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }
    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[data-testid="versions"]').click();
    cy.get('[data-testid="versionsResult"]').should(
      'have.text',
      `${pkg.version} + ${commonPlayer.getLottieWebVersion()}`,
    );
  });
});

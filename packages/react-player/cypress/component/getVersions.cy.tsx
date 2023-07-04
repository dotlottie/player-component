/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useRef, useState } from 'react';

import { DotLottiePlayer as commonPlayer } from '@dotlottie/common';
import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

import pkg from '../../package.json';
import { DotLottieRefProps } from '../../src/hooks/use-dotlottie-player';

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
              if (!lottieRef?.current)
                return;
              const v = lottieRef?.current.getVersions();

              if (v && resultRef.current) {
                resultRef.current.innerHTML = `${v.dotLottieReactVersion} + ${v.lottieWebVersion}`;
              }
            }}
          >
            getVersions
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
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

    cy.mount(<Wrapper />).then(() => {
      cy.get('[data-testid="versions"]').click();
      cy.get('[data-testid="versionsResult"]').should(
        'have.text',
        `${pkg.version} + ${commonPlayer.getLottieWebVersion()}`,
      );
    });
  });
});

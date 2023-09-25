/**
 * Copyright 2023 Design Barn Inc.
 */

import { useRef, useState } from 'react';
import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';
import { DotLottieCommonPlayer } from '@dotlottie/common';

describe('Audio', () => {
  it('Howl should be present in the window if theres audio inside the animation', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          id="player"
          speed={10}
          src={`/audio.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 3);

    cy.get('#player').invoke('remove');
  });

  it('Should unload howls if the src is changed', () => {
    function Wrapper(): JSX.Element {
      const dotLottiePlayerRef = useRef<DotLottieCommonPlayer | null>(null);
      const [src, setSrc] = useState<string>('/audio.lottie');

      return (
        <>
          <button
            data-testid="update-src"
            onClick={(): void => {
              setSrc('/cool-dog.lottie');
            }}
          >
            Update src
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieCommonPlayer | null) => {
              dotLottiePlayerRef.current = ref;
            }}
          >
            <DotLottiePlayer src={src} style={{ height: '400px', display: 'inline-block' }} autoplay>
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 3);

    cy.get('[data-testid="update-src"]').click({ force: true });

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 0);

    cy.get('[name="currentAnimationId"]').should('have.value', '22350275-2e75-41e9-964e-40a766d44237');
  });

  it('Should unload howls if element is unmounted', () => {
    function Wrapper(): JSX.Element {
      const dotLottiePlayerRef = useRef<DotLottieCommonPlayer | null>(null);
      const [display, setDisplay] = useState<boolean>(true);

      return (
        <>
          <button
            data-testid="unmount"
            onClick={(): void => {
              setDisplay(false);
            }}
          >
            unmount
          </button>
          {display && (
            <DotLottiePlayer
              ref={dotLottiePlayerRef}
              id="player"
              speed={10}
              src={'/audio.lottie'}
              style={{ height: '400px', display: 'inline-block' }}
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          )}
        </>
      );
    }
    cy.mount(<Wrapper />);

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 3);

    cy.get('[data-testid="unmount"]').click({ force: true });

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 0);
  });
});

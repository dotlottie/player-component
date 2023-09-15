/**
 * Copyright 2023 Design Barn Inc.
 */

import { useRef, useState, ReactDOM } from 'react';
import { DotLottieRefProps } from '../../dist';
import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Audio', () => {
  // it('Howl should be present in the window if theres audio inside the animation', () => {
  //   cy.mount(
  //     <PlayerStateWrapper>
  //       <DotLottiePlayer id='player' speed={10} src={`/audio.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
  //         <Controls />
  //       </DotLottiePlayer>
  //       ,
  //     </PlayerStateWrapper>,
  //   );

  //   cy.window().should('have.property', 'Howl');
  //   cy.window().its('Howler').its('_howls').should('have.length', 3);

  //   cy.get('#player').invoke('remove')
  // });

  it('Should unload howls if the src is changed', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();
      const [src, setSrc] = useState<string>('/audio.lottie');

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              setSrc('/cool-dog.lottie');
            }}
          >
            Change src
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer id='player' speed={10} src={src} style={{ height: '400px', display: 'inline-block' }} autoplay>
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 3);

    cy.get('[data-testid="next"]').click({ force: true });

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 0);

    cy.get('[name="currentAnimationId"]').should('have.value', '22350275-2e75-41e9-964e-40a766d44237');
  })

  it('Should unload howls if element is unmounted', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();
      const [src, setSrc] = useState<string>('/audio.lottie');
      const [display, setDisplay] = useState<boolean>(true);
      const elem = <>
        <DotLottiePlayer lottieRef={lottieRef} id='player' speed={10} src={src} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>

      </>

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              console.log("DISPLAY = FALSE")
              setDisplay(false);
            }}
          >
            Change src
          </button>
          {
            display && (
              <>
                {
                  elem
                }
              </>
            )
          }
        </>
      );
    }
    cy.mount(<Wrapper />);


    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 3);

    cy.get('[data-testid="next"]').click({ force: true });

    cy.window().should('have.property', 'Howl');
    cy.window().its('Howler').its('_howls').should('have.length', 0);

  })
});

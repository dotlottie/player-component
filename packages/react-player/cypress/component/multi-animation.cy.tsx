/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode, PlayerState } from '@dotlottie/common';
import React, { useRef, useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottieRefProps } from '../../src/hooks/use-dotlottie-player';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Multi-Animation', () => {
  it('should play active animation from manfiest by default', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');
  });

  it('initial animation should be able to override by prop', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          activeAnimationId="wifi"
          src={`/bounce_wifi.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to go to next animation', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next();
            }}
          >
            Next
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="next"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to play specific animation using play method', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="wifi"
            onClick={(): void => {
              lottieRef.current?.play('wifi');
            }}
          >
            Previous
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="wifi"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it("should use manifest playbackoptions if doesn't override by the player", () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next();
            }}
          >
            next
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer src={`/cartoon_puppy_swords.lottie`} style={{ height: '400px', display: 'inline-block' }}>
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'puppy');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 1);
    cy.get('[name="direction"]').should('have.value', 1);

    cy.get('[data-testid="next"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'swords');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 2);
    cy.get('[name="direction"]').should('have.value', -1);

    cy.get('[data-testid="next"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'cartoon');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 1);
    cy.get('[name="direction"]').should('have.value', 1);

    cy.get('[data-testid="next"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'puppy');
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');
    cy.get('[name="speed"]').should('have.value', 1);
    cy.get('[name="direction"]').should('have.value', 1);
  });

  it('should be able to go to previous animation', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="previous"
            onClick={(): void => {
              lottieRef.current?.previous();
            }}
          >
            Previous
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="previous"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('calling reset should go to back to intial animation', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next();
            }}
          >
            next
          </button>
          <button
            data-testid="reset"
            onClick={(): void => {
              lottieRef.current?.reset();
            }}
          >
            Reset
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    // Play next animation `wifi`
    cy.get('[data-testid="next"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');

    // Call reset
    cy.get('[data-testid="reset"]').click({ force: true });
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');
  });

  it('should apply props to all animations', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next();
            }}
          >
            Next
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              speed={3}
              playMode={PlayMode.Bounce}
              intermission={1000}
              loop={false}
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    // Initial animation. Should match the props from the player
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');

    // Got to next. ie. `currentAnimationId = wifi`
    cy.get('[data-testid="next"]').click({ force: true });

    // Second anmation. Should match the props as well.
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');

    // Got to next. ie. `currentAnimationId = bounce`
    cy.get('[data-testid="next"]').click({ force: true });

    // Back to intial animation. Should match the props from the player.
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
  });

  it('should be  able to override playback options using `play`', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="play"
            onClick={(): void => {
              lottieRef.current?.play('wifi', (curr, _) => {
                return {
                  ...curr,
                  speed: 4,
                  playMode: PlayMode.Bounce,
                  intermission: 1000,
                  loop: false,
                  autoplay: true,
                };
              });
            }}
          >
            Play wifi
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // play wifi
    cy.get('[data-testid="play"]').click({ force: true });

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });

  it('should be  able to override playback options using `next`', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next((curr, _) => {
                return {
                  ...curr,
                  speed: 4,
                  playMode: PlayMode.Bounce,
                  intermission: 1000,
                  loop: false,
                  autoplay: true,
                };
              });
            }}
          >
            Play wifi
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // next animation `wifi`
    cy.get('[data-testid="next"]').click({ force: true });

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });

  it('should be  able to override playback options using `previous`', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();

      return (
        <>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.previous((curr, _) => {
                return {
                  ...curr,
                  speed: 4,
                  playMode: PlayMode.Bounce,
                  intermission: 1000,
                  loop: false,
                  autoplay: true,
                };
              });
            }}
          >
            Play wifi
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              loop
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // next animation `wifi`
    cy.get('[data-testid="next"]').click({ force: true });

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });

  it('all animations should always to use the latest props from the player', () => {
    function Wrapper(): JSX.Element {
      const lottieRef = useRef<DotLottieRefProps>();
      const [speed, setSpeed] = useState(1);
      const [mode, setMode] = useState(PlayMode.Normal);
      const [intermission, setIntermission] = useState(0);
      const [loop, setLoop] = useState(true);

      return (
        <>
          <button
            data-testid="update"
            onClick={(): void => {
              setSpeed(4);
              setMode(PlayMode.Bounce);
              setIntermission(1000);
              setLoop(false);
            }}
          >
            update
          </button>
          <button
            data-testid="next"
            onClick={(): void => {
              lottieRef.current?.next();
            }}
          >
            next
          </button>
          <PlayerStateWrapper
            onRef={(ref: DotLottieRefProps) => {
              lottieRef.current = ref;
            }}
          >
            <DotLottiePlayer
              src={`/bounce_wifi.lottie`}
              style={{ height: '400px', display: 'inline-block' }}
              speed={speed}
              playMode={mode}
              intermission={intermission}
              loop={loop}
              autoplay
            >
              <Controls />
            </DotLottiePlayer>
          </PlayerStateWrapper>
        </>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // Before prop update
    cy.get('[name="speed"]').should('have.value', 1);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
    cy.get('[name="intermission"]').should('have.value', 0);
    cy.get('[name="loop"]').should('have.value', 'true');
    cy.get('[name="autoplay"]').should('have.value', 'true');

    // Update props
    cy.get('[data-testid="update"]').click({ force: true });

    // Should match updated props
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');

    // Go to next animation `wifi`
    cy.get('[data-testid="next"]').click({ force: true });

    // Should match with updated props.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');

    // Go to next animation `bounce`
    cy.get('[data-testid="next"]').click({ force: true });

    // Should match with updated props.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });
});

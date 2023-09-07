/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';
import { PlayMode, PlayerState } from '@dotlottie/common';
import { DotLottiePlayer } from '../../';

describe('Multi-Animation', () => {
  it('should play active animation from manfiest by default', () => {
    cy.mount(
      html`
        <dotlottie-player
          data-testid="testPlayer"
          autoplay
          controls
          style="height: 200px;"
          src="/bounce_wifi.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');
  });

  it('initial animation should be able to override by prop', () => {
    cy.mount(
      html`
        <dotlottie-player
          activeAnimationId="wifi"
          data-testid="testPlayer"
          autoplay
          controls
          style="height: 200px;"
          src="/bounce_wifi.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to go to next animation', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="next"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.next();
            }}
          >
            next
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="next"]').click({force:true});
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to play specific animation using play method', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="wifi"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.play(
                'wifi',
              );
            }}
          >
            play wifi
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="wifi"]').click({force:true});
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to go to previous animation', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="previous"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.previous();
            }}
          >
            previous
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[data-testid="previous"]').click({force:true});
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('calling reset should go to back to intial animation', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="next"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.next();
            }}
          >
            next
          </button>
          <button
            data-testid="reset"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.reset();
            }}
          >
            reset
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    // Play next animation `wifi`
    cy.get('[data-testid="next"]').click({force:true});
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');

    // Call reset
    cy.get('[data-testid="reset"]').click({force:true});
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');
  });

  it('should use manifest playbackoptions if doesn\'t override by the player', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="next"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.next();
            }}
          >
            next
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            style="height: 200px;"
            src="/cartoon_puppy_swords.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

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

  it('should apply props to all animations', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="next"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.next();
            }}
          >
            next
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            speed="3"
            playMode="bounce"
            intermission="1000"
            loop="false"
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    // Initial animation. Should match the props from the player
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');

    // Got to next. ie. `currentAnimationId = wifi`
    cy.get('[data-testid="next"]').click({force:true});

    // Second anmation. Should match the Props
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');

    // Got to next. ie. `currentAnimationId = bounce`
    cy.get('[data-testid="next"]').click({force:true});

    // Back to intial animation. Should match the props from the player.
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="speed"]').should('have.value', 3);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
  });

  it('should be  able to override playback options using `play`', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="play"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.play(
                'wifi',
                (curr, _) => ({
                  ...curr,
                  speed: 4,
                  playMode: PlayMode.Bounce,
                  intermission: 1000,
                  loop: false,
                }),
              );
            }}
          >
            play wifi
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            loop
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // play wifi
    cy.get('[data-testid="play"]').click({force:true});

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });

  it('should be  able to override playback options using `next`', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="next"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.next((curr, _) => ({
                ...curr,
                speed: 4,
                playMode: PlayMode.Bounce,
                intermission: 1000,
                loop: false,
              }));
            }}
          >
            next
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            loop
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // next animation `wifi`
    cy.get('[data-testid="next"]').click({force:true});

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });

  it('should be  able to override playback options using `previous`', () => {
    cy.mount(
      html`
        <div>
          <button
            data-testid="previous"
            @click=${(): void => {
              (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer)?.previous((curr, _) => ({
                ...curr,
                speed: 4,
                playMode: PlayMode.Bounce,
                intermission: 1000,
                loop: false,
              }));
            }}
          >
            previous
          </button>
          <dotlottie-player
            data-testid="testPlayer"
            loop
            autoplay
            controls
            style="height: 200px;"
            src="/bounce_wifi.lottie"
          >
          </dotlottie-player>
        </div>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // next animation `wifi`
    cy.get('[data-testid="previous"]').click({force:true});

    // Animation `wifi`. Should match options passed in the method.
    cy.get('[name="speed"]').should('have.value', 4);
    cy.get('[name="playMode"]').should('have.value', PlayMode.Bounce);
    cy.get('[name="intermission"]').should('have.value', 1000);
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[name="autoplay"]').should('have.value', 'true');
  });
});

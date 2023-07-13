/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState } from '@dotlottie/common';
import React from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';

describe('Controls', () => {
  it('should render controls.', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );
    cy.get('[aria-label="lottie-animation-controls"]').should('exist');
  });

  it('should display all buttons by default', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );
    cy.get('[aria-label="play-pause"]').should('exist');
    cy.get('[aria-label="loop-toggle"]').should('exist');
    cy.get('[aria-label="lottie-seek-input"]').should('exist');
    cy.get('[aria-label="play-previous"]').should('exist');
    cy.get('[aria-label="play-next"]').should('exist');
    cy.get('[aria-label="open-popover"]').should('exist');
  });

  it('should display specified buttons. [`loop`]', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls buttons={['loop']} />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[aria-label="play-pause"]').should('not.exist');
    cy.get('[aria-label="play-previous"]').should('not.exist');
    cy.get('[aria-label="play-next"]').should('not.exist');
    cy.get('[aria-label="open-popover"]').should('not.exist');

    cy.get('[aria-label="loop-toggle"]').should('exist');
    cy.get('[aria-label="lottie-seek-input"]').should('exist');
  });

  it('only display seek when `buttons` = `[]`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls buttons={[]} />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[aria-label="play-pause"]').should('not.exist');
    cy.get('[aria-label="play-previous"]').should('not.exist');
    cy.get('[aria-label="play-next"]').should('not.exist');
    cy.get('[aria-label="open-popover"]').should('not.exist');
    cy.get('[aria-label="loop-toggle"]').should('not.exist');

    cy.get('[aria-label="lottie-seek-input"]').should('exist');
  });

  it('should start to play when play button is pressed.', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          autoplay={false}
          src={`/bounce_wifi.lottie`}
          loop
          style={{ height: '400px', display: 'inline-block' }}
        >
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    // Not playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Ready);

    cy.get('[aria-label="play-pause"]').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
  });

  it('should be able to pause', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    // Playing initially
    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[aria-label="play-pause"]').click();
    cy.get('[name="currentState"]').should('have.value', PlayerState.Paused);
  });

  it('should be able toggle looping', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    // Loop is true initially
    cy.get('[aria-label="loop-toggle"]').should('have.class', 'active');
    cy.get('[name="loop"]').should('have.value', 'true');

    cy.get('[aria-label="loop-toggle"]').click();
    cy.get('[name="loop"]').should('have.value', 'false');
    cy.get('[aria-label="loop-toggle"]').should('not.have.class', 'active');
  });

  it('should not display `next`, `previous` and `popover manu` if only 1 animation or if themes are unavailable', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/cool-dog.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);

    cy.get('[aria-label="play-next"]').should('not.exist');
    cy.get('[aria-label="play-previous"]').should('not.exist');
    cy.get('[aria-label="open-popover"]').should('not.exist');
  });

  it('should be able go to next animation by pressing `next`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[aria-label="play-next"]').click();
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able go to previous animation by pressing `previous`', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
        ,
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[aria-label="play-previous"]').click();
    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to open popover by click popover menu button', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[aria-label="Popover Menu"]').should('not.have.attr', 'open');

    cy.get('[aria-label="open-popover"]').click();
    cy.get('[aria-label="Popover Menu"]').should('have.attr', 'open');
  });

  it('should be able to dissmiss popover by clicking outside', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[aria-label="Popover Menu"]').should('not.have.attr', 'open');

    cy.get('[aria-label="open-popover"]').click();
    cy.get('[aria-label="Popover Menu"]').should('have.attr', 'open');

    cy.get('[aria-label="lottie-seek-input"]').click();
    cy.get('[aria-label="Popover Menu"]').should('not.have.attr', 'open');
  });

  it('should be able to change animation using popover', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer src={`/bounce_wifi.lottie`} style={{ height: '400px', display: 'inline-block' }} loop autoplay>
          <Controls />
        </DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="currentAnimationId"]').should('have.value', 'bounce');

    cy.get('[aria-label="open-popover"]').click();
    cy.get('[aria-label="Go to Animations"]').click();
    cy.get('[aria-label="Select wifi"]').click();

    cy.get('[name="currentAnimationId"]').should('have.value', 'wifi');
  });

  it('should be able to change theme using popover', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          defaultTheme="bounce-light"
          src={`/bounce_wifi.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="defaultTheme"]').should('have.value', 'bounce-light');

    cy.get('[aria-label="open-popover"]').click();
    cy.get('[aria-label="Go to Themes"]').click();
    cy.get('[aria-label="Select bounce-dark"]').click();

    cy.get('[name="defaultTheme"]').should('have.value', 'bounce-dark');
  });

  it('should be able reset selected themes', () => {
    cy.mount(
      <PlayerStateWrapper>
        <DotLottiePlayer
          defaultTheme="bounce-light"
          src={`/bounce_wifi.lottie`}
          style={{ height: '400px', display: 'inline-block' }}
          loop
          autoplay
        >
          <Controls />
        </DotLottiePlayer>
      </PlayerStateWrapper>,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[name="defaultTheme"]').should('have.value', 'bounce-light');

    cy.get('[aria-label="open-popover"]').click();
    cy.get('[aria-label="Go to Themes"]').click();
    cy.get('[aria-label="Select bounce-dark"]').click();

    cy.get('[name="defaultTheme"]').should('have.value', 'bounce-dark');

    cy.get('[aria-label="Reset Themes"]').click();

    cy.get('[name="defaultTheme"]').should('have.value', '');
  });
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useState } from 'react';

import { Controls } from '../../src/controls';
import { DotLottiePlayer } from '../../src/react-player';
import { PlayerStateWrapper } from '../support/player-state-wrapper';
import { XssInjectorCheck } from '../support/xss-injector-check';

describe('Worker', () => {
  it('Should protect from XSS attacks', () => {
    cy.mount(
      <XssInjectorCheck>
        <PlayerStateWrapper>
          <DotLottiePlayer worker src={`/xss-animation.json`} style={{ height: '400px', display: 'inline-block' }} autoplay>
            <Controls />
          </DotLottiePlayer>
        </PlayerStateWrapper>
      </XssInjectorCheck>
    );

    cy.get('[data-testid="resultDoc"]').should('have.text', '✅');
    cy.get('[data-testid="resultWindow"]').should('have.text', '✅');
    cy.get('[data-testid="resultStorage"]').should('have.text', '✅');
  });

  it('With worker disabled, XSS attacks are possible', () => {
    cy.mount(
      <XssInjectorCheck>
        <PlayerStateWrapper>
          <DotLottiePlayer src={`/xss-animation.json`} style={{ height: '400px', display: 'inline-block' }} autoplay>
            <Controls />
          </DotLottiePlayer>
        </PlayerStateWrapper>
      </XssInjectorCheck>
    );

    cy.get('[data-testid="resultDoc"]').should('have.text', '❌');
    cy.get('[data-testid="resultWindow"]').should('have.text', '❌');
    cy.get('[data-testid="resultStorage"]').should('have.text', '❌');
  });
});

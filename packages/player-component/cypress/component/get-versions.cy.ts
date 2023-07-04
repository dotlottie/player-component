/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayerState, DotLottiePlayer as commonPlayer } from '@dotlottie/common';
import { html } from 'lit';

import type { DotLottiePlayer } from '../..';
import pkg from '../../package.json';

describe('getVersions', () => {
  it('should return the versions of the player and lottie-web', () => {
    cy.mount(
      html`
          <div id="versionsResult" data-testid="versionsResult"></div>
          <button
          data-testid="versions"
          @click=${(): void => {
            const version = (document.querySelector('[data-testid="testPlayer"]') as DotLottiePlayer).getVersions();
            const doc = document.querySelector('[data-testid="versionsResult"]');

            if (typeof version !== 'undefined' && doc) {
              doc.innerHTML = `${version.dotLottiePlayerVersion} + ${version.lottieWebVersion}`;
            }
          }}
        >
          getVersions
        </button>
        <dotlottie-player data-testid="testPlayer" autoplay loop controls style="height: 200px;" src="/cool-dog.lottie">
        </dotlottie-player>
      `,
    );

    cy.get('[name="currentState"]').should('have.value', PlayerState.Playing);
    cy.get('[data-testid="versions"]').click();
    cy.get('[data-testid="versionsResult"]').should('have.text', `${pkg.version} + ${commonPlayer.getLottieWebVersion()}`);

  });
});

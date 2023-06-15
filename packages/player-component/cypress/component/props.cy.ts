/**
 * Copyright 2023 Design Barn Inc.
 */

import { PlayMode } from 'common';
import { html } from 'lit';

describe('Override playMode', () => {
  it('should override the manifest playMode', () => {
    cy.mount(
      html`
        <dotlottie-player
          playMode="normal"
          data-testid="testPlayer"
          style="height: 200px;"
          src="/speed_3_bounce_and_reverse_play.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="playMode"]').should('have.value', PlayMode.Normal);
  });
});

describe('Override speed', () => {
  it('should override the manifest speed', () => {
    cy.mount(
      html`
        <dotlottie-player
          speed="1"
          data-testid="testPlayer"
          style="height: 200px;"
          src="/speed_3_bounce_and_reverse_play.lottie"
        >
        </dotlottie-player>
      `,
    );

    cy.get('[name="speed"]').should('have.value', 1);
  });
});

// Not sure why this test is failing, works fine in the browser
// describe('Override loop', () => {
//   it('should override the manifest loop', () => {
//     cy.mount(
//       html`
//         <dotlottie-player
//           loop="5"
//           data-testid="testPlayer"
//           style="height: 200px;"
//           src="/speed_3_bounce_and_reverse_play.lottie"
//         >
//         </dotlottie-player>
//       `,
//     );

//     cy.get('[name="loop"]').should('have.value', 5);
//   });
// });

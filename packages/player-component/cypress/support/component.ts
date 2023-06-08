/**
 * Copyright 2023 Design Barn Inc.
 */

import { mount } from 'cypress-ct-lit';

import '../../dist/dotlottie-player.global.js';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

/**
 * Copyright 2023 Design Barn Inc.
 */

// <reference types="cypress" />

import { mount } from 'cypress/react18';

import '../../src/dotlottie-player-styles.css';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

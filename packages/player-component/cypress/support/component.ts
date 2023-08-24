/**
 * Copyright 2023 Design Barn Inc.
 */

import 'cypress-axe';

import { mount } from 'cypress-ct-lit';

import '../../dist/dotlottie-player';

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}

Cypress.Commands.add('mount', mount);

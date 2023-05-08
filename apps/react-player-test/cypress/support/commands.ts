/**
 * Copyright 2023 Design Barn Inc.
 */

// <reference types="cypress" />
// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  interface Chainable<Subject> {
    getControls(): Chainable<Subject>;
    load(config: Partial<PlayerConfig>): Chainable<Subject>;
    updateProp<T extends keyof PlayerConfig, V extends PlayerConfig[T]>(propName: T, value: V): Chainable<Subject>;
    whenReady(): Chainable<Subject>;
  }
}

Cypress.Commands.add('whenReady', () => {
  return cy.get('[name="is-ready"]').should('have.value', 'yes');
});

Cypress.Commands.add('updateProp', (propName, value) => {
  return cy.get('#test-app-root').trigger('update:prop', { detail: { prop: propName, value } });
});

Cypress.Commands.add('load', (props) => {
  if (!props.testId) {
    props.testId = crypto.randomUUID();
  }
  cy.visit('/', {
    qs: {
      // eslint-disable-next-line no-secrets/no-secrets
      src: 'https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie',
      ...props,
    },
  });

  return cy.whenReady();
});

interface PlayerConfig {
  autoplay: boolean;
  background: string;
  controls: boolean;
  direction: 1 | -1;
  loop: boolean;
  mode: 'bounce' | 'normal';
  playOnHover: boolean;
  speed: number;
  src: string;
  testId: string;
}

// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

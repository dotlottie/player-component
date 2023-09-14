/**
 * Copyright 2023 Design Barn Inc.
 */

import { html } from 'lit';

describe('Worker', () => {

  // The xss-animation.json will call the xssCallback function defined below.
  function scriptTag() {
    const tag = document.createElement('script');
    tag.innerHTML = `
    function xssCallback(doc, win, storage) {
      if (typeof doc !== 'undefined') {
      document.getElementById('resultDoc').innerText = '❌';
      }
  
      if (typeof win !== 'undefined') {
      document.getElementById('resultWindow').innerText = '❌';
      }
  
      if (typeof storage !== 'undefined') {
      document.getElementById('resultStorage').innerText = '❌';
      }
    }
    `;
    return tag;
  }

  it('Should protect from XSS attacks', () => {
    cy.mount(
      html`
      ${scriptTag()}

        <table>
          <tr>
              <td>Document</td>
              <td id="resultDoc">✅</td>
          </tr>
          <tr>
              <td>Window</td>
              <td id="resultWindow">✅</td>
              <td id="dumpWindow"></td>
          </tr>
          <tr>
              <td>Local Storage</td>
              <td id="resultStorage">✅</td>
          </tr>
        </table>

  
        <dotlottie-player
          worker 
          data-testid="testPlayer"
          autoplay loop controls 
          style="height: 200px;"
          src="/xss-animation.json">
        </dotlottie-player>
      `,
    );

    cy.get('#resultDoc').should('have.text', '✅');
    cy.get('#resultWindow').should('have.text', '✅');
    cy.get('#resultStorage').should('have.text', '✅');

  });

  it('With worker disabled, XSS attacks are possible', () => {
    cy.mount(
      html` 
      ${scriptTag()}
        <table>
          <tr>
              <td>Document</td>
              <td id="resultDoc">✅</td>
          </tr>
          <tr>
              <td>Window</td>
              <td id="resultWindow">✅</td>
              <td id="dumpWindow"></td>
          </tr>
          <tr>
              <td>Local Storage</td>
              <td id="resultStorage">✅</td>
          </tr>
        </table>

        <dotlottie-player
          data-testid="testPlayer"
          autoplay loop controls 
          style="height: 200px;"
          src="/xss-animation.json">
        </dotlottie-player>
      `,
    );

    cy.get('#resultDoc').should('have.text', '❌');
    cy.get('#resultWindow').should('have.text', '❌');
    cy.get('#resultStorage').should('have.text', '❌');
  });
});

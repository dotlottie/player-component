/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useEffect } from 'react';
import type { ReactNode } from 'react';

export const XssInjectorCheck: React.FC<{ children: ReactNode; }> = ({ children }) => {

  useEffect(() => {
    const script = document.createElement("script");

    script.innerHTML = `
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

    document.body.appendChild(script);
  });

  return (
    <>
      <div>
        <div>
          <div>Document</div>
          <div id="resultDoc" data-testid="resultDoc">✅</div>
        </div>
        <div>
          <div>Window</div>
          <div id="resultWindow" data-testid="resultWindow">✅</div>
          <div id="dumpWindow"></div>
        </div>
        <div>
          <div>Local Storage</div>
          <div id="resultStorage" data-testid="resultStorage">✅</div>
        </div>
      </div>

      {children}
    </>
  )
};

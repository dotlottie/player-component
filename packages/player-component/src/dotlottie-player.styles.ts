/**
 * Copyright 2023 Design Barn Inc.
 */

import { css } from 'lit';

export default css`
  * {
    box-sizing: border-box;
  }

  :host {
    --lottie-player-toolbar-height: 35px;
    --lottie-player-toolbar-background-color: transparent;
    --lottie-player-toolbar-icon-color: #999;
    --lottie-player-toolbar-icon-hover-color: #222;
    --lottie-player-toolbar-icon-active-color: #555;
    --lottie-player-seeker-track-color: #ccc;
    --lottie-player-seeker-accent-color: #00c1a2;
    --lottie-player-seeker-thumb-color: #00c1a2;
    --lottie-player-seeker-display: block;
    --light-mode-border-subtle: #d9e0e6;
    --light-mode-text-icon-primary: #20272c;

    display: block;
    width: 100%;
    height: 100%;
  }

  .main {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
  }

  .animation {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
  }
  .animation.controls {
    height: calc(100% - 35px);
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-items: center;
    background-color: var(--lottie-player-toolbar-background-color);
    margin: 0 5px;
    height: 35px;
  }

  .toolbar button {
    cursor: pointer;
    fill: var(--lottie-player-toolbar-icon-color);
    display: flex;
    background: none;
    border: 0;
    padding: 0;
    outline: none;
    height: 100%;
  }

  .toolbar button:hover {
    fill: var(--lottie-player-toolbar-icon-hover-color);
  }

  .toolbar button.active {
    fill: var(--lottie-player-toolbar-icon-active-color);
  }

  .toolbar button.active:hover {
    fill: var(--lottie-player-toolbar-icon-hover-color);
  }

  .toolbar button:focus {
    outline: 1px dotted var(--lottie-player-toolbar-icon-active-color);
  }

  .toolbar button svg {
  }

  .toolbar button.disabled svg {
    display: none;
  }

  .popover {
    position: absolute;
    top: 80px;
    left: 140px;
    width: 224px;
    background-color: #ffffff;
    box-shadow: 0px 8px 48px 0px rgba(243, 246, 248, 0.15), 0px 8px 16px 0px rgba(61, 72, 83, 0.16),
      0px 0px 1px 0px rgba(61, 72, 83, 0.36);
    border-radius: 8px;
    padding: 8px;
    z-index: 100;
  }

  .popover-button-text {
    display: flex;
    color: #20272c;
    height: 23px;
    flex-direction: column;
    align-self: stretch;
  }

  .popover-button {
    flex-direction: row;
    cursor: pointer;
    color: #20272c;
    justify-content: space-between;
    display: flex;
    padding: 4px 8px;
    align-items: flex-start;
    gap: 8px;
    align-self: stretch;
  }

  .option-title-button {
    display: flex;
    flex-direction: row;
    height: 32px;
    align-items: center;
    gap: 4px;
    align-self: stretch;
    cursor: pointer;
    color: var(--light-mode-text-icon-primary);
    font-size: 16px;
    font-style: normal;
    font-weight: 700;
    line-height: 150%;
    letter-spacing: -0.32px;
  }

  .option-title-separator {
    margin: 8px -8px;
    border-bottom: 1px solid var(--light-mode-border-subtle);
  }

  .option-title-chevron {
    display: flex;
    margin: 4px;
  }

  .option-row {
    display: flex;
    flex-direction: column;
  }

  .option-button {
    display: flex;
    padding: 4px 8px;
    color: #20272c;
    align-items: center;
    gap: 8px;
    align-self: stretch;
  }

  .option-tick {
    display: block;
    width: 24px;
    height: 24px;
  }

  .seeker {
    -webkit-appearance: none;
    width: 95%;
    outline: none;
    background-color: #353535;
    display: var(--lottie-player-seeker-display);
  }

  .seeker::-webkit-slider-runnable-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    accent-color: green;
    border-radius: 3px;
  }
  .seeker::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background: var(--lottie-player-seeker-thumb-color);
    cursor: pointer;
    margin-top: -5px;
  }
  .seeker:focus::-webkit-slider-runnable-track {
    background: #999;
  }
  .seeker::-moz-range-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    background: var(--lottie-player-seeker-track-color);
    border-radius: 3px;
  }
  .seeker::-moz-range-thumb {
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background: var(--lottie-player-seeker-thumb-color);
    cursor: pointer;
  }
  .seeker::-ms-track {
    width: 100%;
    height: 5px;
    cursor: pointer;
    background: transparent;
    border-color: transparent;
    color: transparent;
    accent-color: var(--lottie-player-seeker-accent-color);
  }
  .seeker::-ms-fill-lower {
    background: var(--lottie-player-seeker-track-color);
    border-radius: 3px;
  }
  .seeker::-ms-fill-upper {
    background: var(--lottie-player-seeker-track-color);
    border-radius: 3px;
  }
  .seeker::-ms-thumb {
    border: 0;
    height: 15px;
    width: 15px;
    border-radius: 50%;
    background: var(--lottie-player-seeker-thumb-color);
    cursor: pointer;
  }
  .seeker:focus::-ms-fill-lower {
    background: var(--lottie-player-seeker-track-color);
  }
  .seeker:focus::-ms-fill-upper {
    background: var(--lottie-player-seeker-track-color);
  }

  .error {
    display: flex;
    justify-content: center;
    margin: auto;
    height: 100%;
    align-items: center;
  }
`;

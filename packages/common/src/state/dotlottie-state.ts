/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable typescript-sort-keys/interface */

export interface StateAnimationSettings {
  autoplay?: boolean;
  direction?: 1 | -1;
  hover?: boolean;
  intermission?: number;
  loop?: boolean;
  segments?: [number, number] | string;
  speed?: number;
  theme?: string;
}

export interface StateTransitionOnClick {
  state: string;
}

export interface StateTransitionOnAfter {
  ms: number;
  state: string;
}

export interface StateTransitionOnEnter {
  count: number;
  state: string;
}

export interface StateTransitionOnMouseEnter {
  state: string;
}

export interface StateTransitionOnMouseLeave {
  state: string;
}

export interface StateTransitionOnComplete {
  state: string;
}

export interface StateInfo {
  id: number;
  initial?: string;
}

export interface StateSettings {
  animationId: string;
  statePlaybackSettings: StateAnimationSettings;
  onAfter?: StateTransitionOnAfter;
  onClick?: StateTransitionOnClick;
  onComplete?: StateTransitionOnComplete;
  onEnter?: StateTransitionOnEnter;
  onMouseEnter?: StateTransitionOnMouseEnter;
  onMouseLeave?: StateTransitionOnMouseLeave;
}

export interface State {
  [key: string]: StateSettings;
}

export interface DotLottieState {
  descriptor: StateInfo;

  states: State;
}

// Example usage

// const states: DotLottieState[] = [];

// myState.push({
//   descriptor: {
//     id: 12,
//     initial: 'state1',
//   },
//   states: {
//     state1: {
//       animationId: 'animation1',
//       statePlaybackSettings: {
//         autoplay: true,
//         direction: 1,
//         hover: false,
//         intermission: 0,
//         loop: true,
//         speed: 1,
//         theme: 'light',
//       },
//       onAfter: {
//         ms: 1000,
//         state: 'state2',
//       },
//     },
//     state2: {
//       animationId: 'animation2',
//       statePlaybackSettings: {
//         autoplay: true,
//         direction: -1,
//         hover: false,
//         intermission: 0,
//         loop: true,
//         speed: 1,
//         theme: 'light',
//       },
//       onAfter: {
//         ms: 1000,
//         state: 'state2',
//       },
//     },
//   },
// });

// console.log(data);

/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable typescript-sort-keys/interface */

import type { PlayMode } from '../dotlottie-player';

export interface StateAnimationSettings {
  autoplay?: boolean;
  direction?: 1 | -1;
  hover?: boolean;
  intermission?: number;
  loop?: boolean | number;
  playMode?: PlayMode.Normal | PlayMode.Bounce;
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
  id: string;
  initial: string;
}

export interface StateSettings {
  animationId?: string;
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

// For Wifi / Bounce
export const ExampleState: DotLottieState[] = [
  {
    descriptor: {
      id: 'simple_click_to_next_prev',
      initial: 'bounceState',
    },
    states: {
      bounceState: {
        animationId: 'bounce',
        statePlaybackSettings: {
          autoplay: true,
          loop: true,
          direction: -1,
          speed: 2,
        },
        onClick: {
          state: 'wifiState',
        },
      },
      wifiState: {
        animationId: 'wifi',
        statePlaybackSettings: {
          autoplay: true,
          loop: true,
          direction: 1,
        },
        onClick: {
          state: 'bounceState',
        },
      },
    },
  },
];

// For Exploding pigeon
export const ExplodingPigeon: DotLottieState[] = [
  {
    descriptor: {
      id: 'exploding_pigeon',
      initial: 'running',
    },
    states: {
      running: {
        statePlaybackSettings: {
          autoplay: true,
          loop: true,
          direction: 1,
          segments: 'bird',
        },
        onClick: {
          state: 'exploding',
        },
      },
      exploding: {
        statePlaybackSettings: {
          autoplay: true,
          loop: false,
          direction: 1,
          segments: 'explosion',
        },
        onComplete: {
          state: 'feathers',
        },
      },
      feathers: {
        statePlaybackSettings: {
          autoplay: true,
          loop: false,
          direction: 1,
          segments: 'feathers',
        },
        onComplete: {
          state: 'running',
        },
      },
    },
  },
];

/**
 * Copyright 2023 Design Barn Inc.
 */

import type { PlaybackOptions } from '../dotlottie-player';

export interface StateAnimationSettings extends PlaybackOptions {
  segments?: [number, number] | string;
}

export interface Transitionable {
  state: string;
}

export interface StateTransitionOnClick extends Transitionable {}

export interface StateTransitionOnAfter extends Transitionable {
  ms: number;
}

export interface StateTransitionOnEnter extends Transitionable {
  count: number;
}

export interface StateTransitionOnMouseEnter extends Transitionable {}

export interface StateTransitionOnMouseLeave extends Transitionable {}

export interface StateTransitionOnComplete extends Transitionable {}

export interface StateInfo {
  id: string;
  initial: string;
}

export const EVENT_MAP = {
  click: 'onClick',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  complete: 'onComplete',
};

export const DotLottieStateEvents = Object.values(EVENT_MAP);

export const XStateEvents = Object.keys(EVENT_MAP);

export type EventMap = typeof EVENT_MAP;

export interface StateTransitionEvents {
  onAfter?: StateTransitionOnAfter;
  onClick?: StateTransitionOnClick;
  onComplete?: StateTransitionOnComplete;
  onEnter?: StateTransitionOnEnter;
  onMouseEnter?: StateTransitionOnMouseEnter;
  onMouseLeave?: StateTransitionOnMouseLeave;
}

export interface StateSettings extends StateTransitionEvents {
  animationId?: string;
  statePlaybackSettings: StateAnimationSettings;
}

export interface State {
  [key: string]: StateSettings;
}

export interface DotLottieState {
  descriptor: StateInfo;

  states: State;
}

export interface XStateTargetEvent {
  target: string;
}

export interface XState {
  entry?: () => void;
  exit?: () => void;
  meta: StateAnimationSettings;
  on: Record<keyof EventMap, XStateTargetEvent>;
}

export interface XStateMachine {
  id: string;
  initial: string;
  states: Record<string, XState>;
}

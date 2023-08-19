/**
 * Copyright 2023 Design Barn Inc.
 */

import type { DotLottieStatePlaybackSettings } from '@dotlottie/dotlottie-js';

export const EVENT_MAP = {
  click: 'onClick',
  mouseenter: 'onMouseEnter',
  mouseleave: 'onMouseLeave',
  complete: 'onComplete',
  after: 'onAfter',
  enter: 'onEnter',
  show: 'onShow',
};

export const DotLottieStateEvents = Object.values(EVENT_MAP);

export const XStateEvents = Object.keys(EVENT_MAP);

export type EventMap = typeof EVENT_MAP;

export interface XStateTargetEvent {
  target: string;
}

export interface XState {
  after: Record<number, XStateTargetEvent>;
  entry?: () => void;
  exit?: () => void;
  meta: DotLottieStatePlaybackSettings;
  on: Record<keyof EventMap, XStateTargetEvent>;
}

export interface XStateMachine {
  id: string;
  initial: string;
  states: Record<string, XState>;
}

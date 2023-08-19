/**
 * Copyright 2023 Design Barn Inc.
 */

import type {
  DotLottieStatePlaybackSettings,
  DotLottieStateTransitionEvents,
  StateTransitionOnAfter,
} from '@dotlottie/dotlottie-js';
import { type LottieStateMachine, type Transitionable } from '@dotlottie/dotlottie-js';
import type { AnimationEventName } from 'lottie-web';
import { createMachine, interpret } from 'xstate';

import { DEFAULT_OPTIONS } from '../dotlottie-player';
import type { DotLottieElement, DotLottiePlayer } from '../dotlottie-player';
import { createError, getKeyByValue } from '../utils';

import type { EventMap, XStateTargetEvent } from './xstate-machine';
import { EVENT_MAP, XStateEvents, type XState, type XStateMachine } from './xstate-machine';

export class DotLottieStateMachine {
  protected activeStateId: string = '';

  protected _service: any;

  protected _domListeners = new Map<string, () => void>();

  protected _domElement: DotLottieElement | undefined;

  protected _playerListeners = new Map<AnimationEventName, () => void>();

  protected _player: DotLottiePlayer;

  protected _machineSchemas = new Map<string, XStateMachine>();

  private _onShowPrevValue = 0;

  public constructor(schemas: LottieStateMachine[], player: DotLottiePlayer) {
    this._player = player;
    this._machineSchemas = this._transformToXStateSchema(schemas);
    this._domElement = player.container;
  }

  public start(stateId: string): void {
    this.stop();

    const activeSchema = this._machineSchemas.get(stateId);

    if (typeof activeSchema === 'undefined') {
      throw createError(`invalid state machine id ${stateId}`);
    }

    this._service = interpret(createMachine<XStateMachine>(activeSchema));

    this._addEventListeners();

    this._service.start();
  }

  public stop(): void {
    this._removeEventListeners();
    this._service?.stop();
    this._player.stop();
  }

  protected _removeEventListeners(): void {
    this._requiresDomElement();

    for (const [event, handler] of this._domListeners) {
      if (event === 'visibilityChange') {
        this._player.stopPlayOnShow();
      }
      this._domElement?.removeEventListener(event, handler);
      this._domListeners.delete(event);
    }

    // Player
    for (const [event, handler] of this._playerListeners) {
      this._player.removeEventListener(event, handler);
      this._playerListeners.delete(event);
    }
  }

  protected _addEventListeners(): void {
    this._requiresDomElement();

    const notifyState = (eventName: string): void => {
      this._service.send({
        type: eventName,
      });
    };

    const getEventHandler = (eventName: string): (() => void) => {
      function eventListener(): void {
        notifyState(eventName);
      }

      return eventListener;
    };

    this._service.subscribe((state: any) => {
      // changed 'undefined' === 'intial'
      if (typeof state.changed === 'undefined' || state.changed) {
        // Remove remaining listeners.
        this._removeEventListeners();

        for (const event of state.nextEvents) {
          if (XStateEvents.filter((item) => item !== 'complete' && item !== 'show').includes(event)) {
            const handler = getEventHandler(event);

            this._domListeners.set(event, handler);
            this._domElement?.addEventListener(event, handler, { once: true });
          } else if (event === 'complete') {
            const handler = getEventHandler(event);

            this._player.addEventListener(event, handler);
            this._playerListeners.set(event, handler);
          } else if (event === 'show') {
            const handler = getEventHandler(event);
            // to do: How do you get threshold from state machine?

            this._player.addIntersectionObserver({
              callbackOnIntersect: (visibilityPercentage) => {
                if (visibilityPercentage > 0) {
                  if (visibilityPercentage !== 100 && this._onShowPrevValue !== visibilityPercentage) {
                    handler();
                  }
                  this._onShowPrevValue = visibilityPercentage;
                }
              },
              threshold: [],
            });
            this._domListeners.set('visibilityChange', handler);
          }
        }
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    throw createError(callback.toString());
  }

  protected _transformToXStateSchema(toConvert: LottieStateMachine[]): Map<string, XStateMachine> {
    const machines = new Map<string, XStateMachine>();

    for (const stateObj of toConvert) {
      const machineStates: Record<string, XState> = {};
      const machine = {} as XStateMachine;
      // Loop over every toConvert key

      machine.id = stateObj.id;

      if (typeof stateObj.initial !== 'undefined') machine.initial = stateObj.initial;

      if (typeof stateObj !== 'undefined') {
        const states = stateObj.states;

        for (const state in states) {
          if (typeof states[state] !== 'undefined' && states[state]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stateSettings = states[state]!;

            const playbackSettings = stateSettings['playbackSettings'];

            const eventNames = Object.keys(stateSettings).filter((key) => key.startsWith('on')) as Array<
              keyof DotLottieStateTransitionEvents
            >;

            const events = {} as Record<keyof EventMap, XStateTargetEvent>;
            const after = {} as Record<number, XStateTargetEvent>;

            for (const eventName of eventNames) {
              if (typeof stateSettings[eventName] !== 'undefined') {
                const transtionEvent: Transitionable | undefined = stateSettings[eventName];

                if (eventName === EVENT_MAP.after) {
                  const onAfterTransitionEvent = transtionEvent as StateTransitionOnAfter;

                  after[onAfterTransitionEvent.ms] = {
                    target: transtionEvent?.state ?? '',
                  };
                } else if (eventName === EVENT_MAP.enter) {
                  // TO DO
                  events[getKeyByValue(EVENT_MAP, eventName)] = {
                    target: transtionEvent?.state ?? '',
                  };
                } else {
                  events[getKeyByValue(EVENT_MAP, eventName)] = {
                    target: transtionEvent?.state ?? '',
                  };
                }
              }
            }

            machineStates[state] = {
              entry: (): void => {
                // If the animation is the same as the current one, only update the playback settings, dont re-render
                // If the state machine is different than the current one, re-render the animation
                const shouldRender =
                  !this._player.getAnimationInstance() ||
                  (stateSettings['animationId'] && stateSettings['animationId'] !== this._player.currentAnimationId);

                if (shouldRender) {
                  this._player.play(stateSettings['animationId'], () => ({
                    ...DEFAULT_OPTIONS,
                    ...playbackSettings,
                  }));
                } else {
                  // If animation is already rendered, update playback settings
                  // To do: if autoplay, play animation if not don't
                  this._updatePlaybackSettings(playbackSettings);
                }

                // Segments is outside of playbackSettings type, so needs to be handled separately
                if (playbackSettings.segments) {
                  if (typeof playbackSettings.segments === 'string') {
                    this._player.goToAndPlay(playbackSettings.segments, true);
                  } else {
                    const [frame1, frame2] = playbackSettings.segments;
                    let newFrame1 = frame1;

                    // Solves: If both frames are same lottie-web takes animation to frame 0
                    if (frame1 !== 0 && frame1 === frame2) {
                      newFrame1 = frame1 - 1;
                    }
                    this._player.playSegments([newFrame1, frame2], true);
                  }

                  // Pauses animation. By default `playSegments` plays animation.
                  if (!playbackSettings.autoplay) {
                    this._player.pause();
                  }
                }

                // playOnScroll is outside of playbackSettings type, so needs to be handled separately
                if (playbackSettings.playOnScroll) {
                  if (playbackSettings.segments && typeof playbackSettings.segments !== 'string') {
                    this._player.playOnScroll({
                      threshold: playbackSettings.playOnScroll,
                      segments: playbackSettings.segments,
                    });
                  } else {
                    this._player.playOnScroll({
                      threshold: playbackSettings.playOnScroll,
                    });
                  }
                }
              },
              exit: (): void => {
                // Reset segments to remove frame interval
                // Using force=false to prevent animation from going to frame 0
                if (typeof playbackSettings.segments !== 'undefined') {
                  this._player.resetSegments(false);
                }
                if (typeof playbackSettings.playOnScroll !== 'undefined') {
                  this._player.stopPlayOnScroll();
                }
              },
              on: events,
              after,
              meta: playbackSettings,
            };
          }
        }
      }
      machine.states = machineStates;
      machines.set(stateObj.id, machine);
    }

    return machines;
  }

  protected _updatePlaybackSettings(playbackSettings: DotLottieStatePlaybackSettings): void {
    if (!this._player.getAnimationInstance()) {
      throw new Error('Unable to update playbackSettings. Animations is not rendered yet.');
    }

    if (typeof playbackSettings.autoplay !== 'undefined') {
      this._player.setAutoplay(playbackSettings.autoplay);

      if (playbackSettings.autoplay) {
        this._player.play();
      } else {
        this._player.pause();
      }
    }

    if (typeof playbackSettings.direction !== 'undefined') {
      this._player.setDirection(playbackSettings.direction === 1 ? 1 : -1);
    }

    if (typeof playbackSettings.intermission !== 'undefined') {
      this._player.setIntermission(playbackSettings.intermission);
    }

    if (typeof playbackSettings.loop !== 'undefined') {
      this._player.setLoop(playbackSettings.loop);
    }

    if (typeof playbackSettings.playMode !== 'undefined') {
      this._player.setMode(playbackSettings.playMode);
    }

    if (typeof playbackSettings.speed !== 'undefined') {
      this._player.setSpeed(playbackSettings.speed);
    }

    if (typeof playbackSettings.defaultTheme !== 'undefined') {
      this._player.setDefaultTheme(playbackSettings.defaultTheme);
    }
  }

  protected _requiresDomElement(): void {
    if (!this._domElement) {
      throw createError('Requires a DOM element to attach events.');
    }
  }
}

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
import type { DotLottieElement, DotLottieCommonPlayer } from '../dotlottie-player';
import { createError, getKeyByValue, logError } from '../utils';

import type { EventMap, XStateTargetEvent } from './xstate-machine';
import { EVENT_MAP, XStateEvents, type XState, type XStateMachine } from './xstate-machine';

export class DotLottieStateMachineManager {
  protected activeStateId: string = '';

  protected _service: any;

  protected _domListeners = new Map<string, () => void>();

  protected _domElement: DotLottieElement | undefined;

  protected _playerListeners = new Map<AnimationEventName, () => void>();

  protected _player: DotLottieCommonPlayer;

  protected _machineSchemas = new Map<string, XStateMachine>();

  private _onShowPrevValue = 0;

  public constructor(schemas: LottieStateMachine[], player: DotLottieCommonPlayer) {
    this._player = player;
    this._machineSchemas = this._transformToXStateSchema(schemas);
    this._domElement = player.container;
  }

  /**
   * Start the state machine with the passed id.
   *
   * @param stateId - The id of the state machine to start
   */
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

  /**
   * Stop the state machine.
   */
  public stop(): void {
    this._removeEventListeners();
    this._service?.stop();
    this._player.stop();
  }

  /**
   * Removes all event listeners on the player and container.
   */
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

  /**
   * Adds event listeners to the player and container.
   * Subscribes to the state machine and listens for state changes.
   */
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

  /**
   * Subscribe to state changes.
   * @param callback - Callback function to be called when state changes.
   */
  public subscribe(callback: () => void): () => void {
    throw createError(callback.toString());
  }

  /**
   * Transform custom defined state machine to XState schema.
   * @param toConvert - Custom defined state machine to convert to XState schema
   * @returns - XState schema
   */
  protected _transformToXStateSchema(toConvert: LottieStateMachine[]): Map<string, XStateMachine> {
    const machines = new Map<string, XStateMachine>();

    for (const stateObj of toConvert) {
      const machineStates: Record<string, XState> = {};
      const machine = {} as XStateMachine;
      // Loop over every toConvert key

      machine.id = stateObj.descriptor.id;

      if (typeof stateObj.descriptor.initial !== 'undefined') machine.initial = stateObj.descriptor.initial;

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
                  this._player
                    .play(stateSettings['animationId'], () => ({
                      ...DEFAULT_OPTIONS,
                      ...playbackSettings,
                    }))
                    .then(() => {
                      this._updatePlaybackSettings(playbackSettings);
                    })
                    .catch((error) => {
                      logError(`State machine error: ${error.message}`);
                    });
                } else {
                  // If animation is already rendered, update playback settings
                  this._updatePlaybackSettings(playbackSettings);
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
      machines.set(machine.id, machine);
    }

    return machines;
  }

  /**
   * Handles playSegments playback setting.
   * @param playbackSettings - Playback settings containing segments
   */
  protected _handlePlaySegments(playbackSettings: DotLottieStatePlaybackSettings): void {
    if (typeof playbackSettings.segments === 'string') {
      this._player.goToAndPlay(playbackSettings.segments, true);
    } else {
      const [frame1, frame2] = playbackSettings.segments as [number, number];
      let newFrame1 = frame1;

      // Solves: If both frames are same lottie-web takes animation to frame 0
      if (frame1 !== 0 && frame1 === frame2) {
        newFrame1 = frame1 - 1;
      }
      if (frame1 === 0 && frame1 === frame2) {
        this._player.goToAndPlay(frame1, true);
      } else {
        this._player.playSegments([newFrame1, frame2], true);
      }
    }
  }

  /**
   * Handles playOnScroll playback setting.
   * @param playbackSettings - Playback settings containing playOnScroll
   */
  protected _handlePlayOnScroll(playbackSettings: DotLottieStatePlaybackSettings): void {
    const threshold = playbackSettings.playOnScroll as [number, number];

    if (playbackSettings.segments && typeof playbackSettings.segments !== 'string') {
      const segments = playbackSettings.segments as [number, number];

      this._player.playOnScroll({
        threshold,
        segments,
      });
    } else {
      this._player.playOnScroll({
        threshold,
      });
    }
  }

  /**
   * Update the playback settings of the current animation.
   * @param playbackSettings - Playback settings
   */
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
      this._player.setDirection(playbackSettings.direction);
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

    // playOnScroll only accepts segments as a tuple
    // frame markers are not supported
    if (typeof playbackSettings.playOnScroll !== 'undefined') {
      this._handlePlayOnScroll(playbackSettings);
    }

    // Segments is outside of playbackSettings type, so needs to be handled separately
    if (playbackSettings.segments) {
      this._handlePlaySegments(playbackSettings);
    }

    // Pauses animation. By default `playSegments` plays animation.
    if (!playbackSettings.autoplay) {
      this._player.pause();
    }
  }

  /**
   * Throws an error if the DOM element is not defined.
   */
  protected _requiresDomElement(): void {
    if (!this._domElement) {
      throw createError('Requires a DOM element to attach events.');
    }
  }
}

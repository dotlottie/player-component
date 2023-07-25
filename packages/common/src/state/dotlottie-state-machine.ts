/**
 * Copyright 2023 Design Barn Inc.
 */

import type { AnimationEventName } from 'lottie-web';
import { createMachine, interpret } from 'xstate';

import type { DotLottieElement, DotLottiePlayer } from '../dotlottie-player';
import { createError, getKeyByValue } from '../utils';

import type {
  DotLottieState,
  EventMap,
  StateAnimationSettings,
  StateSettings,
  StateTransitionEvents,
  Transitionable,
  XState,
  XStateMachine,
  XStateTargetEvent,
} from './dotlottie-state';
import { XStateEvents, EVENT_MAP } from './dotlottie-state';

export class DotLottieStateMachine {
  protected activeStateId: string = '';

  protected _service: any;

  protected _domListeners = new Map<string, () => void>();

  protected _domElement: DotLottieElement | undefined;

  protected _playerListers = new Map<AnimationEventName, () => void>();

  protected _player: DotLottiePlayer;

  protected _machineSchemas = new Map<string, XStateMachine>();

  public constructor(schemas: DotLottieState[], player: DotLottiePlayer) {
    this._player = player;
    this._machineSchemas = this._transformToXStateSchema(schemas);

    this._domElement = player.container;
  }

  public start(stateId: string): void {
    this._removeEventListeners();
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
    this._service.stop();
  }

  protected _removeEventListeners(): void {
    this._requiresDomElement();

    for (const [event, handler] of this._domListeners) {
      this._domElement?.removeEventListener(event, handler);
      this._domListeners.delete(event);
    }
    // Player
    for (const [event, handler] of this._playerListers) {
      this._player.removeEventListener(event, handler);
      this._playerListers.delete(event);
    }
  }

  protected _addEventListeners(): void {
    this._requiresDomElement();

    const notifyState = (eventName: string): void =>
      this._service.send({
        type: eventName,
      });

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
          if (XStateEvents.filter((item) => item !== 'complete').includes(event)) {
            const handler = getEventHandler(event);

            this._domListeners.set(event, handler);
            this._domElement?.addEventListener(event, handler, { once: true });
          } else if (event === 'complete') {
            const handler = getEventHandler(event);

            this._player.addEventListener(event, handler);
            this._playerListers.set(event, handler);
          }
        }
      }
    });
  }

  public subscribe(callback: () => void): () => void {
    throw createError(callback.toString());
  }

  protected _transformToXStateSchema(toConvert: DotLottieState[]): Map<string, XStateMachine> {
    const machines = new Map<string, XStateMachine>();

    for (const stateObj of toConvert) {
      const machineStates: Record<string, XState> = {};
      const machine = {} as XStateMachine;
      // Loop over every toConvert key
      const descriptor = stateObj.descriptor;

      machine.id = descriptor.id;

      if (typeof descriptor.initial !== 'undefined') machine.initial = descriptor.initial;

      if (typeof stateObj !== 'undefined') {
        const states = stateObj.states;

        for (const state in states) {
          if (typeof states[state] !== 'undefined' && states[state]) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const stateSettings: StateSettings = states[state]!;

            const playbackSettings = stateSettings.statePlaybackSettings;

            const eventNames = Object.keys(stateSettings).filter((key) => key.startsWith('on')) as Array<
              keyof StateTransitionEvents
            >;

            const events = {} as Record<keyof EventMap, XStateTargetEvent>;

            for (const eventName of eventNames) {
              if (typeof stateSettings[eventName] !== 'undefined') {
                const transtionEvent: Transitionable | undefined = stateSettings[eventName];

                events[getKeyByValue(EVENT_MAP, eventName)] = {
                  target: transtionEvent?.state ?? '',
                };
              }
            }

            machineStates[state] = {
              entry: (): void => {
                console.log(`Entering state: ${state}`, {
                  animationId: stateSettings.animationId,
                  playbackSettings,
                });

                const shouldRender = !this._player.getAnimationInstance() || stateSettings.animationId;

                if (shouldRender) {
                  this._player.play(
                    stateSettings.animationId || this._player.activeAnimationId,
                    () => playbackSettings,
                  );
                }

                if (playbackSettings.segments) {
                  this._updatePlaybackSettings(playbackSettings);

                  if (typeof playbackSettings.segments === 'string') {
                    this._player.goToAndPlay(playbackSettings.segments, true);
                  } else {
                    this._player.playSegments(playbackSettings.segments, true);
                  }
                }
              },
              exit: (): void => {
                console.log(`Exiting ${state}`);
                if (typeof playbackSettings.segments !== 'undefined') {
                  this._player.resetSegments(true);
                }
              },
              on: events,
              meta: playbackSettings,
            };
          }
        }
      }
      machine.states = machineStates;
      machines.set(descriptor.id, machine);
    }

    return machines;
  }

  protected _updatePlaybackSettings(playbackSettings: StateAnimationSettings): void {
    if (!this._player.getAnimationInstance()) {
      throw new Error('Unable to update playbackSettings. Animations is not rendered yet.');
    }

    if (typeof playbackSettings.autoplay !== 'undefined') {
      this._player.setAutoplay(playbackSettings.autoplay);
    }

    if (typeof playbackSettings.direction !== 'undefined') {
      this._player.setDirection(playbackSettings.direction);
    }

    if (typeof playbackSettings.hover !== 'undefined') {
      this._player.setHover(playbackSettings.hover);
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

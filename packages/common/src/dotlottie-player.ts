/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie } from '@dotlottie/dotlottie-js';
import type { Manifest, ManifestAnimation, PlaybackOptions, LottieStateMachine } from '@dotlottie/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';
import style from '@lottiefiles/relottie-style';
import { relottie } from '@lottiefiles/relottie/index';
import lottie from 'lottie-web';
import type {
  AnimationConfig,
  AnimationDirection,
  AnimationItem,
  AnimationEventName,
  RendererType,
  SVGRendererConfig,
  HTMLRendererConfig,
  CanvasRendererConfig,
  AnimationSegment,
} from 'lottie-web';

import pkg from '../package.json';

import { DotLottieStateMachine } from './state/dotlottie-state-machine';
import { Store } from './store';
import { createError, getFilename, logError, logWarning } from './utils';

export type { AnimationDirection, AnimationItem, AnimationSegment };

export enum PlayerEvents {
  Complete = 'complete',
  DataFail = 'data_fail',
  DataReady = 'data_ready',
  Error = 'error',
  Frame = 'frame',
  Freeze = 'freeze',
  LoopComplete = 'loopComplete',
  Pause = 'pause',
  Play = 'play',
  Ready = 'ready',
  Stop = 'stop',
}
export enum PlayerState {
  Completed = 'completed',
  Error = 'error',
  Fetching = 'fetching',
  Frozen = 'frozen',
  Initial = 'initial',
  Loading = 'loading',
  Paused = 'paused',
  Playing = 'playing',
  Ready = 'ready',
  Stopped = 'stopped',
}

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export { ManifestTheme, ManifestAnimation, Manifest, PlaybackOptions } from '@dotlottie/dotlottie-js';

export interface DotLottieElement extends HTMLDivElement {
  __lottie?: AnimationItem | null;
}

export const DEFAULT_OPTIONS: PlaybackOptions = {
  autoplay: false,
  direction: 1,
  hover: false,
  intermission: 0,
  loop: false,
  playMode: PlayMode.Normal,
  speed: 1,
  defaultTheme: '',
};

export type { RendererType };
export type RendererSettings = SVGRendererConfig & CanvasRendererConfig & HTMLRendererConfig;
export type DotLottieConfig<T extends RendererType> = Omit<AnimationConfig<T>, 'container'> &
  PlaybackOptions & {
    activeAnimationId?: string | null;
    activeStateId?: string;
    background?: string;
    testId?: string | undefined;
  };

declare global {
  interface Window {
    dotLottiePlayer: Record<string, Record<string, unknown>>;
  }
}

export interface DotLottiePlayerState extends PlaybackOptions {
  activeStateId: string | undefined;
  background: string;
  currentAnimationId: string | undefined;
  currentState: PlayerState;
  frame: number;
  intermission: number;
  seeker: number;
}

export const DEFAULT_STATE: DotLottiePlayerState = {
  activeStateId: '',
  autoplay: false,
  currentState: PlayerState.Initial,
  frame: 0,
  seeker: 0,
  direction: 1,
  hover: false,
  loop: false,
  playMode: PlayMode.Normal,
  speed: 1,
  background: 'transparent',
  intermission: 0,
  currentAnimationId: undefined,
};

export class DotLottiePlayer {
  protected _lottie?: AnimationItem;

  protected _src: string | Record<string, unknown>;

  protected _animationConfig: Omit<AnimationConfig<RendererType>, 'container'>;

  protected _playbackOptions: PlaybackOptions;

  protected _hover: boolean = false;

  protected _loop: boolean | number = false;

  protected _counter: number = 0;

  protected _intermission: number = 0;

  protected _counterInterval: number | null = null;

  protected _container: DotLottieElement | null = null;

  protected _name?: string;

  protected _mode: PlayMode = PlayMode.Normal;

  protected _background: string = 'transparent';

  protected _animation: Animation | undefined;

  protected _animations: Map<string, Animation> = new Map();

  protected _themes: Map<string, string> = new Map();

  protected _defaultTheme: string;

  protected _manifest: Manifest | undefined = undefined;

  // The active animation id (animation to play first) from the manifest
  protected _activeAnimationId?: string | undefined;

  // The currently playing animation id
  protected _currentAnimationId?: string | undefined;

  protected _testId?: string;

  protected _listeners = new Map<AnimationEventName, Set<() => void>>();

  protected _currentState = PlayerState.Initial;

  protected _stateBeforeFreeze = PlayerState.Initial;

  public state = new Store<DotLottiePlayerState>(DEFAULT_STATE);

  protected _frame: number = 0;

  protected _seeker: number = 0;

  protected _stateSchemas?: LottieStateMachine[];

  protected _activeStateId?: string;

  protected _inInteractiveMode: boolean = false;

  protected _stateMachine?: DotLottieStateMachine;

  public constructor(
    src: string | Record<string, unknown>,
    container?: DotLottieElement | null,
    options?: DotLottieConfig<RendererType>,
  ) {
    this._src = src;

    if (options?.testId) {
      this._testId = options.testId;
    }

    this._defaultTheme = options?.defaultTheme || '';

    // Filter out the playback options
    this._playbackOptions = this._validatePlaybackOptions(options || {});

    // Set the active animation id (animation to play first)
    if (typeof options?.activeAnimationId === 'string') {
      this._activeAnimationId = options.activeAnimationId;
    }

    this._container = container || null;

    if (typeof options?.background === 'string') {
      this.setBackground(options.background);
    }

    if (typeof options?.activeStateId !== 'undefined') {
      this._activeStateId = options.activeStateId;
    }

    this._animationConfig = {
      loop: false,
      autoplay: false,
      renderer: 'svg',
      rendererSettings: {
        clearCanvas: true,
        progressiveLoad: true,
        hideOnTransparent: true,
      },
      ...(options || {}),
    };

    this._listenToHover();
    this._listenToVisibilityChange();
  }

  protected _listenToHover(): void {
    const onEnter = (): void => {
      if (this._hover && this.currentState !== PlayerState.Playing) {
        this.play();
      }
    };
    const onLeave = (): void => {
      if (this._hover && this.currentState === PlayerState.Playing) {
        this.stop();
      }
    };

    this._container?.removeEventListener('mouseenter', onEnter);
    this._container?.removeEventListener('mouseleave', onLeave);

    this._container?.addEventListener('mouseleave', onLeave);
    this._container?.addEventListener('mouseenter', onEnter);
  }

  protected _onVisibilityChange(): void {
    if (!this._lottie || typeof document === 'undefined') return;

    if (document.hidden && this.currentState === PlayerState.Playing) {
      this.freeze();
    } else if (this.currentState === PlayerState.Frozen) {
      this.unfreeze();
    }
  }

  protected _listenToVisibilityChange(): void {
    if (typeof document !== 'undefined' && typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => this._onVisibilityChange());
    }
  }

  /**
   * Retrieves a specific playback option.
   *
   * @remarks
   * It grabs option in the following order.
   * 1. From this._playbackOptions (i.e user specified options) if available
   * 2. From Manifest if available
   * 3. Otherwise Default
   *
   * @param option - The option key to retrieve.
   * @returns The value of the specified playback option.
   */
  protected _getOption<T extends keyof Required<PlaybackOptions>, V extends Required<PlaybackOptions>[T]>(
    option: T,
  ): V {
    // Options from props
    if (typeof this._playbackOptions[option] !== 'undefined') {
      return this._playbackOptions[option] as V;
    }
    // Option from manifest
    const activeAnim = this._manifest?.animations.find((animation) => animation.id === this._currentAnimationId);

    if (activeAnim && typeof activeAnim[option] !== 'undefined') {
      return activeAnim[option] as unknown as V;
    }

    // Option from defaults
    return DEFAULT_OPTIONS[option] as V;
  }

  /**
   * Retrieves all playback options.
   *
   * @see _getOption() function for more context on how it retrieves options
   *
   * @returns An object containing all playback options.
   */
  protected _getPlaybackOptions<K extends keyof PlaybackOptions, V extends PlaybackOptions[K]>(): PlaybackOptions {
    const allOptions: PlaybackOptions = {};

    for (const key in DEFAULT_OPTIONS) {
      if (typeof DEFAULT_OPTIONS[key as K] !== 'undefined') {
        allOptions[key as K] = this._getOption(key as K) as V;
      }
    }

    return allOptions;
  }

  /**
   * Extracts playback options from a manifest animation, combining them with default options.
   *
   * @param manifestAnimation - The animation object from the manifest.
   * @returns A playback options object derived from the manifest animation and default options.
   */
  protected _getOptionsFromAnimation(manifestAnimation: ManifestAnimation): PlaybackOptions {
    const { id, ...rest } = manifestAnimation;

    return {
      ...DEFAULT_OPTIONS,
      ...rest,
    };
  }

  protected _updateTestData(): void {
    if (!this._testId || !this._lottie) return;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!window.dotLottiePlayer) {
      window.dotLottiePlayer = {
        [this._testId]: {},
      };
    }
    window.dotLottiePlayer[this._testId] = {
      direction: this._lottie.playDirection,
      currentState: this._currentState,
      loop: this.loop,
      mode: this._mode,
      speed: this._lottie.playSpeed,
    };
  }

  public get currentState(): PlayerState {
    return this._currentState;
  }

  protected clearCountTimer(): void {
    if (this._counterInterval) {
      clearInterval(this._counterInterval);
    }
  }

  protected setCurrentState(state: PlayerState): void {
    this._currentState = state;
    this._notify();
    this._updateTestData();
  }

  public static isPathJSON(srcParsed: string): boolean {
    return srcParsed.split('.').pop()?.toLowerCase() === 'json';
  }

  public get src(): Record<string, unknown> | string {
    return this._src;
  }

  public updateSrc(src: Record<string, unknown> | string): void {
    if (this._src === src) return;
    this._src = src;
    this._activeAnimationId = undefined;
    this._currentAnimationId = undefined;
    this.load();
  }

  public get intermission(): number {
    return this._intermission;
  }

  public get hover(): boolean {
    return this._hover;
  }

  public setHover(hover: boolean): void {
    if (typeof hover !== 'boolean') return;
    this._hover = hover;
    this._playbackOptions.hover = hover;
    this._notify();
  }

  public setIntermission(intermission: number): void {
    this._intermission = intermission;
    this._playbackOptions.intermission = intermission;
    this._notify();
  }

  public get mode(): PlayMode {
    return this._mode;
  }

  public get animations(): Map<string, Animation> {
    return this._animations;
  }

  public get themes(): Map<string, string> {
    return this._themes;
  }

  public setMode(mode: PlayMode): void {
    if (typeof mode !== 'string') return;
    this._mode = mode;
    this._playbackOptions.playMode = mode;
    this._notify();
    this._updateTestData();
  }

  public goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie) return;
    this._lottie.goToAndPlay(value, isFrame, name);
    this.setCurrentState(PlayerState.Playing);
  }

  public goToAndStop(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie) return;
    this._lottie.goToAndStop(value, isFrame, name);
    this.setCurrentState(PlayerState.Stopped);
  }

  public seek(value: number | string): void {
    if (!this._lottie) return;

    let frameValue = value;

    if (typeof frameValue === 'number') {
      frameValue = Math.round(frameValue);
    }

    // Extract frame number from either number or percentage value
    const matches = /^(\d+)(%?)$/u.exec(frameValue.toString());

    if (!matches) {
      return;
    }

    // Calculate and set the frame number
    const nextFrame = matches[2] === '%' ? (this.totalFrames * Number(matches[1])) / 100 : matches[1];

    // Set seeker to new frame number
    if (nextFrame === undefined) return;
    // Send lottie player to the new frame
    this._lottie.goToAndPlay(nextFrame, true);
    if (this.currentState === PlayerState.Playing) {
      this.play();
    } else if (this.currentState === PlayerState.Frozen) {
      this.freeze();
    } else {
      this.pause();
    }
  }

  protected _validatePlaybackOptions(options?: Record<string, unknown>): Partial<PlaybackOptions> {
    if (!options) return {};
    const validatedOptions: Partial<PlaybackOptions> = {};

    for (const [key, value] of Object.entries(options)) {
      switch (key as keyof PlaybackOptions) {
        case 'autoplay':
          if (typeof value === 'boolean') {
            validatedOptions.autoplay = value;
          }
          break;

        case 'direction':
          if (typeof value === 'number' && [1, -1].includes(value)) {
            validatedOptions.direction = value as AnimationDirection;
          }
          break;

        case 'loop':
          if (typeof value === 'boolean' || typeof value === 'number') {
            validatedOptions.loop = value;
          }
          break;

        case 'playMode':
          if (typeof value === 'string' && ['normal', 'bounce'].includes(value)) {
            validatedOptions.playMode = value as PlayMode;
          }
          break;

        case 'speed':
          if (typeof value === 'number') {
            validatedOptions.speed = value;
          }
          break;

        case 'themeColor':
          if (typeof value === 'string') {
            validatedOptions.themeColor = value;
          }
          break;

        case 'hover':
          if (typeof value === 'boolean') {
            validatedOptions.hover = value;
          }
          break;

        case 'intermission':
          if (typeof value === 'number') {
            validatedOptions.intermission = value;
          }
          break;

        case 'defaultTheme':
          if (typeof value === 'string') {
            validatedOptions.defaultTheme = value;
          }
          break;

        default:
          break;
      }
    }

    this._requireValidPlaybackOptions(validatedOptions);

    return validatedOptions;
  }

  private _requireAnimationsInTheManifest(): void {
    if (!this._manifest?.animations.length) {
      throw createError(`No animations found in manifest.`);
    }
  }

  private _requireAnimationsToBeLoaded(): void {
    if (this._animations.size === 0) {
      throw createError(`No animations have been loaded.`);
    }
  }

  /**
   * Initiates playback of the animation in the DotLottie player.
   *
   * @param activeAnimation - The identifier of the animation to be played. Triggers re-render
   * @param getOptions - A function that allows customization of playback options.
   *
   * @remarks
   * This function starts playing the animation within the DotLottie player.
   * It can be used to play a specific animation by providing its identifier.
   * Should only pass activeAnimationId to render a specific animation. Triggers re-render when passed.
   * The `getOptions` function, if provided, can be used to customize playback options based on the current playback state and the options specified in the animation manifest.
   *
   * @returns void
   *
   * @example
   * ```
   * player.play('animation1'); // Renders the animation1. And only starts playing if autoplay === true
   * player.play(); // Can call with empty params to play animation1
   *
   * player.play(); // Start playing when player is paused or stopped. Doesn't change animation
   * ```
   */
  public play(
    activeAnimation?: string | number,
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    // If the player is in the 'Initial' or 'Loading' state, playback cannot be initiated.
    // As animationData won't be available at this point.
    // This avoids the error thrown if user calls play little bit earlier. Useful for the react-layer
    if ([PlayerState.Initial, PlayerState.Loading].includes(this._currentState)) {
      return;
    }

    this._requireAnimationsInTheManifest();
    this._requireAnimationsToBeLoaded();

    if (this._lottie) {
      if (!activeAnimation) {
        // Handles play for the currently active animation
        if (this._lottie.playDirection === -1 && this._lottie.currentFrame === 0) {
          // If direction is -1 and currentFrame is 0, play needs to start at last frame. Otherwise there are no frames to play.
          this._lottie.goToAndPlay(this._lottie.totalFrames, true);
        } else {
          this._lottie.play();
        }
        this.setCurrentState(PlayerState.Playing);

        return;
      }
    }

    if (typeof activeAnimation === 'number') {
      const anim = this._manifest?.animations[activeAnimation];

      if (!anim) {
        throw createError('animation not found.');
      }

      if (typeof getOptions === 'function') {
        // If a `getOptions` function is provided, use it to customize playback options.
        this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        // Otherwise it doesn't override playback options
        this.render({
          id: anim.id,
        });
      }
    }

    if (typeof activeAnimation === 'string') {
      const anim = this._manifest?.animations.find((animation) => animation.id === activeAnimation);

      if (!anim) {
        throw createError('animation not found.');
      }

      if (typeof getOptions === 'function') {
        // If a `getOptions` function is provided, use it to customize playback options.
        this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        // Otherwise it doesn't override playback options
        this.render({
          id: anim.id,
        });
      }
    }
  }

  public playSegments(segment: AnimationSegment | AnimationSegment[], force?: boolean): void {
    if (!this._lottie) return;
    this._lottie.playSegments(segment, force);
    this.setCurrentState(PlayerState.Playing);
  }

  public resetSegments(force: boolean): void {
    if (!this._lottie) return;

    this._lottie.resetSegments(force);
  }

  public togglePlay(): void {
    if (this.currentState === PlayerState.Playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * Retrieves a manifest animation by its identifier or index.
   *
   * @param animation - The identifier or index of the animation to retrieve.
   * @returns The manifest animation corresponding to the provided identifier or index.
   *
   * @throws If the specified animation identifier or index is not found in the manifest.
   * @throws If the first parameter is not a valid number or string.
   */
  protected _getAnimationByIdOrIndex(animation: string | number): ManifestAnimation {
    this._requireAnimationsInTheManifest();
    this._requireAnimationsToBeLoaded();

    if (typeof animation === 'number') {
      const animByIndex = this._manifest?.animations[animation];

      if (!animByIndex) {
        throw createError('animation not found.');
      }

      return animByIndex;
    }

    if (typeof animation === 'string') {
      const animById = this._manifest?.animations.find((anim) => anim.id === animation);

      if (!animById) {
        throw createError('animation not found.');
      }

      return animById;
    }

    throw createError('first param must be a number or string');
  }

  public get activeAnimationId(): string | undefined {
    return this._activeAnimationId;
  }

  public get currentAnimationId(): string | undefined {
    return this._currentAnimationId;
  }

  public get container(): DotLottieElement | undefined {
    return this._container ?? undefined;
  }

  public get activeStateId(): string | undefined {
    return this._activeStateId;
  }

  public enterInteractiveMode(stateId: string): void {
    this._inInteractiveMode = stateId.length > 0;
    this._activeStateId = stateId;
    this._stateMachine?.stop();

    if (stateId) {
      this._startInteractivity();
    }
  }

  public exitInteractiveMode(): void {
    this._inInteractiveMode = false;
    this._stateMachine?.stop();
  }

  public reset(): void {
    const activeId = this._activeAnimationId;

    this.exitInteractiveMode();

    if (!activeId) {
      const anim = this._manifest?.animations[0];

      if (!anim || !anim.id) {
        throw createError('animation not found.');
      }

      this.render(anim);
    }

    const anim = this._manifest?.animations.find((animation) => animation.id === activeId);

    if (!anim) return;

    this.render({
      id: anim.id,
    });
  }

  public previous(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (this._inInteractiveMode) {
      logWarning('previous() is not supported in interactive mode.');

      return;
    }

    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._currentAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim =
      this._manifest.animations[
        (Number(currentIndex) - 1 + Number(this._manifest.animations.length)) % this._manifest.animations.length
      ];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    if (typeof getOptions === 'function') {
      // If a `getOptions` function is provided, use it to customize playback options.
      this.render({
        id: nextAnim.id,
        ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(nextAnim)),
      });
    } else {
      // Otherwise it doesn't override playback options
      this.render({
        id: nextAnim.id,
      });
    }
  }

  public next(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (this._inInteractiveMode) {
      logWarning('next() is not supported in interactive mode.');

      return;
    }

    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._currentAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim = this._manifest.animations[(Number(currentIndex) + 1) % this._manifest.animations.length];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    if (typeof getOptions === 'function') {
      // If a `getOptions` function is provided, use it to customize playback options.
      this.render({
        id: nextAnim.id,
        ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(nextAnim)),
      });
    } else {
      // Otherwise it doesn't override playback options
      this.render({
        id: nextAnim.id,
      });
    }
  }

  public getManifest(): Manifest | undefined {
    return this._manifest;
  }

  public resize(): void {
    if (!this._lottie) return;
    this._lottie.resize();
  }

  public stop(): void {
    if (!this._lottie) return;
    this.clearCountTimer();
    this._counter = 0;

    this.setDirection(this._getOption('direction'));
    this._lottie.stop();
    this.setCurrentState(PlayerState.Stopped);
  }

  public pause(): void {
    if (!this._lottie) return;

    this.clearCountTimer();
    this._lottie.pause();
    this.setCurrentState(PlayerState.Paused);
  }

  public freeze(): void {
    if (!this._lottie) return;

    if (this.currentState !== PlayerState.Frozen) {
      this._stateBeforeFreeze = this.currentState;
    }
    this._lottie.pause();
    this.setCurrentState(PlayerState.Frozen);
  }

  public unfreeze(): void {
    if (!this._lottie) return;

    if (this._stateBeforeFreeze === PlayerState.Playing) {
      this.play();
    } else {
      this.pause();
    }
  }

  public destroy(): void {
    if (this._container?.__lottie) {
      this._container.__lottie.destroy();
      this._container.__lottie = null;
    }

    this.clearCountTimer();
    if (typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', () => this._onVisibilityChange());
    }
    this._frame = 0;
    this._seeker = 0;
    this._counter = 0;
    this._lottie?.destroy();
  }

  public getAnimationInstance(): AnimationItem | undefined {
    return this._lottie;
  }

  public static getLottieWebVersion(): string {
    return `${pkg.dependencies['lottie-web']}`;
  }

  public addEventListener(name: AnimationEventName, cb: () => void): void {
    if (!this._listeners.has(name)) {
      this._listeners.set(name, new Set());
    }
    this._listeners.get(name)?.add(cb);
    try {
      if (name === 'complete') {
        this._container?.addEventListener(name, cb);
      } else {
        this._lottie?.addEventListener(name, cb);
      }
    } catch (error) {
      logError(`addEventListener ${error}`);
    }
  }

  public getState(): DotLottiePlayerState {
    return {
      autoplay: this._lottie?.autoplay ?? false,
      currentState: this._currentState,
      frame: this._frame,
      seeker: this._seeker,
      direction: (this._lottie?.playDirection ?? 1) as AnimationDirection,
      hover: this._hover,
      loop: this._loop || false,
      playMode: this._mode,
      speed: this._lottie?.playSpeed ?? 1,
      background: this._background,
      intermission: this._intermission,
      defaultTheme: this._defaultTheme,
      currentAnimationId: this._currentAnimationId,
      activeStateId: this._activeStateId ?? '',
    };
  }

  protected _notify(): void {
    this.state.setState(this.getState());
  }

  public get totalFrames(): number {
    return this._lottie?.totalFrames || 0;
  }

  public get direction(): 1 | -1 {
    if (!this._lottie) return 1;

    return this._lottie.playDirection as 1 | -1;
  }

  public setDirection(direction: 1 | -1): void {
    this._requireValidDirection(direction);

    this._lottie?.setDirection(direction);
    this._playbackOptions.direction = direction;
    this._notify();
    this._updateTestData();
  }

  public get speed(): number {
    return this._lottie?.playSpeed || 1;
  }

  public setSpeed(speed: number): void {
    this._requireValidSpeed(speed);

    this._lottie?.setSpeed(speed);
    this._playbackOptions.speed = speed;
    this._notify();
    this._updateTestData();
  }

  public get autoplay(): boolean {
    return this._lottie?.autoplay ?? false;
  }

  public setAutoplay(value: boolean): void {
    this._requireValidAutoplay(value);

    if (!this._lottie) return;
    this._lottie.autoplay = value;
    this._playbackOptions.autoplay = value;
    this._notify();
    this._updateTestData();
  }

  public toggleAutoplay(): void {
    if (!this._lottie) return;
    this.setAutoplay(!this._lottie.autoplay);
  }

  public get defaultTheme(): string {
    return this._defaultTheme;
  }

  public setDefaultTheme(value: string): void {
    this._updateDefaultTheme(value);

    if (this._animation) {
      this.render();
    }
  }

  protected _updateDefaultTheme(value: string): void {
    this._defaultTheme = value;
    this._playbackOptions.defaultTheme = value;

    this._notify();
  }

  public get loop(): number | boolean {
    return this._loop;
  }

  public setLoop(value: boolean | number): void {
    this._requireValidLoop(value);

    this.clearCountTimer();

    this._loop = value;
    this._lottie?.setLoop(typeof value === 'number' ? true : value);
    this._playbackOptions.loop = value;
    this._notify();
    this._updateTestData();
  }

  public toggleLoop(): void {
    if (!this._lottie) return;
    this.setLoop(!this._loop);
  }

  public get background(): string {
    return this._background;
  }

  public setBackground(color: string): void {
    this._requireValidBackground(color);

    if (this._container) {
      this._background = color;
      this._container.style.backgroundColor = color;
    }
  }

  /**
   * Reverts playback options to their values as defined in the manifest for specified keys.
   *
   * @param playbackKeys - An optional array of playback option keys to revert. If not provided, all supported keys will be reverted.
   *
   * @remarks
   * - activeAnimationId added as an additional option as its part of Manifest.
   * - A re-render will be triggered if `activeAnimationId` or `defaultTheme` is being passed
   *
   * @returns Nothing.
   */
  public revertToManifestValues(playbackKeys?: Array<keyof PlaybackOptions | 'activeAnimationId'>): void {
    let revertOptions: Array<keyof PlaybackOptions | 'activeAnimationId'>;

    if (!Array.isArray(playbackKeys) || playbackKeys.length === 0) {
      revertOptions = [
        'autoplay',
        'defaultTheme',
        'direction',
        'hover',
        'intermission',
        'loop',
        'playMode',
        'speed',
        'activeAnimationId',
      ];
    } else {
      revertOptions = playbackKeys;
    }

    let shouldRender = false;

    if (revertOptions.includes('activeAnimationId')) {
      const activeAnimationId = this._manifest?.activeAnimationId;
      const animation = this._getAnimationByIdOrIndex(activeAnimationId || 0);

      this._activeAnimationId = activeAnimationId;
      this._setCurrentAnimation(animation.id);

      shouldRender = true;
    }

    revertOptions.forEach((key) => {
      switch (key) {
        case 'autoplay':
          delete this._playbackOptions.autoplay;
          this.setAutoplay(this._getOption('autoplay'));
          break;

        case 'defaultTheme':
          delete this._playbackOptions.defaultTheme;
          this.setDefaultTheme(this._getOption('defaultTheme'));
          break;

        case 'direction':
          delete this._playbackOptions.direction;
          this.setDirection(this._getOption('direction'));
          break;

        case 'hover':
          delete this._playbackOptions.hover;
          this.setHover(this._getOption('hover'));
          break;

        case 'intermission':
          delete this._playbackOptions.intermission;
          this.setIntermission(this._getOption('intermission'));
          break;

        case 'loop':
          delete this._playbackOptions.loop;
          this.setLoop(this._getOption('loop'));
          break;

        case 'playMode':
          delete this._playbackOptions.playMode;
          this.setMode(this._getOption('playMode'));
          this.setDirection(this._getOption('direction'));
          break;

        case 'speed':
          delete this._playbackOptions.speed;
          this.setSpeed(this._getOption('speed'));
          break;

        default:
          break;
      }
    });

    // Renders if activeAnimationId being updated.
    if (shouldRender) {
      this.render();
    }
  }

  // public triggerComplete
  public removeEventListener(name: AnimationEventName, cb: () => void): void {
    try {
      if (name === 'complete') {
        this._container?.removeEventListener(name, cb);
      } else {
        this._lottie?.removeEventListener(name, cb);
      }

      this._listeners.get(name)?.delete(cb);
    } catch (error) {
      logError('removeEventListener', error as string);
    }
  }

  protected _handleAnimationComplete(): void {
    // If loop = number, and animation has reached the end, call stop to go to frame 0
    if (typeof this._loop === 'number') this.stop();

    this._container?.dispatchEvent(new Event(PlayerEvents.Complete));
    this._counter = 0;
    this.clearCountTimer();
    this.setCurrentState(PlayerState.Completed);
  }

  public addEventListeners(): void {
    if (!this._lottie) return;

    this._lottie.addEventListener('enterFrame', () => {
      // Update seeker and frame value based on the current animation frame
      if (!this._lottie) return;
      this._frame = this._lottie.currentFrame;
      this._seeker = (this._lottie.currentFrame / this._lottie.totalFrames) * 100;
      // Notify state subscriptions about the frame and seeker update.
      this._notify();
    });

    this._lottie.addEventListener('loopComplete', () => {
      if (!this._lottie) return;

      this._container?.dispatchEvent(new Event(PlayerEvents.LoopComplete));

      if (this.intermission > 0) {
        this.pause();
      }

      let newDirection = this._lottie.playDirection;

      if (typeof this._loop === 'number' && this._loop > 0) {
        // In case loop is a number keep the track of the loops internally.
        // For PlayMode `bounce` 1 loop = once it completes playing for both directions
        this._counter += this._mode === PlayMode.Bounce ? 0.5 : 1;
        if (this._counter >= this._loop) {
          // Once it completes specified number of loops trigger a manual complete to stop the player.
          this._handleAnimationComplete();

          return;
        }
      }

      if (this._mode === PlayMode.Bounce && typeof newDirection === 'number') {
        // Reverse the direction if playing in 'Bounce' mode.
        newDirection = Number(newDirection) * -1;
      }

      // Determine the start frame based on the direction.
      const startFrame = newDirection === -1 ? this._lottie.totalFrames - 1 : 0;

      if (this.intermission) {
        // Intermission behavior.
        // 1. Pause:  Pause the player
        // 2. Set Timer:  Resume.

        this._lottie.goToAndPlay(startFrame, true);
        // 1. Pause
        this._lottie.pause();

        // 2. Set a timeout to resume animation after intermission duration.
        this._counterInterval = window.setTimeout(() => {
          if (!this._lottie) return;

          // Next Play event
          this._lottie.setDirection(newDirection as AnimationDirection);
          this._lottie.goToAndPlay(startFrame, true);
        }, this._intermission);
      } else {
        // Without intermission keep playing without interruption
        // Note: A manual goToAndPlay is required to handle bounce
        this._lottie.setDirection(newDirection as AnimationDirection);
        this._lottie.goToAndPlay(newDirection === -1 ? this._lottie.totalFrames - 1 : 0, true);
      }
    });

    this._lottie.addEventListener('complete', () => {
      // Special case: To handle the reverse play for PlayMode bounce. If loop is false.
      if (this._lottie && this._loop === false && this._mode === PlayMode.Bounce) {
        this._counter += 0.5;
        // Trigger complete after reverse play
        if (this._counter >= 1) {
          this._handleAnimationComplete();

          return;
        }

        // Set a timeout to resume animation after intermission duration.
        this._counterInterval = window.setTimeout(() => {
          if (!this._lottie) return;

          let newDirection = this._lottie.playDirection;

          if (this._mode === PlayMode.Bounce && typeof newDirection === 'number') {
            newDirection = Number(newDirection) * -1;
          }

          const startFrame = newDirection === -1 ? this._lottie.totalFrames - 1 : 0;

          this._lottie.setDirection(newDirection as 1 | -1);
          this._lottie.goToAndPlay(startFrame, true);
        }, this._intermission);
      } else {
        this._handleAnimationComplete();
      }
    });

    // Re-attaching the listeners. Requires for re-renders
    for (const [name, callbacks] of this._listeners) {
      if (name === 'complete') {
        for (const cb of callbacks) {
          this._container?.addEventListener(name, cb);
        }
      } else {
        for (const cb of callbacks) {
          this._lottie.addEventListener(name, cb);
        }
      }
    }
  }

  protected _setCurrentAnimation(animationId: string): void {
    const anim = this._animations.get(animationId);

    if (!anim) {
      throw createError(`animation '${animationId}' not found`);
    }

    this._currentAnimationId = animationId;
    this._animation = anim;
  }

  protected _startInteractivity(): void {
    if (typeof this._stateSchemas === 'undefined') {
      throw createError('no interactivity states are available.');
    }

    if (typeof this._activeStateId === 'undefined') {
      throw createError('stateId is not specified.');
    }

    if (this._stateMachine) {
      this._stateMachine.stop();
    }

    this._stateMachine = new DotLottieStateMachine(this._stateSchemas, this);
    this._stateMachine.start(this._activeStateId);
  }

  // If we go back to default animation or at animation 0 we need to use props
  protected async render(activeAnimation?: Partial<ManifestAnimation>): Promise<void> {
    if (activeAnimation?.id) {
      this._setCurrentAnimation(activeAnimation.id);
    } else if (!this._animation) {
      throw createError('no animation selected');
    }

    this.destroy();

    let loop: number | boolean = DEFAULT_OPTIONS.loop ?? false;
    let autoplay: boolean = DEFAULT_OPTIONS.autoplay ?? false;
    let mode: PlayMode = DEFAULT_OPTIONS.playMode ?? PlayMode.Normal;
    let intermission: number = DEFAULT_OPTIONS.intermission ?? 0;
    let hover: boolean = DEFAULT_OPTIONS.hover ?? false;
    let direction: AnimationDirection = (DEFAULT_OPTIONS.direction ?? 1) as AnimationDirection;
    let speed: number = DEFAULT_OPTIONS.speed ?? 1;
    let defaultTheme: string = DEFAULT_OPTIONS.defaultTheme ?? '';

    // Either read properties from passed ManifestAnimation or use manifest values
    loop = activeAnimation?.loop ?? this._getOption('loop');
    autoplay = activeAnimation?.autoplay ?? this._getOption('autoplay');
    mode = activeAnimation?.playMode ?? this._getOption('playMode');
    intermission = activeAnimation?.intermission ?? this._getOption('intermission');
    hover = activeAnimation?.hover ?? this._getOption('hover');
    direction = (activeAnimation?.direction ?? this._getOption('direction')) as AnimationDirection;
    speed = activeAnimation?.speed ?? this._getOption('speed');
    defaultTheme = activeAnimation?.defaultTheme ?? this._getOption('defaultTheme');

    const options = {
      ...this._animationConfig,
      autoplay: hover ? false : autoplay,
      // If loop is a number pass to lottie-web as `true`.
      // See 'loopComplete' to understand how loops are handled.
      loop: typeof loop === 'number' ? true : loop,
    };

    // Modifying for current animation
    this._mode = mode;
    this._intermission = intermission;
    this._hover = hover;
    this._loop = loop;

    const lottieStyleSheet = this._themes.get(defaultTheme) ?? '';

    if (lottieStyleSheet) {
      const vFile = await relottie()
        .use(style, {
          lss: lottieStyleSheet,
        })
        .process(JSON.stringify(this._animation));

      this._animation = JSON.parse(vFile.value) as Animation;
    } else {
      this._animation = this._animations.get(this._currentAnimationId ?? '');
    }

    this._lottie = lottie.loadAnimation({
      ...options,
      container: this._container as Element,
      animationData: this._animation,
    });

    this.addEventListeners();

    if (this._container) {
      this._container.__lottie = this._lottie;
    }

    // Modifying for current animation
    this._lottie.setDirection(direction);
    this._lottie.setSpeed(speed);

    this.setCurrentState(PlayerState.Ready);

    if (autoplay && !hover) {
      this.play();
    }

    this._updateTestData();
  }

  public async load(playbackOptions?: PlaybackOptions): Promise<void> {
    if (this._currentState === PlayerState.Loading) {
      logWarning('Loading in progress..');

      return;
    }

    try {
      this.setCurrentState(PlayerState.Loading);

      const srcParsed = DotLottiePlayer.parseSrc(this._src);

      if (typeof srcParsed === 'string') {
        const { activeAnimationId, animations, manifest, states, themes } = await this.getAnimationData(srcParsed);

        // Setting the activeAnimationId from Manfiest if it's not set by user
        if (!this._activeAnimationId) {
          this._activeAnimationId = activeAnimationId;
        }

        this._animations = animations;
        this._themes = themes;
        this._manifest = manifest;
        this._stateSchemas = states;

        this.setCurrentState(PlayerState.Ready);

        if (this._stateSchemas.length && this._activeStateId) {
          // has interactivity
          this._startInteractivity();
        } else {
          // Setting the animation to be played
          this._currentAnimationId = this._activeAnimationId;

          const animation = this._animations.get(this._currentAnimationId);

          if (!animation) {
            throw createError(`invalid animation id ${this._activeAnimationId}`);
          }

          this._animation = animation;

          this.render({ ...playbackOptions });
        }
      } else if (DotLottiePlayer.isLottie(srcParsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._animation = srcParsed as any;
        this.setCurrentState(PlayerState.Ready);

        this.render({ ...playbackOptions });
      } else {
        throw createError('Load method failing. Object is not a valid Lottie.');
      }
    } catch (error: unknown) {
      const err = error as Error;

      this.setCurrentState(PlayerState.Error);
      logError(`Error loading animation: ${err.message}`);
    }
  }

  protected setErrorState(msg: string): void {
    this.setCurrentState(PlayerState.Error);
    logError(msg);
  }

  protected async processLottieJSON(
    data: Record<string, unknown>,
    filename: string,
  ): Promise<{
    animations: Map<string, Animation>;
    manifest: Manifest;
    themes: Map<string, string>;
  }> {
    try {
      const animations: Map<string, Animation> = new Map();

      const boilerplateManifest: Manifest = {
        animations: [
          {
            id: filename,
            speed: 1,
            loop: true,
            direction: 1,
          },
        ],
        description: '',
        author: '',
        keywords: '',
        generator: 'dotLottie-player-common',
        revision: 1,
        version: '1.0.0',
      };

      animations.set(filename, data as unknown as Animation);

      return {
        animations,
        themes: new Map<string, string>(),
        manifest: boilerplateManifest,
      };
    } catch (error) {
      throw createError(`error occurred while processing lottie JSON  ${error}`);
    }
  }

  /**
   * Retrieves animation data from the provided source URL and processes it for playback.
   *
   * @param srcParsed - The parsed source URL from which to fetch animation data.
   * @returns An object containing various animation-related data, including animations, manifest, states, themes, and more.
   */
  protected async getAnimationData(srcParsed: string): Promise<{
    activeAnimationId: string;
    animations: Map<string, Animation>;
    manifest: Manifest;
    states: LottieStateMachine[];
    themes: Map<string, string>;
  }> {
    let response: Response;

    try {
      response = await fetch(srcParsed, {
        method: 'GET',
        mode: 'cors',
      });
    } catch (error) {
      throw createError(`error fetching URL: ${srcParsed}`);
    }

    const contentType = response.headers.get('Content-Type');

    if (contentType === 'application/json') {
      // Handling lottie JSON files
      const lottieJSON = await response.json();

      const filename = srcParsed.includes('.json') ? getFilename(srcParsed) : 'my-animation';
      const { animations, manifest, themes } = await this.processLottieJSON(lottieJSON, filename);

      if (!animations.size || manifest.animations.length === 0 || !manifest.animations[0]) {
        throw createError('No animation to load!');
      }

      let activeAnimationId: string;

      if (manifest.activeAnimationId) {
        activeAnimationId = manifest.activeAnimationId;
      } else {
        this._currentAnimationId = manifest.animations[0].id;
        activeAnimationId = manifest.animations[0].id;
      }

      return {
        activeAnimationId,
        animations,
        themes,
        states: [],
        manifest,
      };
    }

    // Handling .lotte files
    try {
      const arrayBuffer = await response.arrayBuffer();
      const dl = new DotLottie();
      const dotLottie = await dl.fromArrayBuffer(arrayBuffer);
      const lottieAnimations = dotLottie.animations;

      if (!lottieAnimations.length || !dotLottie.manifest.animations.length || !dotLottie.manifest.animations[0]) {
        throw createError('no animation to load!');
      }

      const themes: Map<string, string> = new Map();

      for (const theme of dotLottie.manifest.themes || []) {
        const existingTheme = dotLottie.getTheme(theme.id);

        if (existingTheme?.data) {
          const lss = await existingTheme.toString();

          themes.set(existingTheme.id, lss);
        }
      }

      const animations: Map<string, Animation> = new Map();

      for (const anim of lottieAnimations) {
        const animation = await dotLottie.getAnimation(anim.id);

        if (animation) {
          animations.set(
            anim.id,
            await animation.toJSON({
              inlineAssets: true,
            }),
          );
        }
      }

      let activeAnimationId: string;

      if (dotLottie.manifest.activeAnimationId) {
        activeAnimationId = dotLottie.manifest.activeAnimationId;
      } else {
        activeAnimationId = dotLottie.manifest.animations[0].id;
      }

      if (!animations.size) {
        throw createError('no animation to load!');
      }

      const stateKeys = dotLottie.manifest.states ?? [];
      const states = [] as LottieStateMachine[];

      for (const stateKey of stateKeys) {
        const newState = dotLottie.getStateMachine(stateKey);

        if (newState) states.push(newState);
      }

      return {
        activeAnimationId,
        animations,
        themes,
        states,
        manifest: dotLottie.manifest as Manifest,
      };
    } catch (error) {
      throw createError(`getAnimationData error ${error}`);
    }
  }

  public static isLottie(json: Record<string, unknown>): boolean {
    const mandatory: string[] = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];

    return mandatory.every((field: string) => Object.prototype.hasOwnProperty.call(json, field));
  }

  public static parseSrc(src: string | Record<string, unknown>): string | Record<string, unknown> {
    if (typeof src === 'object') {
      return src;
    }

    try {
      return JSON.parse(src);
    } catch (error) {
      // Try construct an absolute URL from the src URL
      const srcUrl: URL = new URL(src, window.location.href);

      return srcUrl.toString();
    }
  }

  /**
   * Ensure that the provided direction is a valid number.
   * @param direction - The direction to validate.
   */
  private _requireValidDirection(direction: number): asserts direction is number {
    if (direction !== -1 && direction !== 1) {
      throw createError('Direction can only be -1 (backwards) or 1 (forwards)');
    }
  }

  /**
   * Ensure that the provided intermission is a valid, positive number.
   * @param intermission - The intermission to validate.
   * @throws Error - if the intermission is not a valid number.
   */
  private _requireValidIntermission(intermission: number): asserts intermission is number {
    if (intermission < 0 || !Number.isInteger(intermission)) {
      throw createError('intermission must be a positive number');
    }
  }

  /**
   * Ensure that the provided loop is a valid, positive number or boolean.
   * @param loop - The loop to validate.
   * @throws Error - if the loop is not a valid number or boolean.
   */
  private _requireValidLoop(loop: number | boolean): asserts loop is number | boolean {
    if (typeof loop === 'number' && (!Number.isInteger(loop) || loop < 0)) {
      throw createError('loop must be a positive number or boolean');
    }
  }

  /**
   * Ensure that the provided speed is a valid number.
   * @param speed - The speed to validate.
   * @throws Error - if the speed is not a valid number.
   */
  private _requireValidSpeed(speed: number): asserts speed is number {
    if (typeof speed !== 'number') {
      throw createError('speed must be a number');
    }
  }

  /**
   * Ensure that the provided background is a valid string.
   * @param background - The background to validate.
   * @throws Error - if the background is not a valid string.
   */
  private _requireValidBackground(background: string): asserts background is string {
    if (typeof background !== 'string') {
      throw createError('background must be a string');
    }
  }

  /**
   * Ensure that the provided autoplay is a valid boolean.
   * @param autoplay - The autoplay to validate.
   * @throws Error - if the autoplay is not a valid boolean.
   */
  private _requireValidAutoplay(autoplay: boolean): asserts autoplay is boolean {
    if (typeof autoplay !== 'boolean') {
      throw createError('autoplay must be a boolean');
    }
  }

  /**
   * Ensure that the provided options object is a valid PlaybackOptions object.
   * @param options - The options object to validate.
   */
  private _requireValidPlaybackOptions(options: PlaybackOptions): asserts options is PlaybackOptions {
    if (options.direction) {
      this._requireValidDirection(options.direction);
    }

    if (options.intermission) {
      this._requireValidIntermission(options.intermission);
    }

    if (options.loop) {
      this._requireValidLoop(options.loop);
    }

    if (options.speed) {
      this._requireValidSpeed(options.speed);
    }
  }
}

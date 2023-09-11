/**
 * Copyright 2023 Design Barn Inc.
 */

import type { Manifest, ManifestAnimation, PlaybackOptions } from '@dotlottie/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';
import type {
  AnimationConfig,
  AnimationDirection,
  AnimationItem,
  AnimationEventName,
  RendererType,
  SVGRendererConfig,
  HTMLRendererConfig,
  CanvasRendererConfig,
  LottiePlayer,
  AnimationSegment,
} from 'lottie-web';

import pkg from '../package.json';

import { DotLottieLoader } from './dotlottie-loader';
import { loadStateMachines } from './dotlottie-state-machine-loader';
import { applyLottieStyleSheet } from './dotlottie-styler';
import type { DotLottieStateMachineManager } from './state/dotlottie-state-machine-manager';
import { Store } from './store';
import { createError, isValidLottieJSON, isValidLottieString, logError, logWarning } from './utils';

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
  VisibilityChange = 'visibilityChange',
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
    light?: boolean;
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
  visibilityPercentage: number;
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
  visibilityPercentage: 0,
};

export class DotLottiePlayer {
  protected _lottie?: AnimationItem;

  protected _src: string | Record<string, unknown>;

  protected _animationConfig: Omit<AnimationConfig<RendererType>, 'container'>;

  // This variable holds the playbackOptions prior to interactivity mode.
  protected _prevPlaybackOptions: PlaybackOptions = {};

  // This holds the user set values from the player.
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

  protected _defaultTheme: string;

  // The active animation id (animation to play first) from the manifest
  protected _activeAnimationId?: string | undefined;

  // The currently playing animation id
  protected _currentAnimationId?: string | undefined;

  protected _testId?: string;

  protected _listeners = new Map<AnimationEventName, Set<() => void>>();

  protected _currentState = PlayerState.Initial;

  protected _stateBeforeFreeze = PlayerState.Initial;

  public state = new Store<DotLottiePlayerState>(DEFAULT_STATE);

  private readonly _light: boolean = false;

  private readonly _dotLottieLoader: DotLottieLoader = new DotLottieLoader();

  protected _activeStateId?: string;

  protected _inInteractiveMode: boolean = false;

  private _scrollTicking: boolean = false;

  private _scrollCallback: (() => void) | undefined = undefined;

  private _onShowIntersectionObserver: IntersectionObserver | undefined = undefined;

  private _visibilityPercentage: number = 0;

  protected _stateMachineManager?: DotLottieStateMachineManager;

  public constructor(
    src: string | Record<string, unknown>,
    container?: DotLottieElement | null,
    options?: DotLottieConfig<RendererType>,
  ) {
    this._src = structuredClone(src);

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

    if (options?.light) {
      this._light = options.light;
    }

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
    const activeAnim = this._dotLottieLoader.manifest?.animations.find(
      (animation) => animation.id === this._currentAnimationId,
    );

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
   * Update playbackOptions for lottie-web and local
   */
  protected _setPlayerState(getOptions: (currPlaybackOptions: PlaybackOptions) => PlaybackOptions): void {
    const options = getOptions(this._getPlaybackOptions());

    // Local updates
    if (typeof options.defaultTheme === 'string') {
      this._defaultTheme = options.defaultTheme;
    }

    if (typeof options.playMode === 'string') {
      this._mode = options.playMode;
    }

    if (typeof options.intermission === 'number') {
      this._intermission = options.intermission;
    }

    if (typeof options.hover === 'boolean') {
      this._hover = options.hover;
    }

    // lottie-web updates
    if (typeof options.loop === 'number' || typeof options.loop === 'boolean') {
      this.clearCountTimer();
      this._loop = options.loop;
      this._counter = 0;
      this._lottie?.setLoop(typeof options.loop === 'number' ? true : options.loop);
    }

    if (typeof options.speed === 'number') {
      this._lottie?.setSpeed(options.speed);
    }

    if (typeof options.autoplay === 'boolean' && this._lottie) {
      this._lottie.autoplay = options.autoplay;
    }

    if (typeof options.direction === 'number' && [1, -1].includes(options.direction)) {
      this._lottie?.setDirection(options.direction);
    }
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

  /**
   * Gets the current player state.
   *
   * @returns The current state of the player.
   */
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
    this._src = structuredClone(src);
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
    return this._dotLottieLoader.animationsMap;
  }

  public get themes(): Map<string, string> {
    return this._dotLottieLoader.themeMap;
  }

  public setMode(mode: PlayMode): void {
    if (typeof mode !== 'string') return;
    this._mode = mode;
    this._playbackOptions.playMode = mode;
    this._setPlayerState(() => ({ playMode: mode }));
    this._notify();
    this._updateTestData();
  }

  public get container(): HTMLDivElement | undefined {
    if (this._container) {
      return this._container as HTMLDivElement;
    }

    return undefined;
  }

  public goToAndPlay(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("goToAndPlay() Can't use whilst loading.");

      return;
    }
    this._lottie.goToAndPlay(value, isFrame, name);
    this.setCurrentState(PlayerState.Playing);
  }

  public goToAndStop(value: number | string, isFrame?: boolean, name?: string): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("goToAndStop() Can't use whilst loading.");

      return;
    }

    this._lottie.goToAndStop(value, isFrame, name);
    this.setCurrentState(PlayerState.Stopped);
  }

  public seek(value: number | string): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("seek() Can't use whilst loading.");

      return;
    }

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

  private _areNumbersInRange(num1: number, num2: number): boolean {
    return num1 >= 0 && num1 <= 1 && num2 >= 0 && num2 <= 1;
  }

  private _updatePosition(
    segments?: [number, number],
    threshold?: [number, number],
    positionCallback?: (position: number) => void,
  ): void {
    const [start, end] = segments ?? [0, this.totalFrames - 1];
    const [firstThreshold, lastThreshold] = threshold ?? [0, 1];

    if (!this._areNumbersInRange(firstThreshold, lastThreshold)) {
      logError('threshold values must be between 0 and 1');

      return;
    }

    if (this.container) {
      const { height, top } = this.container.getBoundingClientRect();

      // Calculate current view percentage
      const current = window.innerHeight - top;
      const max = window.innerHeight + height;

      const positionInViewport = current / max;

      const res =
        start + Math.round(((positionInViewport - firstThreshold) / (lastThreshold - firstThreshold)) * (end - start));

      if (positionCallback) positionCallback(positionInViewport);

      this.goToAndStop(res, true);

      /**
       * If we've reached the end of the animation / segments
       * or if the animation is out of view with thresholds, we fire the complete event
       */
      // if (res <= start || res >= end || positionInViewport >= lastThreshold || positionInViewport <= firstThreshold) {
      if (res >= end || positionInViewport >= lastThreshold) {
        this._handleAnimationComplete();
      }
    }

    this._scrollTicking = false;
  }

  private _requestTick(
    segments?: [number, number],
    threshold?: [number, number],
    positionCallback?: (position: number) => void,
  ): void {
    if (!this._scrollTicking) {
      requestAnimationFrame(() => this._updatePosition(segments, threshold, positionCallback));
      this._scrollTicking = true;
    }
  }

  public playOnScroll(scrollOptions?: {
    positionCallback?: (position: number) => void;
    segments?: [number, number];
    threshold?: [number, number];
  }): void {
    this.stop();

    if (this._scrollCallback) this.stopPlayOnScroll();

    this._scrollCallback = (): void =>
      this._requestTick(scrollOptions?.segments, scrollOptions?.threshold, scrollOptions?.positionCallback);

    window.addEventListener('scroll', this._scrollCallback);
  }

  public stopPlayOnScroll(): void {
    if (this._scrollCallback) {
      window.removeEventListener('scroll', this._scrollCallback);

      this._scrollCallback = undefined;
    }
  }

  public stopPlayOnShow(): void {
    if (this._onShowIntersectionObserver) {
      this._onShowIntersectionObserver.disconnect();
      this._onShowIntersectionObserver = undefined;
    }
  }

  public addIntersectionObserver(options?: {
    callbackOnIntersect?: (visibilityPercentage: number) => void;
    threshold?: number[];
  }): void {
    if (!this.container) {
      throw createError("Can't play on show, player container element not available.");
    }

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: options?.threshold ? options.threshold : [0, 1],
    };

    const intersectionObserverCallback = (entries: IntersectionObserverEntry[]): void => {
      entries.forEach((entry) => {
        this._visibilityPercentage = entry.intersectionRatio * 100;

        if (entry.isIntersecting) {
          if (options?.callbackOnIntersect) {
            options.callbackOnIntersect(this._visibilityPercentage);
          }
          this._container?.dispatchEvent(new Event(PlayerEvents.VisibilityChange));
        } else if (options?.callbackOnIntersect) {
          options.callbackOnIntersect(0);
          this._container?.dispatchEvent(new Event(PlayerEvents.VisibilityChange));
        }
      });
    };

    this._onShowIntersectionObserver = new IntersectionObserver(intersectionObserverCallback, observerOptions);
    this._onShowIntersectionObserver.observe(this.container);
  }

  public playOnShow(onShowOptions?: { threshold: number[] }): void {
    this.stop();

    if (!this.container) {
      throw createError("Can't play on show, player container element not available.");
    }

    if (this._onShowIntersectionObserver) {
      this.stopPlayOnShow();
    }

    // how to know when to pause?
    this.addIntersectionObserver({
      threshold: onShowOptions?.threshold ?? [],
      callbackOnIntersect: (visibilityPercentage) => {
        if (visibilityPercentage === 0) this.pause();
        else this.play();
      },
    });
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
    if (!this._dotLottieLoader.manifest?.animations.length) {
      throw createError(`No animations found in manifest.`);
    }
  }

  private _requireAnimationsToBeLoaded(): void {
    if (this._dotLottieLoader.animationsMap.size === 0) {
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
  public async play(
    activeAnimation?: string | number,
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): Promise<void> {
    // If the player is in the 'Initial' or 'Loading' state, playback cannot be initiated.
    // As animationData won't be available at this point.
    // This avoids the error thrown if user calls play little bit earlier. Useful for the react-layer
    if ([PlayerState.Initial, PlayerState.Loading].includes(this._currentState)) {
      logWarning('Player unable to play whilst loading.');

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
      const anim = this._dotLottieLoader.manifest?.animations[activeAnimation];

      if (!anim) {
        throw createError('animation not found.');
      }

      if (typeof getOptions === 'function') {
        // If a `getOptions` function is provided, use it to customize playback options.
        await this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        // Otherwise it doesn't override playback options
        await this.render({
          id: anim.id,
        });
      }
    }

    if (typeof activeAnimation === 'string') {
      const anim = this._dotLottieLoader.manifest?.animations.find((animation) => animation.id === activeAnimation);

      if (!anim) {
        throw createError('animation not found.');
      }

      if (typeof getOptions === 'function') {
        // If a `getOptions` function is provided, use it to customize playback options.
        await this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        // Otherwise it doesn't override playback options
        await this.render({
          id: anim.id,
        });
      }
    }
  }

  public playSegments(segment: AnimationSegment | AnimationSegment[], force?: boolean): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("playSegments() Can't use whilst loading.");

      return;
    }

    this._lottie.playSegments(segment, force);
    this.setCurrentState(PlayerState.Playing);
  }

  public resetSegments(force: boolean): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("resetSegments() Can't use whilst loading.");

      return;
    }

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
      const animByIndex = this._dotLottieLoader.manifest?.animations[animation];

      if (!animByIndex) {
        throw createError('animation not found.');
      }

      return animByIndex;
    }

    if (typeof animation === 'string') {
      const animById = this._dotLottieLoader.manifest?.animations.find((anim) => anim.id === animation);

      if (!animById) {
        throw createError('animation not found.');
      }

      return animById;
    }

    throw createError('first param must be a number or string');
  }

  public get activeAnimationId(): string | undefined {
    return this._getActiveAnimationId();
  }

  public get currentAnimationId(): string | undefined {
    return this._currentAnimationId;
  }

  public get activeStateId(): string | undefined {
    return this._activeStateId;
  }

  /**
   * Gets the state machines from file and starts the specified state machine.
   * @param stateId - The identifier of the state machine to use.
   * @returns
   */
  protected async _startInteractivity(stateId: string): Promise<void> {
    if (!this._inInteractiveMode) {
      logError(
        "Can't start interactivity. Not in interactive mode. Call enterInteractiveMode(stateId: string) to start.",
      );

      return;
    }
    if (this._dotLottieLoader.stateMachinesMap.size === 0) {
      await this._dotLottieLoader.getStateMachines();
    }

    if (this._dotLottieLoader.stateMachinesMap.size === 0) {
      throw createError('No interactivity states are available.');
    }

    if (stateId === 'undefined') {
      throw createError('stateId is not specified.');
    }

    if (!this._stateMachineManager) {
      this._stateMachineManager = await loadStateMachines(
        Array.from(this._dotLottieLoader.stateMachinesMap.values()),
        this,
      );
    }

    this._stateMachineManager.start(stateId);
  }

  /**
   * Enters interactive mode for the specified state machine and starts it.
   * @param stateId - The identifier of the state machine to use.
   */
  public enterInteractiveMode(stateId: string): void {
    if (stateId) {
      // Cache the player PlaybackOptions before entering interactivity mode for the first time.
      if (!this._inInteractiveMode) {
        this._prevPlaybackOptions = { ...this._playbackOptions };
      }

      if (this._inInteractiveMode) {
        this._stateMachineManager?.stop();
      }

      this._activeStateId = stateId;
      this._inInteractiveMode = true;

      this._startInteractivity(stateId);
    } else {
      throw createError('stateId must be a non-empty string.');
    }
  }

  /**
   * Exits interactive mode and stops the current state machine.
   */
  public exitInteractiveMode(): void {
    if (!this._inInteractiveMode) {
      return;
    }

    this._inInteractiveMode = false;
    this._activeStateId = '';
    this._stateMachineManager?.stop();

    // Resets playbackOptions used in interactivity mode
    this._playbackOptions = {};

    // Update the playbackOptions from user / player
    this._playbackOptions = { ...this._prevPlaybackOptions };

    // clear cached values.
    this._prevPlaybackOptions = {};

    this.reset();
  }

  public reset(): void {
    const activeId = this._getActiveAnimationId();
    const anim = this._dotLottieLoader.manifest?.animations.find((animation) => animation.id === activeId);

    if (this._inInteractiveMode) this.exitInteractiveMode();

    if (!anim) {
      throw createError('animation not found.');
    }

    this.play(activeId);
  }

  public previous(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (!this._dotLottieLoader.manifest || !this._dotLottieLoader.manifest.animations.length) {
      throw createError('manifest not found.');
    }

    if (this._inInteractiveMode) {
      logWarning('previous() is not supported in interactive mode.');

      return;
    }

    const currentIndex = this._dotLottieLoader.manifest.animations.findIndex(
      (anim) => anim.id === this._currentAnimationId,
    );

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim =
      this._dotLottieLoader.manifest.animations[
        (currentIndex - 1 + this._dotLottieLoader.manifest.animations.length) %
          this._dotLottieLoader.manifest.animations.length
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
    if (!this._dotLottieLoader.manifest || !this._dotLottieLoader.manifest.animations.length) {
      throw createError('manifest not found.');
    }

    if (this._inInteractiveMode) {
      logWarning('next() is not supported in interactive mode.');

      return;
    }

    const currentIndex = this._dotLottieLoader.manifest.animations.findIndex(
      (anim) => anim.id === this._currentAnimationId,
    );

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim =
      this._dotLottieLoader.manifest.animations[(currentIndex + 1) % this._dotLottieLoader.manifest.animations.length];

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
    return this._dotLottieLoader.manifest;
  }

  public resize(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("resize() Can't use whilst loading.");

      return;
    }
    this._lottie.resize();
  }

  public stop(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("stop() Can't use whilst loading.");

      return;
    }

    this.clearCountTimer();
    this._counter = 0;

    this._setPlayerState(() => ({ direction: this._getOption('direction') }));
    this._lottie.stop();
    this.setCurrentState(PlayerState.Stopped);
  }

  public pause(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("pause() Can't use whilst loading.");

      return;
    }

    this.clearCountTimer();
    this._lottie.pause();
    this.setCurrentState(PlayerState.Paused);
  }

  public freeze(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("freeze() Can't use whilst loading.");

      return;
    }

    if (this.currentState !== PlayerState.Frozen) {
      this._stateBeforeFreeze = this.currentState;
    }
    this._lottie.pause();
    this.setCurrentState(PlayerState.Frozen);
  }

  public unfreeze(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("unfreeze() Can't use whilst loading.");

      return;
    }

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
      visibilityPercentage: this._visibilityPercentage,
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

    this._setPlayerState(() => ({ direction }));
    this._playbackOptions.direction = direction;
  }

  public get speed(): number {
    return this._lottie?.playSpeed || 1;
  }

  public setSpeed(speed: number): void {
    this._requireValidSpeed(speed);

    this._setPlayerState(() => ({ speed }));
    this._playbackOptions.speed = speed;
  }

  public get autoplay(): boolean {
    return this._lottie?.autoplay ?? false;
  }

  public setAutoplay(value: boolean): void {
    this._requireValidAutoplay(value);

    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("setAutoplay() Can't use whilst loading.");

      return;
    }

    this._setPlayerState(() => ({ autoplay: value }));
    this._playbackOptions.autoplay = value;
  }

  public toggleAutoplay(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("toggleAutoplay() Can't use whilst loading.");

      return;
    }
    this.setAutoplay(!this._lottie.autoplay);
  }

  public get defaultTheme(): string {
    return this._defaultTheme;
  }

  public setDefaultTheme(value: string): void {
    this._setPlayerState(() => ({ defaultTheme: value }));
    this._playbackOptions.defaultTheme = value;

    if (this._animation) {
      this.render();
    }
  }

  public get loop(): number | boolean {
    return this._loop;
  }

  public setLoop(value: boolean | number): void {
    this._requireValidLoop(value);

    this._setPlayerState(() => ({ loop: value }));
    this._playbackOptions.loop = value;
  }

  public toggleLoop(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("toggleLoop() Can't use whilst loading.");

      return;
    }
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

  protected get _frame(): number {
    if (!this._lottie) return 0;

    if (this.currentState === PlayerState.Completed) {
      if (this.direction === -1) {
        return 0;
      } else {
        return this._lottie.totalFrames;
      }
    }

    return this._lottie.currentFrame;
  }

  protected get _seeker(): number {
    if (!this._lottie) return 0;

    return (this._frame / this._lottie.totalFrames) * 100;
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
  public async revertToManifestValues(
    playbackKeys?: Array<keyof PlaybackOptions | 'activeAnimationId'>,
  ): Promise<void> {
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
      const activeAnimationId = this._dotLottieLoader.manifest?.activeAnimationId;

      const animation = this._getAnimationByIdOrIndex(activeAnimationId || 0);

      this._activeAnimationId = activeAnimationId;

      await this._setCurrentAnimation(animation.id);

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

    const lastFrame = this.direction === -1 ? 0 : this.totalFrames;

    this.goToAndStop(lastFrame, true);

    this._counter = 0;
    this.clearCountTimer();
    this.setCurrentState(PlayerState.Completed);
    this._container?.dispatchEvent(new Event(PlayerEvents.Complete));
  }

  public addEventListeners(): void {
    if (!this._lottie || [PlayerState.Loading].includes(this._currentState)) {
      logWarning("addEventListeners() Can't use whilst loading.");

      return;
    }

    this._lottie.addEventListener('enterFrame', () => {
      // Update seeker and frame value based on the current animation frame
      if (!this._lottie) {
        logWarning('enterFrame event : Lottie is undefined.');

        return;
      }

      const flooredFrame = Math.floor(this._lottie.currentFrame);

      if (flooredFrame === 0) {
        if (this.direction === -1) {
          this._container?.dispatchEvent(new Event(PlayerEvents.Complete));
          if (!this.loop) this.setCurrentState(PlayerState.Completed);
        }
      }

      // Notify state subscriptions about the frame and seeker update.
      this._notify();
    });

    this._lottie.addEventListener('loopComplete', () => {
      if (!this._lottie) {
        logWarning('loopComplete event : Lottie is undefined.');

        return;
      }

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

        this.goToAndPlay(startFrame, true);
        // 1. Pause
        this.pause();

        // 2. Set a timeout to resume animation after intermission duration.
        this._counterInterval = window.setTimeout(() => {
          if (!this._lottie) return;

          // Next Play event
          this._setPlayerState(() => ({ direction: newDirection as AnimationDirection }));
          this.goToAndPlay(startFrame, true);
        }, this._intermission);
      } else {
        // Without intermission keep playing without interruption
        // Note: A manual goToAndPlay is required to handle bounce
        this._setPlayerState(() => ({ direction: newDirection as AnimationDirection }));
        this.goToAndPlay(newDirection === -1 ? this.totalFrames - 1 : 0, true);
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

          const startFrame = newDirection === -1 ? this.totalFrames - 1 : 0;

          this._setPlayerState(() => ({ direction: newDirection as AnimationDirection }));
          this.goToAndPlay(startFrame, true);
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

  protected async _setCurrentAnimation(animationId: string): Promise<void> {
    this._currentState = PlayerState.Loading;
    const anim = await this._dotLottieLoader.getAnimation(animationId);

    this._currentAnimationId = animationId;
    this._animation = anim;
    this._currentState = PlayerState.Ready;
  }

  // If we go back to default animation or at animation 0 we need to use props
  protected async render(activeAnimation?: Partial<ManifestAnimation>): Promise<void> {
    if (activeAnimation?.id) {
      await this._setCurrentAnimation(activeAnimation.id);
    } else if (!this._animation) {
      throw createError('no animation selected');
    }

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

    const lottieStyleSheet = await this._dotLottieLoader.getTheme(defaultTheme);

    if (lottieStyleSheet && this._animation) {
      this._animation = await applyLottieStyleSheet(this._animation, lottieStyleSheet);
    } else {
      this._animation = await this._dotLottieLoader.getAnimation(this._currentAnimationId ?? '');
    }

    const lottiePlayer = await this._getLottiePlayerInstance();

    if (this._activeStateId && !this._inInteractiveMode) {
      // If we detect state machines are being used, load all of them up from the file
      this.enterInteractiveMode(this._activeStateId);

      return;
    }

    this.destroy();

    // Modifying for current animation before render
    this._setPlayerState(() => ({
      defaultTheme,
      playMode: mode,
      intermission,
      hover,
      loop,
    }));

    this._lottie = lottiePlayer.loadAnimation({
      ...options,
      container: this._container as Element,
      animationData: this._animation,
    });

    this.addEventListeners();

    if (this._container) {
      this._container.__lottie = this._lottie;
    }

    // Modifying for current animation after render
    this._setPlayerState(() => ({
      direction,
      speed,
    }));

    if (autoplay && !hover) {
      this.play();
    }

    this._updateTestData();
  }

  private async _getLottiePlayerInstance(): Promise<LottiePlayer> {
    const renderer = this._animationConfig.renderer ?? 'svg';

    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    let LottieWebModule: typeof import('lottie-web');

    switch (renderer) {
      case 'svg': {
        if (this._light) {
          LottieWebModule = await import(`lottie-web/build/player/lottie_light`);
        } else {
          LottieWebModule = await import(`lottie-web/build/player/lottie_svg`);
        }

        break;
      }

      case 'canvas': {
        if (this._light) {
          LottieWebModule = await import(`lottie-web/build/player/lottie_light_canvas`);
        } else {
          // @ts-ignore
          LottieWebModule = await import(`lottie-web/build/player/lottie_canvas`);
        }

        break;
      }

      case 'html': {
        if (this._light) {
          LottieWebModule = await import(`lottie-web/build/player/lottie_light_html`);
        } else {
          LottieWebModule = await import(`lottie-web/build/player/lottie_html`);
        }

        break;
      }

      default:
        throw new Error(`Invalid renderer: ${renderer}`);
    }

    return LottieWebModule.default;
  }

  private _getActiveAnimationId(): string | undefined {
    const manifest = this._dotLottieLoader.manifest;

    return this._activeAnimationId ?? manifest?.activeAnimationId ?? manifest?.animations[0]?.id ?? undefined;
  }

  public async load(playbackOptions?: PlaybackOptions): Promise<void> {
    if (this._currentState === PlayerState.Loading) {
      logWarning('Loading in progress..');

      return;
    }

    try {
      this.setCurrentState(PlayerState.Loading);

      if (typeof this._src === 'string') {
        if (isValidLottieString(this._src)) {
          const validLottieJson = JSON.parse(this._src);

          this._dotLottieLoader.loadFromLottieJSON(validLottieJson);
        } else {
          const url = new URL(this._src, window.location.href);

          await this._dotLottieLoader.loadFromUrl(url.toString());
        }
      } else if (typeof this._src === 'object' && isValidLottieJSON(this._src)) {
        this._dotLottieLoader.loadFromLottieJSON(this._src);
      } else {
        throw createError('Invalid src provided');
      }

      if (!this._dotLottieLoader.manifest) {
        throw createError('No manifest found');
      }

      const activeAnimationId = this._getActiveAnimationId();

      if (!activeAnimationId) {
        throw createError('No active animation found');
      }

      await this._setCurrentAnimation(activeAnimationId);

      await this.render(playbackOptions);
    } catch (error) {
      this.setCurrentState(PlayerState.Error);
      if (error instanceof Error) {
        logError(`Error loading animation: ${error.message}`);
      }
    }
  }

  protected setErrorState(msg: string): void {
    this.setCurrentState(PlayerState.Error);
    logError(msg);
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

/**
 * Copyright 2023 Design Barn Inc.
 */

/* eslint-disable no-warning-comments */

import type { Animation } from '@lottiefiles/lottie-types';
import style from '@lottiefiles/relottie-style';
import { relottie } from '@lottiefiles/relottie/index';
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
} from 'lottie-web';

import pkg from '../package.json';

import { DotLottieLoader } from './dotlottie-loader';
import { Store } from './store';
import { createError, isValidLottieJSON, isValidLottieString, logError, logWarning } from './utils';

export type { AnimationDirection, AnimationItem };

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

// TODO: export from dotLottie-js
export interface ManifestTheme {
  // scoped animations ids
  animations: string[];

  id: string;
}

// TODO: export from dotLottie-js
export interface ManifestAnimation {
  autoplay?: boolean;

  // default theme to use
  defaultTheme?: string;

  // Define playback direction 1 forward, -1 backward
  direction?: AnimationDirection;

  // Play on hover
  hover?: boolean;

  id: string;

  // Time to wait between playback loops
  intermission?: number;

  // If loop is a number, it defines the number of times the animation will loop
  loop?: boolean | number;

  // Choice between 'bounce' and 'normal'
  playMode?: PlayMode;

  // Desired playback speed, default 1.0
  speed?: number;

  // Theme color
  themeColor?: string;
}

export type PlaybackOptions = Omit<ManifestAnimation, 'id'>;

// TODO: export from dotLottie-js
export interface Manifest {
  // Default animation to play
  activeAnimationId?: string;

  // List of animations
  animations: ManifestAnimation[];

  // Name of the author
  author?: string;

  // Custom data to be made available to the player and animations
  custom?: Record<string, unknown>;

  // Description of the animation
  description?: string;

  // Name and version of the software that created the dotLottie
  generator?: string;

  // Description of the animation
  keywords?: string;

  // Revision version number of the dotLottie
  revision?: number;

  // themes used in the animations
  themes?: ManifestTheme[];

  // Target dotLottie version
  version?: string;
}

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
    background?: string;
    testId?: string | undefined;
  };

declare global {
  interface Window {
    dotLottiePlayer: Record<string, Record<string, unknown>>;
  }
}

export interface DotLottiePlayerState extends PlaybackOptions {
  background: string;
  currentAnimationId: string | undefined;
  currentState: PlayerState;
  frame: number;
  intermission: number;
  seeker: number;
}

export const DEFAULT_STATE: DotLottiePlayerState = {
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

  protected _defaultTheme: string;

  // The active animation id (animation to play first) from the manifest
  protected _activeAnimationId?: string | undefined;

  // The currently playing animation id
  protected _currentAnimationId?: string | undefined;

  protected _testId?: string;

  protected _listeners = new Map();

  protected _currentState = PlayerState.Initial;

  protected _stateBeforeFreeze = PlayerState.Initial;

  public state = new Store<DotLottiePlayerState>(DEFAULT_STATE);

  protected _frame: number = 0;

  protected _seeker: number = 0;

  private readonly _dotLottieLoader: DotLottieLoader = new DotLottieLoader();

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

  protected _getOption<T extends keyof Required<PlaybackOptions>, V extends Required<PlaybackOptions>[T]>(
    option: T,
  ): V {
    // Options from props for 1st animation
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

  protected _getPlaybackOptions<K extends keyof PlaybackOptions, V extends PlaybackOptions[K]>(): PlaybackOptions {
    const allOptions: PlaybackOptions = {};

    for (const key in DEFAULT_OPTIONS) {
      if (typeof DEFAULT_OPTIONS[key as K] !== 'undefined') {
        allOptions[key as K] = this._getOption(key as K) as V;
      }
    }

    return allOptions;
  }

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
    return this.hover;
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
    if (!this._dotLottieLoader.manifest?.animations.length) {
      throw createError(`No animations found in manifest.`);
    }
  }

  private _requireAnimationsToBeLoaded(): void {
    if (this._dotLottieLoader.animationsMap.size === 0) {
      throw createError(`No animations have been loaded.`);
    }
  }

  public play(
    activeAnimation?: string | number,
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (!this._lottie) return;

    this._requireAnimationsInTheManifest();
    this._requireAnimationsToBeLoaded();

    if (!activeAnimation || (typeof activeAnimation === 'string' && activeAnimation === this._currentAnimationId)) {
      if (this._lottie.playDirection === -1 && this._lottie.currentFrame === 0) {
        this._lottie.goToAndPlay(this._lottie.totalFrames, true);
      } else {
        this._lottie.play();
      }
      this.setCurrentState(PlayerState.Playing);

      return;
    }

    if (typeof activeAnimation === 'number') {
      const anim = this._dotLottieLoader.manifest?.animations[activeAnimation];

      if (!anim) {
        throw createError('animation not found.');
      }

      if (typeof getOptions === 'function') {
        this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        this.render({
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
        this.render({
          id: anim.id,
          ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(anim)),
        });
      } else {
        this.render({
          id: anim.id,
        });
      }
    }
  }

  public togglePlay(): void {
    if (this.currentState === PlayerState.Playing) {
      this.pause();
    } else {
      this.play();
    }
  }

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

  public reset(): void {
    const activeId = this._getActiveAnimationId();

    const anim = this._dotLottieLoader.manifest?.animations.find((animation) => animation.id === activeId);

    if (!anim) {
      throw createError('animation not found.');
    }

    this.render(anim);
  }

  public previous(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (!this._dotLottieLoader.manifest || !this._dotLottieLoader.manifest.animations.length) {
      throw createError('manifest not found.');
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
      this.render({
        id: nextAnim.id,
        ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(nextAnim)),
      });
    } else {
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
      this.render({
        id: nextAnim.id,
        ...getOptions(this._getPlaybackOptions(), this._getOptionsFromAnimation(nextAnim)),
      });
    } else {
      this.render({
        id: nextAnim.id,
      });
    }
  }

  public getManifest(): Manifest | undefined {
    return this._dotLottieLoader.manifest;
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
    this._counter = 0;
    this._lottie?.destroy();
  }

  public getAnimationInstance(): AnimationItem | undefined {
    return this._lottie;
  }

  public static getLottieWebVersion(): string {
    return `${pkg.dependencies['lottie-web']}`;
  }

  public addEventListener(name: AnimationEventName, cb: () => unknown): void {
    this._listeners.set([name, cb], cb);
    try {
      this._lottie?.addEventListener(name, cb);
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
    this._defaultTheme = value;
    this._playbackOptions.defaultTheme = value;

    if (this._animation) {
      this.render();
    }

    this._notify();
  }

  public get loop(): number | boolean {
    return this._loop;
  }

  public setLoop(value: boolean | number): void {
    this._requireValidLoop(value);

    this.clearCountTimer();

    this._loop = value;
    this._lottie?.setLoop(Boolean(value));
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

  public removeEventListener(name: AnimationEventName, cb?: () => unknown): void {
    try {
      if (cb) {
        this._lottie?.removeEventListener(name, cb);
      } else {
        this._lottie?.removeEventListener(name);
      }

      this._listeners.delete([name, cb]);
    } catch (error) {
      logError('removeEventListener', error as string);
    }
  }

  public addEventListeners(): void {
    if (!this._lottie) return;
    this._lottie.addEventListener('enterFrame', () => {
      if (!this._lottie) return;
      this._frame = this._lottie.currentFrame;
      this._seeker = (this._lottie.currentFrame / this._lottie.totalFrames) * 100;
      this._notify();
    });

    this._lottie.addEventListener('loopComplete', () => {
      if (!this._lottie) return;

      if (this.intermission > 0) {
        this.pause();
      }

      let newDirection = this._lottie.playDirection;

      if (this._mode === PlayMode.Bounce && typeof newDirection === 'number') {
        newDirection = Number(newDirection) * -1;
      }

      const startFrame = newDirection === -1 ? this._lottie.totalFrames - 1 : 0;

      if (this.intermission) {
        this._lottie.goToAndPlay(startFrame, true);
        this._lottie.pause();

        this._counterInterval = window.setTimeout(() => {
          if (!this._lottie) return;

          this._lottie.setDirection(newDirection as AnimationDirection);
          this._lottie.goToAndPlay(startFrame, true);
        }, this._intermission);
      } else {
        this._lottie.setDirection(newDirection as AnimationDirection);
        this._lottie.goToAndPlay(newDirection === -1 ? this._lottie.totalFrames - 1 : 0, true);
      }
    });

    this._lottie.addEventListener('complete', () => {
      if (this._lottie && typeof this._loop === 'number' && this._loop > 0) {
        this._counter += this._mode === PlayMode.Bounce ? 0.5 : 1;
        if (this._counter >= this._loop) {
          this.stop();

          return;
        }

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
        this.stop();
        this.setCurrentState(PlayerState.Stopped);
      }
    });

    for (const [[name], cb] of this._listeners) {
      this._lottie.addEventListener(name, cb);
    }
  }

  protected async _setCurrentAnimation(animationId: string): Promise<void> {
    const anim = await this._dotLottieLoader.getAnimation(animationId);

    this._currentAnimationId = animationId;
    this._animation = anim;
  }

  // If we go back to default animation or at animation 0 we need to use props
  protected async render(activeAnimation?: Partial<ManifestAnimation>): Promise<void> {
    if (activeAnimation?.id) {
      await this._setCurrentAnimation(activeAnimation.id);
    } else if (!this._animation) {
      throw createError('no animation selected');
    }

    this.destroy();

    let loop: number | boolean = DEFAULT_OPTIONS.loop ?? false;
    let autoplay: boolean = DEFAULT_OPTIONS.autoplay ?? false;
    let mode: PlayMode = DEFAULT_OPTIONS.playMode ?? PlayMode.Normal;
    let intermission: number = DEFAULT_OPTIONS.intermission ?? 0;
    let hover: boolean = DEFAULT_OPTIONS.hover ?? false;
    let direction: AnimationDirection = DEFAULT_OPTIONS.direction ?? 1;
    let speed: number = DEFAULT_OPTIONS.speed ?? 1;
    let defaultTheme: string = DEFAULT_OPTIONS.defaultTheme ?? '';

    // Either read properties from passed ManifestAnimation or use manifest values
    loop = activeAnimation?.loop ?? this._getOption('loop');
    autoplay = activeAnimation?.autoplay ?? this._getOption('autoplay');
    mode = activeAnimation?.playMode ?? this._getOption('playMode');
    intermission = activeAnimation?.intermission ?? this._getOption('intermission');
    hover = activeAnimation?.hover ?? this._getOption('hover');
    direction = activeAnimation?.direction ?? this._getOption('direction');
    speed = activeAnimation?.speed ?? this._getOption('speed');
    defaultTheme = activeAnimation?.defaultTheme ?? this._getOption('defaultTheme');
    this._defaultTheme = defaultTheme;

    const options = {
      ...this._animationConfig,
      autoplay: hover ? false : autoplay,
      loop: typeof loop === 'number' ? false : loop,
    };

    // Modifying for current animation
    this._mode = mode;
    this._intermission = intermission;
    this._hover = hover;
    this._loop = loop;

    const lottieStyleSheet = await this._dotLottieLoader.getTheme(defaultTheme);

    if (lottieStyleSheet) {
      const vFile = await relottie()
        .use(style, {
          lss: lottieStyleSheet,
        })
        .process(JSON.stringify(this._animation));

      this._animation = JSON.parse(vFile.value) as Animation;
    } else {
      this._animation = await this._dotLottieLoader.getAnimation(this._currentAnimationId ?? '');
    }

    const lottiePlayer = await this._getLottiePlayerInstance();

    this._lottie = lottiePlayer.loadAnimation({
      ...options,
      container: this._container as Element,
      animationData: this._animation,
    });

    this.addEventListeners();

    if (this._container) {
      this._container.__lottie = this._lottie;
    }

    this.setCurrentState(PlayerState.Ready);

    // Modifying for current animation
    this._lottie.setDirection(direction);
    this._lottie.setSpeed(speed);

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
      case 'svg':
        LottieWebModule = await import('lottie-web/build/player/lottie_svg');
        break;

      case 'canvas':
        // @ts-ignore
        LottieWebModule = await import('lottie-web/build/player/lottie_canvas');
        break;

      case 'html':
        LottieWebModule = await import('lottie-web/build/player/lottie_html');
        break;

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

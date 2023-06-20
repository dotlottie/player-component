/**
 * Copyright 2023 Design Barn Inc.
 */

import { DotLottie } from '@dotlottie/dotlottie-js';
import type { Animation } from '@lottiefiles/lottie-types';
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
} from 'lottie-web';

import { Store } from './store';
import { createError, logError, logWarning } from './utils';

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

export interface ManifestAnimation {
  autoplay?: boolean;

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

  protected _manifest: Manifest | undefined = undefined;

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

  protected _originalPlaybackSettings: DotLottieConfig<RendererType> | undefined;

  public constructor(
    src: string | Record<string, unknown>,
    container?: DotLottieElement | null,
    options?: DotLottieConfig<RendererType>,
  ) {
    this._src = src;

    if (options?.testId) {
      this._testId = options.testId;
    }

    // Filter out the playback options
    this._playbackOptions = this._validatePlaybackOptions(options || {});

    // Store the original playback options
    this._originalPlaybackSettings = options;

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

  protected _getOption<T extends keyof Required<PlaybackOptions>, V extends Required<PlaybackOptions>[T]>(
    option: T,
  ): V {
    if (typeof this._playbackOptions[option] === 'undefined') {
      // Option from manifest
      const activeAnim = this._manifest?.animations.find((animation) => animation.id === this._currentAnimationId);

      if (activeAnim && activeAnim[option]) {
        return activeAnim[option] as unknown as V;
      }

      // Option from defaults
      return DEFAULT_OPTIONS[option] as V;
    }

    // Option from player props
    return this._playbackOptions[option] as V;
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
    return this._animations;
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

  public play(activeAnimation?: string | number, options?: PlaybackOptions): void {
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
      const anim = this._manifest?.animations[activeAnimation];

      if (!anim) {
        throw createError('animation not found.');
      }
      this.render(anim);
    }

    if (typeof activeAnimation === 'string') {
      const anim = this._manifest?.animations.find((animation) => animation.id === activeAnimation);

      if (!anim) {
        throw createError('animation not found.');
      }

      this.render({
        ...anim,
        ...this._validatePlaybackOptions(options),
      });
    }
  }

  public togglePlay(): void {
    if (this.currentState === PlayerState.Playing) {
      this.pause();
    } else {
      this.play();
    }
  }

  public get activeAnimationId(): string | undefined {
    return this._activeAnimationId;
  }

  public get currentAnimationId(): string | undefined {
    return this._currentAnimationId;
  }

  public reset(): void {
    const activeId = this._manifest?.activeAnimationId;

    if (!activeId) {
      const anim = this._manifest?.animations[0];

      if (!anim || !anim.id) {
        throw createError('animation not found.');
      }

      this.render(anim);
    }

    const anim = this._manifest?.animations.find((animation) => animation.id === activeId);

    if (!anim) return;

    this.render(anim);
  }

  public previous(options?: PlaybackOptions): void {
    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._currentAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim =
      this._manifest.animations[
        (currentIndex - 1 + this._manifest.animations.length) % this._manifest.animations.length
      ];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    this.render({
      ...nextAnim,
      ...this._validatePlaybackOptions(options),
    });
  }

  public next(options?: PlaybackOptions): void {
    if (!this._manifest || !this._manifest.animations.length) {
      throw createError('manifest not found.');
    }

    const currentIndex = this._manifest.animations.findIndex((anim) => anim.id === this._currentAnimationId);

    if (currentIndex === -1) {
      throw createError('animation not found.');
    }

    const nextAnim = this._manifest.animations[(currentIndex + 1) % this._manifest.animations.length];

    if (!nextAnim || !nextAnim.id) {
      throw createError('animation not found.');
    }

    this.render({
      ...nextAnim,
      ...this._validatePlaybackOptions(options),
    });
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
    this._counter = 0;
    this._lottie?.destroy();
  }

  public getAnimationInstance(): AnimationItem | undefined {
    return this._lottie;
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
    this._requireValidSpeed(direction);

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

  // If we go back to default animation or at animation 0 we need to use props
  protected render(activeAnimation?: Partial<ManifestAnimation>): void {
    if (activeAnimation?.id) {
      const anim = this._animations.get(activeAnimation.id);

      if (!anim) {
        throw createError(`animation '${activeAnimation.id}' not found`);
      }
      this._currentAnimationId = activeAnimation.id;
      this._animation = anim;
    } else if (!this._animation) {
      throw createError('no animation selected');
    }

    this.destroy();

    const firstAnimation = this._manifest?.animations.at(0)?.id;

    let loop: number | boolean = DEFAULT_OPTIONS.loop ?? false;
    let autoplay: boolean = DEFAULT_OPTIONS.autoplay ?? false;
    let mode: PlayMode = DEFAULT_OPTIONS.playMode ?? PlayMode.Normal;
    let intermission: number = DEFAULT_OPTIONS.intermission ?? 0;
    let hover: boolean = DEFAULT_OPTIONS.hover ?? false;
    let direction: number = DEFAULT_OPTIONS.direction ?? 1;
    let speed: number = DEFAULT_OPTIONS.speed ?? 1;

    // Either read properties from passed ManifestAnimation or use manifest values
    loop = activeAnimation?.loop ?? this._getOption('loop');
    autoplay = activeAnimation?.autoplay ?? this._getOption('autoplay');
    mode = activeAnimation?.playMode ?? this._getOption('playMode');
    intermission = activeAnimation?.intermission ?? this._getOption('intermission');
    hover = activeAnimation?.hover ?? this._getOption('hover');
    direction = activeAnimation?.direction ?? this._getOption('direction');
    speed = activeAnimation?.speed ?? this._getOption('speed');

    // If we're on the first animation or default animation, check and use the saved inital props
    if (this._currentAnimationId === firstAnimation || this._currentAnimationId === this._activeAnimationId) {
      if (this._originalPlaybackSettings?.loop) {
        loop = this._originalPlaybackSettings.loop;
      }

      if (this._originalPlaybackSettings?.autoplay) {
        autoplay = this._originalPlaybackSettings.autoplay;
      }

      if (this._originalPlaybackSettings?.playMode) {
        mode = this._originalPlaybackSettings.playMode;
      }

      if (this._originalPlaybackSettings?.intermission) {
        intermission = this._originalPlaybackSettings.intermission;
      }

      if (this._originalPlaybackSettings?.hover) {
        hover = this._originalPlaybackSettings.hover;
      }

      if (this._originalPlaybackSettings?.direction) {
        direction = this._originalPlaybackSettings.direction;
      }

      if (this._originalPlaybackSettings?.speed) {
        speed = this._originalPlaybackSettings.speed;
      }
    }

    const options = {
      ...this._animationConfig,
      autoplay: hover ? false : autoplay,
      loop: typeof loop === 'number' ? false : loop,
    };

    this.setMode(mode);
    console.log('intermission', intermission);
    this.setIntermission(intermission);
    this.setHover(hover);
    this.setLoop(loop);

    this._lottie = lottie.loadAnimation({
      ...options,
      container: this._container as Element,
      animationData: this._animation,
    });

    this.addEventListeners();
    if (this._container) {
      this._container.__lottie = this._lottie;
    }
    this.setCurrentState(PlayerState.Ready);

    this.setDirection(direction === 1 ? 1 : -1);
    this.setSpeed(speed);

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
        const { activeAnimationId, animations, manifest } = await this.getAnimationData(srcParsed);

        if (!this._currentAnimationId) {
          this._currentAnimationId = activeAnimationId;
        }

        this._animations = animations;
        this._manifest = manifest;

        const animation = this._animations.get(this._currentAnimationId);

        if (!animation) {
          throw createError(`invalid animation id ${this._activeAnimationId}`);
        }

        this._animation = animation;

        this.render({ ...playbackOptions });
      } else if (DotLottiePlayer.isLottie(srcParsed)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this._animation = srcParsed as any;
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

  protected async fetchLottieJSON(src: string): Promise<{ animations: Map<string, Animation>; manifest: Manifest }> {
    if (!src.toLowerCase().endsWith('.json')) throw createError('parameter src must be .json');

    try {
      const data = await fetch(src, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Response-Type': 'json',
        },
      }).then(async (resp) => resp.json());

      const animations: Map<string, Animation> = new Map();
      const filename = src.substring(Number(src.lastIndexOf('/')) + 1, src.lastIndexOf('.'));

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

      animations.set(filename, data);

      return {
        animations,
        manifest: boilerplateManifest,
      };
    } catch (error) {
      throw createError(`fetchLottieJSON error  ${error}`);
    }
  }

  protected async getAnimationData(srcParsed: string): Promise<{
    activeAnimationId: string;
    animations: Map<string, Animation>;
    manifest: Manifest;
  }> {
    if (srcParsed.toLowerCase().endsWith('.json')) {
      const { animations, manifest } = await this.fetchLottieJSON(srcParsed);

      if (!animations.size || manifest.animations.length === 0 || !manifest.animations[0]) {
        throw createError('No animation to load!');
      }

      let activeAnimationId: string;

      if (manifest.activeAnimationId) {
        // Set the current playing animation
        this._currentAnimationId = manifest.activeAnimationId;

        // Set the active animation id value
        this._activeAnimationId = manifest.activeAnimationId;
        activeAnimationId = manifest.activeAnimationId;
      } else {
        this._currentAnimationId = manifest.animations[0].id;
        activeAnimationId = manifest.animations[0].id;
      }

      return {
        activeAnimationId,
        animations,
        manifest,
      };
    }

    try {
      const dl = new DotLottie();
      const dotLottie = await dl.fromURL(srcParsed);
      const lottieAnimations = dotLottie.animations;

      if (!lottieAnimations.length || !dotLottie.manifest.animations.length || !dotLottie.manifest.animations[0]) {
        throw createError('no animation to load!');
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

      return {
        activeAnimationId,
        animations,
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

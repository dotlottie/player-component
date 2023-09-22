/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererType, DotLottiePlayerState, PlaybackOptions, Manifest, ManifestTheme } from '@dotlottie/common';
import {
  DotLottieCommonPlayer,
  PlayerState,
  PlayMode,
  PlayerEvents,
  logWarning,
  createError,
  DEFAULT_STATE,
} from '@dotlottie/common';
import type { CSSResult, TemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import type { AnimationItem } from 'lottie-web';

import pkg from '../package.json';

import styles from './dotlottie-player.styles';

export interface Versions {
  dotLottiePlayerVersion: string;
  lottieWebVersion: string;
}

const ELEMENT_NAME = 'dotlottie-player';

export { PlayMode, PlaybackOptions };

/**
 * DotLottiePlayer web component class
 */
export class DotLottiePlayer extends LitElement {
  @property({ type: String })
  public defaultTheme = '';

  /**
   * Animation container.
   */
  @query('#animation')
  protected container!: HTMLElement;

  /**
   * Play mode.
   */
  @property()
  public playMode: PlayMode = PlayMode.Normal;

  /**
   * Autoplay animation on load.
   */
  @property({ type: Boolean })
  public autoplay = false;

  /**
   * Background color.
   */
  @property({ type: String })
  public background?: string = 'transparent';

  /**
   * Show controls.
   */
  @property({ type: Boolean })
  public controls = false;

  /**
   * Direction of animation.
   */
  @property({ type: Number })
  public direction = 1;

  /**
   * Whether to play on mouse hover
   */
  @property({ type: Boolean })
  public hover = false;

  /**
   * Whether to loop animation.
   */
  @property({ type: String })
  public loop?: string;

  /**
   * Renderer to use.
   */
  @property({ type: String })
  public renderer = 'svg';

  /**
   * Animation speed.
   */
  @property({ type: Number })
  public speed = 1;

  /**
   * Bodymovin JSON data or URL to JSON.
   */
  @property({ type: String })
  public src?: string;

  @property()
  public intermission = 0;

  /**
   * Animation id as string or index to play on load.
   */
  @property({ type: String })
  public activeAnimationId?: string | null = null;

  @property({ type: Boolean })
  public light?: boolean = false;

  @property({ type: Boolean })
  public worker?: boolean = false;

  /**
   * Interactivity state id.
   */
  @property({ type: String })
  public activeStateId?: string | undefined;

  @state()
  private _seeker: number = 0;

  private _dotLottieCommonPlayer: DotLottieCommonPlayer | undefined;

  private _io?: IntersectionObserver;

  private _loop?: boolean | number;

  private _renderer?: RendererType = 'svg';

  private _unsubscribeListeners?: () => void;

  // Controls state
  private _hasMultipleAnimations = false;

  private _hasMultipleThemes = false;

  private _hasMultipleStates = false;

  private _popoverIsOpen = false;

  private _animationsTabIsOpen = false;

  private _statesTabIsOpen = false;

  private _styleTabIsOpen = false;

  private _themesForCurrentAnimation: ManifestTheme[] = [];

  private _statesForCurrentAnimation: string[] = [];

  /**
   * Get number of loops or boolean value of loop.
   *
   * @param loop - either a string representing a boolean or a number of loops to play
   * @returns boolean - if loop was activated or not
   */
  private _parseLoop(loop: string): boolean | number {
    const loopNb = parseInt(loop, 10);

    if (Number.isInteger(loopNb) && loopNb > 0) {
      this._loop = loopNb;

      return loopNb;
    } else if (typeof loop === 'string' && ['true', 'false'].includes(loop)) {
      this._loop = loop === 'true';

      return this._loop;
    } else {
      logWarning('loop must be a positive integer or a boolean');
    }

    return false;
  }

  /**
   * Handles click and drag actions on the progress track.
   */
  private _handleSeekChange(event: Event): void {
    const target = event.currentTarget as HTMLInputElement;

    try {
      const value = parseInt(target.value, 10);

      if (!this._dotLottieCommonPlayer) {
        return;
      }

      const frame: number = (value / 100) * this._dotLottieCommonPlayer.totalFrames;

      this.seek(frame);
    } catch (error) {
      throw createError('Error while seeking animation');
    }
  }

  private _initListeners(): void {
    const commonPlayer = this._dotLottieCommonPlayer;

    if (commonPlayer === undefined) {
      logWarning('player not initialized - cannot add event listeners', 'dotlottie-player-component');

      return;
    }

    // Calculate and save the current progress of the animation
    this._unsubscribeListeners = commonPlayer.state.subscribe(
      (playerState: DotLottiePlayerState, prevState: DotLottiePlayerState) => {
        this._seeker = playerState.seeker;

        this.requestUpdate();

        if (prevState.currentState !== playerState.currentState) {
          this.dispatchEvent(new CustomEvent(playerState.currentState));
        }

        this.dispatchEvent(
          new CustomEvent(PlayerEvents.Frame, {
            detail: {
              frame: playerState.frame,
              seeker: playerState.seeker,
            },
          }),
        );

        this.dispatchEvent(
          new CustomEvent(PlayerEvents.VisibilityChange, {
            detail: {
              visibilityPercentage: playerState.visibilityPercentage,
            },
          }),
        );
      },
    );

    // Handle animation play complete
    commonPlayer.addEventListener('complete', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.Complete));
    });

    commonPlayer.addEventListener('loopComplete', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.LoopComplete));
    });

    // Handle lottie-web ready event
    commonPlayer.addEventListener('DOMLoaded', () => {
      const manifest = this.getManifest();

      if (manifest && manifest.themes) {
        this._themesForCurrentAnimation = manifest.themes.filter((theme) =>
          theme.animations.includes(this.getCurrentAnimationId() || ''),
        );
      }

      if (manifest && manifest.states) {
        this._hasMultipleStates = manifest.states.length > 0;

        this._statesForCurrentAnimation = [];
        manifest.states.forEach((newState: string) => {
          this._statesForCurrentAnimation.push(newState);
        });
      }

      this.dispatchEvent(new CustomEvent(PlayerEvents.Ready));
    });

    // Handle animation data load complete
    commonPlayer.addEventListener('data_ready', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.DataReady));
    });

    // Set error state when animation load fail event triggers
    commonPlayer.addEventListener('data_failed', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.DataFail));
    });

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window) {
      window.addEventListener('click', (event) => this._clickOutListener(event));
    }
  }

  /**
   * Configure and initialize lottie-web player instance.
   */
  public async load(
    src: string | AnimationItem,
    overrideRendererSettings?: Record<string, unknown>,
    playbackOptions?: PlaybackOptions,
  ): Promise<void> {
    if (!this.shadowRoot) {
      return;
    }

    if (this._dotLottieCommonPlayer) {
      this._dotLottieCommonPlayer.destroy();
    }

    /**
     * User's can call the load method - only do new initialization inside firstConnected()
     */
    this._dotLottieCommonPlayer = new DotLottieCommonPlayer(src, this.container as HTMLDivElement, {
      rendererSettings: overrideRendererSettings ?? {
        scaleMode: 'noScale',
        clearCanvas: true,
        progressiveLoad: true,
        hideOnTransparent: true,
      },
      hover: this.hasAttribute('hover') ? this.hover : undefined,
      renderer: this.hasAttribute('renderer') ? this._renderer : undefined,
      loop: this.hasAttribute('loop') ? this._loop : undefined,
      direction: this.hasAttribute('direction') ? (this.direction === 1 ? 1 : -1) : undefined,
      speed: this.hasAttribute('speed') ? this.speed : undefined,
      intermission: this.hasAttribute('intermission') ? Number(this.intermission) : undefined,
      playMode: this.hasAttribute('playMode') ? this.playMode : undefined,
      autoplay: this.hasAttribute('autoplay') ? this.autoplay : undefined,
      activeAnimationId: this.hasAttribute('activeAnimationId') ? this.activeAnimationId : undefined,
      defaultTheme: this.hasAttribute('defaultTheme') ? this.defaultTheme : undefined,
      light: this.light,
      worker: this.worker,
      activeStateId: this.hasAttribute('activeStateId') ? this.activeStateId : undefined,
    });

    await this._dotLottieCommonPlayer.load(playbackOptions);

    const manifest = this.getManifest();

    // Init controls state
    this._hasMultipleAnimations = this.animationCount() > 1;

    if (manifest) {
      if (manifest.themes) {
        this._themesForCurrentAnimation = manifest.themes.filter((theme) =>
          theme.animations.includes(this.getCurrentAnimationId() || ''),
        );

        this._hasMultipleThemes = manifest.themes.length > 0;
      }

      if (manifest.states) {
        this._hasMultipleStates = manifest.states.length > 0;

        this._statesForCurrentAnimation = [];
        manifest.states.forEach((newState: string) => {
          this._statesForCurrentAnimation.push(newState);
        });
      }
    }

    /**
     * Init done
     */
    this._initListeners();
  }

  /**
   * @returns Current animation's id
   */
  public getCurrentAnimationId(): string | undefined {
    return this._dotLottieCommonPlayer?.currentAnimationId;
  }

  /**
   * @returns The current number of animations
   */
  public animationCount(): number {
    if (!this._dotLottieCommonPlayer) return 0;

    return this._dotLottieCommonPlayer.getManifest()?.animations.length || 0;
  }

  /**
   * @returns The ids of all the animations
   */
  public animations(): string[] {
    if (!this._dotLottieCommonPlayer) return [];

    const manifest = this._dotLottieCommonPlayer.getManifest();

    return manifest?.animations.map((animation) => animation.id) || [];
  }

  /**
   * @returns The current playing animation
   */
  public currentAnimation(): string {
    if (!this._dotLottieCommonPlayer || !this._dotLottieCommonPlayer.currentAnimationId) return '';

    return this._dotLottieCommonPlayer.currentAnimationId;
  }

  /**
   * @returns the current player states
   */
  public getState(): DotLottiePlayerState {
    if (!this._dotLottieCommonPlayer) return DEFAULT_STATE;

    return this._dotLottieCommonPlayer.getState();
  }

  /**
   *
   * @returns The current manifest.
   */
  public getManifest(): Manifest | undefined {
    return this._dotLottieCommonPlayer?.getManifest();
  }

  /**
   * @returns The current lottie-web instance.
   */
  public getLottie(): AnimationItem | undefined {
    return this._dotLottieCommonPlayer?.getAnimationInstance();
  }

  /**
   * @returns The current version of the dotLottie player and lottie-web.
   */
  public getVersions(): Versions {
    return {
      lottieWebVersion: DotLottieCommonPlayer.getLottieWebVersion(),
      dotLottiePlayerVersion: `${pkg.version}`,
    };
  }

  /**
   * Play the previous animation. The order is taken from the manifest.
   */
  public previous(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    this._dotLottieCommonPlayer?.previous(getOptions);
  }

  /**
   * Play the next animation. The order is taken from the manifest.
   */
  public next(
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    this._dotLottieCommonPlayer?.next(getOptions);
  }

  /**
   * Reset to the initial state defined in the manifest.
   */
  public reset(): void {
    this._dotLottieCommonPlayer?.reset();
  }

  public play(
    targetAnimation?: string | number,
    getOptions?: (currPlaybackOptions: PlaybackOptions, manifestPlaybackOptions: PlaybackOptions) => PlaybackOptions,
  ): void {
    if (!this._dotLottieCommonPlayer) {
      return;
    }

    this._dotLottieCommonPlayer.play(targetAnimation, getOptions);
  }

  /**
   * Pause animation play.
   */
  public pause(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.pause();
  }

  /**
   * Stops animation play.
   */
  public stop(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.stop();
  }

  // To do add playback option to manifest
  // To do add as prop

  /**
   * Play the animation when it appears on screen and pause when it goes out of view.
   *
   * @param playOnShowOptions - what percentage of the target's visibility the observer's callback should be executed
   * @returns
   */
  public playOnShow(playOnShowOptions?: { threshold: number[] }): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.playOnShow(playOnShowOptions);
  }

  /**
   * Stop the playOnShow observer.
   * @returns
   */
  public stopPlayOnShow(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.stopPlayOnShow();
  }

  /**
   * Play the animation synchronized to page scroll.
   * @param scrollOptions
   *  - positionCallback: callback function to get the current position of the player relative to the whole page
   *  - segments: optional segment of animation to play
   *  - threshold: optional visibility threshold to start playing the animation. Between 0 and 1. Defaults to [0, 1].
   * @returns
   */
  public playOnScroll(scrollOptions?: {
    positionCallback?: (position: number) => void;
    segments?: [number, number];
    threshold?: [number, number];
  }): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.playOnScroll(scrollOptions);
  }

  /**
   * Stop the play on scroll observer.
   * @returns
   */
  public stopPlayOnScroll(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.stopPlayOnScroll();
  }

  /**
   * Seek to a given frame.
   */
  public seek(value: number | string): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.seek(value);
  }

  /**
   * Snapshot the current frame as SVG.
   *
   * If 'download' argument is boolean true, then a download is triggered in browser.
   */
  public snapshot(download = true): string {
    if (!this.shadowRoot) return '';

    // Get SVG element and serialize markup
    const svgElement = this.shadowRoot.querySelector('.animation svg') as Node;
    const data = new XMLSerializer().serializeToString(svgElement);

    // Trigger file download
    if (download) {
      const element = document.createElement('a');

      element.href = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(data)}`;
      element.download = `download_${this._seeker}.svg`;
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    }

    return data;
  }

  /**
   * Set theme
   */
  public setTheme(theme: string): void {
    this._dotLottieCommonPlayer?.setDefaultTheme(theme);
  }

  /**
   * @returns All the theme keys
   */
  public themes(): string[] {
    if (!this._dotLottieCommonPlayer) return [];

    const manifest = this._dotLottieCommonPlayer.getManifest();

    return manifest?.themes?.map((theme) => theme.id) || [];
  }

  /**
   * @returns The current applied theme
   */
  public getDefaultTheme(): string {
    if (!this._dotLottieCommonPlayer) return '';

    return this._dotLottieCommonPlayer.defaultTheme;
  }

  /**
   * @returns The current active state machine
   */
  public getActiveStateMachine(): string | undefined {
    if (!this._dotLottieCommonPlayer) return '';

    return this._dotLottieCommonPlayer.activeStateId;
  }

  /**
   * Freeze animation play.
   * This internal state pauses animation and is used to differentiate between
   * user requested pauses and component instigated pauses.
   */
  private _freeze(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.freeze();
  }

  /**
   * Sets animation play speed.
   *
   * @param value - Playback speed.
   */
  public setSpeed(value = 1): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.setSpeed(value);
  }

  /**
   * Animation play direction.
   *
   * @param value - Direction values.
   */
  public setDirection(value: 1 | -1): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.setDirection(value);
  }

  /**
   * Sets the looping of the animation.
   *
   * @param value - Whether to enable looping. Boolean true enables looping.
   */
  public setLooping(value: boolean | number): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.setLoop(value);
  }

  public isLooping(): number | boolean {
    if (!this._dotLottieCommonPlayer) return false;

    return this._dotLottieCommonPlayer.loop;
  }

  /**
   * Toggle playing state.
   */
  public togglePlay(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.togglePlay();
  }

  /**
   * Toggles animation looping.
   */
  public toggleLooping(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.toggleLoop();
  }

  /**
   * Sets the player mode
   * @param mode - The mode to set ('normal', 'bounce')
   */
  public setPlayMode(mode: PlayMode): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.setMode(mode);
  }

  /**
   * Changes the Interactivity state id and starts it.
   *
   * @param stateId - state machine id.
   */
  public enterInteractiveMode(stateId: string): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.enterInteractiveMode(stateId);
  }

  /**
   * Exits the Interactivity mode.
   */
  public exitInteractiveMode(): void {
    if (!this._dotLottieCommonPlayer) return;

    this._dotLottieCommonPlayer.exitInteractiveMode();
  }

  /**
   * Reverts PlaybackOptions to manifest values instead of player props.
   */
  public revertToManifestValues(playbackKeys?: Array<keyof PlaybackOptions | 'activeAnimationId'>): void {
    this._dotLottieCommonPlayer?.revertToManifestValues(playbackKeys);
  }

  /**
   * Returns the styles for the component. Overriding causes styles to not be applied.
   */
  public static get styles(): CSSResult {
    return styles;
  }

  /**
   * Initialize everything on component first render.
   */
  protected override async firstUpdated(): Promise<void> {
    this.container = this.shadowRoot?.querySelector('#animation') as HTMLElement;

    // Add intersection observer for detecting component being out-of-view.
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        if (entries[0] !== undefined && entries[0].isIntersecting) {
          if (this._dotLottieCommonPlayer?.currentState === PlayerState.Frozen) {
            this.play();
          }
        } else if (this._dotLottieCommonPlayer?.currentState === PlayerState.Playing) {
          this._freeze();
        }
      });

      this._io.observe(this.container);
    }

    // Parse loop attribute if present as a number or string-boolean
    // Also check if plain 'loop' prop is present
    if (this.loop) {
      this._parseLoop(this.loop);
    } else if (this.hasAttribute('loop')) {
      this._parseLoop('true');
    }

    // Parse renderer and set private variable
    if (this.renderer === 'svg') this._renderer = 'svg';
    else if (this.renderer === 'canvas') this._renderer = 'canvas';
    else if (this.renderer === 'html') this._renderer = 'html';

    // Setup lottie player
    if (this.src) {
      await this.load(this.src);
    }
  }

  /**
   * Cleanup on component destroy.
   */
  public override disconnectedCallback(): void {
    // Remove intersection observer for detecting component being out-of-view.
    if (this._io) {
      this._io.disconnect();
      this._io = undefined;
    }

    // Destroy lottie
    this._dotLottieCommonPlayer?.destroy();

    this._unsubscribeListeners?.();

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (window) {
      window.removeEventListener('click', (event) => this._clickOutListener(event));
    }
  }

  private _clickOutListener(event: MouseEvent): void {
    const inside = event.composedPath().some((element) => {
      if (element instanceof HTMLElement) {
        return element.classList.contains('popover') || element.id === 'lottie-animation-options';
      }

      return false;
    });

    if (!inside && this._popoverIsOpen) {
      this._popoverIsOpen = false;
      this.requestUpdate();
    }
  }

  protected renderControls(): TemplateResult | undefined {
    const isPlaying: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Playing;
    const isPaused: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Paused;

    return html`
      <div id="lottie-controls" aria-label="lottie-animation-controls" class="toolbar">
        ${this._hasMultipleAnimations
          ? html`
              <button @click=${(): void => this.previous()} aria-label="Previous animation" class="btn-spacing-left">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M1.69214 13.5C1.69214 13.7761 1.916 14 2.19214 14C2.46828 14 2.69214 13.7761 2.69214 13.5L2.69214 2.5C2.69214 2.22386 2.46828 2 2.19214 2C1.916 2 1.69214 2.22386 1.69214 2.5V13.5ZM12.5192 13.7828C13.1859 14.174 14.0254 13.6933 14.0254 12.9204L14.0254 3.0799C14.0254 2.30692 13.1859 1.8262 12.5192 2.21747L4.13612 7.13769C3.47769 7.52414 3.47769 8.4761 4.13612 8.86255L12.5192 13.7828Z"
                    fill="#20272C"
                  />
                </svg>
              </button>
            `
          : html``}
        <button
          id="lottie-play-button"
          @click=${(): void => {
            this.togglePlay();
          }}
          class=${isPlaying || isPaused
            ? `active ${this._hasMultipleAnimations ? 'btn-spacing-center' : 'btn-spacing-right'}`
            : `${this._hasMultipleAnimations ? 'btn-spacing-center' : 'btn-spacing-right'}`}
          aria-label="play / pause animation"
        >
          ${isPlaying
            ? html`
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.99996 2C3.26358 2 2.66663 2.59695 2.66663 3.33333V12.6667C2.66663 13.403 3.26358 14 3.99996 14H5.33329C6.06967 14 6.66663 13.403 6.66663 12.6667V3.33333C6.66663 2.59695 6.06967 2 5.33329 2H3.99996Z"
                    fill="#20272C"
                  />
                  <path
                    d="M10.6666 2C9.93025 2 9.33329 2.59695 9.33329 3.33333V12.6667C9.33329 13.403 9.93025 14 10.6666 14H12C12.7363 14 13.3333 13.403 13.3333 12.6667V3.33333C13.3333 2.59695 12.7363 2 12 2H10.6666Z"
                    fill="#20272C"
                  />
                </svg>
              `
            : html`
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M3.33337 3.46787C3.33337 2.52312 4.35948 1.93558 5.17426 2.41379L12.8961 6.94592C13.7009 7.41824 13.7009 8.58176 12.8961 9.05408L5.17426 13.5862C4.35948 14.0644 3.33337 13.4769 3.33337 12.5321V3.46787Z"
                    fill="#20272C"
                  />
                </svg>
              `}
        </button>
        ${this._hasMultipleAnimations
          ? html`
              <button @click=${(): void => this.next()} aria-label="Next animation" class="btn-spacing-right">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M14.3336 2.5C14.3336 2.22386 14.1097 2 13.8336 2C13.5574 2 13.3336 2.22386 13.3336 2.5V13.5C13.3336 13.7761 13.5574 14 13.8336 14C14.1097 14 14.3336 13.7761 14.3336 13.5V2.5ZM3.50618 2.21722C2.83954 1.82595 2 2.30667 2 3.07965V12.9201C2 13.6931 2.83954 14.1738 3.50618 13.7825L11.8893 8.86231C12.5477 8.47586 12.5477 7.52389 11.8893 7.13745L3.50618 2.21722Z"
                    fill="#20272C"
                  />
                </svg>
              </button>
            `
          : html``}
        <input
          id="lottie-seeker-input"
          class="seeker ${this._dotLottieCommonPlayer?.direction === -1 ? 'to-left' : ''}"
          type="range"
          min="0"
          step="1"
          max="100"
          .value=${this._seeker}
          @input=${(event: Event): void => this._handleSeekChange(event)}
          @mousedown=${(): void => {
            this._freeze();
          }}
          @mouseup=${(): void => {
            this._dotLottieCommonPlayer?.unfreeze();
          }}
          aria-valuemin="1"
          aria-valuemax="100"
          role="slider"
          aria-valuenow=${this._seeker}
          aria-label="lottie-seek-input"
          style=${`--seeker: ${this._seeker}`}
        />
        <button
          id="lottie-loop-toggle"
          @click=${(): void => this.toggleLooping()}
          class=${this._dotLottieCommonPlayer?.loop ? 'active btn-spacing-left' : 'btn-spacing-left'}
          aria-label="loop-toggle"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10.8654 2.31319C11.0607 2.11793 11.3772 2.11793 11.5725 2.31319L13.4581 4.19881C13.6534 4.39407 13.6534 4.71066 13.4581 4.90592L11.5725 6.79154C11.3772 6.9868 11.0607 6.9868 10.8654 6.79154C10.6701 6.59628 10.6701 6.27969 10.8654 6.08443L11.6162 5.33362H4V6.66695C4 7.03514 3.70152 7.33362 3.33333 7.33362C2.96514 7.33362 2.66666 7.03514 2.66666 6.66695L2.66666 4.66695C2.66666 4.29876 2.96514 4.00028 3.33333 4.00028H11.8454L10.8654 3.0203C10.6701 2.82504 10.6701 2.50846 10.8654 2.31319Z"
              fill="currentColor"
            />
            <path
              d="M12.4375 11.9999C12.8057 11.9999 13.1042 11.7014 13.1042 11.3332V9.33321C13.1042 8.96502 12.8057 8.66655 12.4375 8.66655C12.0693 8.66655 11.7708 8.96502 11.7708 9.33321V10.6665H4.15462L4.90543 9.91573C5.10069 9.72047 5.10069 9.40389 4.90543 9.20862C4.71017 9.01336 4.39359 9.01336 4.19832 9.20862L2.31271 11.0942C2.11744 11.2895 2.11744 11.6061 2.31271 11.8013L4.19832 13.687C4.39359 13.8822 4.71017 13.8822 4.90543 13.687C5.10069 13.4917 5.10069 13.1751 4.90543 12.9799L3.92545 11.9999H12.4375Z"
              fill="currentColor"
            />
          </svg>
        </button>
        ${this._hasMultipleAnimations || this._hasMultipleThemes || this._hasMultipleStates
          ? html`
              <button
                id="lottie-animation-options"
                @click=${(): void => {
                  this._popoverIsOpen = !this._popoverIsOpen;
                  this.requestUpdate();
                }}
                aria-label="options"
                class="btn-spacing-right"
                style=${`background-color: ${
                  this._popoverIsOpen ? 'var(--lottie-player-toolbar-icon-hover-color)' : ''
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.33337 11.6666C7.78109 11.6666 7.33337 12.1143 7.33337 12.6666C7.33337 13.2189 7.78109 13.6666 8.33337 13.6666C8.88566 13.6666 9.33337 13.2189 9.33337 12.6666C9.33337 12.1143 8.88566 11.6666 8.33337 11.6666Z"
                    fill="#20272C"
                  />
                  <path
                    d="M7.33337 7.99992C7.33337 7.44763 7.78109 6.99992 8.33337 6.99992C8.88566 6.99992 9.33338 7.44763 9.33338 7.99992C9.33338 8.5522 8.88566 8.99992 8.33337 8.99992C7.78109 8.99992 7.33337 8.5522 7.33337 7.99992Z"
                    fill="#20272C"
                  />
                  <path
                    d="M7.33337 3.33325C7.33337 2.78097 7.78109 2.33325 8.33337 2.33325C8.88566 2.33325 9.33338 2.78097 9.33338 3.33325C9.33338 3.88554 8.88566 4.33325 8.33337 4.33325C7.78109 4.33325 7.33337 3.88554 7.33337 3.33325Z"
                    fill="#20272C"
                  />
                </svg>
              </button>
            `
          : html``}
      </div>
      ${this._popoverIsOpen
        ? html`
            <div
              id="popover"
              class="popover"
              tabindex="0"
              aria-label="lottie animations themes popover"
              style="min-height: ${this.themes().length > 0 ? '84px' : 'auto'}"
            >
              ${!this._animationsTabIsOpen && !this._styleTabIsOpen && !this._statesTabIsOpen
                ? html`
                    <button
                      class="popover-button"
                      tabindex="0"
                      aria-label="animations"
                      @click=${(): void => {
                        this._animationsTabIsOpen = !this._animationsTabIsOpen;
                        this.requestUpdate();
                      }}
                      @keydown=${(key: KeyboardEvent): void => {
                        if (key.code === 'Space' || key.code === 'Enter') {
                          this._animationsTabIsOpen = !this._animationsTabIsOpen;
                          this.requestUpdate();
                        }
                      }}
                    >
                      <div class="popover-button-text">Animations</div>
                      <div>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M10.4697 17.5303C10.1768 17.2374 10.1768 16.7626 10.4697 16.4697L14.9393 12L10.4697 7.53033C10.1768 7.23744 10.1768 6.76256 10.4697 6.46967C10.7626 6.17678 11.2374 6.17678 11.5303 6.46967L16.5303 11.4697C16.8232 11.7626 16.8232 12.2374 16.5303 12.5303L11.5303 17.5303C11.2374 17.8232 10.7626 17.8232 10.4697 17.5303Z"
                            fill="#4C5863"
                          />
                        </svg>
                      </div>
                    </button>
                  `
                : html``}
              ${this._hasMultipleThemes && !this._styleTabIsOpen && !this._animationsTabIsOpen && !this._statesTabIsOpen
                ? html` <button
                    class="popover-button"
                    aria-label="Themes"
                    @click=${(): void => {
                      this._styleTabIsOpen = !this._styleTabIsOpen;
                      this.requestUpdate();
                    }}
                    @keydown=${(key: KeyboardEvent): void => {
                      if (key.code === 'Space' || key.code === 'Enter') {
                        this._styleTabIsOpen = !this._styleTabIsOpen;
                        this.requestUpdate();
                      }
                      // eslint-disable-next-line no-secrets/no-secrets
                    }}
                  >
                    <div class="popover-button-text">Themes</div>
                    <div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M10.4697 17.5303C10.1768 17.2374 10.1768 16.7626 10.4697 16.4697L14.9393 12L10.4697 7.53033C10.1768 7.23744 10.1768 6.76256 10.4697 6.46967C10.7626 6.17678 11.2374 6.17678 11.5303 6.46967L16.5303 11.4697C16.8232 11.7626 16.8232 12.2374 16.5303 12.5303L11.5303 17.5303C11.2374 17.8232 10.7626 17.8232 10.4697 17.5303Z"
                          fill="#4C5863"
                        />
                      </svg>
                    </div>
                  </button>`
                : ''}
              ${this._hasMultipleStates && !this._styleTabIsOpen && !this._animationsTabIsOpen && !this._statesTabIsOpen
                ? html` <button
                    class="popover-button"
                    aria-label="States"
                    @click=${(): void => {
                      this._statesTabIsOpen = !this._statesTabIsOpen;
                      this.requestUpdate();
                    }}
                    @keydown=${(key: KeyboardEvent): void => {
                      if (key.code === 'Space' || key.code === 'Enter') {
                        this._statesTabIsOpen = !this._statesTabIsOpen;
                        this.requestUpdate();
                      }
                    }}
                  >
                    <div class="popover-button-text">States</div>
                    <div>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M10.4697 17.5303C10.1768 17.2374 10.1768 16.7626 10.4697 16.4697L14.9393 12L10.4697 7.53033C10.1768 7.23744 10.1768 6.76256 10.4697 6.46967C10.7626 6.17678 11.2374 6.17678 11.5303 6.46967L16.5303 11.4697C16.8232 11.7626 16.8232 12.2374 16.5303 12.5303L11.5303 17.5303C11.2374 17.8232 10.7626 17.8232 10.4697 17.5303Z"
                          fill="#4C5863"
                        />
                      </svg>
                    </div>
                  </button>`
                : ''}
              ${this._animationsTabIsOpen
                ? html`<button
                      class="option-title-button"
                      aria-label="Back to main popover menu"
                      @click=${(): void => {
                        this._animationsTabIsOpen = !this._animationsTabIsOpen;
                        this.requestUpdate();
                      }}
                    >
                      <div class="option-title-chevron">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M13.5303 6.46967C13.8232 6.76256 13.8232 7.23744 13.5303 7.53033L9.06066 12L13.5303 16.4697C13.8232 16.7626 13.8232 17.2374 13.5303 17.5303C13.2374 17.8232 12.7626 17.8232 12.4697 17.5303L7.46967 12.5303C7.17678 12.2374 7.17678 11.7626 7.46967 11.4697L12.4697 6.46967C12.7626 6.17678 13.2374 6.17678 13.5303 6.46967Z"
                            fill="#20272C"
                          />
                        </svg>
                      </div>
                      <div>Animations</div>
                    </button>
                    <div class="option-title-separator"></div>
                    <div class="option-row">
                      <ul>
                        ${this.animations().map((animationName) => {
                          return html`
                            <li>
                              <button
                                class="option-button"
                                aria-label=${`${animationName}`}
                                @click=${(): void => {
                                  this._animationsTabIsOpen = !this._animationsTabIsOpen;
                                  this._popoverIsOpen = !this._popoverIsOpen;
                                  this.play(animationName);
                                  this.requestUpdate();
                                }}
                                @keydown=${(key: KeyboardEvent): void => {
                                  if (key.code === 'Space' || key.code === 'Enter') {
                                    this._animationsTabIsOpen = !this._animationsTabIsOpen;
                                    this._popoverIsOpen = !this._popoverIsOpen;
                                    this.play(animationName);
                                    this.requestUpdate();
                                  }
                                }}
                              >
                                <div class="option-tick">
                                  ${this.currentAnimation() === animationName
                                    ? html`
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M20.5281 5.9372C20.821 6.23009 20.821 6.70497 20.5281 6.99786L9.46297 18.063C9.32168 18.2043 9.12985 18.2833 8.93004 18.2826C8.73023 18.2819 8.53895 18.2015 8.39864 18.0593L3.46795 13.0596C3.1771 12.7647 3.1804 12.2898 3.47532 11.999C3.77024 11.7081 4.2451 11.7114 4.53595 12.0063L8.93634 16.4683L19.4675 5.9372C19.7604 5.64431 20.2352 5.64431 20.5281 5.9372Z"
                                            fill="#20272C"
                                          />
                                        </svg>
                                      `
                                    : html`<div style="width: 24px; height: 24px"></div>`}
                                </div>
                                <div>${animationName}</div>
                              </button>
                            </li>
                          `;
                        })}
                      </ul>
                    </div> `
                : html``}
              ${this._styleTabIsOpen
                ? html`<div class="option-title-themes-row">
                      <button
                        class="option-title-button themes"
                        aria-label="Back to main popover menu"
                        @click=${(): void => {
                          this._styleTabIsOpen = !this._styleTabIsOpen;
                          this.requestUpdate();
                        }}
                      >
                        <div class="option-title-chevron">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M13.5303 6.46967C13.8232 6.76256 13.8232 7.23744 13.5303 7.53033L9.06066 12L13.5303 16.4697C13.8232 16.7626 13.8232 17.2374 13.5303 17.5303C13.2374 17.8232 12.7626 17.8232 12.4697 17.5303L7.46967 12.5303C7.17678 12.2374 7.17678 11.7626 7.46967 11.4697L12.4697 6.46967C12.7626 6.17678 13.2374 6.17678 13.5303 6.46967Z"
                              fill="#20272C"
                            />
                          </svg>
                        </div>
                        <div class="option-title-text">Themes</div>
                        ${this._dotLottieCommonPlayer?.defaultTheme === ''
                          ? html``
                          : html`
                              <button
                                class="reset-btn"
                                @click=${(): void => {
                                  this.setTheme('');
                                  this.requestUpdate();
                                }}
                              >
                                Reset
                              </button>
                            `}
                      </button>
                    </div>
                    <div class="option-title-separator"></div>
                    <div class="option-row">
                      <ul>
                        ${this._themesForCurrentAnimation.map((themeName) => {
                          return html`
                            <li>
                              <button
                                class="option-button"
                                aria-label="${themeName.id}"
                                @click=${(): void => {
                                  this.setTheme(themeName.id);
                                }}
                                @keydown=${(key: KeyboardEvent): void => {
                                  if (key.code === 'Space' || key.code === 'Enter') {
                                    this.setTheme(themeName.id);
                                  }
                                }}
                              >
                                <div class="option-tick">
                                  ${this.getDefaultTheme() === themeName.id
                                    ? html`
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M20.5281 5.9372C20.821 6.23009 20.821 6.70497 20.5281 6.99786L9.46297 18.063C9.32168 18.2043 9.12985 18.2833 8.93004 18.2826C8.73023 18.2819 8.53895 18.2015 8.39864 18.0593L3.46795 13.0596C3.1771 12.7647 3.1804 12.2898 3.47532 11.999C3.77024 11.7081 4.2451 11.7114 4.53595 12.0063L8.93634 16.4683L19.4675 5.9372C19.7604 5.64431 20.2352 5.64431 20.5281 5.9372Z"
                                            fill="#20272C"
                                          />
                                        </svg>
                                      `
                                    : html`<div style="width: 24px; height: 24px"></div>`}
                                </div>
                                <div>${themeName.id}</div>
                              </button>
                            </li>
                          `;
                        })}
                      </ul>
                    </div>`
                : html``}
              ${this._statesTabIsOpen
                ? html`<div class="option-title-themes-row">
                      <button
                        class="option-title-button themes"
                        aria-label="Back to main popover menu"
                        @click=${(): void => {
                          this._statesTabIsOpen = !this._statesTabIsOpen;
                          this.requestUpdate();
                        }}
                      >
                        <div class="option-title-chevron">
                          <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fill-rule="evenodd"
                              clip-rule="evenodd"
                              d="M13.5303 6.46967C13.8232 6.76256 13.8232 7.23744 13.5303 7.53033L9.06066 12L13.5303 16.4697C13.8232 16.7626 13.8232 17.2374 13.5303 17.5303C13.2374 17.8232 12.7626 17.8232 12.4697 17.5303L7.46967 12.5303C7.17678 12.2374 7.17678 11.7626 7.46967 11.4697L12.4697 6.46967C12.7626 6.17678 13.2374 6.17678 13.5303 6.46967Z"
                              fill="#20272C"
                            />
                          </svg>
                        </div>
                        <div class="option-title-text">States</div>
                        <button
                          class="reset-btn"
                          @click=${(): void => {
                            this.exitInteractiveMode();
                            this.requestUpdate();
                          }}
                        >
                          Reset
                        </button>
                      </button>
                    </div>
                    <div class="option-title-separator"></div>
                    <div class="option-row">
                      <ul>
                        ${this._statesForCurrentAnimation.map((stateName) => {
                          return html`
                            <li>
                              <button
                                class="option-button"
                                aria-label="${stateName}"
                                @click=${(): void => {
                                  this.enterInteractiveMode(stateName);
                                }}
                                @keydown=${(key: KeyboardEvent): void => {
                                  if (key.code === 'Space' || key.code === 'Enter') {
                                    this.enterInteractiveMode(stateName);
                                  }
                                }}
                              >
                                <div class="option-tick">
                                  ${this.getActiveStateMachine() === stateName
                                    ? html`
                                        <svg
                                          width="24"
                                          height="24"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M20.5281 5.9372C20.821 6.23009 20.821 6.70497 20.5281 6.99786L9.46297 18.063C9.32168 18.2043 9.12985 18.2833 8.93004 18.2826C8.73023 18.2819 8.53895 18.2015 8.39864 18.0593L3.46795 13.0596C3.1771 12.7647 3.1804 12.2898 3.47532 11.999C3.77024 11.7081 4.2451 11.7114 4.53595 12.0063L8.93634 16.4683L19.4675 5.9372C19.7604 5.64431 20.2352 5.64431 20.5281 5.9372Z"
                                            fill="#20272C"
                                          />
                                        </svg>
                                      `
                                    : html`<div style="width: 24px; height: 24px"></div>`}
                                </div>
                                <div>${stateName}</div>
                              </button>
                            </li>
                          `;
                        })}
                      </ul>
                    </div>`
                : html``}
            </div>
          `
        : html``}
    `;
  }

  public override render(): TemplateResult | void {
    const className: string = this.controls ? 'main controls' : 'main';
    const animationClass: string = this.controls ? 'animation controls' : 'animation';

    return html`
      <div id="animation-container" class=${className} lang="en" role="img" aria-label="lottie-animation-container">
        <div id="animation" class=${animationClass} style="background:${this.background};">
          ${this._dotLottieCommonPlayer?.currentState === PlayerState.Error
            ? html` <div class="error">⚠️</div> `
            : undefined}
        </div>
        ${this.controls ? this.renderControls() : undefined}
      </div>
    `;
  }
}

if (!customElements.get(ELEMENT_NAME)) {
  customElements.define(ELEMENT_NAME, DotLottiePlayer);
}

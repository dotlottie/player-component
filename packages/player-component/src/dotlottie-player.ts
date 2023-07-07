/**
 * Copyright 2023 Design Barn Inc.
 */

import type { RendererType, DotLottiePlayerState, PlaybackOptions, Manifest } from '@dotlottie/common';
import {
  DotLottiePlayer as DotLottieCommonPlayer,
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

  @state()
  private _seeker: number = 0;

  private _dotLottieCommonPlayer: DotLottieCommonPlayer | undefined;

  private _io?: IntersectionObserver;

  private _loop?: boolean | number;

  private _renderer?: RendererType = 'svg';

  private _unsubscribeListeners?: () => void;

  // Controls state
  private _hasMultipleAnimations = false;

  private _hasStyles = false;

  private _popoverIsOpen = false;

  private _animationsTabIsOpen = false;

  private _styleTabIsOpen = false;

  private _animationNames: string[] = [];

  private _styleNames: string[] = [];

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
    });

    await this._dotLottieCommonPlayer.load(playbackOptions);

    /**
     * Controls state init
     */
    this._hasMultipleAnimations = this.animationCount() > 1;

    const manifest = this.getManifest();

    if (manifest && manifest.themes) {
      this._hasStyles = manifest.themes.length >= 1;
    }

    this._animationNames = this.animations();

    this._styleNames = this.styles();

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

    return this._dotLottieCommonPlayer.animations.size;
  }

  /**
   * @returns The ids of all the animationanimations
   */
  public animations(): string[] {
    if (!this._dotLottieCommonPlayer) return [];

    return Array.from(this._dotLottieCommonPlayer.animations.keys());
  }

  /**
   * @returns The ids of all the styles
   */
  public styles(): string[] {
    if (!this._dotLottieCommonPlayer) return [];

    return Array.from(this._dotLottieCommonPlayer.themes.keys());
  }

  public currentTheme(): string {
    if (!this._dotLottieCommonPlayer) return '';

    return this._dotLottieCommonPlayer.defaultTheme;
  }

  public currentAnimation(): string {
    if (!this._dotLottieCommonPlayer) return '';

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
   * Get theme
   */
  public getTheme(): string | undefined {
    return this._dotLottieCommonPlayer?.defaultTheme;
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
  }

  protected renderControls(): TemplateResult | undefined {
    const isPlaying: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Playing;
    const isPaused: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Paused;

    return html`
      <div id="lottie-controls" aria-label="lottie-animation-controls" class="toolbar">
        ${this._hasMultipleAnimations
          ? html`
              <button
                style="align-items: center; width: 24px; height: 24px;"
                @click=${(): void => this.previous()}
                tabindex="0"
                aria-label="previous-animation"
              >
                <svg width="14" height="12" viewBox="0 0 14 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M0.692139 11.5C0.692139 11.7761 0.915996 12 1.19214 12C1.46828 12 1.69214 11.7761 1.69214 11.5L1.69214 0.5C1.69214 0.223858 1.46828 0 1.19214 0C0.915997 0 0.692139 0.223858 0.692139 0.5V11.5ZM11.5192 11.7828C12.1859 12.174 13.0254 11.6933 13.0254 10.9204L13.0254 1.0799C13.0254 0.306915 12.1859 -0.173798 11.5192 0.217468L3.13612 5.13769C2.47769 5.52414 2.47769 6.4761 3.13612 6.86255L11.5192 11.7828Z"
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
          class=${isPlaying || isPaused ? 'active' : ''}
          style="align-items:center; width: 24px; height: 24px;"
          tabindex="0"
          aria-label="play-pause"
        >
          ${isPlaying
            ? html`
                <svg width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M14.016 5.016H18v13.969h-3.984V5.016zM6 18.984V5.015h3.984v13.969H6z" />
                </svg>
              `
            : html`
                <svg width="24" height="24" aria-hidden="true" focusable="false">
                  <path d="M8.016 5.016L18.985 12 8.016 18.984V5.015z" />
                </svg>
              `}
        </button>
        ${this._hasMultipleAnimations
          ? html`
              <button
                style="align-items: center; width: 24px; height: 24px;"
                @click=${(): void => this.next()}
                tabindex="0"
                aria-label="previous-animation"
              >
                <svg width="13" height="12" viewBox="0 0 13 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12.3336 0.5C12.3336 0.223858 12.1097 0 11.8336 0C11.5574 0 11.3336 0.223858 11.3336 0.5V11.5C11.3336 11.7761 11.5574 12 11.8336 12C12.1097 12 12.3336 11.7761 12.3336 11.5V0.5ZM1.50618 0.217221C0.839538 -0.174045 0 0.306668 0 1.07965V10.9201C0 11.6931 0.839538 12.1738 1.50618 11.7825L9.88928 6.86231C10.5477 6.47586 10.5477 5.52389 9.88927 5.13745L1.50618 0.217221Z"
                    fill="#20272C"
                  />
                </svg>
              </button>
            `
          : html``}
        <input
          id="lottie-seeker-input"
          class="seeker"
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
          tabindex="0"
          aria-label="lottie-seek-input"
        />
        <button
          id="lottie-loop-toggle"
          @click=${(): void => this.toggleLooping()}
          class=${this._loop ? 'active' : ''}
          style="align-items:center; width: 24px; height: 24px;"
          tabindex="0"
          aria-label="loop-toggle"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path
              d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
            />
          </svg>
        </button>
        ${this._hasMultipleAnimations
          ? html`
              <button
                @click=${(): void => {
                  this._popoverIsOpen = !this._popoverIsOpen;
                  this.requestUpdate();
                }}
                style="align-items: center; margin-left: 4px; width: 24px; height: 24px;"
                tabindex="0"
                aria-label="options"
              >
                <svg width="3" height="12" viewBox="0 0 3 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M1.33337 9.66658C0.78109 9.66658 0.333374 10.1143 0.333374 10.6666C0.333374 11.2189 0.781089 11.6666 1.33337 11.6666C1.88566 11.6666 2.33337 11.2189 2.33337 10.6666C2.33337 10.1143 1.88566 9.66658 1.33337 9.66658Z"
                    fill="#20272C"
                  />
                  <path
                    d="M0.333374 5.99992C0.333374 5.44763 0.78109 4.99992 1.33337 4.99992C1.88566 4.99992 2.33338 5.44763 2.33338 5.99992C2.33338 6.5522 1.88566 6.99992 1.33337 6.99992C0.78109 6.99992 0.333374 6.5522 0.333374 5.99992Z"
                    fill="#20272C"
                  />
                  <path
                    d="M0.333375 1.33325C0.333375 0.780968 0.78109 0.333252 1.33337 0.333252C1.88566 0.333252 2.33338 0.780968 2.33338 1.33325C2.33338 1.88554 1.88566 2.33325 1.33337 2.33325C0.78109 2.33325 0.333374 1.88554 0.333375 1.33325Z"
                    fill="#20272C"
                  />
                </svg>
              </button>
            `
          : html``}
        ${this._popoverIsOpen
          ? html`
              <div class="popover">
                ${!this._animationsTabIsOpen && !this._styleTabIsOpen
                  ? html`
                      <div
                        class="popover-button"
                        @click=${(): void => {
                          this._animationsTabIsOpen = !this._animationsTabIsOpen;
                          this.requestUpdate();
                        }}
                      >
                        <div class="popover-button-text">Animations</div>
                        <div>
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
                              d="M10.4697 17.5303C10.1768 17.2374 10.1768 16.7626 10.4697 16.4697L14.9393 12L10.4697 7.53033C10.1768 7.23744 10.1768 6.76256 10.4697 6.46967C10.7626 6.17678 11.2374 6.17678 11.5303 6.46967L16.5303 11.4697C16.8232 11.7626 16.8232 12.2374 16.5303 12.5303L11.5303 17.5303C11.2374 17.8232 10.7626 17.8232 10.4697 17.5303Z"
                              fill="#4C5863"
                            />
                          </svg>
                        </div>
                      </div>
                    `
                  : html``}
                ${this._hasStyles && !this._styleTabIsOpen && !this._animationsTabIsOpen
                  ? html` <div
                      class="popover-button"
                      @click=${(): void => {
                        this._styleTabIsOpen = !this._styleTabIsOpen;
                        this.requestUpdate();
                      }}
                    >
                      <div class="popover-button-text">Styles</div>
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
                    </div>`
                  : ''}
                ${this._animationsTabIsOpen
                  ? html`<div
                        class="option-title-button"
                        @click=${(): void => {
                          this._animationsTabIsOpen = !this._animationsTabIsOpen;
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
                        <div>Animations</div>
                      </div>
                      <div class="option-title-separator"></div>
                      <div class="option-row">
                        ${this._animationNames.map((animationName) => {
                          return html`
                            <div
                              class="option-button"
                              @click=${(): void => {
                                this._animationsTabIsOpen = !this._animationsTabIsOpen;
                                this._popoverIsOpen = !this._popoverIsOpen;
                                this.play(animationName);
                                this.requestUpdate();
                              }}
                            >
                              <div class="option-tick">
                                ${this.currentAnimation() === animationName
                                  ? html` <span>
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
                                    </span>`
                                  : html``}
                              </div>
                              <div>${animationName}</div>
                            </div>
                          `;
                        })}
                      </div> `
                  : html``}
                ${this._styleTabIsOpen
                  ? html`<div
                        class="option-title-button"
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
                        <div>Styles</div>
                      </div>
                      <div class="option-title-separator"></div>
                      <div class="option-row">
                        ${this._styleNames.map((styleName) => {
                          return html`
                            <div
                              class="option-button"
                              @click=${(): void => {
                                // this._animationsTabIsOpen = !this._animationsTabIsOpen;
                                // this._popoverIsOpen = !this._popoverIsOpen;
                                this.setTheme(styleName);
                              }}
                            >
                              <div class="option-tick">
                                ${this.currentTheme() === styleName
                                  ? html` <span>
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
                                    </span>`
                                  : html``}
                              </div>
                              <div>${styleName}</div>
                            </div>
                          `;
                        })}
                      </div>`
                  : html``}
              </div>
            `
          : html``}
      </div>
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

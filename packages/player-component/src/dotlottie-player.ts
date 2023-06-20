/**
 * Copyright 2023 Design Barn Inc.
 */

import type { CSSResult, TemplateResult } from 'lit';
import { LitElement, html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import type { AnimationItem } from 'lottie-web';

import type { RendererType, DotLottiePlayerState, PlaybackOptions, Manifest } from '../../common';
import {
  DotLottiePlayer as DotLottieCommonPlayer,
  PlayerState,
  PlayMode,
  PlayerEvents,
  logWarning,
  createError,
  DEFAULT_STATE,
} from '../../common';
import pkg from '../package.json';

import styles from './dotlottie-player.styles';

export interface Versions {
  dotLottiePlayerVersion: string;
  lottieWebVersion: string;
}

/**
 * DotLottiePlayer web component class
 */
@customElement('dotlottie-player')
export class DotLottiePlayer extends LitElement {
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
   * Handle visibility change events.
   */
  private _onVisibilityChange(): void {
    if (!this._dotLottieCommonPlayer) return;

    if (document.hidden && this._dotLottieCommonPlayer.currentState === PlayerState.Playing) {
      this._dotLottieCommonPlayer.freeze();
    } else if (this._dotLottieCommonPlayer.currentState === PlayerState.Frozen) {
      this._dotLottieCommonPlayer.play();
    }
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
    });

    await this._dotLottieCommonPlayer.load(playbackOptions);

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
      lottieWebVersion: `${pkg.dependencies['lottie-web']}`,
      dotLottiePlayerVersion: `${pkg.version}`,
    };
  }

  /**
   * Play the previous animation. The order is taken from the manifest.
   */
  public previous(playbackOptions?: PlaybackOptions): void {
    this._dotLottieCommonPlayer?.previous(playbackOptions);
  }

  /**
   * Play the next animation. The order is taken from the manifest.
   */
  public next(playbackOptions?: PlaybackOptions): void {
    this._dotLottieCommonPlayer?.next(playbackOptions);
  }

  /**
   * Reset to the initial state defined in the manifest.
   */
  public reset(): void {
    this._dotLottieCommonPlayer?.reset();
  }

  public play(targetAnimation?: string | number, playbackOptions?: PlaybackOptions): void {
    if (!this._dotLottieCommonPlayer) {
      return;
    }

    this._dotLottieCommonPlayer.play(targetAnimation, playbackOptions);
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

    // Add listener for Visibility API's change event.
    if (typeof document.hidden !== 'undefined') {
      document.addEventListener('visibilitychange', () => this._onVisibilityChange());
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

    // Remove the attached Visibility API's change event listener.
    document.removeEventListener('visibilitychange', () => this._onVisibilityChange());

    this._unsubscribeListeners?.();
  }

  protected renderControls(): TemplateResult | undefined {
    const isPlaying: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Playing;
    const isPaused: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Paused;
    const isStopped: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Stopped;

    return html`
      <div id="lottie-controls" aria-label="lottie-animation-controls" class="toolbar">
        <button
          id="lottie-play-button"
          @click=${(): void => this.togglePlay()}
          class=${isPlaying || isPaused ? 'active' : ''}
          style="align-items:center;"
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
        <button
          id="lottie-stop-button"
          @click=${(): void => this.stop()}
          class=${isStopped ? 'active' : ''}
          style="align-items:center;"
          tabindex="0"
          aria-label="stop"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path d="M6 6h12v12H6V6z" />
          </svg>
        </button>
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
          style="align-items:center;"
          tabindex="0"
          aria-label="loop-toggle"
        >
          <svg width="24" height="24" aria-hidden="true" focusable="false">
            <path
              d="M17.016 17.016v-4.031h1.969v6h-12v3l-3.984-3.984 3.984-3.984v3h10.031zM6.984 6.984v4.031H5.015v-6h12v-3l3.984 3.984-3.984 3.984v-3H6.984z"
            />
          </svg>
        </button>
      </div>
    `;
  }

  public override render(): TemplateResult | void {
    const className: string = this.controls ? 'main controls' : 'main';
    const animationClass: string = this.controls ? 'animation controls' : 'animation';

    return html`
      <div id="animation-container" class=${className} lang="en" role="img">
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

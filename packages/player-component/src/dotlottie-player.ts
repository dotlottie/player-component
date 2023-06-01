import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TemplateResult } from 'lit/html.js';
import type { AnimationItem } from 'lottie-web';
import styles from './dotlottie-player.styles';
import { DotLottiePlayer as DotLottieCommonPlayer } from 'common';
import { PlayerState, PlayMode } from 'common';

import pkg from '../package.json';
import { createError, warn } from './utils';
import { DotLottiePlayerState } from 'common';
import { PlayerEvents } from 'common';
import { PlaybackOptions } from 'common';
import { Manifest } from 'common';

export interface Versions {
  lottieWebVersion: string;
  dotLottiePlayerVersion: string;
}

/**
 * DotLottiePlayer web component class
 *
 * @export
 * @class DotLottiePlayer
 * @extends {LitElement}
 */
@customElement('dotlottie-player')
export class DotLottiePlayer extends LitElement {
  /**
   * Animation container.
   */
  @query('.animation')
  protected container!: HTMLElement;

  /**
   * Play mode.
   */
  @property()
  public mode: PlayMode = PlayMode.Normal;

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

  /**
   * Player state.
   */
  // @property({ type: String })
  // public currentState: PlayerState = PlayerState.Loading;

  @property()
  public seeker: any;

  @property()
  public intermission = 1;

  /**
   * Animation id as string or index to play on load.
   */
  @property({ type: String })
  public activeAnimationId?: string | null = null;

  // static get properties
  public static getProperties() {
    return {
      mode: { type: String },
      autoplay: { type: Boolean },
      background: { type: String },
      controls: { type: Boolean },
      direction: { type: Number },
      hover: { type: Boolean },
      loop: { type: String },
      renderer: { type: String },
      speed: { type: Number },
      src: { type: String },
      currentState: { type: String },
      seeker: { type: Object },
      intermission: { type: Number },
      activeAnimationId: { type: String },
    };
  }

  private _dotLottieCommonPlayer: DotLottieCommonPlayer | undefined;
  private _io?: any;
  private _loop?: boolean;
  private _count?: number;

  constructor() {
    super();
  }

  /**
   * @param loop - either a string representing a boolean or a number of loops to play
   * @returns boolean - if loop was activated or not
   */
  private _parseLoop(loop: string): boolean {
    const loopNb = parseInt(loop, 10);

    if (Number.isInteger(loopNb) && loopNb > 0) {
      this._count = loopNb;
      this._loop = true;

      return true;
    } else if (typeof loop === 'string' && ['true', 'false'].includes(loop)) {
      this._loop = loop === 'true';

      return this._loop;
    } else {
      warn('loop must be a positive integer or a boolean');
    }

    return false;
  }

  /**
   * Handle visibility change events.
   */
  private _onVisibilityChange(): void {
    if (!this._dotLottieCommonPlayer)
      return ;

    if (document.hidden && this._dotLottieCommonPlayer?.currentState === PlayerState.Playing) {
      this._dotLottieCommonPlayer.freeze();
    } else if (this._dotLottieCommonPlayer?.currentState === PlayerState.Frozen) {
      this._dotLottieCommonPlayer.play();
    }
  }

  /**
   * Handles click and drag actions on the progress track.
   */
  private _handleSeekChange(e: any): void {
    if (!this._dotLottieCommonPlayer || isNaN(e.target.value)) {
      return;
    }

    const frame: number = (e.target.value / 100) * this._dotLottieCommonPlayer.totalFrames;

    this.seek(frame);
  }

  private _initListeners(): void {
    // Because we fetch the data ourselves, fire the load event
    this.dispatchEvent(new CustomEvent(PlayerEvents.DataReady));

    if (this._dotLottieCommonPlayer === undefined) {
      warn('dotLottie-player-component not initialized - cannot add event listeners');
      
      return ;
    }

    // Calculate and save the current progress of the animation
    this._dotLottieCommonPlayer.state.subscribe( (state: DotLottiePlayerState) => {
      this.seeker = (state.frame / this._dotLottieCommonPlayer.totalFrames) * 100;
        
      this.dispatchEvent(
        new CustomEvent(PlayerEvents.Frame, {
          detail: {
            frame: state.frame,
            seeker: this.seeker,
          },
        }),
      );
    })

    // Handle animation play complete
    this._dotLottieCommonPlayer.addEventListener('complete', () => {
      if (this._dotLottieCommonPlayer?.currentState !== PlayerState.Playing) {
        this.dispatchEvent(new CustomEvent(PlayerEvents.Complete));
      }
    });

    // Handle lottie-web ready event
    this._dotLottieCommonPlayer.addEventListener('DOMLoaded', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.Ready));
    });

    // Handle animation data load complete
    this._dotLottieCommonPlayer.addEventListener('data_ready', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.DataReady));
    });

    // Set error state when animation load fail event triggers
    this._dotLottieCommonPlayer.addEventListener('data_failed', () => {

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

    this._dotLottieCommonPlayer = new DotLottieCommonPlayer(src, this.container, {
      renderer: this.renderer,
      rendererSettings: overrideRendererSettings ? overrideRendererSettings : 
      { 
            scaleMode: 'noScale',
            clearCanvas: false,
            progressiveLoad: true,
            hideOnTransparent: true,
      },
      hover: this.hover,
      loop: this._loop,
      direction: this.direction === 1 ? 1 : -1,
      speed: this.speed,
      intermission: this.intermission,
      playMode: this.mode,
      autoplay: this.hover ? false : this.autoplay,
      count: this._count ? this._count : 1,
    })

    await this._dotLottieCommonPlayer.load(playbackOptions);

    if (this._dotLottieCommonPlayer) {
      this._initListeners();
    } else {
      this._dotLottieCommonPlayer.s = PlayerState.Error;
      this.dispatchEvent(new CustomEvent(PlayerEvents.Error));

      throw createError('Player failed to initialize.');
    }    

    // // turn this in to lottie-web options
    // const lottieOptions: any = {
    //   container: this.container,
    //   loop: false,
    //   // Leave autoplay false as we call our own play method
    //   autoplay: false,
    //   renderer: this.renderer,
    //   rendererSettings: overrideRendererSettings
    //     ? overrideRendererSettings
    //     : {
    //         scaleMode: 'noScale',
    //         clearCanvas: false,
    //         progressiveLoad: true,
    //         hideOnTransparent: true,
    //       },
    // };

    // try {
    //   const srcParsed = this.parseSrc(src);
    //   let fetchedData = null;

    //   // if src is a string, fetch the file and load it
    //   if (typeof srcParsed === 'string') {
    //     fetchedData = await this._fetchFileAndLoad(srcParsed);
    //   } else if (typeof srcParsed === 'object') {
    //     if (!this.isLottie(srcParsed)) throw createError('Load method failing. Object is not a valid Lottie.');
    //   }

    //   if (this._lottie) {
    //     this._lottie.destroy();
    //   }

    //   // If there are playback options they override everything else
    //   if (playbackOptions !== undefined) {
    //     for (const [key, value] of Object.entries(playbackOptions)) {
    //       if (key === 'playMode') {
    //         value === 'normal' ? (this.mode = PlayMode.Normal) : (this.mode = PlayMode.Bounce);
    //       } else if (value !== undefined) {
    //         (this as any)[key] = value;
    //       }
    //     }
    //   } else if (
    //     this._activeAnimationIndex === 0 ||
    //     this._manifest.animations[this._activeAnimationIndex]?.id === this.activeAnimationId ||
    //     this._manifest.animations[this._activeAnimationIndex]?.id === this._manifest.activeAnimationId
    //   ) {
    //     // Check which props were defined by the user and use those, otherwise use what was defined for the animation on the manifest
    //     const animation = this._manifest.animations[this._activeAnimationIndex];
    //     const propNames = Object.keys(DotLottiePlayer.getProperties());
    //     const attrNames = Array.from(this.getAttributeNames());

    //     // We need to reset settings to the prop values first
    //     for (const attrName of attrNames) {
    //       const attrValue = this.getAttribute(attrName);

    //       if (attrValue) {
    //         (this as any)[attrName] = attrValue;
    //       }
    //     }

    //     // Filter properties that were defined in the manifest, but not in the props
    //     const undefinedProps = propNames.filter(
    //       (propName) =>
    //         !attrNames.includes(propName.toLowerCase()) &&
    //         this._manifest.animations[this._activeAnimationIndex]?.hasOwnProperty(propName),
    //     );

    //     for (const propName of undefinedProps) {
    //       const propValue = (animation as any)[propName];

    //       if (propValue !== undefined) {
    //         if (propName === 'playMode')
    //           propValue === 'normal' ? (this.mode = PlayMode.Normal) : (this.mode = PlayMode.Bounce);
    //         else (this as any)[propName] = propValue;
    //       }
    //     }
    //   } else {
    //     this._loadManifestOptions(this._activeAnimationIndex);
    //   }

    //   // Initialize lottie player and load animation
    //   this._lottie = lottie.loadAnimation({
    //     ...lottieOptions,
    //     animationData: fetchedData !== null ? fetchedData : srcParsed,
    //   });
    // } catch (err) {
    //   this.currentState = PlayerState.Error;

    //   this.dispatchEvent(new CustomEvent(PlayerEvents.Error));
    //   console.error(err);
    //   return;
    // }

    // if (this._lottie) {
    //   this._initListeners();

    //   // Set initial playback speed and direction
    //   this.setSpeed(this.speed);
    //   this.setDirection(this.direction);

    //   // Start playing if autoplay is enabled
    //   if (this.autoplay) {
    //     if (this.direction === -1) this.seek('99%');
    //     this.play();
    //   }
    // } else {
    //   this.currentState = PlayerState.Error;
    //   this.dispatchEvent(new CustomEvent(PlayerEvents.Error));

    //   throw createError('Player failed to initialize.');
    // }
  }

  /**
   * Get current animation's id
   */
  public getActiveId(): string | undefined {
    if (this._dotLottieCommonPlayer === undefined) return ;

    return this._dotLottieCommonPlayer.activeAnimationId;
  }

  /**
   * Get current animation's index
   */
  // public getActiveAnimationIndex(): number {
  //   return this._activeAnimationIndex;
  // }

  /**
   * @returns The current number of animations
   */
  public animationCount(): number {
    // if (this._animations) return this._animations.length;
    if (!this._dotLottieCommonPlayer) return 0;

    return this._dotLottieCommonPlayer.animations.size;
  }

  /**
   *
   * @returns The current manifest.
   */
  public getManifest(): Manifest | undefined {
    if (!this._dotLottieCommonPlayer) return ;

    return this._dotLottieCommonPlayer.getManifest();
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


  /**
   * todo
   * Start playing animation.
   */
  public play(targetAnimation?: string | number, playbackOptions?: PlaybackOptions): void {
    if (!this._dotLottieCommonPlayer) {
      return;
    }
    this._dotLottieCommonPlayer.play(targetAnimation, playbackOptions);
    return ;

    // this._requireAnimationsInTheManifest();
    // this._requireAnimationsToBeLoaded();

    // // If no animation is specified, play the current animation
    // if (targetAnimation === undefined) {
    //   this._lottie.play();
    //   this.currentState = PlayerState.Playing;

    //   this.dispatchEvent(new CustomEvent(PlayerEvents.Play));

    //   return;
    // }

    // this._requireAnimationsToBeLoaded();
    // this._requireAnimationsInTheManifest();

    // // If animation is specified, check if it exists and play it
    // if (targetAnimation !== undefined) {
    //   if (!this._animations) throw createError(`No animations have been loaded.`);
    //   this._requireAnimationsInTheManifest();

    //   if (typeof targetAnimation === 'string') {
    //     const animationIndex = this._manifest.animations.findIndex((element) => element.id === targetAnimation);
    //     const animation = this._animations[animationIndex];

    //     if (animationIndex !== -1 && animation !== undefined) {
    //       this._activeAnimationIndex = animationIndex;


    //       this.load(animation, { playbackOptions });
    //     } else {
    //       error(`No animation with the id '${targetAnimation}' was found.`);
    //     }
    //   } else if (typeof targetAnimation === 'number') {
    //     this._validateAnimationIndex(targetAnimation);
    //     const animation = this._animations[targetAnimation];

    //     if (this._manifest.animations && this._manifest.animations[targetAnimation] && animation !== undefined) {
    //       this._activeAnimationIndex = targetAnimation;

    //       this.load(animation, { playbackOptions });
    //     } else {
    //       error(`Animation not found at index: ${targetAnimation}`);
    //     }
    //   }
    // }
  }

  /**
   * Pause animation play.
   */
  public pause(): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.pause();

    // if (!this._lottie) {
    //   return;
    // }

    // this._lottie.pause();
    // this.currentState = PlayerState.Paused;

    this.dispatchEvent(new CustomEvent(PlayerEvents.Pause));
  }

  /**
   * Stops animation play.
   */
  public stop(): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.stop();
    this.dispatchEvent(new CustomEvent(PlayerEvents.Stop));
  }

  /**
   * Seek to a given frame.
   */
  public seek(value: number | string): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.seek(value);

    return ;
  }

  /**
   * Snapshot the current frame as SVG.
   *
   * If 'download' argument is boolean true, then a download is triggered in browser.
   */
  public snapshot(download = true): string | void {
    if (!this.shadowRoot) return;

    // Get SVG element and serialize markup
    const svgElement = this.shadowRoot.querySelector('.animation svg') as Node;
    const data = new XMLSerializer().serializeToString(svgElement);

    // Trigger file download
    if (download) {
      const element = document.createElement('a');
      element.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data);
      element.download = 'download_' + this.seeker + '.svg';
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
  private freeze(): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.freeze();
    this.dispatchEvent(new CustomEvent(PlayerEvents.Freeze));
  }

  /**
   * Sets animation play speed.
   *
   * @param value Playback speed.
   */
  public setSpeed(value = 1): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.setSpeed(value);
  }

  /**
   * Animation play direction.
   *
   * @param value Direction values.
   */
  public setDirection(value: 1 | -1): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.setDirection(value);
  }

  /**
   * Sets the looping of the animation.
   *
   * @param value Whether to enable looping. Boolean true enables looping.
   */
  public setLooping(value: boolean | number): void {
    if (!this._dotLottieCommonPlayer) return ;

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
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.togglePlay();
  }

  /**
   * Toggles animation looping.
   */
  public toggleLooping(): void {
    if (!this._dotLottieCommonPlayer) return ;

    this._dotLottieCommonPlayer.toggleLoop();
  }

  /**
   * Returns the styles for the component. Overriding causes styles to not be applied.
   */
  // @ts-ignore
  static get styles() {
    return styles;
  }

  /**
   * Initialize everything on component first render.
   */
  protected override async firstUpdated(): Promise<void> {
    // Add intersection observer for detecting component being out-of-view.
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        if (entries[0] !== undefined && entries[0].isIntersecting) {
          if (this._dotLottieCommonPlayer?.currentState === PlayerState.Frozen) {
            this.play();
          }
        } else if (this._dotLottieCommonPlayer?.currentState === PlayerState.Playing) {
          this.freeze();
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

    // Setup lottie player
    if (this.src) {
      await this.load(this.src);
    }
    this.dispatchEvent(new CustomEvent(PlayerEvents.Rendered));
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
  }

  protected renderControls() {
    const isPlaying: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Playing;
    const isPaused: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Paused;
    const isStopped: boolean = this._dotLottieCommonPlayer?.currentState === PlayerState.Stopped;

    return html`
      <div id="lottie-controls" aria-label="lottie-animation-controls" class="toolbar">
        <button
          id="lottie-play-button"
          @click=${this.togglePlay}
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
          @click=${this.stop}
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
          .value=${this.seeker}
          @input=${this._handleSeekChange}
          @mousedown=${() => {
            this.freeze();
          }}
          @mouseup=${() => {
            this._dotLottieCommonPlayer?.unfreeze();
          }}
          aria-valuemin="1"
          aria-valuemax="100"
          role="slider"
          aria-valuenow=${this.seeker}
          tabindex="0"
          aria-label="lottie-seek-input"
        />
        <button
          id="lottie-loop-toggle"
          @click=${this.toggleLooping}
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

  override render(): TemplateResult | void {
    const className: string = this.controls ? 'main controls' : 'main';
    const animationClass: string = this.controls ? 'animation controls' : 'animation';
    return html`
      <div id="animation-container" class=${className} lang="en" role="img">
        <div id="animation" class=${animationClass} style="background:${this.background};">
          ${this._dotLottieCommonPlayer?.currentState === PlayerState.Error ? html` <div class="error">⚠️</div> ` : undefined}
        </div>
        ${this.controls ? this.renderControls() : undefined}
      </div>
    `;
  }
}

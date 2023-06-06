import { LitElement, html } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { TemplateResult } from 'lit/html.js';
import lottie from 'lottie-web';
import type { AnimationItem } from 'lottie-web';
import styles from './dotlottie-player.styles';
import { unzip, strFromU8 } from 'fflate';
import type { Zippable } from 'fflate';

import pkg from '../package.json';
import { createError, error, warn } from './utils';
import { Manifest, ManifestAnimation } from './manifest';

// Define valid player states
export enum PlayerState {
  Loading = 'loading',
  Playing = 'playing',
  Paused = 'paused',
  Stopped = 'stopped',
  Frozen = 'frozen',
  Error = 'error',
}

// Define play modes
export enum PlayMode {
  Normal = 'normal',
  Bounce = 'bounce',
}

// Define player events
export enum PlayerEvents {
  Load = 'load',
  Error = 'error',
  Ready = 'ready',
  Play = 'play',
  Pause = 'pause',
  Stop = 'stop',
  Freeze = 'freeze',
  Loop = 'loop',
  Complete = 'complete',
  Rendered = 'rendered',
  Frame = 'frame',
}

export interface Versions {
  lottieWebVersion: string;
  dotLottiePlayerVersion: string;
}

export type PlaybackOptions = Omit<ManifestAnimation, 'id'>;

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
  @property({ type: String })
  public currentState: PlayerState = PlayerState.Loading;

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
  public static get properties() {
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

  private _io?: any;
  private _loop?: boolean;
  private _lottie?: any;
  private _prevState?: any;
  private _counter = 1;
  private _activeAnimationIndex = 0;
  private _manifest: Manifest;
  private _animations?: AnimationItem[];
  // Number of times to loop animation.
  private _count?: number;

  constructor() {
    super();

    this._manifest = {
      animations: [],
    };
  }

  /**
   *
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
    if (document.hidden && this.currentState === PlayerState.Playing) {
      this.freeze();
    } else if (this.currentState === PlayerState.Frozen) {
      this.play();
    }
  }

  /**
   * Handles click and drag actions on the progress track.
   */
  private _handleSeekChange(e: any): void {
    if (!this._lottie || isNaN(e.target.value)) {
      return;
    }

    const frame: number = (e.target.value / 100) * this._lottie.totalFrames;

    this.seek(frame);
  }

  private isLottie(json: Record<string, any>): boolean {
    const mandatory: string[] = ['v', 'ip', 'op', 'layers', 'fr', 'w', 'h'];
    let notLottie = false;

    if (json.animations && json.animations.length) {
      json.animations.forEach((animation: Record<string, unknown>): void => {
        if (!this.isLottie(animation)) notLottie = true;
      });
      return notLottie;
    }
    return mandatory.every((field: string) => Object.prototype.hasOwnProperty.call(json, field));
  }

  private parseSrc(src: string | Record<string, unknown>): string | Record<string, unknown> {
    if (typeof src === 'object') {
      return src;
    }

    try {
      return JSON.parse(src);
    } catch (e) {
      // Try construct an absolute URL from the src URL
      const srcUrl: URL = new URL(src, window.location.href);

      return srcUrl.toString();
    }
  }

  private async _fetchDotLottie(url: string): Promise<{ animations: AnimationItem[]; manifest: Manifest | undefined }> {
    const data = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Response-Type': 'arraybuffer',
      },
    })
      .then((buffer) => {
        return buffer.arrayBuffer();
      })
      .then(async (buffer) => {
        const animations: AnimationItem[] = [];
        const animAndManifest: { animations: AnimationItem[]; manifest: Manifest | undefined } = {
          animations: [],
          manifest: undefined,
        };

        const data = await new Promise<Zippable>((resolve, reject) => {
          unzip(new Uint8Array(buffer), (error: any, data: any) => {
            if (error) {
              reject(error);
            }

            resolve(data);
          });
        });

        let lottieJson;

        if (data['manifest.json']) {
          const str = strFromU8(data['manifest.json'] as Uint8Array);
          const manifest = JSON.parse(str);

          if (!('animations' in manifest)) {
            throw createError('Manifest not found');
          }

          if (manifest.animations.length === 0) {
            throw createError('No animations listed in the manifest');
          }

          animAndManifest.manifest = manifest;

          for (const animName of manifest.animations) {
            lottieJson = JSON.parse(strFromU8(data[`animations/${animName.id}.json`] as Uint8Array));

            if ('assets' in lottieJson) {
              lottieJson.assets.map((asset: any) => {
                if (!asset.p) {
                  return;
                }
                if (!data[`images/${asset.p}`]) {
                  return;
                }
                const base64Png = btoa(strFromU8(data[`images/${asset.p}`] as Uint8Array, true));
                asset.p = 'data:;base64,' + base64Png;
                asset.e = 1;
              });
            }
            animations.push(lottieJson);
          }

          animAndManifest.manifest = manifest;
          animAndManifest.animations = animations;

          return animAndManifest;
        } else {
          throw createError('No manifest found in file.');
        }
      })
      .catch((error) => {
        throw createError(error);
      });

    // return { animations: [], manifest: undefined };
    return data;
  }

  private async _fetchJsonFile(url: string): Promise<{ animations: AnimationItem[]; manifest: Manifest | undefined }> {
    // If we have a json file, fetch it and return it
    const data = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Response-Type': 'json',
      },
    })
      .then((response) => response.json())
      .then((data) => {
        const animations: AnimationItem[] = [];
        const filename = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.'));

        // Because we have a json file, we need to create a manifest
        const boilerplateManifest = {
          animations: [
            {
              id: filename,
              speed: 1,
              loop: 'true',
              direction: 1,
            },
          ],
          description: '',
          author: '',
          generator: 'dotLottie-player-component',
          revision: 1,
          version: '1.0.0',
        };
        const animAndManifest: {
          animations: AnimationItem[];
          manifest: Manifest | undefined;
        } = {
          animations: [],
          manifest: undefined,
        };

        animations.push(data);

        animAndManifest.animations = animations;
        animAndManifest.manifest = boilerplateManifest;

        return animAndManifest;
      })
      .catch((error) => {
        throw createError(error);
      });
    return data;
  }

  private async _fetchFileAndLoad(url: string): Promise<AnimationItem> {
    const fileFormat = url.split(/[#?]/)[0].split('.').pop()?.toLowerCase();
    let manifestAndAnimation: { animations: AnimationItem[]; manifest: Manifest | undefined } = {
      animations: [],
      manifest: undefined,
    };

    if (fileFormat === 'json') {
      manifestAndAnimation = await this._fetchJsonFile(url);
    } else {
      manifestAndAnimation = await this._fetchDotLottie(url);
    }

    if (
      !manifestAndAnimation['animations'] ||
      !manifestAndAnimation['manifest'] ||
      manifestAndAnimation['animations'].length === 0
    ) {
      this.currentState = PlayerState.Error;

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error));

      throw createError(
        !manifestAndAnimation['animations'] || !manifestAndAnimation['animations'].length
          ? 'Animations are empty'
          : 'Manifest not found',
      );
    }
    this._animations = manifestAndAnimation['animations'];
    this._manifest = manifestAndAnimation['manifest'];

    // If passed as a prop, will override manifest
    if (this.activeAnimationId) {
      const animationIndex = this._manifest.animations.findIndex((element) => element.id === this.activeAnimationId);

      if (animationIndex !== -1) this._activeAnimationIndex = animationIndex;
      else warn('Active animation not found in manifest');
    } else if (this._manifest && this._manifest['activeAnimationId']) {
      //If present in manifest, play the default active animation
      const animationIndex = this._manifest.animations.findIndex(
        (element) => element.id === this._manifest['activeAnimationId'],
      );

      if (animationIndex !== -1) this._activeAnimationIndex = animationIndex;
      else warn('Active animation not found in manifest');
    }

    const srcParsed = this._animations[this._activeAnimationIndex];
    if (srcParsed === undefined) throw createError('No animation to load!');

    return srcParsed;
  }

  /**
   * Loads playback options from the manifest file for the active animation.
   */
  private _loadManifestOptions(animationIndex: number): void {
    this._requireAnimationsInTheManifest();

    //check that the animation exists in the manifest
    if (this._manifest.animations[animationIndex] === undefined) {
      throw createError('Animation not found in manifest');
    }

    const { autoplay, direction, loop, playMode, speed, hover, intermission } =
      this._manifest.animations[animationIndex];

    if (autoplay !== undefined) {
      this.autoplay = autoplay;
    }

    if (direction !== undefined) {
      this.direction = direction;
    }

    if (loop !== undefined) {
      this.loop = loop;
    }

    if (playMode !== undefined) {
      this.mode = playMode;
    }

    if (speed !== undefined) {
      this.speed = speed;
    }

    if (hover !== undefined) {
      this.hover = hover;
    }

    if (intermission !== undefined) {
      this.intermission = intermission;
    }
  }

  private _initListeners(): void {
    // Because we fetch the data ourselves, fire the load event
    this.dispatchEvent(new CustomEvent(PlayerEvents.Load));

    // Calculate and save the current progress of the animation
    this._lottie.addEventListener('enterFrame', () => {
      this.seeker = (this._lottie.currentFrame / this._lottie.totalFrames) * 100;

      this.dispatchEvent(
        new CustomEvent(PlayerEvents.Frame, {
          detail: {
            frame: this._lottie.currentFrame,
            seeker: this.seeker,
          },
        }),
      );
    });

    // Handle animation play complete
    this._lottie.addEventListener('complete', () => {
      if (this.currentState !== PlayerState.Playing) {
        this.dispatchEvent(new CustomEvent(PlayerEvents.Complete));
        return;
      }
      if (!this._loop || (this._count && this._counter >= this._count)) {
        this.dispatchEvent(new CustomEvent(PlayerEvents.Complete));

        if (this.mode === PlayMode.Bounce) {
          if (this._lottie.currentFrame === 0) {
            return;
          }
        } else {
          return;
        }
      }

      if (this.mode === PlayMode.Bounce) {
        if (this._count) {
          this._counter += 0.5;
        }

        setTimeout(() => {
          this.dispatchEvent(new CustomEvent(PlayerEvents.Loop));

          if (this.currentState === PlayerState.Playing) {
            this._lottie.setDirection(this._lottie.playDirection * -1);
            this._lottie.play();
          }
        }, this.intermission);
      } else {
        if (this._count) {
          this._counter += 1;
        }

        window.setTimeout(() => {
          this.dispatchEvent(new CustomEvent(PlayerEvents.Loop));

          if (this.currentState === PlayerState.Playing) {
            if (this.direction === -1) {
              // Prevents flickering
              this.seek('99%');
              this.play();
            } else {
              this._lottie.stop();
              this.play();
            }
          }
        }, this.intermission);
      }
    });

    // Handle lottie-web ready event
    this._lottie.addEventListener('DOMLoaded', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.Ready));
    });

    // Handle animation data load complete
    this._lottie.addEventListener('data_ready', () => {
      this.dispatchEvent(new CustomEvent(PlayerEvents.Load));
    });

    // Set error state when animation load fail event triggers
    this._lottie.addEventListener('data_failed', () => {
      this.currentState = PlayerState.Error;

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error));
    });

    // Set handlers to auto play animation on hover if enabled
    this.container.addEventListener('mouseenter', () => {
      if (this.hover && this.currentState !== PlayerState.Playing) {
        this.play();
      }
    });
    this.container.addEventListener('mouseleave', () => {
      if (this.hover && this.currentState === PlayerState.Playing) {
        this.stop();
      }
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

    // turn this in to lottie-web options
    const lottieOptions: any = {
      container: this.container,
      loop: false,
      // Leave autoplay false as we call our own play method
      autoplay: false,
      renderer: this.renderer,
      rendererSettings: overrideRendererSettings
        ? overrideRendererSettings
        : {
            scaleMode: 'noScale',
            clearCanvas: false,
            progressiveLoad: true,
            hideOnTransparent: true,
          },
    };

    try {
      const srcParsed = this.parseSrc(src);
      let fetchedData = null;

      // if src is a string, fetch the file and load it
      if (typeof srcParsed === 'string') {
        fetchedData = await this._fetchFileAndLoad(srcParsed);
      } else if (typeof srcParsed === 'object') {
        if (!this.isLottie(srcParsed)) throw createError('Load method failing. Object is not a valid Lottie.');
      }

      if (this._lottie) {
        this._lottie.destroy();
      }

      // If there are playback options they override everything else
      if (playbackOptions !== undefined) {
        for (const [key, value] of Object.entries(playbackOptions)) {
          if (key === 'playMode') {
            value === 'normal' ? (this.mode = PlayMode.Normal) : (this.mode = PlayMode.Bounce);
          } else if (value !== undefined) {
            (this as any)[key] = value;
          }
        }
      } else if (
        this._activeAnimationIndex === 0 ||
        this._manifest.animations[this._activeAnimationIndex].id === this.activeAnimationId ||
        this._manifest.animations[this._activeAnimationIndex].id === this._manifest.activeAnimationId
      ) {
        // Check which props were defined by the user and use those, otherwise use what was defined for the animation on the manifest
        const animation = this._manifest.animations[this._activeAnimationIndex];
        const propNames = Object.keys(DotLottiePlayer.properties);
        const attrNames = Array.from(this.getAttributeNames());

        // We need to reset settings to the prop values first
        for (const attrName of attrNames) {
          const attrValue = this.getAttribute(attrName);

          if (attrValue) {
            (this as any)[attrName] = attrValue;
          }
        }

        // Filter properties that were defined in the manifest, but not in the props
        const undefinedProps = propNames.filter(
          (propName) =>
            !attrNames.includes(propName.toLowerCase()) &&
            this._manifest.animations[this._activeAnimationIndex].hasOwnProperty(propName),
        );

        for (const propName of undefinedProps) {
          const propValue = (animation as any)[propName];

          if (propValue !== undefined) {
            if (propName === 'playMode')
              propValue === 'normal' ? (this.mode = PlayMode.Normal) : (this.mode = PlayMode.Bounce);
            else (this as any)[propName] = propValue;
          }
        }
      } else {
        this._loadManifestOptions(this._activeAnimationIndex);
      }

      // Initialize lottie player and load animation
      this._lottie = lottie.loadAnimation({
        ...lottieOptions,
        animationData: fetchedData !== null ? fetchedData : srcParsed,
      });
    } catch (err) {
      this.currentState = PlayerState.Error;

      this.dispatchEvent(new CustomEvent(PlayerEvents.Error));
      console.error(err);
      return;
    }

    if (this._lottie) {
      this._initListeners();

      // Set initial playback speed and direction
      this.setSpeed(this.speed);
      this.setDirection(this.direction);

      // Start playing if autoplay is enabled
      if (this.autoplay) {
        if (this.direction === -1) this.seek('99%');
        this.play();
      }
    } else {
      this.currentState = PlayerState.Error;
      this.dispatchEvent(new CustomEvent(PlayerEvents.Error));

      throw createError('Player failed to initialize.');
    }
  }

  /**
   * Get current animation's id
   */
  public getActiveId(): string | null {
    if (!this._manifest.animations) return null;

    return this._manifest.animations[this._activeAnimationIndex].id;
  }

  /**
   * Get current animation's index
   */
  public getActiveAnimationIndex(): number {
    return this._activeAnimationIndex;
  }

  /**
   * @returns The current number of animations
   */
  public animationCount(): number {
    if (this._animations) return this._animations.length;

    return 0;
  }

  /**
   *
   * @returns The current manifest.
   */
  public getManifest(): Manifest {
    return this._manifest;
  }

  /**
   * @returns The current lottie-web instance.
   */
  public getLottie(): AnimationItem {
    return this._lottie;
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

  private _requireAnimationsInTheManifest(): void {
    if (!this._manifest.animations.length) {
      throw createError(`No animations found in manifest.`);
    }
  }

  private _requireAnimationsToBeLoaded(): void {
    if (!this._animations?.length) {
      throw createError(`No animations have been loaded.`);
    }
  }

  /**
   * Play the previous animation. The order is taken from the manifest.
   */
  public previous(playbackOptions?: PlaybackOptions): void {
    this._activeAnimationIndex =
      (this._activeAnimationIndex - 1 + this._manifest.animations.length) % this._manifest.animations.length;
    this.play(this._activeAnimationIndex, playbackOptions);
  }

  /**
   * Play the next animation. The order is taken from the manifest.
   */
  public next(playbackOptions?: PlaybackOptions): void {
    this._activeAnimationIndex = (this._activeAnimationIndex + 1) % this._manifest.animations.length;
    this.play(this._activeAnimationIndex, playbackOptions);
  }

  /**
   * Reset to the initial state defined in the manifest.
   */
  public reset(): void {
    if (this._manifest && this._manifest['activeAnimationId']) {
      this.play(this._manifest['activeAnimationId']);
    } else if (this.activeAnimationId) {
      this.play(this.activeAnimationId);
    } else {
      // If no active animation is specified, play the first one
      this.play(0);
    }
  }

  private _validateAnimationIndex(animationIndex: number): void {
    if (isNaN(animationIndex) || animationIndex < 0 || animationIndex >= this._manifest.animations.length) {
      throw createError(`Animation index ${animationIndex} is out of bounds.`);
    }
  }

  /**
   * Start playing animation.
   */
  public play(targetAnimation?: string | number, playbackOptions?: PlaybackOptions): void {
    if (!this._lottie) {
      return;
    }
    this._requireAnimationsInTheManifest();
    this._requireAnimationsToBeLoaded();

    // If no animation is specified, play the current animation
    if (targetAnimation === undefined) {
      this._lottie.play();
      this.currentState = PlayerState.Playing;

      this.dispatchEvent(new CustomEvent(PlayerEvents.Play));

      return;
    }

    this._requireAnimationsToBeLoaded();
    this._requireAnimationsInTheManifest();

    // If animation is specified, check if it exists and play it
    if (targetAnimation !== undefined) {
      if (!this._animations) throw createError(`No animations have been loaded.`);
      this._requireAnimationsInTheManifest();

      if (typeof targetAnimation === 'string') {
        const animationIndex = this._manifest.animations.findIndex((element) => element.id === targetAnimation);

        if (animationIndex !== -1) {
          this._activeAnimationIndex = animationIndex;

          this.load(this._animations[this._activeAnimationIndex], { playbackOptions });
        } else {
          error(`No animation with the id '${targetAnimation}' was found.`);
        }
      } else if (typeof targetAnimation === 'number') {
        this._validateAnimationIndex(targetAnimation);

        if (this._manifest.animations && this._manifest.animations[targetAnimation]) {
          this._activeAnimationIndex = targetAnimation;

          this.load(this._animations[this._activeAnimationIndex], { playbackOptions });
        } else {
          error(`Animation not found at index: ${targetAnimation}`);
        }
      }
    }
  }

  /**
   * Pause animation play.
   */
  public pause(): void {
    if (!this._lottie) {
      return;
    }

    this._lottie.pause();
    this.currentState = PlayerState.Paused;

    this.dispatchEvent(new CustomEvent(PlayerEvents.Pause));
  }

  /**
   * Stops animation play.
   */
  public stop(): void {
    if (!this._lottie) {
      return;
    }

    this._counter = 0;
    this._lottie.stop();
    if (this.direction === -1) {
      this._lottie.goToAndStop(this._lottie.totalFrames, true);
    }
    this.currentState = PlayerState.Stopped;

    this.dispatchEvent(new CustomEvent(PlayerEvents.Stop));
  }

  /**
   * Seek to a given frame.
   */
  public seek(value: number | string): void {
    if (!this._lottie) {
      return;
    }

    if (typeof value === 'number') value = Math.round(value);

    // Extract frame number from either number or percentage value
    const matches = /^(\d+)(%?)$/.exec(value.toString());

    if (!matches) {
      return;
    }

    // Calculate and set the frame number
    const frame = matches[2] === '%' ? (this._lottie.totalFrames * Number(matches[1])) / 100 : Number(matches[1]);

    // Set seeker to new frame number
    this.seeker = frame;

    // Send lottie player to the new frame
    if (this.currentState === PlayerState.Playing) {
      this._lottie.goToAndPlay(frame, true);
    } else {
      this._lottie.goToAndStop(frame, true);
      this._lottie.pause();
    }
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
    if (!this._lottie) {
      return;
    }

    this._lottie.pause();
    this.currentState = PlayerState.Frozen;

    this.dispatchEvent(new CustomEvent(PlayerEvents.Freeze));
  }

  /**
   * Sets animation play speed.
   *
   * @param value Playback speed.
   */
  public setSpeed(value = 1): void {
    if (!this._lottie) {
      return;
    }

    this._lottie.setSpeed(value);
  }

  /**
   * Animation play direction.
   *
   * @param value Direction values.
   */
  public setDirection(value: number): void {
    if (!this._lottie) {
      return;
    }

    this._lottie.setDirection(value);
  }

  /**
   * Sets the looping of the animation.
   *
   * @param value Whether to enable looping. Boolean true enables looping.
   */
  public setLooping(value: string): void {
    if (this._lottie) {
      this._lottie.loop = this._parseLoop(value);
    }
  }

  public isLooping(): boolean {
    if (this._loop) return this._loop;
    return false;
  }

  /**
   * Toggle playing state.
   */
  public togglePlay(): void {
    return this.currentState === PlayerState.Playing ? this.pause() : this.play();
  }

  /**
   * Toggles animation looping.
   */
  public toggleLooping(): void {
    const newLoop = !this._loop;

    this.setLooping(newLoop.toString());
  }

  /**
   * Returns the styles for the component.
   */
  static get styles() {
    return styles;
  }

  /**
   * Initialize everything on component first render.
   */
  protected async firstUpdated(): Promise<void> {
    // Add intersection observer for detecting component being out-of-view.
    if ('IntersectionObserver' in window) {
      this._io = new IntersectionObserver((entries: IntersectionObserverEntry[]) => {
        if (entries[0].isIntersecting) {
          if (this.currentState === PlayerState.Frozen) {
            this.play();
          }
        } else if (this.currentState === PlayerState.Playing) {
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
  public disconnectedCallback(): void {
    // Remove intersection observer for detecting component being out-of-view.
    if (this._io) {
      this._io.disconnect();
      this._io = undefined;
    }

    // Destroy lottie
    if (this._lottie) {
      this._lottie.destroy();
    }

    // Remove the attached Visibility API's change event listener.
    document.removeEventListener('visibilitychange', () => this._onVisibilityChange());
  }

  protected renderControls() {
    const isPlaying: boolean = this.currentState === PlayerState.Playing;
    const isPaused: boolean = this.currentState === PlayerState.Paused;
    const isStopped: boolean = this.currentState === PlayerState.Stopped;

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
            this._prevState = this.currentState;
            this.freeze();
          }}
          @mouseup=${() => {
            this._prevState === PlayerState.Playing && this.play();
            this.seek(this._lottie.currentFrame);
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

  render(): TemplateResult | void {
    const className: string = this.controls ? 'main controls' : 'main';
    const animationClass: string = this.controls ? 'animation controls' : 'animation';
    return html`
      <div id="animation-container" class=${className} lang="en" role="img">
        <div id="animation" class=${animationClass} style="background:${this.background};">
          ${this.currentState === PlayerState.Error ? html` <div class="error">⚠️</div> ` : undefined}
        </div>
        ${this.controls ? this.renderControls() : undefined}
      </div>
    `;
  }
}

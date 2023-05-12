/**
 * Copyright 2023 Design Barn Inc.
 */

export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

export interface ManifestAnimation {
  autoplay?: boolean;

  // Define playback direction 1 forward, -1 backward
  direction?: number;

  id: string;

  // If loop is a number, it defines the number of times the animation will loop
  loop?: boolean;

  // Choice between 'bounce' and 'normal'
  playMode?: PlayMode;

  // Desired playback speed, default 1.0
  speed?: number;

  // Theme color
  themeColor?: string;

  // Play on hover
  hover?: boolean;

  // Time to wait between playback loops
  intermission?: number;
}

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

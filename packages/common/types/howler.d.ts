/**
 * Copyright 2023 Design Barn Inc.
 */

declare module 'howler';

declare interface AudioFactory {
  play(): void;
  playing(): void;
  rate(): void;
  seek(): void;
  setVolume(): void;
}

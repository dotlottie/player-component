/**
 * Copyright 2023 Design Barn Inc.
 */

import type { ManifestAnimation, ManifestTheme } from '@dotlottie/common';
import { PlayerState } from '@dotlottie/common';
import React, { useEffect, useMemo, useState } from 'react';

import { useDotLottieState } from './hooks/use-dotlottie-state';
import { EllipsisVertical } from './icons/ellipsis-vertical';
import { Loop } from './icons/loop';
import { Next } from './icons/next';
import { Pause } from './icons/pause';
import { Play } from './icons/play';
import { Previous } from './icons/previous';
import { Popover } from './popover';
import { useDotLottieContext } from './providers';

const AVAILABLE_BUTTONS = [
  'play',
  'stop',
  'loop',
  'next',
  'previous',
  'animations',
  'themes',
] as const;

interface ControlsProps extends React.HTMLAttributes<HTMLDivElement> {
  buttons?: Array<typeof AVAILABLE_BUTTONS[number]>;
  show?: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ buttons = AVAILABLE_BUTTONS, ...props }) => {
  const dotLottiePlayer = useDotLottieContext();

  const loop = useDotLottieState((state) => state.loop);
  const currentState = useDotLottieState((state) => state.currentState);
  const seeker = useDotLottieState((state) => state.seeker);
  const currentAnimationId = useDotLottieState((state) => state.currentAnimationId);
  const defaultTheme = useDotLottieState((state) => state.defaultTheme);
  const direction = useDotLottieState((state) => state.direction);

  const isPlaying = useMemo(() => {
    return currentState === PlayerState.Playing;
  }, [currentState]);

  const [popover, setPopover] = useState(false);

  const [animations, setAnimations] = useState<ManifestAnimation[]>([]);
  const [themes, setThemes] = useState<ManifestTheme[]>([]);

  const popoverItems = useMemo(() => {
    const manuItems = [];
    const _animations = animations.map((anim) => ({
      value: anim.id,
      selected: currentAnimationId === anim.id,
    }));
    const _themes = themes
      .filter((theme) => theme.animations.includes(currentAnimationId || ''))
      .map((theme) => ({ value: theme.id, selected: defaultTheme === theme.id }));

    if (Array.isArray(_animations) && _animations.length !== 0) {
      manuItems.push({
        title: 'Animations',
        items: _animations,
      });
    }

    if (Array.isArray(_themes) && _themes.length !== 0) {
      manuItems.push({
        title: 'Styles',
        items: _themes,
      });
    }

    return manuItems;
  }, [animations, themes, currentAnimationId, defaultTheme]);

  const shouldDisplayPopover = useMemo(() => {
    if (buttons.includes('themes') && Array.isArray(themes) && themes.length)  {
      return true;
    }

    return (buttons.includes('animations') && Array.isArray(animations) && animations.length > 1);
  }, [popoverItems])

  function updateManifest(): void {
    const _animations = dotLottiePlayer.getManifest()?.animations;
    const _themes = dotLottiePlayer.getManifest()?.themes;

    if (_animations) {
      setAnimations(_animations);
    }

    if (_themes) {
      setThemes(_themes);
    }
  }

  useEffect(() => {
    if (typeof dotLottiePlayer === 'undefined') return undefined;

    dotLottiePlayer.addEventListener('DOMLoaded', updateManifest);

    return () => {
      dotLottiePlayer.removeEventListener('DOMLoaded', updateManifest);
    };
  }, [dotLottiePlayer]);

  return (
    <div aria-label="lottie-animation-controls" className="toolbar" {...props}>
      {buttons.includes('previous') && animations.length > 1 && (
        <button onClick={(): void => dotLottiePlayer.previous()} aria-label="play-previous">
          <Previous />
        </button>
      )}
      {buttons.includes('play') && (
        <button onClick={(): void => dotLottiePlayer.togglePlay()} aria-label="play-pause">
          {isPlaying ? <Pause /> : <Play />}
        </button>
      )}
      {buttons.includes('next') && animations.length > 1 && (
        <button onClick={(): void => dotLottiePlayer.next()} aria-label="play-next">
          <Next />
        </button>
      )}
      <input
        style={{ width: '100%', '--seeker': seeker } as React.CSSProperties}
        className={`seeker ${direction === 1 ? '' : 'to-left'}`}
        type="range"
        min={0}
        step={0}
        max={100}
        value={seeker || 0}
        onInput={(event): void =>
          dotLottiePlayer.seek(String(event.currentTarget.value).concat('%'))
        }
        onMouseDown={(): void => {
          dotLottiePlayer.freeze();
        }}
        onMouseUp={(): void => {
          dotLottiePlayer.unfreeze();
        }}
        aria-valuemin={1}
        aria-valuemax={100}
        role="slider"
        aria-valuenow={seeker}
        aria-label="lottie-seek-input"
      />

      {buttons.includes('loop') && (
        <button
          onClick={(): void => {
            dotLottiePlayer.toggleLoop();
          }}
          className={loop ? 'active' : ''}
          aria-label="loop-toggle"
        >
          <Loop />
        </button>
      )}
      {shouldDisplayPopover && (
        <div style={{ position: 'relative' }}>
          <Popover
            items={popoverItems}
            open={popover}
            onDismiss={(): void => {
              setPopover(false);
            }}
            onSelectItem={(title, value): void => {
              if (title === 'Animations') {
                dotLottiePlayer.play(value);
              }
              if (title === 'Styles') {
                dotLottiePlayer.setDefaultTheme(value);
              }
            }}
          />
          <button
            aria-label="open-popover"
            onClick={(): void => {
              setPopover(!popover);
            }}
          >
            <EllipsisVertical />
          </button>
        </div>
      )}
    </div>
  );
};

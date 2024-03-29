/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DotLottiePlayer, Controls, PlayMode } from '@dotlottie/react-player';
import type {  ManifestAnimation, ManifestTheme, DotLottieCommonPlayer } from '@dotlottie/react-player';
import { ThemeContext } from '../App';

const lotties = [
  {
    from: 'Multiple themes (.lottie)',
    src: 'https://lottie.host/7ebddb46-c455-4191-ab23-b351ad9f4208/oX63nkjFYw.lottie',
  },
  {
    from: '.lottie',
    // eslint-disable-next-line no-secrets/no-secrets
    src: 'https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie',
  },
  {
    from: '.json',
    src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
  },
  {
    from: '.json',
    // eslint-disable-next-line no-secrets/no-secrets
    src: 'https://lottie.host/cba131d3-3e01-43be-b71c-2de700a12642/c5CK9Co8WD.json',
  },
  {
    from: 'Local .lottie',
    src: './audio.lottie',
  },
];

interface ItemProps {
  from: string;
  src: string;
}

const Item: React.FC<ItemProps> = (props: ItemProps) => {
  const isDarkMode = React.useContext(ThemeContext) === 'dark';
  const [src, setSrc] = useState<Record<string, unknown> | string>(props.src);
  const [loop, setLoop] = useState<undefined | boolean>(true);
  const [autoplay, setAutoPlay] = useState<undefined | boolean>(true);
  const [scroll, setScroll] = useState<undefined | boolean>(false);
  const [show, setShow] = useState<undefined | boolean>(false);
  const [controls, setControls] = useState(true);
  const [direction, setDirection] = useState<undefined | 1 | -1>(1);
  const [background, setBackground] = useState<undefined | string>('#FFFFFF00');
  const [speed, setSpeed] = useState<undefined | number>(1);
  const [mode, setMode] = useState<undefined | PlayMode>(PlayMode.Normal);
  const [playOnHover, setPlayOnHover] = useState<undefined | boolean>(false);
  const [activeAnimationId, setActiveAnimationId] = useState<string | undefined>();
  const [theme, setTheme] = useState<undefined | string>('');
  const [animations, setAnimations] = useState<ManifestAnimation[]>();
  const [themes, setThemes] = useState<ManifestTheme[]>();
  const [ready, setReady] = useState(false);
  const dotLottiePlayerRef = useRef<DotLottieCommonPlayer | null>(null);

  function handleClick(): void {
    const otherLotties = lotties.filter((lottie) => lottie.src !== src);
    const randomLottie = otherLotties[Math.floor(Math.random() * otherLotties.length)];

    if (randomLottie) {
      setSrc(randomLottie.src);
    }
  }

  useEffect(() => {
    if (dotLottiePlayerRef && dotLottiePlayerRef.current && ready) {
      scroll ? dotLottiePlayerRef.current?.playOnScroll() : dotLottiePlayerRef.current?.stopPlayOnScroll();
    }
  }, [scroll, dotLottiePlayerRef]);

  useEffect(() => {
    if (dotLottiePlayerRef && dotLottiePlayerRef.current && ready) {
      show ? dotLottiePlayerRef.current?.playOnShow() : dotLottiePlayerRef.current?.stopPlayOnShow();
    }
  }, [show, dotLottiePlayerRef]);

  useEffect(() => {
    if (!animations) return;

    const firstItem = animations[0];

    if (firstItem) {
      setActiveAnimationId(firstItem.id);
    }
  }, [animations]);

  useEffect(() => {
    if (isDarkMode) {
      setBackground('#000000');
      setTheme(activeAnimationId + '-' + 'dark');
    } else {
      setBackground('#FFFFFF');
      setTheme('');
    }
  }, [isDarkMode, activeAnimationId]);

  return (
    <>
      <h1>{props.from}</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}
        >
          {Array.isArray(animations) && (
            <select
              defaultValue={activeAnimationId}
              onChange={(event): void => setActiveAnimationId(event.target.value)}
            >
              {animations.map((anim) => {
                return (
                  <option key={anim.id} value={anim.id}>
                    Render {anim.id}
                  </option>
                );
              })}
            </select>
          )}
          {Array.isArray(themes) && (
            <select value={theme} onChange={(event): void => setTheme(event.target.value)}>
              <option value="">Please select a theme</option>
              {activeAnimationId
                ? themes
                  .filter((theme) => theme.animations.includes(activeAnimationId) || theme.animations.length === 0)
                  .map((theme) => {
                    return (
                      <option key={theme.id} value={theme.id}>
                        Apply {theme.id}
                      </option>
                    );
                  })
                : null}
            </select>
          )}
          <button
            onClick={(): void => {
              dotLottiePlayerRef.current?.previous();
            }}
          >
            Prev
          </button>
          <button
            onClick={(): void => {
              dotLottiePlayerRef.current?.next((_, manifest) => {
                return {
                  ...manifest,
                };
              });
            }}
          >
            Next with (override)
          </button>
          <button
            onClick={(): void => {
              dotLottiePlayerRef.current?.next();
            }}
          >
            Next
          </button>
          <button
            onClick={(): void => {
              dotLottiePlayerRef.current?.play();
            }}
          >
            Play
          </button>
          <button
            onClick={(): void => {
              dotLottiePlayerRef.current?.reset();
            }}
          >
            Reset
          </button>
          <button onClick={handleClick}>Swap src</button>
          <label>
            <input type="checkbox" onChange={(): void => setAutoPlay(!autoplay)} checked={autoplay} />
            Autoplay
          </label>
          <label>
            <input type="checkbox" onChange={(): void => setLoop(!loop)} checked={loop} />
            Loop
          </label>
          <label>
            <input type="checkbox" onChange={(): void => setControls(!controls)} checked={controls} />
            Controls
          </label>
          <label>
            <input type="number" onChange={(evt): void => setSpeed(parseInt(evt.target.value, 10))} value={speed} />
            speed
          </label>
          <label>
            <button onClick={(): void => setDirection(-1)}>-1</button>
            <button onClick={(): void => setDirection(1)}>1</button>
            Direction
          </label>
          <label>
            <select defaultValue={mode} onChange={(evt): void => setMode(evt.target.value as PlayMode)}>
              <option value="normal">Normal</option>
              <option value="bounce">Bounce</option>
            </select>
            Mode
          </label>
          <label>
            <input type="color" onChange={(evt): void => setBackground(evt.target.value)} value={background} />
            Background
          </label>
          <label>
            <input type="checkbox" onChange={(): void => setPlayOnHover(!playOnHover)} checked={playOnHover} />
            playOnHover
          </label>
          <label>
            <input type="checkbox" onChange={(): void => setShow(!show)} checked={show} />
            playOnShow
          </label>
          <label>
            <input type="checkbox" onChange={(): void => setScroll(!scroll)} checked={scroll} />
            playOnScroll
          </label>
          <button
            onClick={() => {
              dotLottiePlayerRef.current?.revertToManifestValues([]);
              setBackground('transparent');
            }}
          >
            Unset props
          </button>
        </div>
        <DotLottiePlayer
          ref={dotLottiePlayerRef}
          src={src}
          style={{ height: '400px', display: 'inline-block' }}
          hover={playOnHover}
          autoplay={autoplay}
          loop={loop}
          playMode={mode}
          speed={speed}
          direction={direction}
          background={background}
          activeAnimationId={activeAnimationId}
          defaultTheme={theme}
          onEvent={(name): void => {
            switch (name) {
              case 'ready':
                console.log('onPlayerReady', dotLottiePlayerRef.current?.getManifest()?.animations);
                setAnimations(dotLottiePlayerRef.current?.getManifest()?.animations);
                setThemes(dotLottiePlayerRef.current?.getManifest()?.themes);
                setReady(true);
                break;

              case 'freeze':
                console.log('freeze');
                break;

              case 'data_fail':
                console.log('data_fail');
                break;

              case 'complete':
                console.log('complete');
                break;

              case 'pause':
                console.log('pause');
                break;

              case 'stop':
                console.log('stop');
                break;

              case 'play':
                console.log('play');
                break;

              default:
                break;
            }
          }}
        >
          {controls && <Controls />}
        </DotLottiePlayer>
      </div>
    </>
  );
};

const Home: React.FC = () => {
  return (
    <div className="App">
      {lotties.map((props, index) => {
        return <Item key={index} {...props} />;
      })}
    </div>
  );
};

export default Home;

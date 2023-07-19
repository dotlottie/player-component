/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DotLottiePlayer, PlayMode, Controls } from '@dotlottie/react-player';
import type { DotLottieRefProps, ManifestAnimation, ManifestTheme } from '@dotlottie/react-player';
import { ThemeContext } from '../App';

const lotties = [
  {
    from: 'Multiple themes (.lottie)',
    src: 'https://lottie.host/c7029f2f-d015-4d88-93f6-7693bf88692b/d7j8UjWsGt.lottie',
  },
  {
    from: 'Multiple lottie (.lottie)',
    src: './amazing.lottie',
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
    src: './test.lottie',
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
  const lottieRef = useRef<DotLottieRefProps>();

  function handleClick(): void {
    const otherLotties = lotties.filter((lottie) => lottie.src !== src);
    const randomLottie = otherLotties[Math.floor(Math.random() * otherLotties.length)];

    if (randomLottie) {
      setSrc(randomLottie.src);
    }
  }

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
                    .filter((theme) => theme.animations.includes(activeAnimationId))
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
              lottieRef.current?.previous();
            }}
          >
            Prev
          </button>
          <button
            onClick={(): void => {
              lottieRef.current?.next((_, manifest) => {
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
              lottieRef.current?.next();
            }}
          >
            Next
          </button>
          <button
            onClick={(): void => {
              lottieRef.current?.play();
            }}
          >
            Play
          </button>
          <button
            onClick={(): void => {
              lottieRef.current?.reset();
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
          <button
            onClick={() => {
              lottieRef.current?.revertToManifestValues([]);
              setBackground('transparent');
            }}
          >
            Unset props
          </button>
        </div>
        <DotLottiePlayer
          rendererSettings={{
            runExpressions: false,
          }}
          lottieRef={lottieRef}
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
                console.log('onPlayerReady', lottieRef.current?.getManifest()?.animations);
                setAnimations(lottieRef.current?.getManifest()?.animations);
                setThemes(lottieRef.current?.getManifest()?.themes);
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

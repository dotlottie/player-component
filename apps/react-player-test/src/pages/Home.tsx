/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useEffect, useRef, useState } from 'react';
import { DotLottiePlayer, PlayMode } from 'react-player';
import type { DotLottieRefProps, ManifestAnimation } from 'react-player';

const lotties = [
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
  const [src, setSrc] = useState<Record<string, unknown> | string>(props.src);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoPlay] = useState(true);
  const [controls, setControls] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [background, setBackground] = useState('#FFFFFF00');
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState(PlayMode.Normal);
  const [playOnHover, setPlayOnHover] = useState(false);
  const [activeAnimationId, setActiveAnimationId] = useState<string | undefined>();
  const [animations, setAnimations] = useState<ManifestAnimation[]>();
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
          <button
            onClick={(): void => {
              lottieRef.current?.previous();
            }}
          >
            Prev
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
        </div>
        <DotLottiePlayer
          lottieRef={lottieRef}
          src={src}
          style={{ height: '400px', display: 'inline-block' }}
          playOnHover={playOnHover}
          autoplay={autoplay}
          loop={loop}
          mode={mode}
          speed={speed}
          direction={direction}
          background={background}
          controls={controls}
          activeAnimationId={activeAnimationId}
          onEvent={(name): void => {
            switch (name) {
              case 'ready':
                console.log('onPlayerReady', lottieRef.current?.getManifest()?.animations);
                setAnimations(lottieRef.current?.getManifest()?.animations);
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
        />
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

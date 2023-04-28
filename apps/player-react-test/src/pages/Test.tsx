import { DotLottiePlayer, PlayerState, PlayMode } from 'player-react';
import { useEffect, useRef, useState } from 'react';

import { useSearchParam } from 'react-use';

const lotties = [
  {
    from: '.lottie',
    src: 'https://assets4.lottiefiles.com/dotlotties/dlf10_YwqueuLEuR.lottie',
  },
];

interface ItemProps {
  from: string;
  src: string;
}

const Item = (props: ItemProps) => {
  const qSrc = useSearchParam('src');
  if (!qSrc) return <div>Param `src` is required</div>;

  // Query Parameters
  const testId = useSearchParam('testId') || undefined;
  const qLoop = useSearchParam('loop') === 'true';
  const qAutoplay = useSearchParam('autoplay') === 'true';
  const qControls = useSearchParam('controls') === 'true';
  const qDirection = Number(useSearchParam('direction')) === -1 ? -1 : 1;
  const qSpeed = Number(useSearchParam('speed')) || 1;
  const qMode = useSearchParam('mode') === 'bounce' ? PlayMode.Bounce : PlayMode.Normal;
  const qPlayOnHover = useSearchParam('playOnHover') === 'true';
  let qBackground = useSearchParam('background');
  if (qBackground && !/^(#|hsl|cmyk|rgb)./.test(qBackground)) {
    qBackground = '#' + qBackground;
  }

  const [src, setSrc] = useState(qSrc);
  const [loop, setLoop] = useState(qLoop);
  const [autoplay, setAutoPlay] = useState(qAutoplay);
  const [controls, setControls] = useState(qControls);
  const [direction, setDirection] = useState<1 | -1>(qDirection);
  const [background, setBackground] = useState(qBackground || 'transparent');
  const [speed, setSpeed] = useState(qSpeed);
  const [mode, setMode] = useState(qMode);
  const [playOnHover, setPlayOnHover] = useState(qPlayOnHover);

  const [currentState, setCurrentState] = useState<PlayerState>(PlayerState.Initial);
  const [isReady, setIsReady] = useState('no');

  const root = useRef<any>(null);

  useEffect(() => {
    if (!root.current) return;
    root.current.addEventListener('update:prop', (event: CustomEvent<{ prop: string; value: unknown }>) => {
      console.log('details', event.detail);
      switch (event.detail.prop) {
        case 'loop':
          setLoop(event.detail.value as boolean);
          break;
        case 'autoplay':
          setAutoPlay(event.detail.value as boolean);
          break;
        case 'controls':
          setControls(event.detail.value as boolean);
          break;
        case 'direction':
          setDirection(event.detail.value as 1 | -1);
          break;
        case 'background':
          setBackground(event.detail.value as string);
          break;
        case 'speed':
          setSpeed(event.detail.value as number);
          break;
        case 'mode':
          setMode(event.detail.value as PlayMode);
          break;
        case 'playOnHover':
          setPlayOnHover(event.detail.value as boolean);
          break;
      }
    });

    return () => {
      // root.current.removeEventListener('update:prop');
    };
  }, [root]);

  return (
    <div id="test-app-root" ref={root}>
      <h1>Reactive Props</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <label>
          <input name="src" type="text" onChange={(e) => setSrc(e.target.value)} value={src} />
          Src
        </label>
        <label>
          <input name="autoplay" type="checkbox" onChange={() => setAutoPlay(!autoplay)} checked={autoplay} />
          Autoplay
        </label>
        <label>
          <input name="loop" type="checkbox" onChange={() => setLoop(!loop)} checked={loop} />
          Loop
        </label>
        <label>
          <input name="controls" type="checkbox" onChange={() => setControls(!controls)} checked={controls} />
          Controls
        </label>
        <label>
          <input name="speed" type="number" onChange={(e) => setSpeed(parseInt(e.target.value))} value={speed} />
          speed
        </label>
        <label>
          <button id="direction-reverse" onClick={() => setDirection(-1)}>
            -1
          </button>
          <button id="direction-forward" onClick={() => setDirection(1)}>
            1
          </button>
          Direction
        </label>
        <label>
          <select name="mode" defaultValue={mode} onChange={(e) => setMode(e.target.value as PlayMode)}>
            <option value="normal">Normal</option>
            <option value="bounce">Bounce</option>
          </select>
          Mode
        </label>
        <label>
          <input name="background" type="color" onChange={(e) => setBackground(e.target.value)} value={background} />
          Background
        </label>
        <label>
          <input
            name="playOnHover"
            type="checkbox"
            onChange={() => setPlayOnHover(!playOnHover)}
            checked={playOnHover}
          />
          playOnHover
        </label>
      </div>
      <div>
        <label>Current State</label>
        <input name="player-state" value={currentState} disabled />
      </div>
      <div>
        <label>IsReady</label>
        <input name="is-ready" value={isReady} disabled />
      </div>
      <DotLottiePlayer
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
        onPlayerReady={() => {
          console.log('onPlayerReady');
          setIsReady('yes');
          setCurrentState(PlayerState.Ready);
        }}
        onFreeze={() => {
          console.log('onFreeze');
          setCurrentState(PlayerState.Frozen);
        }}
        onDataFail={() => {
          console.log('onDataFail');
          setCurrentState(PlayerState.Error);
        }}
        onComplete={() => {
          console.log('onComplete');
          setCurrentState(PlayerState.Stopped);
        }}
        onPause={() => {
          console.log('onPause');

          setCurrentState(PlayerState.Paused);
        }}
        onStop={() => {
          console.log('onStop');
          setCurrentState(PlayerState.Stopped);
        }}
        onPlay={() => {
          console.log('onPlay');
          setCurrentState(PlayerState.Playing);
        }}
        testId={testId}
      />
    </div>
  );
};

export default () => {
  return (
    <div className="App">
      {lotties.map((props, index) => {
        return <Item key={index} {...props} />;
      })}
    </div>
  );
};

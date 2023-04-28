import { DotLottiePlayer, PlayMode } from 'player-react';
import { useState } from 'react';

const lotties = [
  {
    from: '.lottie',
    src: 'https://assets4.lottiefiles.com/dotlotties/dlf10_YwqueuLEuR.lottie',
  },
  {
    from: '.json',
    src: 'https://assets1.lottiefiles.com/packages/lf20_mGXMLaVUoX.json',
  },
  {
    from: '.json',
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

const Item = (props: ItemProps) => {
  const [src, setSrc] = useState(props.src);
  const [loop, setLoop] = useState(true);
  const [autoplay, setAutoPlay] = useState(true);
  const [controls, setControls] = useState(true);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [background, setBackground] = useState('#FFFFFF00');
  const [speed, setSpeed] = useState(1);
  const [mode, setMode] = useState(PlayMode.Normal);
  const [playOnHover, setPlayOnHover] = useState(false);

  function handleClick() {
    const otherLotties = lotties.filter((lottie) => lottie.src != src);
    const randomLottie = otherLotties?.[Math.floor(Math.random() * otherLotties.length)];

    if (randomLottie) {
      setSrc(randomLottie.src);
    }
  }

  return (
    <>
      <h1>{props.from}</h1>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <button onClick={handleClick}>Swap src</button>
        <label>
          <input type="checkbox" onChange={() => setAutoPlay(!autoplay)} checked={autoplay} />
          Autoplay
        </label>
        <label>
          <input type="checkbox" onChange={() => setLoop(!loop)} checked={loop} />
          Loop
        </label>
        <label>
          <input type="checkbox" onChange={() => setControls(!controls)} checked={controls} />
          Controls
        </label>
        <label>
          <input type="number" onChange={(e) => setSpeed(parseInt(e.target.value))} value={speed} />
          speed
        </label>
        <label>
          <button onClick={() => setDirection(-1)}>-1</button>
          <button onClick={() => setDirection(1)}>1</button>
          Direction
        </label>
        <label>
          <select defaultValue={mode} onChange={(e) => setMode(e.target.value as PlayMode)}>
            <option value="normal">Normal</option>
            <option value="bounce">Bounce</option>
          </select>
          Mode
        </label>
        <label>
          <input type="color" onChange={(e) => setBackground(e.target.value)} value={background} />
          Background
        </label>
        <label>
          <input type="checkbox" onChange={() => setPlayOnHover(!playOnHover)} checked={playOnHover} />
          playOnHover
        </label>
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
        }}
        onFreeze={() => {
          console.log('onFreeze');
        }}
        onDataFail={() => {
          console.log('onDataFail');
        }}
        onComplete={() => {
          console.log('onComplete');
        }}
        onPause={() => {
          console.log('onPause');
        }}
        onStop={() => {
          console.log('onStop');
        }}
        onPlay={() => {
          console.log('onPlay');
        }}
      />
    </>
  );
};

function Home() {
  return (
    <div className="App">
      {lotties.map((props, index) => {
        return <Item key={index} {...props} />;
      })}
    </div>
  );
}

export default Home;

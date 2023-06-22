# DotLottiePlayer React Component

This is a React component for [@dotlottie/player-component](https://www.npmjs.com/package/@dotlottie/player-component)

## Installation

You can install `@dotlottie/react-player` using npm:

```shell
npm install @dotlottie/react-player
```

or yarn:

```shell
yarn add @dotlottie/react-player
```

## Usage

To use `@dotlottie/react-player` in your React project, import the component and use it as follows:

```jsx
import React from 'react';

import { DotLottiePlayer, Controls } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/dotlottie-player-styles.css'

const App = () => {
  return (
    <div>
        <DotLottiePlayer
          src="/path-to-lottie.lottie"
          autoplay
          loop
        >
          <Controls />
        </DotLottiePlayer>
      <DotLottiePlayer src={animationData} autoplay loop />
    </div>
  );
};

export default App;
```

## Props

The `DotLottiePlayer` component accepts the following props:

| Prop      | Description | Type | Default |
| ----      | ----------- | ---- | ------- | 
| `src` _(required)_ | Animation data or url | `Record<string, unknown> \| string` | `undefined` | 
| `lottieRef` | Get player object | `MutableRefObject` | `undefined` | 
| `autoplay` | Autoplay animation on load | `boolean` | `false` | 
| `background` | Background color | `string` | `transparent` | 
| `direction` | Play direction | `1 \| -1` | `1` | 
| `hover` | Whether to play on mouse hover | `boolean` | `false` | 
| `intermission` | Pause between loops | `number` | `0` | 
| `loop` | Whether to loop animation | `boolean` | `false` | 
| `playMode` | Play mode | `'normal' \| 'bounce'` | `normal` | 
| `renderer` | How to render | `'svg' \| 'html' \| 'canvas'` | `normal` | 
| `speed` | Play speed | `number` | `1` | 


## Events

The `DotLottiePlayer` component accepts the following props:

    Complete = "complete",
    DataFail = "data_fail",
    DataReady = "data_ready",
    Error = "error",
    Frame = "frame",
    Freeze = "freeze",
    LoopComplete = "loopComplete",
    Pause = "pause",
    Play = "play",
    Ready = "ready",
    Stop = "stop"

| Name      | Description |
| ----      | ----------- |
| `complete` | Animation completed playing |
| `error` | An animation source cannot be parsed, fails to load or has format errors. |
| `frame` | A new frame is entered |
| `freeze` | on animation freeze |
| `loopComplete` | on loop complete |
| `pause` | Animation is paused |
| `ready` | Animation data loaded and player is ready |
| `stop` | Animation is stopped |


## Examples

Listening for events

```jsx
import React, {useState} from 'react';

import { DotLottiePlayer, Controls, PlayerEvents } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/dotlottie-player-styles.css'

const App = () => {
    const [loading, setLoading] = useState(true);
  return (
    <div>
        { loading 
            ? <div>loading....</div>  
            : <DotLottiePlayer
              src="/path-to-lottie.lottie"
              onEvent={(event: PlayerEvents) => {
                if (event === PlayerEvents.Ready) {
                    setLoading(false);
                }
              }}
              autoplay
              loop
              >
              <Controls />
            </DotLottiePlayer> 
        }
    </div>
  );
};

export default App;
```

## Methods
getLottie: () => AnimationItem | undefined;


    getLottie: () => AnimationItem | undefined;
    getManifest: () => Manifest | undefined;
    next: (options?: PlaybackOptions) => void;
    play: (indexOrId?: string | number, options?: PlaybackOptions) => void;
    previous: (options?: PlaybackOptions) => void;
    reset: () => void;

### `getLottie: () => AnimationItem | undefined`

get (`lottie-web`)[https://www.npmjs.com/package/lottie-web] instance.

#### Returns

Type: `void`

### `stop() => void`

Stops animation play.

#### Returns

Type: `void`


You can find examples of how to use `@dotlottie/react-player` in the [examples directory](link-to-examples).

## Contributing

Contributions are welcome! If you want to contribute to `@dotlottie/react-player`, please follow the guidelines in [CONTRIBUTING.md](link-to-contributing-guide).

## License

`@dotlottie/react-player` is [MIT licensed](link-to-license).

## Support

If you encounter any issues or have any questions or suggestions, please [open an issue](link-to-issue-tracker) or contact us at [support@dotlottie.io](mailto:support@dotlottie.io).
```

You can copy and paste this code block into your GitHub README file.

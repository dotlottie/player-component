# DotLottiePlayer React Component

This is a React component for [@dotlottie/player-component](https://www.npmjs.com/package/@dotlottie/player-component)

<p align="center">
  <img src="https://user-images.githubusercontent.com/23125742/201124166-c2a0bc2a-018b-463b-b291-944fb767b5c2.png" />
</p>

This is a React Component for easily embedding and playing dotLottie animations on your react projects.

### What's dotLottie?

dotLottie is an open-source file format that aggregates one or more Lottie files and their associated resources into a single file. They are ZIP archives compressed with the Deflate compression method and carry the file extension of ".lottie".

[Read more about .lottie here!](https://dotlottie.io/)

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
import '@dotlottie/react-player/dist/index.css'

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

| Prop               | Description | Type | Default |
| ----               | ----------- | ---- | ------- | 
| `src` _(required)_ | Animation data or url | `Record<string, unknown> \| string` | `undefined` | 
| `lottieRef`        | Get player object | `MutableRefObject` | `undefined` | 
| `autoplay`         | Autoplay animation on load | `boolean` | `false` | 
| `background`       | Background color | `string` | `transparent` | 
| `direction`        | Play direction | `1 \| -1` | `1` | 
| `hover` | Whether to play on mouse hover | `boolean` | `false` | 
| `intermission`     | Pause between loops | `number` | `0` | 
| `loop` | Whether to loop animation | `boolean` | `false` | 
| `playMode`         | Play mode | `'normal' \| 'bounce'` | `normal` | 
| `renderer`         | How to render | `'svg' \| 'html' \| 'canvas'` | `normal` | 
| `speed`            | Play speed | `number` | `1` | 
| `onEvent`            | Listen to player  | `number` | `1` | 


## Events

The following events are exposed via `onEvent` function.
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
import '@dotlottie/react-player/dist/index.css'

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

Getting player instance and calling

```jsx
import React, {useState} from 'react';

import type { DotLottieRefProps } from '@dotlottie/react-player';
import { DotLottiePlayer, Controls, PlayerEvents } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css'

const App = () => {
  const lottieRef = useRef<DotLottieRefProps>();

  return (
    <div>
    <DotLottiePlayer
    lottieRef={lottieRef}
          src="/path-to-lottie.lottie"
          onEvent={(event: PlayerEvents) => {
            if (event === PlayerEvents.Ready) {
                // play next animation.
                lottieRef.current?.next();
            }
          }}
          autoplay
          loop
          >
          <Controls />
        </DotLottiePlayer> 
    </div>
  );
};

export default App;
```


## Methods
You should be able access these methods using player instance.

---
`getLottie: () => AnimationItem | undefined` 

Returns [lottie-web](https://www.npmjs.com/package/lottie-web) instance

---
`getManifest: () => Manifest | undefined`

Returns `.lottie` Manifest.

---
`next: (options?: PlaybackOptions) => void`

Play next animation in the manifest.

---
`play: (indexOrId?: string | number, options?: PlaybackOptions) => void`

Play current animation.

---
`previous: (options?: PlaybackOptions) => void`

Play previous animation in the manifest.

---
`reset: () => void`

Go back to default / intial animation.

---

## Contributing

We use changesets to maintain a changelog for this repository. When making any change to the codebase that impacts functionality or performance we require a changeset to be present.

To add a changeset run:

```
yarn run changeset
```

And select the type of version bump you'd like (major, minor, path).

You can document the change in detail and format it properly using Markdown by opening the ".md" file that the "yarn changeset" command created in the ".changeset" folder. Open the file, it should look something like this:

```
---
"@dotlottie/common": minor
"@dotlottie/react-player": major
---

This is where you document your **changes** using Markdown.

- You can write
- However you'd like
- In as much detail as you'd like

Aim to provide enough details so that team mates and future you can understand the changes and the context of the change.
```

You can commit your changes and the changeset to your branch and then create a pull request on the develop branch.

## Our other Lottie related libraries

<table style="table-layout:fixed; white-space: nowrap;">
  <tr>
    <th>Project</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/lottie-react" target="_blank" rel="noopener noreferrer">lottie-react</a></td>
    <td>
    A React component for the Lottie Web player.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/lottie-vue" target="_blank" rel="noopener noreferrer">lottie-vue</a></td>
    <td>
    A Vue component for the Lottie player.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/svelte-lottie-player" target="_blank" rel="noopener noreferrer">svelte-lottie-player</a></td>
    <td>
    Lottie player component for use with Svelte.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/jlottie" target="_blank" rel="noopener noreferrer">jLottie</a></td>
    <td>
    jLottie is suitable as a general purpose lottie player, though implements a subset of the features in the core player - this approach leads to a tiny footprint and great performance.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/lottie-interactivity" target="_blank" rel="noopener noreferrer">lottie-interactivity</a></td>
    <td>
    This is a small library to add scrolling, cursor interactivity and interaction chaining to your Lottie Animations.
    </td>
  </tr>
  <tr>
    <td><a href="https://github.com/LottieFiles/lottie-js" target="_blank" rel="noopener noreferrer">lottie-js</a></td>
    <td>
    The library consists of methods to map the Lottie JSON to the object model and interact with properties as well as manipulate them.
    </td>
  </tr>
</table>

## License

MIT License © LottieFiles.com
# DotLottiePlayer React Component


<p align="center">
  <img src="https://user-images.githubusercontent.com/23125742/201124166-c2a0bc2a-018b-463b-b291-944fb767b5c2.png" />
</p>

This is a React Component for easily embedding and playing dotLottie animations in your react projects.

## What is dotLottie?

dotLottie is an open-source file format that combines one or more Lottie files and their associated resources into a single file. These files are ZIP archives compressed with the Deflate compression method and have the file extension ".lottie".

[Read more about dotLottie here!](https://dotlottie.io/)

## Documentation

[View the full documentation](https://docs.lottiefiles.com/dotlottie-players/)

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
import '@dotlottie/react-player/dist/index.css';

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
    </div>
  );
};

export default App;
```

## Props

The `DotLottiePlayer` component accepts the following props:

| Prop               | Description                              | Type                            | Default     |
| ------------------ | ---------------------------------------- | ------------------------------- | ----------- |
| `src` _(required)_ | Animation data or URL                     | `Record<string, unknown> \| string` | `undefined` |
| `lottieRef`        | Get player object                         | `MutableRefObject`              | `undefined` |
| `autoplay`         | Autoplay animation on load                | `boolean`                       | `false`     |
| `background`       | Background color                          | `string`                        | `transparent` |
| `direction`        | Play direction                            | `1 \| -1`                      | `1`         |
| `hover`            | Whether to play on mouse hover            | `boolean`                       | `false`     |
| `intermission`     | Pause between loops                        | `number`                        | `0`         |
| `loop`             | Whether to loop animation                 | `boolean`                       | `false`     |
| `playMode`         | Play mode                                 | `'normal' \| 'bounce'`          | `normal`    |
| `renderer`         | How to render                             | `'svg' \| 'html' \| 'canvas'`   | `svg`       |
| `speed`            | Play speed                                | `number`                        | `1`         |
| `onEvent`          | Listen to player events                   | `function`                      | `undefined` |
| `defaultTheme`     | Default .lottie theme to use                  | `string`                        | `undefined` |

## Events

The following events are exposed via the `onEvent` function:

| Name           | Description                                                               |
| -------------- | ------------------------------------------                                |
| `complete`     | Animation completed playing                                               |
| `error`        | An animation source cannot be parsed, fails to load, or has format errors |
| `frame`        | A new frame is entered                                                    |
| `freeze`       | Animation is frozen                                                       |
| `loopComplete` | Loop animation is complete                                                |
| `pause`        | Animation is paused                                                       |
| `ready`        | Animation data is loaded and player is ready                              |
| `stop`         | Animation is stopped                                                      |

## Examples

Listening for events:

```jsx
import React, { useState } from 'react';
import { DotLottiePlayer, Controls, PlayerEvents } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const App = () => {
  const [loading, setLoading] = useState(true);

  return (
    <div>
      {loading ? (
        <div>loading....</div>
      ) : (
        <DotLottiePlayer
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
      )}
    </div>
  );
};

export default App;
```

Getting player instance and calling methods:

```jsx
import React, { useRef } from 'react';
import { DotLottiePlayer, Controls, PlayerEvents } from '@dotlottie/react-player';
import '@dotlottie/react-player/dist/index.css';

const App = () => {
  const lottieRef = useRef<DotLottieRefProps>();

  return (
    <div>
      <DotLottiePlayer
        lottieRef={lottieRef}
        src="/path-to-lottie.lottie"
        onEvent={(event: PlayerEvents) => {
          if (event === PlayerEvents.Ready) {
            // Play next animation.
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

You can access these methods using the player instance:

- `getLottie(): AnimationItem | undefined`
  Returns the [lottie-web](https://www.npmjs.com/package/lottie-web) instance.

- `getManifest(): Manifest | undefined`
  Returns the `.lottie` Manifest.

- `next(getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions): void`
  Plays the next animation in the manifest.

- `play(indexOrId?: string | number, getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions): void`
  Plays the current animation or a specified animation with passed PlaybackOptions.

- `previous(getOptions?: (currPlaybackOptions?: PlaybackOptions, manifestPlaybackOptions?: PlaybackOptions) => PlaybackOptions): void`
  Plays the previous animation in the manifest.

- `reset(): void`
  Resets or goes back to the default/initial animation.

- `resize(): void`
  Resizes the canvas if canvas renderer.

- `seek(frame: number): void`
  Seeks to a specific frame.

- `setBackground(background: string): void`
  Sets the container background.

- `setDefaultTheme(defaultTheme: string): void`
  Sets the default theme (applies all animations).

- `setDirection(direction: AnimationDirection): void`
  Sets the player direction. (applies all animations)

- `setHover(hover: boolean): void`
  Sets whether to play on hover (applies to all animations).

- `setIntermission(intermission: number): void`
  Sets the pause between loops (applies to all animations).

- `setLoop(loop: number | boolean): void`
  Sets loop behavior (applies to all animations).

- `setPlayMode(mode: PlayMode): void`
  Sets the player play mode (e.g., bounce or normal) for all animations.

- `setSpeed(speed: number): void`
  Sets the play speed (applies all animations).

- `togglePlay(): void`
  Toggles the play state.

- `pause(): void`
  Pauses the animation.

- `stop(): void`
  Stops the animation.

- `getContainer(): HTMLDivElement | undefined`
  Gets the animation container.


## Contributing

We use changesets to maintain a changelog for this repository. When making any changes to the codebase that impact functionality or performance, we require a changeset to be present.

To add a changeset, run:

```
pnpm changeset add
```

And select the type of version bump you'd like (major, minor, patch).

You can document the changes in detail and format them properly using Markdown by opening the ".md" file that the "pnpm changeset" command created in the ".changeset" folder. Open the file, and it should look something like this:

```
---
"@dotlottie/common": minor
"@dotlottie/react-player": major
---

This is where you document your **changes** using Markdown.

- You can write
- However you'd like
- In as much detail as you'd like

Aim to provide enough details so that teammates and future you can understand the changes and the context of

 the change.
```

Commit your changes and the changeset to your branch, and then create a pull request on the develop branch.

## Our Other Lottie-related Libraries

Here are some of our other Lottie-related libraries:

- [lottie-react](https://github.com/LottieFiles/lottie-react): A React component for the Lottie Web player.
- [lottie-vue](https://github.com/LottieFiles/lottie-vue): A Vue component for the Lottie player.
- [svelte-lottie-player](https://github.com/LottieFiles/svelte-lottie-player): Lottie player component for use with Svelte.
- [jLottie](https://github.com/LottieFiles/jlottie): jLottie is suitable as a general-purpose Lottie player, though it implements a subset of the features in the core player. This approach leads to a tiny footprint and great performance.
- [lottie-interactivity](https://github.com/LottieFiles/lottie-interactivity): This is a small library to add scrolling, cursor interactivity, and interaction chaining to your Lottie animations.
- [lottie-js](https://github.com/LottieFiles/lottie-js): The library consists of methods to map the Lottie JSON to the object model and interact with properties, as well as manipulate them.

## License

MIT License © LottieFiles.com
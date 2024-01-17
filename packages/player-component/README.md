 <h1 align="center">dotlottie-player Web Component</h1>

<div align="center">

  <a href="">[![npm](https://img.shields.io/npm/v/@dotlottie/player-component.svg)](https://www.npmjs.com/package/@dotlottie/player-component)</a>
  <a href="">[![webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/@dotlottie/dotlottie-player)</a>

</div>

<p align="center">
  <img src="https://user-images.githubusercontent.com/23125742/201124166-c2a0bc2a-018b-463b-b291-944fb767b5c2.png" />
</p>

This is a Web Component for easily embedding and playing dotLottie animations on websites.

### What's dotLottie?

dotLottie is an open-source file format that aggregates one or more Lottie files and their associated resources into a single file. They are ZIP archives compressed with the Deflate compression method and carry the file extension of ".lottie".

[Read more about .lottie here!](https://dotlottie.io/)

## Documentation

[View the full documentation](https://docs.lottiefiles.com/dotlottie-players/)

## Installation

#### In HTML, import from CDN or from the local Installation

##### Lottie Player

- Import from CDN.

```html
<script type="module" src="https://unpkg.com/@dotlottie/player-component@2.3.0/dist/dotlottie-player.mjs" ></script>
```

- Import from local node_modules directory.

```html
<script type="module" src="/node_modules/@dotlottie/player-component/dist/dotlottie-player.mjs"></script>
```

#### In Javascript or TypeScript

1. Install package using npm or yarn.

```shell
npm install --save @dotlottie/player-component
```

2. Import package in your code.

```javascript
import '@dotlottie/player-component';
```

## Usage

Add the element `dotlottie-player` and set the `src` property to a URL pointing to a .lottie or .json file.

```html
<dotlottie-player
  autoplay
  controls
  loop
  playMode="normal"
  src="http://dotlottieio.s3-website-us-east-1.amazonaws.com/sample_files/animation-external-image.lottie"
  style="width: 320px"
>
</dotlottie-player>
```

You may set and load animations programmatically as well.

```html
<dotlottie-player autoplay controls loop mode="normal" style="width: 320px"> </dotlottie-player>
```

```js
const player = document.querySelector('dotlottie-player');
player.load('http://dotlottieio.s3-website-us-east-1.amazonaws.com/sample_files/animation-external-image.lottie');
```

## Usage example in ReactJS

1 - import the player and use as follows

```javascript
import '@dotlottie/player-component';

function App() {
  return (
    <div className="App">
      <dotlottie-player
        src="https://assets2.lottiefiles.com/dotlotties/dlf10_l12sw9oo.lottie"
        autoplay
        loop
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export default App;
```

## Usage example in ReactJS + Typescript

1 - import as follows

```javascript
import '@dotlottie/player-component';

function App() {
  return (
    <div className="App">
      <dotlottie-player
        src="https://assets2.lottiefiles.com/dotlotties/dlf10_l12sw9oo.lottie"
        autoplay
        loop
        style={{ height: '100%', width: '100%' }}
      />
    </div>
  );
}

export default App;
```

2 - create a global.d.ts file in your src folder and add the code below

```javascript
declare namespace JSX {
  interface IntrinsicElements {
    "dotlottie-player": any;
  }
}
```

## Usage example in NuxtJS / VueJS

1 - update the plugins array in nuxt.config.js file in your root as follows

```javascript
plugins: [{ src: '~/plugins/lottie-player', mode: 'client' }];
```

2 - create a folder plugins in your root if it doesnt already exist, add a file lottie-player.js with the following content

```javascript
import * as LottiePlayer from '@dotlottie/player-component';
```

3 - the component can now be used in your pages or components template tag as follows without any import necessary

```javascript
<template>
  <dotlottie-player src="https://assets2.lottiefiles.com/dotlotties/dlf10_l12sw9oo.lottie" autoplay loop />
</template>
<script>
export default {};
</script>
```

- note for vueJS the library/player must be declared as a client side plugin module.

Full documentation on player properties, methods, events and styling for the dotlottie-player are available [here](https://docs.lottiefiles.com/dotlottie-player/).

## Community & Support

- [Github issues.](https://github.com/dotlottie/player-component/issues) For bugs and errors you encounter using this player.
- [Discord.](https://lottiefiles.com/discord) For hanging out with the community and sharing your awesome Lottie animations!

## Our other Lottie related libraries

<table style="table-layout:fixed; white-space: nowrap;">
  <tr>
    <th>Project</th>
    <th>Description</th>
  </tr>
  <!-- TEMPLATE FOR NEW ROW -->
  <!-- START ROW
  <tr>
    <td>lang</td>
    <td><a href="" target="_blank" rel="noopener noreferrer">supabase-lang</a></td>
  </tr>
  END ROW -->
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

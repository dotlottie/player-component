# DotLottie Players

The official player components for dotLottie, which allows you to embed and play dotLottie animations in your web applications.

<p align="center">
  <img src="https://user-images.githubusercontent.com/23125742/201124166-c2a0bc2a-018b-463b-b291-944fb767b5c2.png" />
</p>

## What is dotLottie?

dotLottie is an open-source file format that combines one or more Lottie files and their associated resources into a single file. These files are ZIP archives compressed with the Deflate compression method and have the file extension ".lottie".

[Read more about dotLottie here!](https://dotlottie.io/)


## Packages
- [`@dotlottie/common`](./packages/common/) - Core player. 
- [`@dotlottie/player-component`](./packages/player-component/) - DotLottie web player
- [`@dotlottie/react-player`](./packages/react-player/) - DotLottie React player

## Contributing

We use changesets to maintain a changelog for this repository. When making any changes to the codebase that impact functionality or performance, we require a changeset to be present.

To add a changeset, run:

```
pnpm changeset add
```

And select the type of version bump you'd like (major, minor, patch).

You can document the changes in detail and format them properly using Markdown by opening the ".md" file that the "yarn changeset" command created in the ".changeset" folder. Open the file, and it should look something like this:

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
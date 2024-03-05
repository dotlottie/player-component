# @dotlottie/react-player

## 1.6.18

### Patch Changes

- 0587998: fix: 🐛 box-sizing css rule scope

## 1.6.17

### Patch Changes

- 9c78f2a: chore: 🤖 fix homepage link in package.json

## 1.6.16

### Patch Changes

- Updated dependencies [163dcc2]
  - @dotlottie/common@0.7.10

## 1.6.15

### Patch Changes

- 82fa43d: fix: upgrade dependencies with vulnerability issues
- Updated dependencies [82fa43d]
  - @dotlottie/common@0.7.9

## 1.6.14

### Patch Changes

- 7f40780: fix: loopComplete event does not fire after first cycle if direction is -1
- Updated dependencies [7f40780]
  - @dotlottie/common@0.7.8

## 1.6.13

### Patch Changes

- 871336a: fix: 🐛 First loopComplete event was not firing when direction is -1
- Updated dependencies [871336a]
  - @dotlottie/common@0.7.7

## 1.6.12

### Patch Changes

- Updated dependencies [477d72e]
  - @dotlottie/common@0.7.6

## 1.6.11

### Patch Changes

- 52e45e3: fix: 🐛 tsconfig jsx compile option for react 16.8 compatibility

## 1.6.10

### Patch Changes

- Updated dependencies [64e1d02]
  - @dotlottie/common@0.7.5

## 1.6.9

### Patch Changes

- d5bbe07: fix: 🐛 removed the use of css file when there are no controls

## 1.6.8

### Patch Changes

- 293f9bb: fix: 🐛 useLayoutEffect does nothing on the server warning

## 1.6.7

### Patch Changes

- Updated dependencies [9351f7f]
  - @dotlottie/common@0.7.4

## 1.6.6

### Patch Changes

- fbf5b55: fix: 🐛 setAutoplay fires on initial load next14

## 1.6.5

### Patch Changes

- eee0aea: fix: 🐛 target build for chrome79
- Updated dependencies [eee0aea]
  - @dotlottie/common@0.7.3

## 1.6.4

### Patch Changes

- Updated dependencies [65a151b]
  - @dotlottie/common@0.7.2

## 1.6.3

### Patch Changes

- 34afa16: fix: 🐛 react-player couldn't find package "@dotlottie/common"

## 1.6.2

### Patch Changes

- 8d9c419: fix: 🐛 react-player types build issue

## 1.6.1

### Patch Changes

- 940a873: fix: 🐛 error removing eventListeners when unmount

## 1.6.0

### Minor Changes

- 4634c13: automatic audio detection and support

### Patch Changes

- c1d0f54: fix: 🐛 worker and audio support in react player
- b5e2b23: fix: 🐛 cleanup for eventListeners

## 1.5.0

### Minor Changes

- 5d6a1fb: adds lottie_worker via the 'worker' prop

### Patch Changes

- 56422f0: fix: 🐛 added default filterSize, fixes the drop shadows
- 79fd9ad: feat: 🎸 state selector menu

## 1.4.6

### Patch Changes

- 60262ef: fix: 🐛 manifest options were not used when changing animaiton

## 1.4.5

### Patch Changes

- b2f4617: fix: 🐛 json reference is being modified by lotti-web

## 1.4.4

### Patch Changes

- 7334ef0: fix: speed and direction not picking up the manifest values

## 1.4.3

### Patch Changes

- 3083f09: fix: 🐛 updating src doesn't clear previously loaded states

## 1.4.2

### Patch Changes

- 9f83088: refactor: 💡 remove the use of local var this.\_frame

## 1.4.1

### Patch Changes

- 2c999e9: fix: 🐛 removed set autoplay warning

## 1.4.0

### Minor Changes

- 1716af8: complete event now fires if direction is -1 and frame 0 is hit

## 1.3.0

### Minor Changes

- e89d991: added state machine support
- 00452b2: feat: 🎸 add `light` prop to dynamically load a lighter version of the lottie-web renderer

### Patch Changes

- 8286537: fix: set default value for className props to prevent undefined
- 28c1581: fix: content-type check for .json urls
- 00452b2: perf: ⚡️ reduce bundle size
- 35b2074: fix: tests

## 1.2.1

### Patch Changes

- a64d41e: fix: double render on next() and previous();

## 1.2.0

### Minor Changes

- f17f39b: feat: 🎸 selective decompression of animations

### Patch Changes

- 410da8b: added react17 support

## 1.1.2

### Patch Changes

- 09692e4: exposed missing methods from react-player

## 1.1.1

### Patch Changes

- 63fd88c: fix: font issue

## 1.1.0

### Minor Changes

- bdfd979: feat: added new player controls

### Patch Changes

- 0cf77e0: fix: added media type check in determining .json and .lottie

## 1.0.1

### Patch Changes

- 5e10530: fix: nextjs ssr

## 1.0.0

### Major Changes

- 0e50822: bumping for major release

## 0.1.0

### Minor Changes

- 5c6648d: added getversions
- 5c6648d: chore: updated lottie-web version
- 4153712: chore: moved visibilityChange to common player
- 3b01e71: feat: 🎸 theming
- b9c465d: fix: fixed issues in beta release

### Patch Changes

- 3146757: added changeset
- d6c2aa0: chore: added readme
- acaa1f3: fix: 🐛 bundling
- f77e3a5: fixed dts
- 23a8dc9: chore: build all src modules
- 3db37ce: fix: types not exported
- 23a8dc9: fix: 🐛 css not exported

## 0.1.0-beta.9

### Minor Changes

- d40d5d7: added getversions
- d40d5d7: chore: updated lottie-web version

### Patch Changes

- 7115251: added changeset

## 0.1.0-beta.8

### Minor Changes

- 8629bef: fix: fixed issues in beta release

## 0.1.0-beta.7

### Minor Changes

- a64bf5e: chore: moved visibilityChange to common player
- 14fe8c8: feat: 🎸 theming

## 0.0.1-beta.6

### Patch Changes

- 0dfa731: fixed dts

## 0.0.1-beta.5

### Patch Changes

- a7f4340: fix: types not exported

## 0.0.1-beta.4

### Patch Changes

- 1a6e818: chore: added readme

## 0.0.1-beta.3

### Patch Changes

- b355bf4: chore: build all src modules
- b355bf4: fix: 🐛 css not exported

## 0.0.1-beta.2

### Patch Changes

- d4da4bf: fix: 🐛 bundling

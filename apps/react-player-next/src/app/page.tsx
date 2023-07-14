/**
 * Copyright 2023 Design Barn Inc.
 */

import Player from './player';

export default function Home(): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Player />
    </main>
  );
}

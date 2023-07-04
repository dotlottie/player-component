import Player from './player';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any;
    }
  }
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <Player
          src="https://lottie.host/53ececb8-cfb3-4505-ac42-b0214d81d2d7/UBIa29hJUQ.lottie"
          playbackOptions={{
            direction: 1,
            autoplay: true,
            speed: 1,
            playMode: 'bounce',
          }}
          controls
        />

        <Player
          src="monster.lottie"
          playbackOptions={{
            direction: 1,
            speed: 1,
            autoplay: true,
            playMode: 'bounce',
          }}
          controls
        />
      </div>
    </main>
  );
}

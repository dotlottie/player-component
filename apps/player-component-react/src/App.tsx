import './App.css';
import '@dotlottie/player-component';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any;
    }
  }
}

function App() {
  return (
    <>
      <dotlottie-player
        src="https://lottie.host/53ececb8-cfb3-4505-ac42-b0214d81d2d7/UBIa29hJUQ.lottie"
        direction="1"
        controls
        playmode="bounce"
        speed={6}
      />
    </>
  );
}

export default App;

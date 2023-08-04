/**
 * Copyright 2023 Design Barn Inc.
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

import '@dotlottie/react-player/dist/index.css';
import { Playground } from './components/playground';
import { BsFileZipFill } from 'react-icons/bs';

const SAMPLE_FILES = [
  { name: 'toggle.lottie', path: './toggle.lottie' },
  { name: 'lf_interactivity_page.lottie', path: './lf_interactivity_page.lottie' },
  {
    name: 'cool_dog.lottie',
    path: 'https://lottie.host/ffebcde0-ed6d-451a-b86a-35f693f249d7/7BMTlaBW7h.lottie',
  },
];

interface HomeScreenProps {
  onStart: (file: ArrayBuffer) => void;
}
const HomeScreen = ({ onStart }: HomeScreenProps) => {
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;

      const arrayBuffer = await acceptedFiles[0].arrayBuffer();
      onStart(arrayBuffer);
    },
    [onStart],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const startWith = useCallback(
    (file: { name: string; path: string }) => {
      return async () => {
        const arrayBuffer = await fetch(file.path).then((res) => res.arrayBuffer());
        onStart(arrayBuffer);
      };
    },
    [onStart],
  );

  return (
    <div {...getRootProps()} className="h-full bg-dark text-white flex justify-center items-center">
      <input {...getInputProps()} />
      {isDragActive ? (
        <h1 className="text-5xl mb-4">Drop it!!!! Almost there :)</h1>
      ) : (
        <div className="p-10 rounded text-gray-400 max-w-2xl">
          <h1 className="text-5xl mb-4">DotLottie Playground :)</h1>
          <p className="text-2xl mb-6">
            To start drop a <span className="text-red-600">.lottie</span>. You could also select a sample file below.
          </p>
          <h2 className="text-lg mb-2">Sample files</h2>
          <ul className="text-sm">
            {SAMPLE_FILES.map((file) => {
              return (
                <li key={file.name}>
                  <button className="flex gap-2 items-center hover:text-white mb-1" onClick={startWith(file)}>
                    <BsFileZipFill className="fill-yellow-500" />
                    {file.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

function App() {
  const [file, setFile] = useState<ArrayBuffer | undefined>();

  const onStart = useCallback(
    (file: ArrayBuffer) => {
      setFile(file);
    },
    [setFile],
  );

  return (
    <div className="h-screen bg-dark">{!file ? <HomeScreen onStart={onStart} /> : <Playground file={file} />}</div>
  );
}

export default App;

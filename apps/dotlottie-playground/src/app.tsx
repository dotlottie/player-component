/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useState } from 'react';
import { BsFileZipFill } from 'react-icons/bs';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Dropzone } from './components/dropzone';
import { Playground } from './components/playground';
import '@dotlottie/react-player/dist/index.css';

const SAMPLE_FILES = [
  { name: 'toggle.lottie', path: `${import.meta.env.BASE_URL}toggle.lottie` },
  { name: 'interactivity_example.lottie', path: `${import.meta.env.BASE_URL}interactivity_example.lottie` },
  { name: 'aniki_hamster.lottie', path: `${import.meta.env.BASE_URL}aniki_hamster.lottie` },
  {
    name: 'theming_example.lottie',
    path: `${import.meta.env.BASE_URL}theming_example.lottie`,
  },
];

interface HomeScreenProps {
  onStart: (file: ArrayBuffer, fileName: string) => void;
}
const HomeScreen = ({ onStart }: HomeScreenProps): React.ReactNode => {
  const handleStart = useCallback(
    async (lottieFile: File | ArrayBuffer, lottieFileName?: string): Promise<void> => {
      let arrayBuffer: ArrayBuffer;
      let name = '';

      if (lottieFile instanceof File) {
        arrayBuffer = await lottieFile.arrayBuffer();
        name = lottieFile.name;
      } else {
        arrayBuffer = lottieFile;
        name = lottieFileName || 'new_awesome';
      }

      if (typeof arrayBuffer !== 'undefined') {
        onStart(arrayBuffer, name);
      }
    },
    [onStart],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0];

      if (!acceptedFile) return;

      handleStart(acceptedFile);
    },
    [onStart],
  );

  const fetchLottieAndStart = useCallback(async (url: string, name: string) => {
    const resp = await fetch(url);
    const arrayBuffer = await resp.arrayBuffer();

    handleStart(arrayBuffer, name);
  }, []);

  const startWith = useCallback(
    (file: { name: string; path: string }) => {
      return () => {
        fetchLottieAndStart(file.path, file.name);
      };
    },
    [onStart],
  );

  return (
    <Dropzone onDrop={onDrop} accept="lottie" noClick>
      {(state): JSX.Element => (
        <div {...state.getRootProps()} className="h-full bg-dark text-white flex justify-center items-center">
          <input {...state.getInputProps()} />
          {state.isDragActive ? (
            <h1 className="text-5xl mb-4">Drop it!!!! Almost there :)</h1>
          ) : (
            <div className="p-10 rounded text-gray-400 max-w-2xl">
              <h1 className="text-5xl mb-4">DotLottie Playground :)</h1>
              <p className="text-2xl mb-6">
                To start drop a <span className="text-red-600">.lottie</span>. You could also select a sample file
                below.
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
      )}
    </Dropzone>
  );
};

const App: React.FC = () => {
  const [file, setFile] = useState<{ arrayBuffer?: ArrayBuffer; name?: string }>({});

  const onStart = useCallback(
    (arrayBuffer: ArrayBuffer, name: string) => {
      setFile({
        name,
        arrayBuffer,
      });
    },
    [setFile],
  );

  return (
    <div className="h-screen bg-dark">
      {file.arrayBuffer ? (
        <Playground file={file.arrayBuffer} fileName={file.name || 'unammed.lottie'} />
      ) : (
        <HomeScreen onStart={onStart} />
      )}
      <ToastContainer />
    </div>
  );
};

export default App;

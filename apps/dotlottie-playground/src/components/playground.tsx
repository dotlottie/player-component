/**
 * Copyright 2023 Design Barn Inc.
 */

import Editor from '@monaco-editor/react';
import type { DotLottieState } from '@dotlottie/dotlottie-js';
import monaco from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Controls, DotLottiePlayer, DotLottieRefProps, PlayerEvents } from '@dotlottie/react-player';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import Dropzone, { useDropzone } from 'react-dropzone';

import { FileTree } from '../components/file-tree';

import '@dotlottie/react-player/dist/index.css';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { removeAnimation, setAnimations } from '../store/animationSlice';
import { useDotLottie } from '../hooks/use-dotlottie';
import { removeState, setStates } from '../store/stateSlice';
import { removeTheme, setThemes } from '../store/themeSlice';
import { formatJSON, getMockDotLottieState, processFilename } from '../utils';
import {
  clearEditorFile,
  clearEditorState,
  setEditorAnimationId,
  setEditorFile,
  setEditorUpdated,
  setEditorValidatationStatus,
} from '../store/editorSlice';
import { Button } from '../components/button';
import { BiSolidSave } from 'react-icons/bi';
import { PlaybackOptionsEditor } from './playback-options-editor';

interface PlaygroundProps {
  file: ArrayBuffer;
  fileName: string;
}

export const Playground: React.FC<PlaygroundProps> = ({ file, fileName }) => {
  const dispatch = useAppDispatch();
  const lottiePlayer = useRef<DotLottieRefProps>();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const animations = useAppSelector((state) => state.animations.list);
  const themes = useAppSelector((state) => state.themes.list);
  const states = useAppSelector((state) => state.states.list);
  const { dotLottie, setDotLottie } = useDotLottie();
  const [updatedLottie, setUpdatedLottie] = useState<string>('');
  const editorFileContent = useAppSelector((state) => state.editor.file?.content);
  const editorFileType = useAppSelector((state) => state.editor.file?.type);
  const editorAnimationId = useAppSelector((state) => state.editor.animationId);

  const [_fileName, setFileName] = useState(fileName);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newInstance = await dotLottie.fromArrayBuffer(await file.arrayBuffer());
      setFileName(file.name);
      setDotLottie(newInstance);
    },
    [dotLottie, setDotLottie],
  );

  useEffect(() => {
    (async () => {
      const newInstance = await dotLottie.fromArrayBuffer(file);
      setDotLottie(newInstance);
    })();
  }, [file, setDotLottie]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const isCodeValid = useAppSelector((state) => state.editor.validationStatus);
  const currentFileName = useAppSelector((state) => state.editor.file?.name);
  const currentFilePath = useAppSelector((state) => state.editor.file?.path);

  const onChange = useCallback(
    (value: string | undefined) => {
      if (isCodeValid && value) {
        dispatch(setEditorUpdated(value));
      }
    },
    [isCodeValid, dispatch],
  );

  const editorUpdated = useAppSelector((state) => state.editor.updated);

  const handleDownload = useCallback(async () => {
    await dotLottie.build();
    dotLottie.download(_fileName);
  }, [dotLottie, _fileName]);

  const startLottiePlayer = useCallback(async () => {
    const _prev = updatedLottie;

    await dotLottie.build();
    const file = await dotLottie.toBlob();

    const url = URL.createObjectURL(file);

    setUpdatedLottie('');
    setUpdatedLottie(url);

    if (_prev) {
      URL.revokeObjectURL(_prev);
    }
  }, [dotLottie, setUpdatedLottie]);

  const fetchFromDotLottie = useCallback(() => {
    const anims = dotLottie.manifest.animations.map((item) => {
      return {
        name: `${item.id}.json`,
        type: 'json',
      };
    });

    const states = dotLottie.states.map((item) => {
      return {
        name: `${item.id}.json`,
        type: 'json',
      };
    });

    const themes = dotLottie.themes.map((item) => {
      return {
        name: `${item.id}.lss`,
        type: 'lss',
      };
    });

    dispatch(setAnimations(anims));
    dispatch(setStates(states));
    dispatch(setThemes(themes));
  }, [dispatch, dotLottie]);

  const handleSave = useCallback(() => {
    if (!isCodeValid || !currentFileName) return;

    const editorValue: string | undefined = editorRef.current?.getValue();
    let editorValueParsed: unknown;

    if (!editorValue) return;

    switch (currentFilePath) {
      case 'States':
        editorValueParsed = JSON.parse(editorValue);
        if (editorValue && currentFileName) {
          // Use currentFileName when removing. Use might have updated the id
          dotLottie.removeState(currentFileName.replace(/.json/, ''));
          const newStateId = (editorValueParsed as DotLottieState).descriptor.id;
          dotLottie.addState({
            id: newStateId,
            state: editorValueParsed as DotLottieState,
          });
          dispatch(
            setEditorFile({
              name: newStateId,
            }),
          );
        }
        break;
      case 'Themes':
        if (currentFileName) {
          dotLottie.removeTheme(currentFileName.replace(/.lss/, ''));
          // TODO: add how to apply themes to animations?
          dotLottie.addTheme({
            id: currentFileName,
            data: editorValue,
          });
        }
        break;
    }

    dispatch(setEditorUpdated(false));
    fetchFromDotLottie();
    startLottiePlayer();
  }, [isCodeValid, currentFileName, dotLottie, dispatch, startLottiePlayer, currentFilePath, fetchFromDotLottie]);

  function onMount(editor: monaco.editor.IStandaloneCodeEditor) {
    editorRef.current = editor;
  }

  useEffect(() => {
    fetchFromDotLottie();

    if (dotLottie.animations.length) {
      startLottiePlayer();
    }
    return () => {
      URL.revokeObjectURL(updatedLottie);
    };
  }, [dotLottie, startLottiePlayer, fetchFromDotLottie]);

  const openInEditor = useCallback(
    async (folder: string, fileName: string) => {
      let fileContent: string | undefined;
      let isTheme = false;

      switch (folder) {
        case 'States':
          fileContent = dotLottie.getState(fileName.substring(0, fileName.lastIndexOf('.')))?.toString();
          break;
        case 'Themes':
          fileContent = await dotLottie.getTheme(fileName.replace(/.lss/, ''))?.toString();
          isTheme = true;
          console.log('fileContent', fileContent, fileName.replace(/.lss/, ''));
          break;
      }

      if (fileContent) {
        dispatch(
          setEditorFile({
            name: fileName,
            type: isTheme ? 'css' : 'json',
            path: folder,
            content: isTheme ? fileContent : formatJSON(fileContent),
          }),
        );
      }
    },
    [dotLottie, dispatch],
  );

  const validateFile = useCallback(
    (markers: monaco.editor.IMarker[]) => {
      const hasError = markers.some((marker) => marker.severity === 8);
      if (hasError) {
        dispatch(setEditorValidatationStatus(false));
        return;
      }
      dispatch(setEditorValidatationStatus(true));
    },
    [dispatch],
  );

  const [playerStates, setPlayerStates] = useState<string[]>([]);

  const handlePlayerEvents = useCallback(
    (event: PlayerEvents) => {
      if (event === PlayerEvents.Ready) {
        const states = lottiePlayer.current?.getManifest()?.states;
        setPlayerStates(states || []);
      }
    },
    [lottiePlayer],
  );

  const handleRemoveFile = useCallback(
    (title: string, fileName: string) => {
      switch (title) {
        case 'States':
          dotLottie.removeState(fileName.replace('.json', ''));
          dispatch(removeState(fileName));
          break;
        case 'Animations':
          dotLottie.removeAnimation(fileName.replace('.json', ''));
          dispatch(removeAnimation(fileName));
          break;
        case 'Themes':
          dotLottie.removeTheme(fileName.replace('.lss', ''));
          dispatch(removeTheme(fileName));
          if (currentFileName === fileName) {
            dispatch(clearEditorFile());
          }
          break;
      }

      if (currentFileName === fileName || editorAnimationId === fileName.replace(/.json/, '')) {
        dispatch(clearEditorState());
      }

      startLottiePlayer();
    },
    [dotLottie, dispatch, startLottiePlayer, currentFileName, editorAnimationId],
  );

  const handleUpload = useCallback(
    async (title: string, file: File) => {
      const fileName = processFilename(file.name).replace(/(.json|.lss)/, '');
      let parsedContent: unknown;
      switch (title) {
        case 'States':
          parsedContent = JSON.parse(await file.text());
          dotLottie.addState({
            id: fileName,
            state: parsedContent as DotLottieState,
          });
          break;
        case 'Animations':
          parsedContent = JSON.parse(await file.text());
          if (parsedContent) {
            dotLottie.addAnimation({
              id: fileName,
              data: parsedContent as any,
            });
          }
          break;
        case 'Themes':
          // const content = await file.text();
          console.log('TODO: upload theme');
          break;
      }

      fetchFromDotLottie();
      startLottiePlayer();
    },
    [dotLottie, startLottiePlayer, fetchFromDotLottie],
  );

  const restartPlayer = useCallback(() => {
    fetchFromDotLottie();
    startLottiePlayer();
  }, [fetchFromDotLottie, startLottiePlayer]);

  const handleAddNew = useCallback(
    async (title: string, fileName: string) => {
      const updatedFileName = processFilename(fileName).replace(/(.json|.lss)/, '');
      let mockState: DotLottieState;

      switch (title) {
        case 'States':
          mockState = getMockDotLottieState();
          mockState.descriptor.id = updatedFileName;
          dotLottie.addState({
            id: updatedFileName,
            state: mockState,
          });
          break;
        case 'Themes':
          dotLottie.addTheme({
            id: updatedFileName,
            data: '/* Make your animations colorful */',
          });
          break;
      }

      fetchFromDotLottie();
      startLottiePlayer();
    },
    [dotLottie, startLottiePlayer, fetchFromDotLottie],
  );

  const openPlaybackOptionsEditor = useCallback(
    (_: string, fileName: string) => {
      dispatch(setEditorAnimationId(fileName.replace(/.json/, '')));
    },
    [dispatch],
  );

  return (
    <div className="h-full flex flex-col">
      <div className="w-full bg-dark p-2 flex gap-2 justify-end">
        <Dropzone onDrop={onDrop}>
          {({ getRootProps, getInputProps }) => (
            <Button {...getRootProps()}>
              <input {...getInputProps()} />
              Start Over
            </Button>
          )}
        </Dropzone>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          <span>{_fileName || 'unnamed.lottie'}</span>
        </div>
        <Button onClick={handleDownload}>Download</Button>
      </div>
      <div className="flex grow border-t border-gray-600 flex-1">
        <PanelGroup autoSaveId="dotlottie-playground" direction="horizontal">
          <Panel defaultSize={10} maxSize={40} className="bg-dark">
            <section className="flex flex-col h-full">
              <FileTree
                className="flex-1 h-1/3"
                title="Animations"
                files={animations}
                onClick={openPlaybackOptionsEditor}
                onRemove={handleRemoveFile}
                onUpload={handleUpload}
              />
              <FileTree
                className="flex-1"
                title="States"
                files={states}
                onClick={openInEditor}
                onRemove={handleRemoveFile}
                onUpload={handleUpload}
                onAddNew={handleAddNew}
              />
              <FileTree
                className="flex-1"
                title="Themes"
                files={themes}
                onClick={openInEditor}
                onRemove={handleRemoveFile}
                onUpload={handleUpload}
                onAddNew={handleAddNew}
              />
            </section>
          </Panel>
          <PanelResizeHandle className="bg-gray-500 w-1" />
          <Panel>
            <div className="w-full h-full relative" {...getRootProps()}>
              <input {...getInputProps()} />
              {isDragActive && (
                <div className="absolute z-10 inset-0 bg-gray-500 opacity-80 flex justify-center items-center text-white text-3xl">
                  Drop your .lottie here
                </div>
              )}
              {editorAnimationId && <PlaybackOptionsEditor onUpdate={restartPlayer} />}
              {editorFileContent && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-stretch pr-4 flex-shrink border-b border-gray-600">
                    <span className="text-white text-sm border-b border-b-blue-500 border-r border-gray-600 px-4 flex items-center">
                      {currentFileName}
                    </span>
                    <button
                      title="Save"
                      className="text-gray-400 py-1 hover:text-white disabled:text-gray-700"
                      onClick={handleSave}
                      disabled={!editorUpdated}
                    >
                      <BiSolidSave size={33} />
                    </button>
                  </div>
                  <Editor
                    className="flex-1"
                    language={editorFileType}
                    width="100%"
                    theme="vs-dark"
                    options={{
                      fontSize: 15,
                      formatOnPaste: true,
                      formatOnType: true,
                      minimap: {
                        enabled: false,
                      },
                    }}
                    loading="Loading..."
                    value={editorFileContent}
                    onChange={onChange}
                    onMount={onMount}
                    onValidate={validateFile}
                  />
                </div>
              )}
            </div>
          </Panel>
          <PanelResizeHandle className="bg-gray-500 w-1" />
          <Panel defaultSize={25}>
            <div>
              {updatedLottie && (
                <>
                  <DotLottiePlayer
                    background="white"
                    onEvent={handlePlayerEvents}
                    lottieRef={lottiePlayer}
                    src={updatedLottie}
                  >
                    <Controls />
                  </DotLottiePlayer>
                  <div className="flex flex-wrap gap-2 p-2 text-white">
                    <span>Available states:</span>
                    {playerStates.map((state) => {
                      return (
                        <Button onClick={() => lottiePlayer.current?.setActiveStateId(state)} key={state}>
                          {state}
                        </Button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

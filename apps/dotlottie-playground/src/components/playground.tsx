/**
 * Copyright 2023 Design Barn Inc.
 */

import { type Animation } from '@lottiefiles/lottie-types';
import Editor from '@monaco-editor/react';
import type monaco from 'monaco-editor';
import React, { useCallback, useEffect, useRef } from 'react';
import Dropzone, { useDropzone } from 'react-dropzone';
import { BiSolidSave } from 'react-icons/bi';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import { type DotLottieStateMachineOptions, useDotLottie } from '../hooks/use-dotlottie';
import {
  clearEditorState,
  setEditorAnimationId,
  setEditorFile,
  setEditorUpdated,
  setEditorValidatationStatus,
} from '../store/editor-slice';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setWorkingFileName } from '../store/playground-slice';
import { formatJSON, getMockDotLottieState, processFilename } from '../utils';

import { Button } from './button';
import { FileTree } from './file-tree';
import { PlaybackOptionsEditor } from './playback-options-editor';
import { Player } from './player';

import '@dotlottie/react-player/dist/index.css';

interface PlaygroundProps {
  file: ArrayBuffer;
  fileName: string;
}

export const Playground: React.FC<PlaygroundProps> = ({ file: dotLottieFile, fileName: dotLottieFileName }) => {
  const dispatch = useAppDispatch();
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const animations = useAppSelector((state) => state.animations.list);
  const themes = useAppSelector((state) => state.themes.list);
  const states = useAppSelector((state) => state.states.list);
  const {
    addDotLottieAnimation,
    addDotLottieStateMachine,
    addDotLottieTheme,
    buildAndUpdateUrl,
    dotLottie,
    downloadDotLottie,
    fetchAndUpdateDotLottie,
    removeDotLottieAnimation,
    removeDotLottieState,
    removeDotLottieTheme,
    setDotLottie,
  } = useDotLottie();
  const editorFileContent = useAppSelector((state) => state.editor.file?.content);
  const editorFileType = useAppSelector((state) => state.editor.file?.type || 'json');
  const editorAnimationId = useAppSelector((state) => state.editor.animationId);
  const workingFileName = useAppSelector((state) => state.playground.workingFileName);

  const updateDotLottieInstance = useCallback(
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
        const newInstance = await dotLottie.fromArrayBuffer(arrayBuffer);

        dispatch(clearEditorState());
        dispatch(setWorkingFileName(name));
        setDotLottie(newInstance);
      }
    },
    [setWorkingFileName, setDotLottie],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const acceptedFile = acceptedFiles[0];

      if (typeof acceptedFile === 'undefined') return;

      updateDotLottieInstance(acceptedFile);
    },
    [updateDotLottieInstance],
  );

  useEffect(() => {
    updateDotLottieInstance(dotLottieFile, dotLottieFileName);
  }, [updateDotLottieInstance]);

  const { getInputProps, getRootProps, isDragActive } = useDropzone({ onDrop, noClick: true });

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

  const handleSave = useCallback(() => {
    if (!isCodeValid || !currentFileName) return;

    const editorValue: string | undefined = editorRef.current?.getValue();
    let editorValueParsed: unknown;

    if (!editorValue) return;

    switch (currentFilePath) {
      case 'States':
        editorValueParsed = JSON.parse(editorValue);
        if (editorValue && currentFileName) {
          const newStateId = (editorValueParsed as DotLottieStateMachineOptions).descriptor.id;

          addDotLottieStateMachine(editorValueParsed as DotLottieStateMachineOptions, currentFileName);
          dispatch(
            setEditorFile({
              name: newStateId,
            }),
          );
        }
        break;

      case 'Themes':
        if (currentFileName) {
          addDotLottieTheme(editorValue, currentFileName);
        }
        break;

      default:
        break;
    }

    dispatch(setEditorUpdated(false));
  }, [isCodeValid, currentFileName, dispatch, currentFilePath]);

  function onMount(editor: monaco.editor.IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  useEffect(() => {
    if (dotLottie.animations.length) {
      fetchAndUpdateDotLottie();
      buildAndUpdateUrl();
    }
  }, [dotLottie, buildAndUpdateUrl, fetchAndUpdateDotLottie]);

  const openInEditor = useCallback(
    async (folder: string, fileName: string) => {
      dispatch(clearEditorState());
      let fileContent: string | undefined;
      let isTheme = false;

      switch (folder) {
        case 'States':
          fileContent = dotLottie.getStateMachine(fileName)?.toString();
          break;

        case 'Themes':
          fileContent = await dotLottie.getTheme(fileName)?.toString();
          isTheme = true;
          break;

        default:
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

  const handleRemoveFile = useCallback(
    (title: string, fileName: string) => {
      switch (title) {
        case 'States':
          removeDotLottieState(fileName);
          break;

        case 'Animations':
          removeDotLottieAnimation(fileName);
          break;

        case 'Themes':
          removeDotLottieTheme(fileName);
          break;

        default:
          break;
      }

      if (currentFileName === fileName || editorAnimationId === fileName) {
        dispatch(clearEditorState());
      }
    },
    [dotLottie, dispatch, currentFileName, editorAnimationId],
  );

  const handleUpload = useCallback(
    async (title: string, file: File) => {
      const fileName = processFilename(file.name).replace(/(.json|.lss)/gu, '');
      let parsedContent: unknown;

      switch (title) {
        case 'States':
          parsedContent = JSON.parse(await file.text());
          addDotLottieStateMachine(parsedContent as DotLottieStateMachineOptions);
          break;

        case 'Animations':
          parsedContent = JSON.parse(await file.text());
          addDotLottieAnimation(parsedContent as Animation, fileName);
          break;

        case 'Themes':
          parsedContent = await file.text();
          addDotLottieTheme(parsedContent as string, file.name);
          break;

        default:
          break;
      }
    },
    [dotLottie],
  );

  const restartPlayer = useCallback(() => {
    fetchAndUpdateDotLottie();
    buildAndUpdateUrl();
  }, [fetchAndUpdateDotLottie, buildAndUpdateUrl]);

  const handleAddNew = useCallback(
    async (title: string, fileName: string) => {
      const updatedFileName = processFilename(fileName).replace(/(.json|.lss)/gu, '');
      let mockState: DotLottieStateMachineOptions;

      switch (title) {
        case 'States':
          mockState = getMockDotLottieState();
          mockState.descriptor.id = updatedFileName;
          addDotLottieStateMachine(mockState);
          break;

        case 'Themes':
          addDotLottieTheme('/* Make your animations colorful */', updatedFileName);
          break;

        default:
          break;
      }
    },
    [dotLottie],
  );

  const openPlaybackOptionsEditor = useCallback(
    (_: string, fileName: string) => {
      dispatch(setEditorAnimationId(fileName.replace(/.json/gu, '')));
    },
    [dispatch],
  );

  return (
    <div className="h-full flex flex-col">
      <div className="w-full bg-dark p-2 flex gap-2 justify-end">
        <Dropzone onDrop={onDrop}>
          {(state): JSX.Element => (
            <Button {...state.getRootProps()}>
              <input {...state.getInputProps()} />
              Start Over
            </Button>
          )}
        </Dropzone>
        <div className="flex-1 flex justify-center items-center text-gray-400 text-sm">
          <span>{workingFileName || 'unnamed.lottie'}</span>
        </div>
        <Button onClick={downloadDotLottie}>Download</Button>
      </div>
      <div className="flex grow border-t border-gray-600 flex-1">
        <PanelGroup autoSaveId="dotlottie-playground" direction="horizontal" className="h-full">
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
            <div className="flex flex-col w-full h-full relative" {...getRootProps()}>
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
                    className="flex-1 max-h-[calc(100vh-5.5rem)]"
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
            <Player />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
};

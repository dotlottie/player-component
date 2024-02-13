/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useState } from 'react';
import { useKey } from 'react-use';

import { useDotLottie } from '../../hooks/use-dotlottie';
import { clearEditorState } from '../../store/editor-slice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { Dropzone } from '../dropzone';

import { AddNew } from './add-new';
import { EditableItem } from './editable-item';
import { Title } from './title';

const FILE_TYPES = ['json'] as const;

export type SupportedFileTypes = typeof FILE_TYPES[number];

export interface SupportedFile {
  name: string;
  type: SupportedFileTypes;
}

interface FileTreeProps {
  className?: string;
  files: SupportedFile[];
  onAddNew?: (title: string, fileName: string) => void | Promise<void>;
  onClick?: (title: string, fileName: string) => void | Promise<void>;
  onRemove?: (title: string, fileName: string) => void | Promise<void>;
  onUpload?: (title: string, file: File) => void | Promise<void>;
  title: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  className,
  files,
  onAddNew,
  onClick,
  onRemove,
  onUpload,
  title,
}) => {
  const { renameDotLottieAnimation } = useDotLottie();
  const dispatch = useAppDispatch();

  const handleClick = useCallback(
    (fileName: string) => {
      return () => {
        onClick?.(title, fileName);
      };
    },
    [onClick, title],
  );

  const handleRemove = useCallback(
    (fileName: string) => {
      onRemove?.(title, fileName);
    },
    [onRemove, title],
  );

  const [displayAdd, setDisplayAdd] = useState(false);

  const startAddNew = useCallback(() => {
    setDisplayAdd(true);
  }, []);

  useKey(
    'Escape',
    () => {
      setDisplayAdd(false);
    },
    { event: 'keyup' },
  );

  const handleAddNew = useCallback(
    (value: string) => {
      onAddNew?.(title, `${value}.json`);
      setDisplayAdd(false);
    },
    [onAddNew, title],
  );

  const handleRename = useCallback(
    (id: string, previousId: string) => {
      if (title === 'Animations') {
        renameDotLottieAnimation(id, previousId);
        dispatch(clearEditorState());
      }
    },
    [title, renameDotLottieAnimation],
  );

  const handleUpload = useCallback(
    (file: File) => {
      onUpload?.(title, file);
    },
    [onUpload, title],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      handleUpload(acceptedFiles[0]);
    },
    [handleUpload],
  );

  const editorFileName = useAppSelector((state) => state.editor.file?.name);
  const editorAnimationId = useAppSelector((state) => state.editor.animationId);

  return (
    <div className={`flex flex-col ${className}`}>
      <Title
        title={title}
        onClickAdd={startAddNew}
        onUpload={handleUpload}
        buttons={title === 'Animations' ? ['upload'] : ['upload', 'add']}
      />
      <div className="relative h-full overflow-y-auto custom-scrollbar">
        <Dropzone onDrop={onDrop} accept={'json'} noClick>
          {(state): JSX.Element => {
            return (
              <div {...state.getRootProps()}>
                <input {...state.getInputProps()} />
                {state.isDragActive && (
                  <div className="absolute inset-0 bg-black opacity-50 text-white flex justify-center items-center">
                    Drop {title}
                  </div>
                )}
                <ul className="w-full py-2">
                  {Array.isArray(files) &&
                    files.map((file) => {
                      return (
                        <li
                          key={file.name}
                          data-value={title}
                          className={`w-full ${
                            editorAnimationId === file.name || editorFileName === file.name
                              ? 'bg-gray-700 text-gray-100'
                              : 'text-gray-400'
                          }`}
                        >
                          <EditableItem
                            onRemove={handleRemove}
                            onRename={handleRename}
                            editable={title === 'Animations'}
                            file={file}
                            onClick={handleClick(file.name)}
                          />
                        </li>
                      );
                    })}

                  {displayAdd && (
                    <li>
                      <AddNew onAdd={handleAddNew} extension={'json'} />
                    </li>
                  )}
                </ul>
              </div>
            );
          }}
        </Dropzone>
        <div></div>
      </div>
    </div>
  );
};

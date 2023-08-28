/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { RxCross2 } from 'react-icons/rx';
import { useKey } from 'react-use';

import { useAppSelector } from '../../store/hooks';
import { Dropzone } from '../dropzone';

import { AddNew } from './add-new';
import { FileIcon } from './file-icon';
import { Title } from './title';

const FILE_TYPES = ['json', 'lss'] as const;

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
  const handleClick = useCallback(
    (fileName: string) => {
      return () => {
        onClick?.(title, fileName);
      };
    },
    [onClick, title],
  );

  const fileExtention = useMemo(() => (title.toLowerCase() === 'themes' ? 'lss' : 'json'), [title]);

  const handleRemove = useCallback(
    (fileName: string) => {
      return (event: React.MouseEvent) => {
        event.stopPropagation();
        onRemove?.(title, fileName);
      };
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
      onAddNew?.(title, `${value}.${fileExtention}`);
      setDisplayAdd(false);
    },
    [onAddNew, title, fileExtention],
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
        <Dropzone onDrop={onDrop} accept={title === 'Themes' ? 'lss' : 'json'} noClick>
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
                    files.map((file, index) => {
                      return (
                        <li
                          key={index}
                          data-value={title}
                          className={`w-full ${
                            editorAnimationId === file.name || editorFileName === file.name
                              ? 'bg-gray-700 text-gray-100'
                              : 'text-gray-400'
                          }`}
                        >
                          <button
                            onClick={handleClick(file.name)}
                            className="group w-full flex items-center gap-1 px-2 py-1 pl-4 text-sm whitespace-nowrap hover:text-white"
                          >
                            <span>
                              <FileIcon type={file.type} />
                            </span>
                            <span className="flex-1 text-left">{file.name}</span>
                            <span
                              onClick={handleRemove(file.name)}
                              title="Remove"
                              className="justify-self-end text-gray-400 hover:text-white opacity-0 group-hover:opacity-100"
                            >
                              <RxCross2 size={20} />
                            </span>
                          </button>
                        </li>
                      );
                    })}

                  {displayAdd && (
                    <li>
                      <AddNew onAdd={handleAddNew} extension={title === 'Themes' ? 'lss' : 'json'} />
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

import React, { ElementRef, FocusEventHandler, KeyboardEventHandler, useCallback, useRef, useState } from 'react';

import { useDropzone } from 'react-dropzone';
import { useKey } from 'react-use';
import { Title } from './title';
import { FileIcon } from './file-icon';
import { RxCross2 } from 'react-icons/rx';
import { useMemo } from 'react';
import { useAppSelector } from '../../store/hooks';

const FILE_TYPES = ['json', 'lss'] as const;

export type SupportedFileTypes = typeof FILE_TYPES[number];

export interface SupportedFile {
  name: string;
  type: SupportedFileTypes;
}

interface FileTreeProps {
  title: string;
  files: SupportedFile[];
  onClick?: (title: string, fileName: string) => void;
  onRemove?: (title: string, fileName: string) => void;
  onAddNew?: (title: string, fileName: string) => void;
  onUpload?: (title: string, file: File) => void;
  className?: string;
}

export const FileTree: React.FC<FileTreeProps> = ({
  onClick,
  onRemove,
  onAddNew,
  onUpload,
  files,
  title,
  className,
}) => {
  const handleClick = useCallback(
    (fileName: string) => {
      return () => onClick?.(title, fileName);
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    multiple: false,
  });

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
      <div className="relative h-full overflow-y-auto custom-scrollbar" {...getRootProps()}>
        <input {...getInputProps()} />
        {isDragActive && (
          <div className="absolute inset-0 bg-black opacity-50 text-white flex justify-center items-center">
            Drop {title}
          </div>
        )}
        <ul className="w-full py-2" onClick={() => {}}>
          {Array.isArray(files) &&
            files.map((file, index) => {
              return (
                <li
                  key={index}
                  data-value={title}
                  className={`w-full ${
                    `${editorAnimationId}.json` === file.name || editorFileName === file.name
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
    </div>
  );
};

// Add new input
interface AddNewProps {
  onAdd: (value: string) => void;
  extension: SupportedFileTypes;
}
export const AddNew: React.FC<AddNewProps> = ({ extension, onAdd }) => {
  const ref = useRef<ElementRef<'input'>>(null);

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (event) => {
      if (typeof onAdd === 'function' && event.target.value) {
        onAdd(event.target.value.replace(/\s+/g, '_'));
      }
    },
    [onAdd],
  );

  const handleKeyUp = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key === 'Enter' && ref.current?.value && typeof onAdd === 'function') {
        onAdd(ref.current.value.replace(/\s+/g, '_'));
      }
    },
    [onAdd],
  );

  return (
    <div className="w-full bg-dark flex items-center gap-1 px-2 py-1 pl-4 text-gray-400 text-sm whitespace-nowrap hover:text-white">
      <span>
        <FileIcon type="json" />
      </span>
      <input ref={ref} type="text" className="bg-gray-white text-black" onKeyUp={handleKeyUp} onBlur={handleBlur} />
      <span>{extension}</span>
    </div>
  );
};

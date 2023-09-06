/**
 * Copyright 2023 Design Barn Inc.
 */

import React, {
  type HTMLAttributes,
  useCallback,
  type MouseEventHandler,
  useState,
  useRef,
  type KeyboardEventHandler,
} from 'react';
import { BiSolidEdit } from 'react-icons/bi';
import { RxCross2 } from 'react-icons/rx';

import { processFilename } from '../../utils';

import { FileIcon } from './file-icon';

import { type SupportedFile } from '.';

interface EditableItemProps extends HTMLAttributes<HTMLButtonElement> {
  editable?: boolean;
  file: SupportedFile;
  onClick?: () => void;
  onRemove?: (fileName: string) => void;
  onRename?: (previousId: string, newId: string) => void;
}

export const EditableItem: React.FC<EditableItemProps> = ({ editable, file, onRemove, onRename, ...props }) => {
  const [editMode, setEditMode] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.stopPropagation();
      onRemove?.(file.name);
    },
    [onRemove, file.name],
  );

  const enterEditMode = useCallback<MouseEventHandler<HTMLSpanElement>>(
    (event) => {
      event.stopPropagation();
      setEditMode(true);
    },
    [setEditMode, editMode],
  );

  const triggerRename = useCallback(() => {
    if (inputRef.current && inputRef.current.value !== file.name) {
      onRename?.(file.name, processFilename(inputRef.current.value));
    }
    setEditMode(false);
  }, [onRename, setEditMode, inputRef]);

  const checkForEnterKey = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key === 'Enter') {
        triggerRename();
      }
    },
    [triggerRename],
  );

  return (
    <button
      className="group w-full flex items-center gap-1 px-2 py-1 pl-4 text-sm whitespace-nowrap hover:text-white"
      {...props}
    >
      <span>
        <FileIcon type={file.type} />
      </span>
      {editMode && (
        <input
          ref={inputRef}
          onKeyDown={checkForEnterKey}
          onBlur={triggerRename}
          autoFocus
          className="outline-none bg-transparent flex-1 text-left"
          defaultValue={file.name}
        />
      )}
      {!editMode && <span className="flex-1 text-left">{file.name}</span>}
      {!editMode && (
        <div className="flex justify-self-end text-gray-400 gap-1">
          {editable && (
            <span onClick={enterEditMode} className="hover:text-white opacity-0 group-hover:opacity-100">
              <BiSolidEdit size={20} />
            </span>
          )}
          <span onClick={handleRemove} title="Remove" className="hover:text-white opacity-0 group-hover:opacity-100">
            <RxCross2 size={20} />
          </span>
        </div>
      )}
    </button>
  );
};

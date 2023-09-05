/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useState, useRef, type KeyboardEventHandler } from 'react';
import { BiSolidEdit } from 'react-icons/bi';

import { cn } from '../utils';

interface EditableTitleProps {
  onChange: (value: string) => void;
  title: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({ onChange, title }) => {
  const [edit, setEdit] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = useCallback((): void => {
    if (!edit) {
      setEdit(true);
    }
  }, [edit]);

  const handleSave = useCallback(() => {
    onChange(inputRef.current?.value ? `${inputRef.current.value}.lottie` : title);
    setEdit(false);
  }, [onchange, setEdit]);

  const checkForEnterKey = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key === 'Enter') {
        handleSave();
      }
    },
    [handleSave],
  );

  return (
    <div className="group flex items-center">
      {edit && (
        <input
          ref={inputRef}
          autoFocus
          className="bg-transparent outline-none"
          type="text"
          onKeyDown={checkForEnterKey}
          onBlur={handleSave}
          defaultValue={title.replace(/.lottie$/u, '')}
        />
      )}
      {!edit && <span>{title || 'unnamed.lottie'}</span>}
      <button onClick={handleClick} className={cn('invisible', !edit && 'group-hover:visible')}>
        <BiSolidEdit size={20} />
      </button>
    </div>
  );
};

/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type ChangeEventHandler, useCallback, useState } from 'react';
import { BiSolidEdit } from 'react-icons/bi';
import { useKey } from 'react-use';

import { cn } from '../utils';

interface EditableTitleProps {
  onChange: (value: string) => void;
  title: string;
}

export const EditableTitle: React.FC<EditableTitleProps> = ({ onChange, title }) => {
  const [edit, setEdit] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState(title.replace(/.lottie$/u, ''));

  const handleClick = useCallback((): void => {
    if (!edit) {
      setEdit(true);
    }
  }, [edit]);

  const handleSave = useCallback(() => {
    onChange(updatedTitle ? `${updatedTitle}.lottie` : title);
    setEdit(false);
  }, [updatedTitle, onchange, setEdit]);

  const handlValueChanged = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      setUpdatedTitle(event.target.value);
    },
    [setUpdatedTitle],
  );

  useKey('Escape', () => {
    setEdit(false);
  });

  useKey(
    'Enter',
    () => {
      if (!edit) return;

      handleSave();
    },
    {},
    [handleSave],
  );

  return (
    <div className="group flex items-center">
      {edit && (
        <input
          autoFocus
          className="bg-transparent outline-none"
          type="text"
          onBlur={handleSave}
          defaultValue={title.replace(/.lottie$/u, '')}
          onChange={handlValueChanged}
        />
      )}
      {!edit && <span>{title || 'unnamed.lottie'}</span>}
      <button onClick={handleClick} className={cn('invisible', !edit && 'group-hover:visible')}>
        <BiSolidEdit size={20} />
      </button>
    </div>
  );
};

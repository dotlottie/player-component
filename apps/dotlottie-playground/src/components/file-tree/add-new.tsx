/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type ElementRef, type FocusEventHandler, type KeyboardEventHandler, useCallback, useRef } from 'react';

import { FileIcon } from './file-icon';

import type { SupportedFileTypes } from '.';

interface AddNewProps {
  extension: SupportedFileTypes;
  onAdd: (value: string) => void;
}
export const AddNew: React.FC<AddNewProps> = ({ onAdd }) => {
  const ref = useRef<ElementRef<'input'>>(null);

  const handleBlur = useCallback<FocusEventHandler<HTMLInputElement>>(
    (event) => {
      if (typeof onAdd === 'function' && event.target.value) {
        onAdd(event.target.value.replace(/\s+/gu, '_'));
      }
    },
    [onAdd],
  );

  const handleKeyUp = useCallback<KeyboardEventHandler<HTMLInputElement>>(
    (event) => {
      if (event.key === 'Enter' && ref.current?.value && typeof onAdd === 'function') {
        onAdd(ref.current.value.replace(/\s+/gu, '_'));
      }
    },
    [onAdd],
  );

  return (
    <div className="w-full bg-dark flex items-center gap-1 px-2 py-1 pl-4 text-gray-400 text-sm whitespace-nowrap hover:text-white">
      <span>
        <FileIcon type="json" />
      </span>
      <input
        autoFocus
        ref={ref}
        type="text"
        className="bg-transparent outline-none"
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
      />
    </div>
  );
};

/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type ChangeEventHandler, useCallback, useRef } from 'react';

interface InputColorPickerProps {
  label: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const InputColorPicker: React.FC<InputColorPickerProps> = ({ label, onChange, value }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      onChange?.(event.target.value);
    },
    [onChange],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), [inputRef]);

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <button
        onClick={openPicker}
        className={`flex items-center justify-between py-2 px-3 rounded bg-white text-gray-600`}
      >
        <div className="py-1 px-2 w-full text-left rounded" style={{ backgroundColor: value }}>
          <span className="text-white mix-blend-difference">{value || 'transparent'}</span>
        </div>
      </button>
      <input
        ref={inputRef}
        type="color"
        onChange={handleChange}
        value={value}
        name={label}
        className={`invisible h-0 w-0`}
      />
    </div>
  );
};

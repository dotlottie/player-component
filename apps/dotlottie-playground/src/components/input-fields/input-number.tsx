/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type ChangeEventHandler, useCallback } from 'react';

interface InputNumberProps {
  label: string;
  onChange?: (value: number) => void;
  value?: number;
}

export const InputNumber: React.FC<InputNumberProps> = ({ label, onChange, value }) => {
  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    (event) => {
      onChange?.(Number(event.target.value));
    },
    [onChange],
  );

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <input
        type="number"
        onChange={handleChange}
        value={value}
        name={label}
        className={`py-3 px-3 rounded bg-white text-gray-600`}
      />
    </div>
  );
};

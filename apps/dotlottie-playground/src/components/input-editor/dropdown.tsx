/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type ChangeEventHandler, useCallback } from 'react';

interface InputDropdownProps {
  items: Array<{ name: string; value: string }>;
  label: string;
  onChange?: (value: string) => void;
  value?: string;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({ items, label, onChange, value }) => {
  const handleChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (event) => {
      onChange?.(event.target.value);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <select onChange={handleChange} value={value} className={`py-3 px-3 rounded bg-white text-gray-600`}>
        {items.map((item) => {
          return (
            <option key={item.value} value={item.value}>
              {item.name}
            </option>
          );
        })}
      </select>
    </div>
  );
};

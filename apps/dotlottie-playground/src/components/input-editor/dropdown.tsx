import React, { ChangeEventHandler, useCallback } from 'react';

interface InputDropdownProps {
  value?: string;
  label: string;
  items: { name: string; value: string }[];
  onChange?: (value: string) => void;
}

export const InputDropdown: React.FC<InputDropdownProps> = ({ items, onChange, value, label }) => {
  const handleChange = useCallback<ChangeEventHandler<HTMLSelectElement>>(
    (event) => {
      onChange?.(event.target.value);
    },
    [onChange],
  );

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <select onChange={handleChange} value={value} className={`py-3 px-3 rounded bg-white text-gray-400 `}>
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

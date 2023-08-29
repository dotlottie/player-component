/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback } from 'react';
import { PiToggleLeftFill, PiToggleRightFill } from 'react-icons/pi';

interface InputBooleanProps {
  label: string;
  onToggle?: (value: boolean) => void;
  value?: boolean;
}

export const InputBoolean: React.FC<InputBooleanProps> = ({ label, onToggle, value }) => {
  const handleToggle = useCallback(() => {
    onToggle?.(!value);
  }, [onToggle, value]);

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <button
        onClick={handleToggle}
        className={`flex items-center justify-between py-2 px-3 rounded bg-white text-gray-600`}
      >
        <div>{value ? 'On' : 'Off'}</div>
        <span className={`${value ? 'text-green-700' : ''}`}>
          {value ? <PiToggleRightFill size={30} /> : <PiToggleLeftFill size={30} />}
        </span>
      </button>
    </div>
  );
};

/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type HTMLAttributes } from 'react';

import { cn } from '../utils';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  color?: 'green' | 'red' | 'blue';
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, color = 'blue', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'text-white rounded px-3 py-1  text-sm disabled:bg-gray-500',
          color === 'blue' && 'bg-blue-600 hover:bg-blue-700',
          color === 'green' && 'bg-green-600 hover:bg-green-700',
          color === 'red' && 'bg-red-600 hover:bg-red-700',
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);

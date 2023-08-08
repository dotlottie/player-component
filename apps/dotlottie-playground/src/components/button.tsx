/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type HTMLAttributes } from 'react';

interface ButtonProps extends HTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className="text-white rounded px-3 py-1 bg-blue-600 hover:bg-blue-700 text-sm disabled:bg-gray-500"
      {...props}
    >
      {children}
    </button>
  );
});

/**
 * Copyright 2023 Design Barn Inc.
 */

import type { SVGAttributes } from 'react';
import React from 'react';

export const EllipsisVertical = (props: SVGAttributes<SVGElement>): JSX.Element => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M8.33325 11.6667C7.78097 11.6667 7.33325 12.1144 7.33325 12.6667C7.33325 13.2189 7.78097 13.6667 8.33325 13.6667C8.88554 13.6667 9.33325 13.2189 9.33325 12.6667C9.33325 12.1144 8.88554 11.6667 8.33325 11.6667Z"
        fill="currentColor"
      />
      <path
        d="M7.33325 8C7.33325 7.44771 7.78097 7 8.33325 7C8.88554 7 9.33325 7.44771 9.33325 8C9.33325 8.55228 8.88554 9 8.33325 9C7.78097 9 7.33325 8.55228 7.33325 8Z"
        fill="currentColor"
      />
      <path
        d="M7.33325 3.33333C7.33325 2.78105 7.78097 2.33333 8.33325 2.33333C8.88554 2.33333 9.33325 2.78105 9.33325 3.33333C9.33325 3.88562 8.88554 4.33333 8.33325 4.33333C7.78097 4.33333 7.33325 3.88562 7.33325 3.33333Z"
        fill="currentColor"
      />
    </svg>
  );
};

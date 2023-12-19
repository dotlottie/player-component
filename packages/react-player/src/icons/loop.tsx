/**
 * Copyright 2023 Design Barn Inc.
 */

import type { SVGAttributes } from 'react';
import React from 'react';

export const Loop = (props: SVGAttributes<SVGElement>): JSX.Element => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M10.8654 2.31311C11.0607 2.11785 11.3772 2.11785 11.5725 2.31311L13.4581 4.19873C13.6534 4.39399 13.6534 4.71058 13.4581 4.90584L11.5725 6.79146C11.3772 6.98672 11.0607 6.98672 10.8654 6.79146C10.6701 6.5962 10.6701 6.27961 10.8654 6.08435L11.6162 5.33354H4V6.66687C4 7.03506 3.70152 7.33354 3.33333 7.33354C2.96514 7.33354 2.66666 7.03506 2.66666 6.66687L2.66666 4.66687C2.66666 4.29868 2.96514 4.0002 3.33333 4.0002H11.8454L10.8654 3.02022C10.6701 2.82496 10.6701 2.50838 10.8654 2.31311Z"
        fill="currentColor"
      />
      <path
        d="M12.4375 11.9998C12.8057 11.9998 13.1042 11.7013 13.1042 11.3331V9.33313C13.1042 8.96494 12.8057 8.66647 12.4375 8.66647C12.0693 8.66647 11.7708 8.96494 11.7708 9.33313V10.6665H4.15462L4.90543 9.91565C5.10069 9.72039 5.10069 9.40381 4.90543 9.20854C4.71017 9.01328 4.39359 9.01328 4.19832 9.20854L2.31271 11.0942C2.11744 11.2894 2.11744 11.606 2.31271 11.8013L4.19832 13.6869C4.39359 13.8821 4.71017 13.8821 4.90543 13.6869C5.10069 13.4916 5.10069 13.175 4.90543 12.9798L3.92545 11.9998H12.4375Z"
        fill="currentColor"
      />
    </svg>
  );
};
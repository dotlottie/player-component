/**
 * Copyright 2023 Design Barn Inc.
 */

import type { SVGAttributes } from 'react';
import React from 'react';

export const LoopOff = (props: SVGAttributes<SVGElement>): JSX.Element => {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5873 3.61127C16.8802 3.31838 17.355 3.31838 17.6479 3.61127L20.4764 6.4397C20.7693 6.73259 20.7693 7.20747 20.4764 7.50036L17.6479 10.3288C17.355 10.6217 16.8802 10.6217 16.5873 10.3288C16.2944 10.0359 16.2944 9.56102 16.5873 9.26813L17.7132 8.14217H12.2889L11.1342 6.14217H18.0575L16.5873 4.67193C16.2944 4.37904 16.2944 3.90416 16.5873 3.61127ZM5.28918 6.1419L5.31263 6.14217H6.51541L7.67011 8.14217H6.28918V10.1419C6.28918 10.6942 5.84146 11.1419 5.28918 11.1419C4.73689 11.1419 4.28918 10.6942 4.28918 10.1419L4.28918 7.1419C4.28918 6.58962 4.73689 6.1419 5.28918 6.1419ZM17.9454 16.142V14.1413C17.9454 13.589 18.3931 13.1413 18.9454 13.1413C19.4977 13.1413 19.9454 13.589 19.9454 14.1413V17.1413L19.9453 17.1578C19.9368 17.7028 19.4924 18.142 18.9454 18.142H18.0623L16.9076 16.142H17.9454ZM7.64733 20.6719C7.35444 20.9648 6.87956 20.9648 6.58667 20.6719L3.75824 17.8435C3.46535 17.5506 3.46535 17.0757 3.75824 16.7828L6.58667 13.9544C6.87956 13.6615 7.35444 13.6615 7.64733 13.9544C7.94022 14.2473 7.94022 14.7222 7.64733 15.0151L6.52045 16.142L12.2888 16.142L13.4435 18.142H6.17802L7.64733 19.6113C7.94022 19.9042 7.94022 20.379 7.64733 20.6719ZM16.1393 20.3113C16.3464 20.67 16.8051 20.7929 17.1639 20.5858C17.5226 20.3787 17.6455 19.92 17.4384 19.5613L8.4384 3.97288C8.23129 3.61416 7.7726 3.49126 7.41388 3.69836C7.05516 3.90547 6.93225 4.36416 7.13936 4.72288L16.1393 20.3113Z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Copyright 2023 Design Barn Inc.
 */

import type { SVGAttributes } from 'react';
import React from 'react';

export const CheckMark = (props: SVGAttributes<SVGElement>): JSX.Element => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.5283 5.9372C20.8211 6.23009 20.8211 6.70497 20.5283 6.99786L9.4631 18.063C9.32181 18.2043 9.12997 18.2833 8.93016 18.2826C8.73035 18.2819 8.53907 18.2015 8.39877 18.0593L3.46807 13.0596C3.17722 12.7647 3.18052 12.2898 3.47544 11.999C3.77036 11.7081 4.24522 11.7114 4.53608 12.0063L8.93646 16.4683L19.4676 5.9372C19.7605 5.64431 20.2354 5.64431 20.5283 5.9372Z"
        fill="currentColor"
      />
    </svg>
  );
};

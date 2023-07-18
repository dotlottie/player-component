/**
 * Copyright 2023 Design Barn Inc.
 */

import type { SVGAttributes } from 'react';
import React from 'react';

export const Segment = (props: SVGAttributes<SVGElement>): JSX.Element => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.543 3.17082C10.5464 3.16867 10.549 3.16769 10.5506 3.16722C10.5522 3.16676 10.5533 3.16667 10.554 3.16667C10.5548 3.16667 10.5559 3.16677 10.5575 3.16723C10.5591 3.16771 10.5617 3.16871 10.5652 3.17088L12.7893 4.56735L12.7903 4.56794C12.7971 4.57222 12.8079 4.58168 12.8174 4.5995C12.8269 4.61748 12.8333 4.6408 12.8333 4.66667C12.8333 4.69254 12.8269 4.71585 12.8174 4.73384C12.8079 4.75165 12.7971 4.76111 12.7903 4.76539L12.7893 4.76599L10.5663 6.16173L10.5652 6.16246C10.5617 6.16463 10.5591 6.16563 10.5575 6.1661C10.5559 6.16657 10.5548 6.16667 10.554 6.16667C10.5533 6.16667 10.5522 6.16658 10.5506 6.16612C10.549 6.16565 10.5464 6.16466 10.543 6.16252C10.5361 6.15819 10.5253 6.14866 10.5158 6.13078C10.5063 6.11273 10.4999 6.08938 10.5 6.06351L10.5 6.06241L10.5 3.27093L10.5 3.26983C10.4999 3.24396 10.5063 3.2206 10.5158 3.20256C10.5253 3.18468 10.5361 3.17515 10.543 3.17082ZM10.5553 2.16667C10.3613 2.16642 10.1734 2.22204 10.011 2.32404C9.84909 2.42578 9.71976 2.5689 9.63195 2.73485C9.54433 2.90044 9.49969 3.08536 9.5 3.27139V6.06194C9.49969 6.24798 9.54433 6.43289 9.63195 6.59849C9.71976 6.76444 9.84909 6.90756 10.011 7.0093C10.1734 7.1113 10.3613 7.16692 10.5553 7.16667C10.7491 7.16641 10.9366 7.11045 11.0986 7.00832L11.0992 7.0079L13.3206 5.61316C13.4826 5.51184 13.6121 5.36914 13.7002 5.20357C13.7883 5.03797 13.8333 4.85292 13.8333 4.66667C13.8333 4.48042 13.7883 4.29536 13.7002 4.12977C13.6121 3.96419 13.4821 3.82116 13.3201 3.71984L11.0992 2.32543L11.0985 2.325C10.9366 2.22288 10.7491 2.16692 10.5553 2.16667ZM2.74408 4.07741C2.90036 3.92113 3.11232 3.83334 3.33333 3.83334H8C8.27614 3.83334 8.5 3.60948 8.5 3.33334C8.5 3.05719 8.27614 2.83334 8 2.83334H3.33333C2.8471 2.83334 2.38079 3.02649 2.03697 3.37031C1.69315 3.71412 1.5 4.18044 1.5 4.66667V9.99995V10.0001V12.6667C1.5 13.1529 1.69315 13.6192 2.03697 13.963C2.38079 14.3068 2.8471 14.5 3.33333 14.5H11.3333C11.8196 14.5 12.2859 14.3068 12.6297 13.963C12.9735 13.6192 13.1667 13.1529 13.1667 12.6667V11.2002V11.1998V9.33333C13.1667 9.05719 12.9428 8.83333 12.6667 8.83333C12.3905 8.83333 12.1667 9.05719 12.1667 9.33333V9.98209L10.9091 8.70865L10.9053 8.70486C10.5882 8.39059 10.1598 8.21428 9.71333 8.21428C9.26688 8.21428 8.83849 8.39059 8.52137 8.70485L7.93233 9.2939L6.16709 7.52664L6.16529 7.52486C5.84818 7.21059 5.41979 7.03428 4.97333 7.03428C4.52688 7.03428 4.09849 7.21059 3.78138 7.52486L2.5 8.79823V4.66667C2.5 4.44565 2.5878 4.23369 2.74408 4.07741ZM10.1997 9.41351L12.1667 11.4053V12.6667C12.1667 12.8877 12.0789 13.0996 11.9226 13.2559C11.9171 13.2614 11.9116 13.2667 11.906 13.272L8.64013 10.0003L9.22599 9.41446C9.35576 9.28621 9.53086 9.21428 9.71333 9.21428C9.89535 9.21428 10.07 9.28586 10.1997 9.41351ZM2.5 10.208V12.6667C2.5 12.8877 2.5878 13.0996 2.74408 13.2559C2.90036 13.4122 3.11232 13.5 3.33333 13.5H10.7202L5.46138 8.23515L5.4606 8.23438C5.33084 8.10618 5.15577 8.03428 4.97333 8.03428C4.79064 8.03428 4.61511 8.10662 4.48529 8.23515L2.5 10.208Z"
        fill="currentColor"
      />
    </svg>
  );
};

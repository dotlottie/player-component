/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';
import { BsFiletypeJson } from 'react-icons/bs';

import type { SupportedFileTypes } from '.';

export const FileIcon = ({ type }: { type: SupportedFileTypes }): JSX.Element => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (type !== 'json') {
    return <></>;
  }

  return <BsFiletypeJson />;
};

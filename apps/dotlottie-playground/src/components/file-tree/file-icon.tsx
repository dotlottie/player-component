/**
 * Copyright 2023 Design Barn Inc.
 */

import React from 'react';
import { BsFiletypeJson, BsFiletypeCss } from 'react-icons/bs';

import type { SupportedFileTypes } from '.';

export const FileIcon = ({ type }: { type: SupportedFileTypes }): JSX.Element => {
  if (type === 'lss') {
    return <BsFiletypeCss />;
  } else {
    return <BsFiletypeJson />;
  }
};

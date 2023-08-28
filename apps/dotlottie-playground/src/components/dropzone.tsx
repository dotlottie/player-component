/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback } from 'react';
import ReactDropzone, { type DropzoneState, type FileError, type FileRejection, ErrorCode } from 'react-dropzone';
import { toast } from 'react-toastify';

interface DropzoneProps {
  accept: 'lottie' | 'json' | 'lss';
  children: (state: DropzoneState) => JSX.Element;
  multiple?: boolean;
  noClick?: boolean;
  onDrop: (acceptedFiels: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ accept, children, multiple, noClick, onDrop }) => {
  const onDropRejected = useCallback((rejectedFiles: FileRejection[]) => {
    for (const rejectedFile of rejectedFiles) {
      toast(`${rejectedFile.errors[0].message},  ${rejectedFile.file.name}`, {
        type: 'error',
      });
    }
  }, []);

  const validateFiles = useCallback((file: File): FileError | FileError[] | null => {
    const fileName = typeof file.name === 'string' ? file.name : '';

    if (accept === 'lottie' && !fileName.endsWith('.lottie')) {
      return {
        message: 'Invalid .lottie',
        code: ErrorCode.FileInvalidType,
      };
    }

    if (accept === 'json' && file.type !== 'application/json') {
      return {
        message: 'Invalid .json',
        code: ErrorCode.FileInvalidType,
      };
    }

    if (accept === 'lss' && !fileName.endsWith('.lss')) {
      return {
        message: 'Invalid .lss',
        code: ErrorCode.FileInvalidType,
      };
    }

    return null;
  }, []);

  return (
    <ReactDropzone
      noClick={noClick}
      maxFiles={multiple ? 10 : 1}
      validator={validateFiles}
      multiple={multiple}
      onDrop={onDrop}
      onDropRejected={onDropRejected}
    >
      {children}
    </ReactDropzone>
  );
};

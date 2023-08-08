/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { type HTMLAttributes, useCallback } from 'react';
import Dropzone from 'react-dropzone';
import { AiFillFileAdd } from 'react-icons/ai';
import { FaFolder } from 'react-icons/fa';
import { LuUpload } from 'react-icons/lu';

import { cn } from '../../utils';

const AVAILABLE_BUTTONS = ['add', 'upload'] as const;

type AvailableButtons = typeof AVAILABLE_BUTTONS[number];

interface TitleProps extends HTMLAttributes<HTMLDivElement> {
  buttons?: AvailableButtons[];
  onClickAdd?: () => void;
  onUpload?: (file: File) => void;
  title: string;
}

export const Title: React.FC<TitleProps> = ({ buttons, onClickAdd, onUpload, title, ...props }) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      onUpload?.(file);
    },
    [onUpload],
  );

  return (
    <div
      className={cn(
        `flex w-full items-center gap-2 py-2 px-1 text-gray-400 text-md whitespace-nowrap border-y border-gray-500`,
      )}
      {...props}
    >
      <span>
        <FaFolder />
      </span>
      <span className="w-full text-left text-md">{title}</span>
      {Array.isArray(buttons) &&
        buttons.map((item) => {
          const buttonsToDisplay = [] as React.ReactNode[];

          switch (item) {
            case 'add':
              buttonsToDisplay.push(
                <button className="hover:text-white" key={item} title="Add new" onClick={onClickAdd}>
                  <AiFillFileAdd size={20} />
                </button>,
              );
              break;

            case 'upload':
              buttonsToDisplay.push(
                <Dropzone key={item} onDrop={onDrop}>
                  {({ getInputProps, getRootProps }): JSX.Element => (
                    <button {...getRootProps()} className="hover:text-white" title="Upload">
                      <input {...getInputProps()} />
                      <LuUpload size={20} />
                    </button>
                  )}
                </Dropzone>,
              );
              break;

            default:
              break;
          }

          return buttonsToDisplay;
        })}
    </div>
  );
};

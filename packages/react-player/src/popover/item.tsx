/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback } from 'react';

import { ChevronLeft } from '../icons/chevron-left';
import { ChevronRight } from '../icons/chevron-right';

interface ItemProps {
  children: React.ReactNode;
  enableReset: boolean;
  expand: boolean;
  onBack: () => void;
  onExpand: () => void;
  onReset: () => void;
  title: string;
}

export const Item: React.FC<ItemProps> = ({
  children,
  enableReset,
  expand = false,
  onBack,
  onExpand,
  onReset,
  title,
}) => {
  const onClickBack = useCallback(() => {
    onBack();
  }, [onBack]);

  const onClickItem = useCallback(() => {
    onExpand();
  }, [onExpand]);

  const handleReset = useCallback(() => {
    onReset();
  }, [onReset]);

  return (
    <>
      {!expand && (
        <button className="popover-item" aria-label={`Go to ${title}`} onClick={onClickItem}>
          <span style={{ flex: 1 }}>{title}</span>
          <span>
            <ChevronRight />
          </span>
        </button>
      )}
      {expand && (
        <div className="popover-submenu">
          <div className="popover-header">
            <button onClick={onClickBack}>
              <ChevronLeft />
            </button>
            <div className="popover-header-title" style={{ flex: 1 }}>
              <span>{title}</span>
              {enableReset && (
                <button className="reset-theme" onClick={handleReset} aria-label={`Reset ${title}`}>
                  Reset
                </button>
              )}
            </div>
          </div>
          {children}
        </div>
      )}
    </>
  );
};

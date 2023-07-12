/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback } from 'react';

import { ChevronLeft } from '../icons/chevron-left';
import { ChevronRight } from '../icons/chevron-right';

interface ItemProps {
  children?: React.ReactNode;
  expand: boolean;
  onBack?: () => void;
  onExpand?: () => void;
  title: string;
}

export const Item: React.FC<ItemProps> = ({ children, expand = false, onBack, onExpand, title }) => {
  const onClickBack = useCallback(() => {
    onBack?.();
  }, [onBack]);

  const onClickItem = useCallback(() => {
    onExpand?.();
  }, [onExpand]);

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
            <span style={{ flex: 1 }}>{title}</span>
          </div>
          {children}
        </div>
      )}
    </>
  );
};

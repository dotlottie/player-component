/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback } from 'react';

import { CheckMark } from '../icons/check-mark';

interface SubItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  onSelectItem?: (value: string) => void;
  selected: boolean;
  value: string;
}

export const SubItem: React.FC<SubItemProps> = ({ onSelectItem, selected = false, value, ...props }) => {
  const onClickItem = useCallback(() => {
    onSelectItem?.(value);
  }, [onSelectItem, value]);

  return (
    <button
      aria-label={`Select ${value}`}
      className={`popover-item ${selected ? 'selected' : ''}`}
      onClick={onClickItem}
      {...props}
    >
      <span style={{ visibility: selected ? 'visible' : 'hidden' }}>
        <CheckMark />
      </span>
      <span style={{ flex: 1 }}>{value}</span>
    </button>
  );
};

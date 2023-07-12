/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useRef, useState } from 'react';
import { useClickAway } from 'react-use';

import { Item } from './item';
import { SubItem } from './sub-item';

interface PopoverSubItem {
  selected: boolean;
  value: string;
}
interface PopoverItem {
  items: PopoverSubItem[];
  title: string;
}

interface PopoverProps extends React.HTMLAttributes<HTMLDialogElement> {
  active?: string;
  items: PopoverItem[];
  onDismiss?: () => void;
  onSelectItem?: (title: string, value: string) => void;
  open: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ items = [], active = '', onSelectItem, onDismiss, ...props }) => {
  const [_active, setActive] = useState(active);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useClickAway(dialogRef, () => {
    setActive('');
    onDismiss?.();
  });

  const goBack = useCallback(() => {
    setActive('');
  }, [setActive]);

  const handleExpandMenu = useCallback(
    (value: string) => {
      return () => setActive(value);
    },
    [setActive],
  );

  return (
    <dialog
      ref={dialogRef}
      style={{ padding: _active ? '0px' : '8px' }}
      className="popover"
      aria-label="Popover Menu"
      {...props}
    >
      <ul aria-label="Popover content" className="popover-content">
        {items.map((item) => {
          return (
            <li
              key={item.title}
              style={{
                width: '100%',
              }}
            >
              {(_active === item.title || !_active) && (
                <Item
                  expand={_active === item.title}
                  title={item.title}
                  onExpand={handleExpandMenu(item.title)}
                  onBack={goBack}
                >
                  <ul className="popover-items" aria-label={`List of ${item.title}`}>
                    {item.items.map((sub) => {
                      return (
                        <li key={sub.value}>
                          <SubItem
                            value={sub.value}
                            selected={sub.selected}
                            onSelectItem={(): void => {
                              onSelectItem?.(item.title, sub.value);
                            }}
                          />
                        </li>
                      );
                    })}
                  </ul>
                </Item>
              )}
            </li>
          );
        })}
      </ul>
    </dialog>
  );
};

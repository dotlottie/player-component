/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useRef, useState } from 'react';
import { useClickAway, useKey } from 'react-use';

import { Item } from './item';
import { SubItem } from './sub-item';

interface PopoverSubItem {
  selected: boolean;
  value: string;
}
interface PopoverItem {
  enableReset: boolean;
  items: PopoverSubItem[];
  title: string;
}

interface PopoverProps extends React.HTMLAttributes<HTMLDialogElement> {
  items: PopoverItem[];
  onDismiss: () => void;
  onSelectItem: (title: string, value: string) => void;
  open: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ items = [], onSelectItem, onDismiss, ...props }) => {
  const [active, setActive] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);

  useClickAway(dialogRef, () => {
    setActive('');
    onDismiss();
  });

  useKey('Escape', () => {
    setActive('');
    onDismiss();
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

  const handleSelectItem = useCallback(
    (title: string, value: string) => {
      return () => onSelectItem(title, value);
    },
    [onSelectItem],
  );

  return (
    <dialog
      ref={dialogRef}
      style={{ padding: active ? '0px' : '8px' }}
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
              {(active === item.title || !active) && (
                <Item
                  expand={active === item.title}
                  title={item.title}
                  onExpand={handleExpandMenu(item.title)}
                  onBack={goBack}
                  enableReset={item.enableReset}
                  onReset={handleSelectItem(item.title, '')}
                >
                  <ul className="popover-items" aria-label={`List of ${item.title}`}>
                    {item.items.map((sub) => {
                      return (
                        <li key={sub.value}>
                          <SubItem
                            value={sub.value}
                            selected={sub.selected}
                            onSelectItem={handleSelectItem(item.title, sub.value)}
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

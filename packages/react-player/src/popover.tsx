/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useRef, useState } from 'react';

import { useClickOutside } from './hooks/use-click-outside';
import { CheckMark } from './icons/check-mark';
import { ChevronLeft } from './icons/chevron-left';
import { ChevronRight } from './icons/chevron-right';

interface PopoverProps extends React.HTMLAttributes<HTMLDialogElement> {
  active?: string;
  items: Array<{
    items: Array<{
      selected: boolean;
      value: string;
    }>;
    title: string;
  }>;
  onDismiss?: () => void;
  onSelectItem?: (title: string, value: string) => void;
  open: boolean;
}

export const Popover: React.FC<PopoverProps> = ({ items = [], active = '', onSelectItem, onDismiss, ...props }) => {
  const [_active, setActive] = useState(active);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useClickOutside(dialogRef, () => {
    setActive('');
    onDismiss?.();
  });

  return (
    <dialog
      ref={dialogRef}
      style={{ padding: _active ? '0px' : '8px' }}
      className="popover"
      aria-label="Popover Menu"
      {...props}
    >
      <div aria-label="Popover content">
        {items.map((item) => {
          return (
            <div
              key={item.title}
              style={{
                width: '100%',
              }}
            >
              {!_active && (
                <button
                  className="popover-item"
                  aria-label={`Go to ${item.title}`}
                  onClick={(): void => {
                    setActive(item.title);
                  }}
                >
                  <span style={{ flex: 1 }}>{item.title}</span>
                  <span>
                    <ChevronRight />
                  </span>
                </button>
              )}
              {_active === item.title && (
                <div className="popover-submenu">
                  <div className="popover-header">
                    <button
                      onClick={(): void => {
                        setActive('');
                      }}
                    >
                      <ChevronLeft />
                    </button>
                    <span style={{ flex: 1 }}>{item.title}</span>
                  </div>
                  <div className="popover-items" aria-label={`List of ${item.title}`}>
                    {item.items.map((sub) => {
                      return (
                        <div key={sub.value}>
                          <button
                            aria-label={`Select ${sub.value}`}
                            className="popover-item"
                            onClick={(): void => {
                              onSelectItem?.(item.title, sub.value);
                            }}
                          >
                            <span style={{ visibility: sub.selected ? 'visible' : 'hidden' }}>
                              <CheckMark />
                            </span>
                            <span style={{ flex: 1 }}>{sub.value}</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </dialog>
  );
};

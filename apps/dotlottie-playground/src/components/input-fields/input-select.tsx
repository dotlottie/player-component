/**
 * Copyright 2023 Design Barn Inc.
 */

import React, { useCallback, useMemo } from 'react';
import Select, { type GroupBase, type Props, type SingleValue, type MultiValue } from 'react-select';

export interface InputSelectOption {
  label: string;
  value: string;
}

function CustomSelect<
  Option = InputSelectOption,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>,
>(props: Props<Option, IsMulti, Group>): JSX.Element {
  return (
    <Select
      classNames={{
        container: () => 'text-lg bg-white rounded text-gray-400',
        valueContainer: () => 'text-lg !text-gray-600 !py-1',
        singleValue: () => 'text-lg !text-gray-600 py-1',
        multiValue: () => 'text-lg !text-gray-600',
        menuList: () => 'text-lg !text-gray-600',
      }}
      {...props}
    />
  );
}

interface InputSelectProps {
  label: string;
  multiple?: boolean;
  onChange?: (value: string) => void;
  options: InputSelectOption[];
  value?: string;
}

export const InputSelect: React.FC<InputSelectProps> = ({ label, multiple, onChange, options, value }) => {
  const selectedValue = useMemo<InputSelectOption | InputSelectOption[] | undefined>(() => {
    if (!value) return multiple ? [] : undefined;

    const values = value.split(',');

    if (multiple) return options.filter((item) => values.includes(item.value));

    return options.find((item) => item.value === value);
  }, [value, options, multiple]);

  const handleChange = useCallback(
    (selectedOptions: SingleValue<InputSelectOption> | MultiValue<InputSelectOption>) => {
      if (Array.isArray(selectedOptions)) {
        onChange?.((selectedOptions as MultiValue<InputSelectOption>).map((item) => item.value).join(','));
      } else {
        const option = selectedOptions as SingleValue<InputSelectOption>;

        onChange?.(option?.value || '');
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col text-gray-400 w-full max-w-xs hover:text-white">
      <span className="flex-1 text-lg text-left">{label}</span>
      <CustomSelect value={selectedValue} isMulti={multiple} name={label} options={options} onChange={handleChange} />
    </div>
  );
};

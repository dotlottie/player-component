import { BsFiletypeJson, BsFiletypeCss } from 'react-icons/bs';
import { SupportedFileTypes } from '.';

export const FileIcon = ({ type }: { type: SupportedFileTypes }) => {
  if (type === 'json') {
    return <BsFiletypeJson />;
  }

  if (type === 'lss') {
    return <BsFiletypeCss />;
  }
};

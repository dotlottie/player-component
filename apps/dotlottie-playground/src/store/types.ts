/**
 * Copyright 2023 Design Barn Inc.
 */

export const SUPPORTED_FILE_TYPES = ['json', 'lss'] as const;
export const EDITOR_ACTIONS = [
  'themes_add',
  'themes_remove',
  'states_add',
  'states_remove',
  'animations_add',
  'animations_remove',
] as const;

export type SupportedFileTypes = typeof SUPPORTED_FILE_TYPES[number];
export type EditorActions = typeof EDITOR_ACTIONS[number];

export interface SupportedFile {
  name: string;
  type: SupportedFileTypes;
}

export interface EditorAction {
  payload: unknown;
  type: EditorActions;
}

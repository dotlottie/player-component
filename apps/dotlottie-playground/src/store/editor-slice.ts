/**
 * Copyright 2023 Design Barn Inc.
 */

import { type PlaybackOptions } from '@dotlottie/dotlottie-js';
import { createSlice } from '@reduxjs/toolkit';

export interface EditorFile {
  content: string;
  name: string;
  path: string;
  type: string;
}

export interface EditorAnimationOptions extends PlaybackOptions {
  assignedThemes?: string;
  defaultActiveAnimation?: boolean;
}

interface EditorSlice {
  animationId?: string;
  animationOptions: EditorAnimationOptions;
  file?: EditorFile;
  playbackOptions: PlaybackOptions;
  updated: boolean;
  validationStatus: boolean;
}

const initialState: EditorSlice = {
  file: undefined,
  validationStatus: true,
  updated: false,
  animationId: '',
  playbackOptions: {},
  animationOptions: {},
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setEditorFile: (state, action) => {
      state.file = { ...(state.file || {}), ...(action.payload || {}) };
      state.animationId = undefined;
      state.updated = false;
    },
    clearEditorFile: (state) => {
      state.file = undefined;
      state.validationStatus = true;
      state.updated = false;
    },
    updateEditorFile: (state, action) => {
      if (state.file) {
        state.file.content = action.payload;
      }
    },
    setEditorValidatationStatus: (state, action) => {
      state.validationStatus = action.payload;
    },
    setEditorUpdated: (state, action) => {
      state.updated = action.payload;
    },
    setEditorAnimationId: (state, action) => {
      state.animationId = action.payload;
      state.updated = false;
      state.file = undefined;
    },
    setEditorPlaybacOptions: (state, action) => {
      state.playbackOptions = { ...state.playbackOptions, ...(action.payload || {}) };
    },
    setEditorAnimationOptions: (state, action) => {
      state.animationOptions = action.payload || {};
    },
    updateEditorAnimationOptions: (state, action) => {
      state.animationOptions = { ...state.animationOptions, ...(action.payload || {}) };
    },
    clearEditorPlaybackOptions: (state) => {
      state.playbackOptions = {};
      state.animationId = '';
    },
    clearEditorState: (state) => {
      state.file = undefined;
      state.validationStatus = true;
      state.updated = false;
      state.playbackOptions = {};
      state.animationId = '';
      state.animationOptions = {};
    },
  },
});

export const {
  clearEditorFile,
  clearEditorPlaybackOptions,
  clearEditorState,
  setEditorAnimationId,
  setEditorAnimationOptions,
  setEditorFile,
  setEditorPlaybacOptions,
  setEditorUpdated,
  setEditorValidatationStatus,
  updateEditorAnimationOptions,
  updateEditorFile,
} = editorSlice.actions;

export default editorSlice.reducer;

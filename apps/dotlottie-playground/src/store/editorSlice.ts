import { PlaybackOptions } from '@dotlottie/react-player';
import { createSlice } from '@reduxjs/toolkit';

export interface EditorFile {
  name: string;
  type: string;
  path: string;
  content: string;
}
interface EditorSlice {
  file?: EditorFile;
  validationStatus: boolean;
  updated: boolean;
  animationId?: string;
  playbackOptions: PlaybackOptions;
}

const initialState: EditorSlice = {
  file: undefined,
  validationStatus: true,
  updated: false,
  animationId: '',
  playbackOptions: {},
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setEditorFile: (state, action) => {
      state.file = action.payload;
      state.animationId = undefined;
      state.updated = false;
    },
    clearEditorFile: (state) => {
      state.file = undefined;
      state.validationStatus = false;
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
    clearEditorPlaybackOptions: (state) => {
      state.playbackOptions = {};
      state.animationId = '';
    },
    clearEditorState: (state) => {
      state.file = undefined;
      state.validationStatus = false;
      state.updated = false;
      state.playbackOptions = {};
      state.animationId = '';
    },
  },
});

export const {
  setEditorAnimationId,
  setEditorPlaybacOptions,
  clearEditorPlaybackOptions,
  setEditorUpdated,
  setEditorValidatationStatus,
  setEditorFile,
  clearEditorFile,
  updateEditorFile,
} = editorSlice.actions;

export default editorSlice.reducer;

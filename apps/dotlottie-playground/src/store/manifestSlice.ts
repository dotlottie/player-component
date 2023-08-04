import { PlayMode, PlaybackOptions } from '@dotlottie/react-player';
import { createSlice } from '@reduxjs/toolkit';

interface EditorSlice {
  animationId: string;
  playbackOptions: PlaybackOptions;
}

const initialState: EditorSlice = {
  animationId: '',
  playbackOptions: {
    autoplay: false,
    direction: 1,
    hover: false,
    intermission: 0,
    loop: false,
    playMode: PlayMode.Normal,
    speed: 1,
    defaultTheme: '',
  },
};

export const editorSlice = createSlice({
  name: 'editor',
  initialState,
  reducers: {
    setPlaybackO: (state, action) => {
      state.file = action.payload;
    },
    clearEditorFile: (state) => {
      state.file = undefined;
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
  },
});

export const { setEditorUpdated, setEditorValidatationStatus, setEditorFile, clearEditorFile, updateEditorFile } =
  editorSlice.actions;

export default editorSlice.reducer;

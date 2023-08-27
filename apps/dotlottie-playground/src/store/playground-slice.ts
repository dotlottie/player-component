/**
 * Copyright 2023 Design Barn Inc.
 */

import { createSlice } from '@reduxjs/toolkit';

interface PlaygroundSlice {
  playerUrl: string | undefined;
  workingFileName: string;
}

const initialState: PlaygroundSlice = {
  playerUrl: undefined,
  workingFileName: '_.lottie',
};

export const playgroundSlice = createSlice({
  name: 'playground',
  initialState,
  reducers: {
    setPlayerUrl: (state, action) => {
      state.playerUrl = action.payload;
    },
    setWorkingFileName: (state, action) => {
      state.workingFileName = action.payload;
    },
  },
});

export const { setPlayerUrl, setWorkingFileName } = playgroundSlice.actions;

export default playgroundSlice.reducer;

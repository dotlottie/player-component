/**
 * Copyright 2023 Design Barn Inc.
 */

import { createSlice } from '@reduxjs/toolkit';

import { type SupportedFile } from './types';

interface ThemeSlice {
  list: SupportedFile[];
}

const initialState: ThemeSlice = {
  list: [],
};

export const themeSlice = createSlice({
  name: 'themes',
  initialState,
  reducers: {
    setThemes: (state, action) => {
      state.list = action.payload;
    },
    addTheme: (state, action) => {
      state.list.push(action.payload);
    },
    removeTheme: (state, action) => {
      state.list = state.list.filter((item) => item.name !== action.payload);
    },
  },
});

export const { addTheme, removeTheme, setThemes } = themeSlice.actions;

export default themeSlice.reducer;

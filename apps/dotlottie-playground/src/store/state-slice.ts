/**
 * Copyright 2023 Design Barn Inc.
 */

import { createSlice } from '@reduxjs/toolkit';

import { type SupportedFile } from './types';

interface StateSlice {
  list: SupportedFile[];
}

const initialState: StateSlice = {
  list: [],
};

export const stateSlice = createSlice({
  name: 'states',
  initialState,
  reducers: {
    setStates: (state, action) => {
      state.list = action.payload;
    },
    addState: (state, action) => {
      state.list.push(action.payload);
    },
    removeState: (state, action) => {
      state.list = state.list.filter((item) => item.name !== action.payload);
    },
  },
});

export const { addState, removeState, setStates } = stateSlice.actions;

export default stateSlice.reducer;

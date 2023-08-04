import { createSlice } from '@reduxjs/toolkit';
import { SupportedFile } from './types';

interface AnimationSlice {
  list: SupportedFile[];
}

const initialState: AnimationSlice = {
  list: [],
};

export const animationSlice = createSlice({
  name: 'animations',
  initialState,
  reducers: {
    setAnimations: (state, action) => {
      state.list = action.payload;
    },
    addAnimation: (state, action) => {
      console.log('action paly  ', action);
      state.list.push(action.payload);
    },
    removeAnimation: (state, action) => {
      state.list = state.list.filter((item) => item.name !== action.payload);
    },
  },
});

// Action creators are generated for each case reducer function
export const { addAnimation, removeAnimation, setAnimations } = animationSlice.actions;

export default animationSlice.reducer;

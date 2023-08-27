/**
 * Copyright 2023 Design Barn Inc.
 */

import { configureStore } from '@reduxjs/toolkit';

import animationSlice from './animation-slice';
import editorSlice from './editor-slice';
import playgroundSlice from './playground-slice';
import stateSlice from './state-slice';
import themeSlice from './theme-slice';

const store = configureStore({
  reducer: {
    animations: animationSlice,
    themes: themeSlice,
    states: stateSlice,
    editor: editorSlice,
    playground: playgroundSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;

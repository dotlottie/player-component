import { configureStore } from '@reduxjs/toolkit';
import animationSlice from './animationSlice';
import themeSlice from './themeSlice';
import stateSlice from './stateSlice';
import editorSlice from './editorSlice';

const store = configureStore({
  reducer: {
    animations: animationSlice,
    themes: themeSlice,
    states: stateSlice,
    editor: editorSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;

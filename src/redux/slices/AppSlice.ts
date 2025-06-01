import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

type AppState = {
  userId: string;
  treeCode: string;
  isPermit: number; // 0: view ; 1: edit; 2: example data
};

const initialState: AppState = {
  userId: '',
  treeCode: '',
  isPermit: 2,
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    updateUserId: (state, action: PayloadAction<string>) => {
      state.userId = action.payload;
    },
    updateTreeCode: (state, action: PayloadAction<string>) => {
      state.treeCode = action.payload;
    },
    updatePermit: (state, action: PayloadAction<number>) => {
      state.isPermit = action.payload;
    },
  },
});

export const {updateUserId, updateTreeCode, updatePermit} = appSlice.actions;

export default appSlice.reducer;

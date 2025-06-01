import {createSlice} from '@reduxjs/toolkit';
import type {PayloadAction} from '@reduxjs/toolkit';

type FormState = {
  treeCode?: string;
  date: string;
  fruitCount: string;
  harvestCount: string;
};
const initialState: FormState[] = [];

export const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    addForm: (state, action: PayloadAction<FormState>) => {
      const isExist = state.findIndex(
        item => item.date === action.payload.date,
      );
      if (isExist === -1) {
        state.push(action.payload);
      }
    },
    resetForm: () => {
      return [];
    },
  },
});

export const {addForm, resetForm} = formSlice.actions;

export default formSlice.reducer;

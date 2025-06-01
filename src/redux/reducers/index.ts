import { combineReducers } from "@reduxjs/toolkit";
import AppReducer from "../slices/AppSlice";
import FormReducer from "../slices/FormSlice";
import { noAuthApi } from "../api/no-auth";
import { authApi } from "../api/auth";

export const rootReducers = combineReducers({
  app: AppReducer,
  form: FormReducer,
  [noAuthApi.reducerPath]: noAuthApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
});

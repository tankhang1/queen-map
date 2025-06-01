import { configureStore } from "@reduxjs/toolkit";
import { rootReducers } from "../reducers";
import { noAuthApi } from "../api/no-auth";
import { authApi } from "../api/auth";

export const store = configureStore({
  reducer: rootReducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(noAuthApi.middleware)
      .concat(authApi.middleware),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

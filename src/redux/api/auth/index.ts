import {createApi} from '@reduxjs/toolkit/query/react';
import {baseAuthQuery} from '..';
import {TUpdateTreeStatusREQ} from '../../dto/search/search.req';
import {TZaloREQ} from '../../dto/zalo/zalo.req';
import {TZaloCheckRES} from '../../dto/zalo/zalo.res';
// Define a service using a base URL and expected endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseAuthQuery,
  endpoints: build => ({
    updateTree: build.mutation<
      {status: number; message: string},
      TUpdateTreeStatusREQ
    >({
      query: data => ({
        url: '/zalo/process/update',
        body: data,
        method: 'POST',
      }),
    }),
    checkUserId: build.mutation<TZaloCheckRES, {zalo_user_id: string}>({
      query: data => ({
        url: '/zalo/check',
        body: data,
        method: 'POST',
      }),
    }),
    updateZaloInfo: build.mutation<TZaloCheckRES, TZaloREQ>({
      query: data => ({
        url: '/zalo/update',
        body: data,
        method: 'POST',
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useUpdateTreeMutation,
  useCheckUserIdMutation,
  useUpdateZaloInfoMutation,
} = authApi;

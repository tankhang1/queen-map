// src/api/customFetchBaseQuery.ts
import {fetchBaseQuery} from '@reduxjs/toolkit/query/react';

export const baseQuery = fetchBaseQuery({
  baseUrl: 'https://qqr.vn',
  prepareHeaders: (headers, {getState}) => {
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

export const baseAuthQuery = fetchBaseQuery({
  baseUrl: 'https://qqr.icampaign.vn',
  prepareHeaders: (headers, {getState}) => {
    const token = (getState() as any).auth?.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

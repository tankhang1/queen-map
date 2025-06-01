import {createApi} from '@reduxjs/toolkit/query/react';
import {baseQuery} from '..';
import {TreeInfo} from '../../dto/search/search.res';
import {TPlansRES} from '../../dto/plan/plan.res';
import {TReportRES} from '../../dto/report/report.res';

export const noAuthApi = createApi({
  reducerPath: 'noAuthApi',
  baseQuery: baseQuery,
  tagTypes: ['Tree', 'Plan', 'Area', 'Plot', 'Row', 'Report'], // 👈 Add all tag types here
  endpoints: build => ({
    searchTree: build.query<TreeInfo[], string>({
      query: code => ({
        url: `/cultivation/plot-row-plant/search/${code}`,
        method: 'GET',
      }),
    }),
    getTreeDetail: build.mutation<TreeInfo, string>({
      query: code => ({
        url: `/cultivation/plot-row-plant/detail/${code}`,
        method: 'GET',
      }),
    }),
    getPlotByArea: build.query<
      TPlansRES[],
      {tree_code: string; area_code: string}
    >({
      query: ({tree_code, area_code}) => ({
        url: `/cultivation/dashboard/plant-group-area-plot/g-${tree_code}/a-${area_code}`,
        method: 'GET',
      }),
    }),
    getRowByPlot: build.query<
      TPlansRES[],
      {tree_code: string; area_code: string; plot_code: string}
    >({
      query: ({area_code, plot_code, tree_code}) => ({
        url: `/cultivation/dashboard/plant-group-area-plot-row/g-${tree_code}/a-${area_code}/p-${plot_code}`,
        method: 'GET',
      }),
    }),
    getPlanByRow: build.query<
      TReportRES[],
      {
        tree_code: string;
        area_code: string;
        plot_code: string;
        row_code: string;
      }
    >({
      query: ({area_code, plot_code, tree_code, row_code}) => ({
        url: `/cultivation/dashboard/plant-group-area-plot-row-tree/g-${tree_code}/a-${area_code}/p-${plot_code}/r-${row_code}`,
        method: 'GET',
      }),
    }),
    getListPlans: build.query<TPlansRES[], void>({
      query: () => ({
        url: `/cultivation/dashboard/plant-group`,
        method: 'GET',
      }),
    }),
    getListArea: build.query<TPlansRES[], string>({
      query: name => ({
        url: `/cultivation/dashboard/plant-group-area/${name}`,
        method: 'GET',
      }),
    }),
    getReport: build.query<
      TReportRES[],
      {code: string; start: string; end: string}
    >({
      query: ({code, start, end}) => ({
        url: `/cultivation/plot-row-plant/plant-group/${code}-${start}-${end}`,
        method: 'GET',
      }),
    }),
  }),
});

export const {
  useSearchTreeQuery,
  useGetTreeDetailMutation,
  useGetPlotByAreaQuery,
  useGetRowByPlotQuery,
  useGetListPlansQuery,
  useGetListAreaQuery,
  useGetReportQuery,
  useGetPlanByRowQuery,
} = noAuthApi;

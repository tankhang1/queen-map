export type TReportRES = {
  id: number;
  name: string;
  code: string;
  plot_code: string;
  plot_name: string;
  plot_row_code: string;
  plot_row_name: string;
  area_code: string;
  area_name: string;
  count_on_tree: number;
  count_on_land: number;
  count_lost: number;
  time_created: string; // ISO date string
  time_created_number: number; // yyyymmdd format
  plant_group: string;
};

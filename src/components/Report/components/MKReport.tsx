import Chart from "react-apexcharts";
import dayjs from "dayjs";
import type { TFilter } from "..";
import { Box, ScrollAreaAutosize, Stack, Table, Text } from "@mantine/core";
import { useGetReportQuery } from "../../../redux/api/no-auth";
import type { CSSProperties } from "react";

const headerStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  backgroundColor: "#f3f4f6", // gray-100
  zIndex: 10,
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
  color: "#374151",
  textAlign: "left",
};

const cellStyle: CSSProperties = {
  padding: "12px 16px",
  borderBottom: "1px solid #e5e7eb",
  color: "#1f2937",
};
const MKReport = ({ filterDate }: { filterDate: TFilter }) => {
  const { data: mkReport } = useGetReportQuery(
    {
      code: "MK",
      start: dayjs(filterDate.start).format("YYYYMMDD"),
      end: dayjs(filterDate.end).format("YYYYMMDD"),
    },
    {
      refetchOnFocus: true,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
    }
  );
  // Group logs by date
  const statsByDate = (mkReport || []).reduce((acc, log) => {
    const date = new Date(log.time_created).toLocaleDateString("vi-VN");
    if (!acc[date]) {
      acc[date] = { tree: 0, land: 0, lost: 0 };
    }
    acc[date].tree += log.count_on_tree;
    acc[date].land += log.count_on_land;
    acc[date].lost += log.count_lost;
    return acc;
  }, {} as Record<string, { tree: number; land: number; lost: number }>);

  const categories = Object.keys(statsByDate);
  const chartSeries = [
    {
      name: "Trên cây",
      data: categories.map((date) => statsByDate[date].tree),
    },
    {
      name: "Thu hoạch",
      data: categories.map((date) => statsByDate[date].land),
    },
    {
      name: "Hao hụt",
      data: categories.map((date) => statsByDate[date].lost),
    },
  ];

  return (
    <Stack>
      <Text fw={"bold"}>Sầu riêng Musang King</Text>
      <Chart
        type="bar"
        height={300}
        options={{
          chart: { id: "tree-log" },
          xaxis: { categories },
          colors: ["#4CAF50", "#FF9800", "#F44336"],
        }}
        series={chartSeries}
      />

      <Text fw={"bold"}>Lịch sử nhật ký</Text>

      <Box>
        <ScrollAreaAutosize mah={400}>
          <Table
            striped
            highlightOnHover
            horizontalSpacing="sm"
            verticalSpacing="sm"
            fz="sm"
            border={0}
          >
            <thead>
              <tr>
                <th style={headerStyle}>Ngày</th>
                <th style={headerStyle}>Mã cây</th>
                <th style={headerStyle}>Khu</th>
                <th style={headerStyle}>Lô</th>
                <th style={headerStyle}>Hàng</th>
                <th style={{ ...headerStyle, textAlign: "center" }}>
                  Trên cây
                </th>
                <th style={{ ...headerStyle, textAlign: "center" }}>
                  Thu hoạch
                </th>
                <th style={{ ...headerStyle, textAlign: "center" }}>Hao hụt</th>
              </tr>
            </thead>
            <tbody>
              {mkReport?.map((log) => (
                <tr
                  key={log.id}
                  style={{
                    transition: "background-color 0.1s ease-in-out",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f9fafb"; // Tailwind hover:bg-gray-50
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "";
                  }}
                >
                  <td
                    style={{
                      ...cellStyle,
                      color: "#15803d",
                      fontWeight: 500,
                    }}
                  >
                    {new Date(log.time_created).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={cellStyle}>{log.code}</td>
                  <td style={cellStyle}>{log.area_name}</td>
                  <td style={cellStyle}>{log.plot_name}</td>
                  <td style={cellStyle}>{log.plot_row_name}</td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {log.count_on_tree}
                  </td>
                  <td style={{ ...cellStyle, textAlign: "center" }}>
                    {log.count_on_land}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      textAlign: "center",
                      color: "#ef4444",
                    }}
                  >
                    {log.count_lost}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </ScrollAreaAutosize>
      </Box>
      <Box h={50} />
    </Stack>
  );
};

export default MKReport;

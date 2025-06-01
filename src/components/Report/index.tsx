import { Button, Group, Modal, Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useState } from "react";
import R7Report from "./components/R7Report";
import R6Report from "./components/R6Report";
import MKReport from "./components/MKReport";
import { DatePickerInput } from "@mantine/dates";
import { BiCalendar } from "react-icons/bi";

type TReportModal = {
  openedReport: boolean;
  closeReport: () => void;
};
export type TFilter = { start: Date; end: Date };

const ReportModal = ({ closeReport, openedReport }: TReportModal) => {
  const [filterDate, setFilterDate] = useState<TFilter>({
    start: new Date(),
    end: new Date(),
  });
  const [tmpFilterDate, setTmpFilterDate] = useState<TFilter>({
    start: new Date(),
    end: new Date(),
  });
  return (
    <Modal
      opened={openedReport}
      onClose={closeReport}
      zIndex={9999}
      size={"90dvw"}
      title={
        <Text fz={"h4"} fw={"bold"}>
          Báp cáo
          {dayjs(filterDate.start).format("DD/MM/YYYY") ===
          dayjs(filterDate.end).format("DD/MM/YYYY")
            ? ` hôm nay`
            : ` ${dayjs(filterDate.start).format("DD/MM/YYYY")} - ${dayjs(
                filterDate.end
              ).format("DD/MM/YYYY")}`}
        </Text>
      }
      styles={{
        inner: { zIndex: 99999, top: 10, left: 0 },
      }}
    >
      <Stack>
        <Group justify="flex-end" align="center">
          <DatePickerInput
            placeholder="Ngày bắt đầu"
            leftSection={<BiCalendar />}
            dropdownType="popover"
            locale="vi-VN"
            value={dayjs(tmpFilterDate.start).format("YYYY-MM-DD")}
            maxDate={tmpFilterDate.end}
            onChange={(value) =>
              setTmpFilterDate({ ...tmpFilterDate, start: new Date(value) })
            }
            popoverProps={{ withinPortal: true, zIndex: 99999 }}
          />
          <DatePickerInput
            placeholder="Ngày kết thúc"
            leftSection={<BiCalendar />}
            dropdownType="popover"
            locale="vi-VN"
            minDate={tmpFilterDate.start}
            value={dayjs(tmpFilterDate.end).format("YYYY-MM-DD")}
            onChange={(value) => {
              console.log(value, new Date(value));
              setTmpFilterDate({ ...tmpFilterDate, end: new Date(value) });
            }}
            popoverProps={{ withinPortal: true, zIndex: 99999 }}
          />
          <Button
            color="green"
            variant="outline"
            onClick={() => {
              setFilterDate({ start: new Date(), end: new Date() });
              setTmpFilterDate({ start: new Date(), end: new Date() });
            }}
          >
            Thu hồi
          </Button>
          <Button color="green" onClick={() => setFilterDate(tmpFilterDate)}>
            Lọc
          </Button>
        </Group>
        <R7Report filterDate={filterDate} />
        <R6Report filterDate={filterDate} />
        <MKReport filterDate={filterDate} />
      </Stack>
    </Modal>
  );
};

export default ReportModal;

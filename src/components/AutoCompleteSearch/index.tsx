import {
  ActionIcon,
  Autocomplete,
  Button,
  Center,
  CloseIcon,
  Group,
  Image,
  LoadingOverlay,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { CiSearch } from "react-icons/ci";
import {
  useGetTreeDetailMutation,
  useSearchTreeQuery,
} from "../../redux/api/no-auth";
import { useDebouncedState, useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import type { TreeInfo } from "../../redux/dto/search/search.res";
import { TREES } from "../../constants";
import { useUpdateTreeMutation } from "../../redux/api/auth";
import { toast } from "react-toastify";
export type TInputData = {
  date: string;
  fruitCount: string;
  harvestCount: string;
};
const AutoCompleteSearch = () => {
  const [updateTree, { isLoading: isloadingUpdateTree }] =
    useUpdateTreeMutation();
  const [openedTreeDetail, { open: openTreeDetail, close: closeTreeDetail }] =
    useDisclosure(false);
  const [openedUpdateForm, { open: openUpdateForm, close: closeUpdateForm }] =
    useDisclosure(false);
  const today = new Date().toISOString().split("T")[0];

  const [treeCode, setTreeCode] = useDebouncedState("", 400);
  const [treeDetail, setTreeDetail] = useState<TreeInfo | null>(null);
  const [inputData, setInputData] = useState<TInputData>({
    date: today,
    fruitCount: "",
    harvestCount: "",
  });
  const { data: trees } = useSearchTreeQuery(treeCode, {
    skip: treeCode.length < 4,
  });
  const [getTreeDetail, { isLoading: isLoadingGetTreeDetail }] =
    useGetTreeDetailMutation();
  const onGetTreeDetail = async (code: string) => {
    await getTreeDetail(code)
      .unwrap()
      .then((data) => {
        setTreeDetail(data);
      });
  };
  const onUpdateTree = async () => {
    await updateTree({
      plant_code: treeCode.split(" - ")[0],
      total_on_land: +inputData.harvestCount,
      total_on_tree: +inputData.fruitCount,
      zalo_user_id: "queenfarm/qf@2025",
    })
      .unwrap()
      .then((value: { status: number; message: string }) => {
        if (value.status === 0) {
          toast.success("Cập nhật thành công");
          setInputData({
            date: today,
            fruitCount: "",
            harvestCount: "",
          });
        } else {
          toast.error(value.message);
        }
      })
      .catch(() => {
        toast.error("Cập nhật thất bại");
      });
  };
  return (
    <Stack>
      <Autocomplete
        placeholder="Nhập mã cây"
        leftSection={<CiSearch color="black" />}
        onChange={setTreeCode}
        w={350}
        clearable
        onClear={() => {
          closeTreeDetail();
        }}
        styles={{ dropdown: { zIndex: 9999 } }}
        data={trees?.map((item) => ({
          label: `${item.code} - ${item.name}`,
          value: item.code,
        }))}
        onOptionSubmit={(value) => {
          openTreeDetail();
          onGetTreeDetail(value);
        }}
      />
      {openedTreeDetail && (
        <Stack
          bg="white"
          p={20}
          style={{
            borderRadius: 10,
          }}
        >
          <LoadingOverlay
            visible={isLoadingGetTreeDetail}
            zIndex={1000}
            overlayProps={{ radius: "sm", blur: 2 }}
          />
          {treeDetail ? (
            !openedUpdateForm ? (
              <Stack gap="xs">
                <Center>
                  <Image
                    src={TREES[treeDetail.code.slice(-2)]?.image}
                    w={100}
                    h={100}
                  />
                </Center>
                <Text>
                  <b>Mã cây:</b> {treeDetail.code}
                </Text>
                <Text>
                  <b>Tên cây:</b> {treeDetail.name}
                </Text>
                <Text>
                  <b>Khu vực:</b> {treeDetail.area_name}
                </Text>
                <Text>
                  <b>Lô:</b> {treeDetail.plot_name}
                </Text>
                <Text>
                  <b>Hàng:</b> {treeDetail.plot_row_name}
                </Text>
                <Group>
                  <Button
                    color={"green"}
                    size="xs"
                    flex={1}
                    onClick={openUpdateForm}
                  >
                    <Text>Cập nhật dữ liệu</Text>
                  </Button>
                </Group>
              </Stack>
            ) : (
              <Stack gap={5}>
                <Group justify="space-between">
                  <Text fw={"bold"}>Cập nhật dữ liệu</Text>
                  <ActionIcon
                    variant="transparent"
                    color={"black"}
                    onClick={closeUpdateForm}
                  >
                    <CloseIcon />
                  </ActionIcon>
                </Group>
                <TextInput
                  label="Ngày cập nhật"
                  disabled
                  value={inputData.date}
                />
                <TextInput
                  label="Tổng trên cây"
                  type="number"
                  placeholder="VD: 10, 20"
                  min={0}
                  value={inputData.fruitCount}
                  onChange={(e) =>
                    setInputData({ ...inputData, fruitCount: e.target.value })
                  }
                />
                <TextInput
                  label="Tổng thu hoạch"
                  type="number"
                  placeholder="VD: 10, 20"
                  min={0}
                  value={inputData.harvestCount}
                  onChange={(e) =>
                    setInputData({ ...inputData, harvestCount: e.target.value })
                  }
                />
                <Group mt={5}>
                  <Button
                    color="green"
                    flex={1}
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      setInputData({
                        date: today,
                        fruitCount: "",
                        harvestCount: "",
                      });
                    }}
                  >
                    <Text>Thu hồi</Text>
                  </Button>
                  <Button
                    color="green"
                    flex={1}
                    size="xs"
                    loading={isloadingUpdateTree}
                    onClick={onUpdateTree}
                  >
                    <Text>Cập nhật</Text>
                  </Button>
                </Group>
              </Stack>
            )
          ) : (
            <Text size="sm">Không tìm thấy thông tin cây.</Text>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default AutoCompleteSearch;

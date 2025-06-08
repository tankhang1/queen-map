import { MapContainer, TileLayer, GeoJSON, Pane } from "react-leaflet";
import { useEffect, useState } from "react";
import {
  Card,
  Group,
  Stack,
  Text,
  Box,
  Title,
  ActionIcon,
  HoverCard,
  Modal,
  TextInput,
  Button,
  Radio,
} from "@mantine/core";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GeoJsonObject, Feature, Point } from "geojson";
import AutoCompleteSearch, {
  type TInputData,
} from "./components/AutoCompleteSearch";
import { useDisclosure } from "@mantine/hooks";
import { FaChartBar } from "react-icons/fa";
import ReportModal from "./components/Report";
import ZoomListener from "./components/ZoomListener";
import { useGetTreeDetailMutation } from "./redux/api/no-auth";
import { TREES } from "./constants";
import type { TreeInfo } from "./redux/dto/search/search.res";
import { toast } from "react-toastify";
import { useUpdateTreeMutation } from "./redux/api/auth";

interface LayerConfig {
  key: string;
  color?: string;
  fill?: boolean;
  point?: boolean;
  label: string;
}

const LAYERS: LayerConfig[] = [
  { key: "zone", color: "#2b8cbe", fill: true, label: "Vùng" },
  { key: "area", color: "#f03b20", fill: true, label: "Khu vực" },
  { key: "plot", color: "#31a354", fill: true, label: "Lô" },
  { key: "row", color: "#ffff", fill: false, label: "Hàng" },
];
const MAP_GROUP = new Map([
  ["0", "Vùng"],
  ["1", "Khu vực"],
  ["2", "Lô"],
  ["3", "Lô + Hàng + Cây"],
]);
export default function FarmMap() {
  const today = new Date().toISOString().split("T")[0];
  const [openedReport, { open: openReport, close: closeReport }] =
    useDisclosure(false);
  const [data, setData] = useState<Record<string, GeoJsonObject>>({});
  const [plantFeatures, setPlantFeatures] = useState<Feature<Point>[]>([]);
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    zone: false,
    area: true,
    plot: false,
    row: false,
    plant: false,
  });
  const [inputData, setInputData] = useState<TInputData>({
    date: today,
    fruitCount: "",
    harvestCount: "",
  });
  const [tree, setTree] = useState<TreeInfo | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string | null>("0");
  const [getTreeDetail] = useGetTreeDetailMutation();
  const [updateTree, { isLoading: isloadingUpdateTree }] =
    useUpdateTreeMutation();
  useEffect(() => {
    Promise.all(
      [...LAYERS, { key: "plant", label: "Tree" }].map((layer) =>
        fetch(`/${layer.key}.geojson`).then((res) => res.json())
      )
    ).then((results) => {
      const all: Record<string, GeoJsonObject> = {};
      LAYERS.forEach((layer, index) => {
        all[layer.key] = results[index];
      });
      setData(all);
      const plantGeo = results[LAYERS.length] as GeoJsonObject;
      if (plantGeo && "features" in plantGeo) {
        //@ts-expect-error no check
        setPlantFeatures(plantGeo.features);
      }
    });
  }, []);

  const onUpdateTree = async () => {
    await updateTree({
      plant_code: tree?.code.split(" - ")[0] || "",
      total_on_land: +inputData.harvestCount,
      total_on_tree: +inputData.fruitCount,
      zalo_user_id: "queenfarm/qf@2025",
    })
      .unwrap()
      .then((value: { status: number; message: string }) => {
        if (value.status === 0) {
          toast.success("Cập nhật thành công");
        } else {
          toast.error(value.message);
        }
        setInputData({
          date: today,
          fruitCount: "",
          harvestCount: "",
        });
        setTree(null);
      })
      .catch(() => {
        toast.error("Cập nhật thất bại");
      });
  };
  const onSelectedGroupChange = (value: string) => {
    setSelectedGroup(value);
    if (value === "0") {
      setVisibleLayers({
        zone: true,
        area: false,
        plot: false,
        row: false,
        plant: false,
      });
    }
    if (value === "1") {
      setVisibleLayers({
        zone: false,
        area: true,
        plot: false,
        row: false,
        plant: false,
      });
    }
    if (value === "2") {
      setVisibleLayers({
        zone: false,
        area: false,
        plot: false,
        row: false,
        plant: false,
      });
      setTimeout(() => {
        setVisibleLayers({
          zone: false,
          area: false,
          plot: true,
          row: false,
          plant: false,
        });
      }, 100);
    }
    if (value === "3") {
      setVisibleLayers({
        zone: false,
        area: false,
        plot: false,
        row: false,
        plant: false,
      });
      setTimeout(() => {
        setVisibleLayers({
          zone: false,
          area: false,
          plot: true,
          row: true,
          plant: true,
        });
      }, 100);
    }
  };
  const onZoomChange = (value: number) => {
    if (value === 17) {
      setVisibleLayers({
        zone: true,
        area: false,
        plot: false,
        row: false,
        plant: false,
      });
      return;
    }
    if (value === 18) {
      setVisibleLayers({
        zone: false,
        area: true,
        plot: false,
        row: false,
        plant: false,
      });
      return;
    }
    if (value === 19) {
      setVisibleLayers({
        zone: false,
        area: false,
        plot: true,
        row: false,
        plant: false,
      });
      return;
    }
    setVisibleLayers({
      zone: false,
      area: false,
      plot: false,
      row: false,
      plant: true,
    });
    setTimeout(() => {
      setVisibleLayers({
        zone: false,
        area: false,
        plot: true,
        row: true,
        plant: true,
      });
    }, 100);
  };
  useEffect(() => {
    //@ts-expect-error no check
    window.setTreeFromPopup = async (tree: string) => {
      const treeDetail = await getTreeDetail(tree);
      setTree(treeDetail.data as TreeInfo);
    };

    return () => {
      //@ts-expect-error no check
      delete window.setTreeFromPopup;
    };
  }, []);

  return (
    <>
      <MapContainer
        preferCanvas
        center={[11.553203605968022, 107.12999664743181]}
        maxZoom={20}
        zoom={18}
        zoomControl={false}
        zoomSnap={1}
        minZoom={17}
        boxZoom={false}
        style={{ height: "100dvh", width: "100dvw" }}
      >
        <ZoomListener onChange={onZoomChange} />
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Yis</a> & contributors'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        />

        {LAYERS.map(
          ({ key, color, fill, label }) =>
            visibleLayers[key] &&
            data[key] && (
              <Pane
                key={key}
                name={key}
                style={visibleLayers.plant ? { zIndex: 100 } : {}}
              >
                <GeoJSON
                  data={data[key]}
                  style={() => ({
                    color,
                    weight: 2,
                    fillOpacity: fill ? 0.2 : 0,
                    fillColor: color,
                    dashArray: key === "row" ? "4" : undefined,
                  })}
                  onEachFeature={(feature: Feature, layer) => {
                    const props = feature.properties || {};
                    const content = `<b>${label}:</b> ${props.name || "N/A"}`;

                    layer.bindPopup(content);
                  }}
                />
              </Pane>
            )
        )}

        {visibleLayers.plant && plantFeatures?.length > 0 && (
          <Pane name="plant" style={{ zIndex: 999 }}>
            <GeoJSON
              key="plant-layer"
              data={{
                type: "FeatureCollection",
                // @ts-expect-error no check
                features: plantFeatures as Feature[],
              }}
              pointToLayer={(feature, latlng) => {
                const name = feature.properties?.name || "";
                let color = "#3388ff";
                if (name.includes("Ri6")) color = "#f03b20";
                else if (name.includes("Musang")) color = "#31a354";
                return L.circleMarker(latlng, {
                  radius: 4,
                  color,
                  fillColor: color,
                  fillOpacity: 0.8,
                  weight: 1,
                  interactive: true,
                });
              }}
              onEachFeature={async (feature, layer) => {
                layer.on("click", async () => {
                  const props = feature.properties || {};
                  layer
                    .bindPopup("<b>Đang tải thông tin cây...</b>")
                    .openPopup();
                  try {
                    // Replace with your actual API call (e.g., fetch or axios)
                    const data = await getTreeDetail(props.code);

                    const popup = `
                        <div  style="text-align: center; max-width: 250px;"> 
                        <img src="${
                          TREES[data.data?.code.slice(-2) || ""]?.image
                        }" alt="Tree" style="width: 50px; height: 50px;  margin-bottom: 8px;" />
                        <div style="text-align: left;">
                        <b>Mã cây:</b> ${data.data?.code || ""}
                        <br/><b>Tên cây:</b> ${data.data?.name || ""}
                        <br/><b>Khu vực:</b> ${data.data?.area_name || ""}
                        <br/><b>Lô:</b> ${data.data?.plot_name || ""}
                        <br/><b>Hàng:</b> ${data.data?.plot_row_name || ""}
                        </div>
                        <button onclick="window.setTreeFromPopup('${
                          data.data?.code || ""
                        }')"
                          style="margin-top: 8px; background-color: #007bff; color: white; padding: 6px 12px; border: none; border-radius: 4px; cursor: pointer;">
                          Xem chi tiết
                        </button>
                        </div>
                      `;

                    layer.bindPopup(popup).openPopup(); // Show the popup after binding it
                  } catch (error) {
                    console.error("Failed to fetch tree detail:", error);
                    layer
                      .bindPopup("<b>Lỗi:</b> Không thể tải dữ liệu cây.")
                      .openPopup();
                  }
                });
              }}
            />
          </Pane>
        )}
      </MapContainer>
      <Stack pos={"absolute"} top={10} left={10} style={{ zIndex: 999 }}>
        <AutoCompleteSearch />
      </Stack>
      <Stack
        align="flex-end"
        pos={"absolute"}
        top={10}
        right={10}
        style={{ zIndex: 999 }}
      >
        <Card shadow="md" radius="md" p="md" w={180}>
          <Title order={6} mb="xs">
            🗺️ Lớp
          </Title>

          <Radio.Group value={selectedGroup} onChange={onSelectedGroupChange}>
            <Stack>
              {Array.from(MAP_GROUP.keys()).map((key) => (
                <Radio
                  key={key}
                  value={key}
                  label={
                    <Text fw={500} fz="sm" c="black">
                      {MAP_GROUP.get(key)}
                    </Text>
                  }
                />
              ))}
            </Stack>
          </Radio.Group>
        </Card>
        <Card shadow="md" radius="md" p="md" w={"auto"}>
          <Title order={6} mb="xs">
            🗺️ Cây trồng
          </Title>
          <Stack gap={6}>
            <Group gap={6}>
              <Box w={10} h={10} bg="#f03b20" style={{ borderRadius: 50 }} />
              <Text size="sm">Cây Sầu Riêng Ri6</Text>
            </Group>
            <Group gap={6}>
              <Box w={10} h={10} bg="#31a354" style={{ borderRadius: 50 }} />
              <Text size="sm">Cây Sầu Riêng Musang King</Text>
            </Group>
            <Group gap={6}>
              <Box w={10} h={10} bg="#3388ff" style={{ borderRadius: 50 }} />
              <Text size="sm">Cây Sầu Riêng Monthong</Text>
            </Group>
          </Stack>
        </Card>
      </Stack>
      <Stack
        align="flex-end"
        pos={"absolute"}
        bottom={30}
        right={20}
        style={{ zIndex: 999 }}
      >
        <HoverCard
          width={280}
          shadow="md"
          styles={{ dropdown: { zIndex: 999 } }}
        >
          <HoverCard.Target>
            <ActionIcon size={50} radius={100} onClick={openReport}>
              <FaChartBar size={24} />
            </ActionIcon>
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <Text size="sm">
              Báo cáo thống kê số lượng thu hoạch trên từng cây
            </Text>
          </HoverCard.Dropdown>
        </HoverCard>
        <ReportModal closeReport={closeReport} openedReport={openedReport} />
      </Stack>
      <Modal
        opened={tree !== null}
        onClose={() => setTree(null)}
        zIndex={9999}
        title={
          <Text fw={"bold"}>
            {tree?.name || ""} ({tree?.code})
          </Text>
        }
        styles={{
          inner: { zIndex: 99999, top: 10, left: 0 },
        }}
      >
        <Stack gap={5}>
          <TextInput label="Ngày cập nhật" disabled value={inputData.date} />
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
              loading={isloadingUpdateTree}
              onClick={onUpdateTree}
            >
              <Text>Cập nhật</Text>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}

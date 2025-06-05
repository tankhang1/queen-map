import { MapContainer, TileLayer, GeoJSON, Pane } from "react-leaflet";
import { useEffect, useState } from "react";
import {
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  Box,
  Title,
  ActionIcon,
  HoverCard,
} from "@mantine/core";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { GeoJsonObject, Feature, Point } from "geojson";
import AutoCompleteSearch from "./components/AutoCompleteSearch";
import { useDisclosure } from "@mantine/hooks";
import { FaChartBar } from "react-icons/fa";
import ReportModal from "./components/Report";
import ZoomListener from "./components/ZoomListener";

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
const MAP_LABEL = new Map([
  ["zone", "Vùng"],
  ["area", "Khu vực"],
  ["plot", "Lô"],
  ["row", "Hàng"],
  ["plant", "Cây"],
]);
export default function FarmMap() {
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

  const toggleLayer = (key: string) => {
    setVisibleLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const onZoomChange = (value: number) => {
    if (value === 16) {
      setVisibleLayers({
        zone: true,
        area: false,
        plot: false,
        row: false,
        plant: false,
      });
      return;
    }
    if (value === 17) {
      setVisibleLayers({
        zone: false,
        area: true,
        plot: false,
        row: false,
        plant: false,
      });
      return;
    }
    if (value === 18) {
      setVisibleLayers({
        zone: false,
        area: false,
        plot: true,
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
        row: true,
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
        row: false,
        plant: true,
      });
    }, 500);
  };

  return (
    <>
      <MapContainer
        preferCanvas
        center={[11.553203605968022, 107.12999664743181]}
        maxZoom={20}
        zoom={18}
        zoomControl={false}
        zoomSnap={1}
        minZoom={16}
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
              onEachFeature={(feature, layer) => {
                const props = feature.properties || {};
                const popup = `
                  <b>Cây:</b> ${props.name || ""}
                  <br/><b>Hàng:</b> ${props.rowId}
                `;
                layer.bindPopup(popup);
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
          <Stack gap={4}>
            {Object.keys(visibleLayers).map((key) => {
              const colorMap: Record<string, string> = {
                zone: "#2b8cbe",
                area: "#f03b20",
                plot: "#31a354",
                row: "#636363",
                plant: "#3388ff",
              };

              return (
                <Checkbox
                  key={key}
                  label={
                    <Text c={colorMap[key]} fw={500} fz={"sm"}>
                      {MAP_LABEL.get(key)}
                    </Text>
                  }
                  checked={visibleLayers[key]}
                  onChange={() => toggleLayer(key)}
                />
              );
            })}
          </Stack>
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
    </>
  );
}

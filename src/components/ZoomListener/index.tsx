import { useMapEvent } from "react-leaflet";

type TZoomListener = {
  onChange: (value: number) => void;
};
const ZoomListener = ({ onChange }: TZoomListener) => {
  useMapEvent("zoomend", (e) => {
    onChange(e.target.getZoom());
    console.log("Zoom level changed:", e.target.getZoom());
  });

  return null;
};
export default ZoomListener;

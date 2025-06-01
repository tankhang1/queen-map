import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";
import { store } from "./redux/store/index.ts";
import { ToastContainer } from "react-toastify";
import "dayjs/locale/vi";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MantineProvider>
      <Provider store={store}>
        <App />
        <ToastContainer />
      </Provider>
    </MantineProvider>
  </StrictMode>
);

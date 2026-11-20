import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./theme.css";
import { captureNotificationFromLocation } from "./utils/pushNavigation";
import { startDomTranslator } from "./i18n/domTranslator";

// Start the language layer before React paints, so a saved Somali choice never flashes English first.
startDomTranslator();

// Cold start from a tapped push notification (?n=<id>): remember the id; the app opens it after sign-in.
captureNotificationFromLocation();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

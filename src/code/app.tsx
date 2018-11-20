import "../styles/app.sass";

import * as React from "react";
import * as ReactDOM from "react-dom";

import { App } from "./components/app";
import { showOpenOrCreateDialog } from "./components/open-or-create";

if ((window as any).CloudFileManager) {
  // add function to window object so that it can be used in index.html.ejs
  (window as any).showOpenOrCreateDialog = showOpenOrCreateDialog;
} else {
  ReactDOM.render(<App />, document.getElementById("app"));
}


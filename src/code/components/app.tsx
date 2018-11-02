
import * as React from "react";
import { parse } from "query-string";

import { CodapIFrame } from "./codap-iframe";

const params = parse(window.location.search);
const mode = params.mode === "dev" ? "dev" : "prod";

interface AppProps {
}
interface AppState {
}

export class App extends React.Component<AppProps, AppState> {

  public static displayName = "App";

  public render() {
    return (
      <CodapIFrame mode={mode} />
    );
  }

}

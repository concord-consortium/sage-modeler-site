
import * as React from "react";

import { CodapIFrame } from "./codap-iframe";

interface AppProps {
}
interface AppState {
}

export class App extends React.Component<AppProps, AppState> {

  public static displayName = "App";

  public render() {
    return (
      <CodapIFrame />
    );
  }

}


import * as React from "react";

import { CodapIFrame } from "./codap-iframe";
import { About } from "./about";

const mode = window.location.hostname === "localhost" ? "dev" : "prod";

interface AppProps {
}
interface AppState {
  showVersionInfo: boolean;
}

export class App extends React.Component<AppProps, AppState> {

  public static displayName = "App";

  public state: AppState = {
    showVersionInfo: false
  };

  public componentDidMount() {
    if (window.self !== window.top) {
      window.addEventListener("message", (e) => {
        const data = e.data || {};
        const type = "" + (data.type || "");
        if (type === "sagemodeler::showVersionInfo") {
          this.setState({showVersionInfo: !this.state.showVersionInfo});
        }
      });
    }
  }

  public render() {
    return (
      <React.Fragment>
        <CodapIFrame mode={mode} />
        {this.state.showVersionInfo ? this.renderVersionInfo() : undefined}
      </React.Fragment>
    );
  }

  private renderVersionInfo() {
    return <About onClose={this.handleCloseAbout} />;
  }

  private handleCloseAbout = () => {
    this.setState({showVersionInfo: false});
  }

}

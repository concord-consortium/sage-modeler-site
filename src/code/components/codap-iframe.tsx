
import * as React from "react";

interface CodapIFrameProps {
  mode: "dev" | "prod";
}
interface CodapIFrameState {
}

export class CodapIFrame extends React.Component<CodapIFrameProps, CodapIFrameState> {

  public static displayName = "CodapIFrame";

  public shouldComponentUpdate() {
    return false;
  }

  public render() {
    if (this.props.mode === "dev") {
      return this.renderDev();
    }
    return this.renderProd();
  }

  private renderProd() {
    return <iframe src="/releases/latest/static/dg/en/cert/index.html?standalone=true&di=https://sage.concord.org/branch/159109340-add-splash-screen/" />;
  }

  private renderDev() {
    return <iframe src="/codap/static/dg/en/cert/index.html?standalone=true&cfmBaseUrl=/cfm/js&di=/sage/" />;
  }
}

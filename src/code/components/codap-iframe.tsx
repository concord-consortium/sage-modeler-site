
import * as React from "react";

interface CodapIFrameProps {
}
interface CodapIFrameState {
}

export class CodapIFrame extends React.Component<CodapIFrameProps, CodapIFrameState> {

  public static displayName = "CodapIFrame";

  public shouldComponentUpdate() {
    return false;
  }

  public render() {
    return (
      <iframe src="https://sagemodeler.concord.org/releases/latest/static/dg/en/cert/index.html?standalone=true&di=https://sage.concord.org/branch/159109340-add-splash-screen/" />
    );
  }
}

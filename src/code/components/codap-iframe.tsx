
import * as React from "react";

interface CodapIFrameProps {
  mode: "dev" | "prod";
}
interface CodapIFrameState {
}

export class CodapIFrame extends React.Component<CodapIFrameProps, CodapIFrameState> {

  public static displayName = "CodapIFrame";

  private iframe: HTMLIFrameElement | null;

  public componentDidMount() {
    // proxy CFM messages between iframes
    if (window.self !== window.top) {
      window.addEventListener("message", (e) => {
        const data = e.data || {};
        const type = "" + (data.type || "");
        if (this.iframe && this.iframe.contentWindow && (type.substr(0, 5) === "cfm::")) {
          if (e.source === window.top) {
            this.iframe.contentWindow.postMessage(data, "*");
          } else if (e.source === this.iframe.contentWindow) {
            window.top.postMessage(data, "*");
          }
        }
      });
    }
  }

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
    return <iframe ref={el => this.iframe = el} src="/releases/latest/static/dg/en/cert/index.html?standalone=true&embeddedMode=yes&di=https://sage.concord.org/branch/159109340-add-splash-screen/sagemodeler.html" />;
  }

  private renderDev() {
    const sageModelerParams = encodeURIComponent("?standalone=true");
    return <iframe ref={el => this.iframe = el} src={`/codap/static/dg/en/cert/index.html?standalone=true&embeddedMode=yes&cfmBaseUrl=/cfm/js&di=/sage/sagemodeler.html${sageModelerParams}`} />;
  }
}


import * as React from "react";
import * as queryString from "query-string";

const urlParams: UrlParams = queryString.parse(window.location.search);

interface CodapParamsOptions {
  codap: string;
  cfmBaseUrl: string;
  di: string;
}

interface UrlParams {
  codap?: string;
  cfmBaseUrl?: string;
  di?: string;
}

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
    const src = this.iframeSrc({
      codap: "/~dmartin/travis3/static/dg/en/cert/index.html",
      cfmBaseUrl: "https://cloud-file-manager.concord.org/branch/master/js/",
      di: "https://sage.concord.org/branch/master/sagemodeler.html"
    });
    return <iframe ref={el => this.iframe = el} src={src} />;
  }

  private renderDev() {
    const src = this.iframeSrc({
      codap: "/codap/static/dg/en/cert/index.html",
      cfmBaseUrl: "/cfm/js",
      di: "/sage/sagemodeler.html"
    });
    return <iframe ref={el => this.iframe = el} src={src} />;
  }

  private iframeSrc(options: CodapParamsOptions) {
    let {codap, cfmBaseUrl, di} = options;

    // allow overrides from query string
    codap = urlParams.codap || codap;
    cfmBaseUrl = urlParams.cfmBaseUrl || cfmBaseUrl;
    di = urlParams.di || di;

    const sageModelerParams = encodeURIComponent("?standalone=true");
    return `${codap}?standalone=true&embeddedMode=yes&hideSplashScreen=yes&hideWebViewLoading=yes&cfmBaseUrl=${cfmBaseUrl}&di=${di}${sageModelerParams}`;
  }
}

import { urlParams } from "./url-params";
const mode = window.location.hostname === "localhost" ? "dev" : "prod";

interface CodapParamsOptions {
  codap: string;
  cfmBaseUrl: string;
  di: string;
}

const iframeSrc = (options: CodapParamsOptions) => {
  let {codap, cfmBaseUrl, di} = options;

  // allow overrides from query string
  codap = urlParams.codap || codap;
  cfmBaseUrl = urlParams.cfmBaseUrl || cfmBaseUrl;
  di = urlParams.di || di;

  // Apply language setting to CODAP iframe. It will propagate down and update Sage modeler language too.
  if (urlParams.lang) {
    const lang = urlParams.lang.split("-")[0];
    if (lang !== "en") {
      codap = codap.replace("/en/", `/${lang}/`);
    }
  }

  const sageModelerParams = encodeURIComponent("?standalone=true");
  return `${codap}?standalone=true&embeddedMode=yes&hideSplashScreen=yes&hideWebViewLoading=yes&cfmBaseUrl=${cfmBaseUrl}&di=${di}${sageModelerParams}`;
};

const prodSrc = iframeSrc({
  codap: "/~dmartin/travis4/static/dg/en/cert/index.html",
  cfmBaseUrl: "https://cloud-file-manager.concord.org/branch/master/js/",
  di: "https://sage.concord.org/branch/master/sagemodeler.html"
});

const devSrc = iframeSrc({
  codap: "/codap/static/dg/en/cert/index.html",
  cfmBaseUrl: "/cfm/js",
  di: "/sage/sagemodeler.html"
});

export const codapIframeSrc = mode === "dev" ? devSrc : prodSrc;

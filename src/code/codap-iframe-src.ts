import { urlParams, parsedParams } from "./utils/url-params";
import { stringify } from "query-string";

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

  // assume release/branch names for params without slashes
  if (codap.indexOf("/") === -1) {
    codap = `/releases/${codap}/static/dg/en/cert/index.html`;
  }
  if (di.indexOf("/") === -1) {
    di = `/sage/branch/${di}/sage.html`;
  }
  if (cfmBaseUrl.indexOf("/") === -1) {
    cfmBaseUrl = `/cfm/branch/${cfmBaseUrl}/js`;
  }

  const codapParams = {
    standalone: "true",
    embeddedMode: "yes",
    hideSplashScreen: "yes",
    hideWebViewLoading: "yes",
    hideUndoRedoInComponent: "yes",
    cfmBaseUrl
  };
  const sageParams = {
    standalone: "true"
  };

  Object.keys(parsedParams).forEach((key) => {
    const match = key.match(/^(codap|sage):(.+)$/i);
    if (match) {
      const params = match[1] === "codap" ? codapParams : sageParams;
      params[match[2]] = parsedParams[key];
    }
  });

  const diParams = encodeURIComponent(`?${stringify(sageParams)}`);
  return `${codap}?${stringify(codapParams)}&di=${di}${diParams}&di-override=sage`;
};

export const codapIframeSrc = iframeSrc({
  // SageModelerBuildConfig is defined in index.html using webpack configuration.
  codap: (window as any).SageModelerBuildConfig.codapUrl,
  cfmBaseUrl: (window as any).SageModelerBuildConfig.cfmUrl + "/js",
  di: (window as any).SageModelerBuildConfig.sageUrl + "/sagemodeler.html"
});

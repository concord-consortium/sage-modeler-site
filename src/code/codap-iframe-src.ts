import { urlParams } from "./utils/url-params";

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

export const codapIframeSrc = iframeSrc({
  // SageModelerBuildConfig is defined in index.html using webpack configuration.
  codap: (window as any).SageModelerBuildConfig.codapUrl,
  cfmBaseUrl: (window as any).SageModelerBuildConfig.cfmUrl + "/js",
  di: (window as any).SageModelerBuildConfig.sageUrl + "/sagemodeler.html"
});

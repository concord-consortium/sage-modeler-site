import { urlParams, parsedParams } from "./utils/url-params";
import { stringify } from "query-string";
import { currentLang, useFullLanguage, getBaseLanguage } from "./utils/translate";

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
  const fullLangWhitelist = ["zh-TW", "pt-BR"];
  const lang = useFullLanguage(currentLang) ? currentLang : getBaseLanguage(currentLang);
  if (lang !== "en") {
    codap = codap.replace("/en/", `/${lang}/`);
  }

  // assume release/branch names for params without slashes
  const expandBranchUrl = (url: string, branchUrl: string) => url.indexOf("/") === -1 ? branchUrl : url;
  codap = expandBranchUrl(codap, `/releases/${codap}/static/dg/${lang}/cert/`);
  di =  expandBranchUrl(di, `/sage/branch/${di}/sagemodeler.html`);
  cfmBaseUrl = expandBranchUrl(cfmBaseUrl, `/cfm/branch/${cfmBaseUrl}/js`);

  const codapParams = {
    standalone: "SageModeler",
    embeddedMode: "yes",
    hideSplashScreen: "yes",
    hideWebViewLoading: "yes",
    hideUndoRedoInComponent: "yes",
    "lang-override": lang,
    inbounds: "true"
  };
  const sageParams = {
    standalone: "true"
  };

  Object.keys(parsedParams).forEach((key) => {
    const match = key.match(/^(codap|sage):(.+)$/i);
    if (match) {
      let value = parsedParams[key] as string;
      const param = match[2];
      if (param === "cfmBaseUrl") {
        value = expandBranchUrl(value, `/cfm/branch/${value}/js`);
      }
      const params = match[1] === "codap" ? codapParams : sageParams;
      params[param] = value;
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

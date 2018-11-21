import * as queryString from "query-string";

interface UrlParams {
  lang?: string;
  codap?: string;
  cfmBaseUrl?: string;
  di?: string;
}

export const urlParams: UrlParams = queryString.parse(window.location.search);

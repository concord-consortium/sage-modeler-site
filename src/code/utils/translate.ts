import { urlParams } from "./url-params";

const languageFiles = {
  "de":      require("./lang/de.json"),      // German
  "el":      require("./lang/el.json"),      // Greek
  "en-US":   require("./lang/en-US.json"),   // US English
  "es":      require("./lang/es.json"),      // Spanish
  "he":      require("./lang/he.json"),      // Hebrew
  "ko":      require("./lang/ko.json"),      // Korean
  "nb":      require("./lang/nb.json"),      // Norwegian Bokmål
  "nn":      require("./lang/nn.json"),      // Norwegian Nynorsk
  "pt-BR":   require("./lang/pt-BR.json"),   // Portuguese (Brazilian)
  "th":      require("./lang/th.json"),      // Thai
  "tr":      require("./lang/tr.json"),      // Turkish
  "zh":      require("./lang/zh-HANS.json"), // Chinese (Simplified)
  "zh-TW":   require("./lang/zh-TW.json"),   // Chinese (Traditional)
};

export const useFullLanguage = (lang: string) => {
  const fullLangWhitelist = ["zh-TW", "pt-BR"];
  return fullLangWhitelist.indexOf(lang) !== -1;
};

export const getBaseLanguage = (langKey: string) => {
  return langKey.split("-")[0];
};

const getFirstBrowserLanguage = () => {
  const nav = window.navigator as any;
  const languages = nav ? (nav.languages || []).concat([nav.language, nav.browserLanguage, nav.systemLanguage, nav.userLanguage]) : [];

  for (const language of languages) {
    if (language) {
      return language;
    }
  }
};

const translations =  {};
Object.keys(languageFiles).forEach(langKey => {
  const baseLang = getBaseLanguage(langKey);
  translations[langKey] = languageFiles[langKey];
  if (!translations[baseLang]) {
    translations[baseLang] = languageFiles[langKey];
  }
});

const lang = urlParams.lang || getFirstBrowserLanguage();
const baseLang = getBaseLanguage(lang || "");
export const currentLang = lang && translations[lang] ? lang : (translations[baseLang] ? baseLang : "en");

console.log(`sage-modeler-site: using ${currentLang} for translation (lang is "${urlParams.lang}" || "${getFirstBrowserLanguage()}")`);

const varRegExp = /%\{\s*([^}\s]*)\s*\}/g;

export const translate = (key, vars = {}, lang = currentLang) => {
  let translation = translations[lang] != null ? translations[lang][key] : null;
  if (translation == null) {
    translation = key;
  }
  return translation.replace(varRegExp, (match, key) => {
    if (vars.hasOwnProperty(key)) {
      return vars[key];
    } else {
      return `'** UKNOWN KEY: ${key} **`;
    }
  });
};

export const tr = translate;

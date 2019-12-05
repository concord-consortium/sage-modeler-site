import { urlParams } from "./url-params";
const languageFiles = {
  "en-US": require("./lang/en-US.json"),
  "he": require("./lang/he.json"),
  "tr": require("./lang/tr.json"),
  "zh-TW": require("./lang/zh-TW.json"),
  "es": require("./lang/es.json"),
  "et": require("./lang/et.json"),
  "el": require("./lang/el.json"),
  "nb": require("./lang/nb.json"),
  "nn": require("./lang/nn.json"),
  "de": require("./lang/de.json")
};

const translations =  {};
Object.keys(languageFiles).forEach(langKey => {
  let dashLoc;
  translations[langKey] = languageFiles[langKey];
  // accept full key with region code or just the language code
  if ((dashLoc = langKey.indexOf("-")) > 0) {
    const lang = langKey.substring(0, dashLoc);
    translations[lang] = languageFiles[langKey];
  }
});

const getFirstBrowserLanguage = () => {
  const nav = window.navigator as any;
  const languages = nav ? (nav.languages || []).concat([nav.language, nav.browserLanguage, nav.systemLanguage, nav.userLanguage]) : [];

  for (const language of languages) {
    if (language) {
      return language;
    }
  }
};

const lang = urlParams.lang || getFirstBrowserLanguage();
const defaultLang = lang && translations[lang] ? lang : "en";

const varRegExp = /%\{\s*([^}\s]*)\s*\}/g;

export const translate = (key, vars = {}, lang = defaultLang) => {
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

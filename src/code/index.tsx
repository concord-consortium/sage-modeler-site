import { showOpenOrCreateDialog } from "./components/open-or-create";
import { codapIframeSrc } from "./codap-iframe-src";
import { urlParams, parsedParams } from "./utils/url-params";
import { tr, currentLang, useFullLanguage, getBaseLanguage } from "./utils/translate";
import * as queryString from "query-string";
// CFM is added using script tag.
const CloudFileManager = (window as any).CloudFileManager;

import "../styles/index.sass";

let inIframe = false;
try {
  inIframe = window.top !== window.self;
} catch (e) {
  inIframe = false;
}

// the three ways we detect if we are launched from lara is if we are in an iframe
// or there is either a documentServer or launchFromLara parameter that is part of the LARA embed parameters
const launchedFromLara = inIframe || !!parsedParams.documentServer || !!parsedParams.launchFromLara;

// check for a temp file before creating the CFM frame (where is will be auto loaded and then removed from localstorage)
const haveTempFile = CloudFileManager.client.haveTempFile && CloudFileManager.client.haveTempFile();

const selfUrl = `${window.location.origin}${window.location.pathname}`;

const providers = [
  {
    "name": "readOnly",
    "displayName": tr("~SAGEMODELER.OPEN_OR_CREATE.EXAMPLES"),
    "urlDisplayName": "examples",
    "src": "//s3.amazonaws.com/cc-project-resources/sagemodeler-examples/index.json"
  },
  {
    "name": "lara",
    "patch": true,
    "patchObjectHash": obj => {
      return obj.guid || JSON.stringify(obj);
    },
    "logLaraData": laraData => {
      console.log("SageModeler logLaraData:" + JSON.stringify(laraData));
    }
  },
  {
    "name": "googleDrive",
    "apiKey": "AIzaSyArBgGAjVU_TvSXtluZPaEDnBToANkMD4Q",
    "clientId": "617149450375-rglbpcteq9ej0j3gsfc59io5fgpp42eb.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive.install",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/userinfo.profile"
    ],
    "disableSharedDrives": true
  },
  {
    "name": "documentStore",
    "displayName": "Concord Cloud",
    "deprecationPhase": (() => {
      return 3;
    })(),
    "patch": true,
    "patchObjectHash": obj => {
      return obj.guid || JSON.stringify(obj);
    },
    "appName": "SageModeler",
    "appVersion": (window as any).SageModelerBuildConfig.appVersion,
    "appBuildNum": (window as any).SageModelerBuildConfig.commit,
  },
  "localFile"
];
if (window.location.search.indexOf("enableLocalStorage") !== -1) {
  providers.push("localStorage");
}

const options = {
  app: codapIframeSrc,
  hideMenuBar: launchedFromLara,
  autoSaveInterval: 5,
  mimeType: "application/json",
  appName: "SageModeler",
  appVersion: (window as any).SageModelerBuildConfig.appVersion,
  appBuildNum: (window as any).SageModelerBuildConfig.commit,
  wrapFileContent: false,
  readableMimeTypes: ["application/x-sagemod-document"],
  extension: "sagemod",
  readableExtensions: ["sagemod"],
  enableLaraSharing: true,
  sendPostMessageClientEvents: true,
  iframeAllow: "geolocation; microphone; camera; bluetooth; clipboard-read; clipboard-write",
  log: (event, eventData) => {
    const params = eventData ? JSON.stringify(eventData) : "";
    console.log(event, params);
  },
  providers,
  ui: {
    menu: CloudFileManager.DefaultMenu,
    menuBar: {
      info: (window as any).SageModelerBuildConfig.appVersion,
      languageMenu: {
        currentLang,
        options: [
          {langCode: "en-US", label: "English"},
          {langCode: "es",    label: "Español"},
          {langCode: "el",    label: "Ελληνικά"},
          {langCode: "de",    label: "Deutsch"},
          {langCode: "he",    label: "עברית"},
          {langCode: "ko",    label: "한국어"},
          {langCode: "nb",    label: "Bokmål"},
          {langCode: "nn",    label: "Nynorsk"},
          {langCode: "pt-BR", label: "Português do Brasil"},
          {langCode: "th",    label: "ไทย"},
          {langCode: "tr",    label: "Türkçe"},
          {langCode: "zh",    label: "简体中文"},
          {langCode: "zh-TW", label: "繁体中文"}
        ],
        onLangChanged: langCode => {
          const newParams = Object.assign({}, urlParams);
          newParams.lang = langCode;
          window.location.search = queryString.stringify(newParams);
        }
      }
    },
    newFileAddsNewToQuery: true,
    shareDialog: {
      serverUrl: selfUrl,
      serverUrlLabel: tr("~SAGEMODELER.SHARE_DIALOG.SERVER_URL")
    },
    confirmCloseIfDirty: true
  },
  contentLoadFilter: (currentContent: any) => {
    // this fixes the translated iframe title in the early Korean versions
    const component = currentContent?.content?.content?.components?.[0];
    if (component?.type === "DG.GameView" && component?.componentStorage?.title === "세이지모델러") {
      component.componentStorage.title = "SageModeler";
    }
    return currentContent;
  },
  contentSaveFilter: (currentContent: any) => {
    // as a hack for now filter out the version numbers from the content so that
    // app version changes updates don't cause the contents to change
    if (currentContent?.content) {
      if (currentContent.content.appVersion) {
        currentContent.content.appVersion = "2.5.3.filtered";
      }
      if (currentContent.content.cfmVersion) {
        currentContent.content.cfmVersion = "1.5.5.filtered";
      }
      if (currentContent.content.content?.appBuildNum) {
        currentContent.content.content.appBuildNum = "0625.filtered";
      }
    }
    return currentContent;
  }
};

// if there is no lang parameter redirect to the browser's language if it isn't English
if (!urlParams.lang) {
  const baseLang = getBaseLanguage(currentLang);
  const lang = useFullLanguage(currentLang) ? currentLang : baseLang;
  const langOption = options.ui.menuBar.languageMenu.options.find((option) => {
    return (option.langCode === lang);
  });
  if (!!langOption && (baseLang !== "en")) {
    const hash = window.location.hash.length > 1 ? window.location.hash : "";
    urlParams.lang = langOption.langCode;
    window.location.replace(`?${queryString.stringify(urlParams)}${hash}`);
  }
}

// remove #new from url
const isNewedFile = window.location.hash === "#new";
if (isNewedFile && window.history.replaceState) {
  window.history.replaceState("", document.title, window.location.pathname + window.location.search);
}
// #copy doesn't have to be removed from URL. CFM will do it itself while loading a copied file.
const isCopiedFile = window.location.hash.startsWith("#copy");

CloudFileManager.createFrame(options, "app", event => {
  if (event.type === "rendered") {
    const client = event.data.client;
    client.insertMenuItemAfter("openFileDialog", {
      name: tr("~SAGEMODELER.MENU.IMPORT"),
      action: () => {
        client.importDataDialog();
      }
    });
    client.insertMenuItemAfter("openFileDialog", {
      name: tr("~SAGEMODELER.MENU.CLOSE"),
      action: () => {
        client.closeFileDialog(() => {
          // remove hash from url completely
          (window as any).location = window.location.toString().replace(/#.*$/, "");
        });
      }
    });

    window.addEventListener("message", (e) => {
      // This message is sent by CODAP's CFM due to the saveSecondaryFileViaPostMessage
      // being set as a CODAP query parameter in codap-iframe-src.ts.
      if (e.data.action === "saveSecondaryFile") {
        const {extension, mimeType, content} = e.data;
        client.saveSecondaryFileAsDialog(content, extension, mimeType);
      }
    });

    (window as any).onSplashScreenClosed = () => {
      // only show the open or create if there is no hash parameter (for loading a file)
      // and we are not in an iframe (for LARA) or were launched from LARA
      if ((window.location.hash.length < 2) && !isNewedFile && !launchedFromLara && !isCopiedFile && !haveTempFile) {
        showOpenOrCreateDialog(client);
      }
    };
  }
});

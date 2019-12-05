import { showOpenOrCreateDialog } from "./components/open-or-create";
import { codapIframeSrc } from "./codap-iframe-src";
import { urlParams, parsedParams } from "./utils/url-params";
import { tr } from "./utils/translate";
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

const selfUrl = `${window.location.origin}${window.location.pathname}`;

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
  log: (event, eventData) => {
    const params = eventData ? JSON.stringify(eventData) : "";
    console.log(event, params);
  },
  providers: [
    {
      "name": "readOnly",
      "displayName": "Examples",
      "urlDisplayName": "examples",
      "src": "//s3.amazonaws.com/cc-project-resources/sagemodeler-examples/index.json"
    },
    {
      "name": "lara",
      "patch": true,
      "patchObjectHash": obj => {
        return obj.guid || JSON.stringify(obj);
      }
    },
    {
      "name": "googleDrive",
      "clientId": "617149450375-rglbpcteq9ej0j3gsfc59io5fgpp42eb.apps.googleusercontent.com",
      "scopes": [
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/drive.install",
        "https://www.googleapis.com/auth/drive.metadata.readonly",
        "https://www.googleapis.com/auth/userinfo.profile"
      ]
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
  ],
  ui: {
    menu: CloudFileManager.DefaultMenu,
    menuBar: {
      info: (window as any).SageModelerBuildConfig.appVersion,
      languageMenu: {
        currentLang: urlParams.lang || "en-US",
        options: [
          {langCode: "en-US", label: "English"},
          {langCode: "es", label: "Español"},
          {langCode: "el", label: "Ελληνικά"},
          {langCode: "de", label: "Deutsch"},
          {langCode: "he", label: "עברית"},
          {langCode: "nb", label: "Bokmål"},
          {langCode: "nn", label: "Nynorsk"},
          {langCode: "tr", label: "Türkçe"},
          {langCode: "zh", label: "中文"},
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
};

// if there is no lang parameter redirect to the browser's language if it isn't English
if (!urlParams.lang) {
  const {language} = navigator;
  const twoLetterCode = language.replace(/-.*$/, "");
  const langOption = options.ui.menuBar.languageMenu.options.find((option) => {
    return (option.langCode === language) || (option.langCode === twoLetterCode);
  });
  if (!!langOption && (twoLetterCode !== "en")) {
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

    (window as any).onSplashScreenClosed = () => {
      // only show the open or create if there is no hash parameter (for loading a file)
      // and we are not in an iframe (for LARA) or were launched from LARA
      if ((window.location.hash.length < 2) && !isNewedFile && !launchedFromLara && !isCopiedFile) {
        showOpenOrCreateDialog(client);
      }
    };
  }
});

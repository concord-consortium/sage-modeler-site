import { showOpenOrCreateDialog } from "./components/open-or-create";
import { codapIframeSrc } from "./codap-iframe-src";
import { urlParams } from "./utils/url-params";
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

const selfUrl = `${window.location.origin}${window.location.pathname}`;

const options = {
  app: codapIframeSrc,
  hideMenuBar: inIframe,
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
      "clientId": "617149450375-rglbpcteq9ej0j3gsfc59io5fgpp42eb.apps.googleusercontent.com"
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
          {langCode: "en-US", flag: "us"},
          {langCode: "es", flag: "es"},
          {langCode: "he", flag: "il"},
          {langCode: "tr", flag: "tr"},
          {langCode: "zh", flag: "tw"}
        ],
        onLangChanged: langCode => {
          const newParams = Object.assign({}, urlParams);
          if (langCode === "en-US") {
            delete newParams.lang;
          } else {
            newParams.lang = langCode;
          }
          window.location.search = queryString.stringify(newParams);
        }
      }
    },
    newFileAddsNewToQuery: true,
    shareDialog: {
      serverUrl: selfUrl,
      serverUrlLabel: tr("~SAGEMODELER.SHARE_DIALOG.SERVER_URL")
    }
  },
};

// remove #new from url
const isNewedFile = window.location.hash === "#new";
if (isNewedFile && window.history.replaceState) {
  window.history.replaceState("", document.title, window.location.pathname + window.location.search);
}

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
      // and we are not in an iframe (for LARA)
      if ((window.location.hash.length < 2) && !isNewedFile && !inIframe) {
        showOpenOrCreateDialog(client);
      }
    };
  }
});

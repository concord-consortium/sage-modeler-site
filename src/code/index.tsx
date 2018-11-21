import { showOpenOrCreateDialog } from "./components/open-or-create";
import { showAbout } from "./components/about";
import { codapIframeSrc } from "./codap-iframe-src";
import { urlParams } from "./utils/url-params";
import { tr } from "./utils/translate";
import * as queryString from "query-string";
// CFM is added using script tag.
const CloudFileManager = (window as any).CloudFileManager;

import "../styles/index.sass";

const options = {
  app: codapIframeSrc,
  autoSaveInterval: 5,
  mimeType: "application/json",
  appName: "SageModeler",
  appVersion: (window as any).APP_VERSION,
  appBuildNum: (window as any).COMMIT,
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
      "src": "examples.json"
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
      "appVersion": (window as any).APP_VERSION,
      "appBuildNum": (window as any).COMMIT,
    },
    "localFile"
  ],
  ui: {
    menu: CloudFileManager.DefaultMenu,
    menuBar: {
      info: (window as any).APP_VERSION,
      onInfoClicked: () => {
        showAbout();
      },
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
    }
  },
};

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
      if (window.location.hash.length < 2) {
        showOpenOrCreateDialog(client);
      }
    };
  }
});

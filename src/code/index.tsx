import { showOpenOrCreateDialog } from "./components/open-or-create";
import { showAbout } from "./components/about";
import { codapIframeSrc } from "./codap-iframe-src";
// CFM is added using script tag.
const CloudFileManager = (window as any).CloudFileManager;

import "../styles/index.sass";

const getQueryVariable = name => {
  const query = window.location.search.substring(1);
  const vars = query.split("&");
  for (const variable of vars) {
    const pair = variable.split("=");
    if (decodeURIComponent(pair[0]) === name) {
      return decodeURIComponent(pair[1]);
    }
  }
};
const updateQueryStringParameter = (key, value) => {
  const uri = window.location.search;
  const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
  const separator = uri.indexOf("?") !== -1 ? "&" : "?";
  if (uri.match(re)) {
    if (value !== null) {
      // Update variable.
      window.location.search = uri.replace(re, "$1" + key + "=" + value + "$2");
    } else {
      // Remove variable.
      window.location.search = uri.replace(re, "$1" + "$2");
    }
  } else {
    if (value !== null) {
      window.location.search = uri + separator + key + "=" + value;
    }
  }
};

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
        currentLang: getQueryVariable("lang") || "en-US",
        options: [
          {langCode: "en-US", flag: "us"},
          {langCode: "es", flag: "es"},
          {langCode: "he", flag: "il"},
          {langCode: "tr", flag: "tr"},
          {langCode: "zh", flag: "tw"}
        ],
        onLangChanged: langCode => {
          if (langCode === "en-US") {
            updateQueryStringParameter("lang", null);
          } else {
            updateQueryStringParameter("lang", langCode);
          }
        }
      }
    }
  },
};

CloudFileManager.createFrame(options, "app", event => {
  if (event.type === "rendered") {
    const client = event.data.client;
    client.insertMenuItemAfter("openFileDialog", {
      name: "Import ...",
      action: () => {
        client.importDataDialog();
      }
    });
    client.insertMenuItemAfter("openFileDialog", {
      name: "Close",
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

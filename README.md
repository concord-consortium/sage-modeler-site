# SageModeler Site

## Passing parameters to Sage and CODAP

To pass parameters to the embedded CODAP and Sage instances prefix the parameter with either `codap:` or `sage:`.  The prefix will be stripped from the parameter and placed into the correct url location.

Examples:

To hide the inspector panel in Sage use:

`?sage:hide=inspectorPanel`

To set the guide index in CODAP use:

`?codap:guideIndex=1`

## Adding Examples

1. Capture the JSON and then save it as a file, eg `sample.json`.
2. Upload `sample.json` to the `sagemodeler-examples/files` folder in the Concord cc-project-resources S3 bucket (https://console.aws.amazon.com/s3/buckets/cc-project-resources/sagemodeler-examples/files/?region=us-east-1)
3. Download the `index.json` file from `sagemodeler-examples` folder on S3 and add the `sample.json` file to the list of files.
   NOTE: the ordering of the files is preserved when showing the examples in the dialog.
4. Upload the updated `index.json` file to `sagemodeler-examples` on S3
5. Reload `https://sagemodeler.concord.org` and verify that the new `sample.json` example is available in the File/Open dialog.

Optional (to keep the examples under version control):

1. Copy `sample.json` to the `src/assets/examples/files` folder and `index.json` to the `src/assets/examples` folder.
2. Create a pull request with the changes

## Development

### Initial steps

1. Clone this repo and `cd` into it
2. Run `npm install` to pull dependencies
3. Run `npm start` to run the dev proxy and server and open your browser to the server in dev mode.
   NOTE: you may need to manually refresh your browser after webpack is done building the code
   depending on how each task runs as each tasks runs in parallel.

### Dev Proxy and Server

For local development it is assumed you have the following three additional repos checked out as sibling
repos: codap, building-models and cloud-file-manager.  In dev mode the iframe points to the dev proxy
which proxies requests to the sibling repos based on the first folder in the request and if no match is
found proxies to webpack-dev-server.  This allows us to serve this app, CODAP, Sage and CFM from the
same domain to enable cross-frame communication.

In production mode CloudFront provides the proxying.

### Local Storage

To enable faster local development `enableLocalStorage` can be added to the query string.  This will add
the local storage provider to the list of open/save providers.  For example:

https://localhost:10000/app?enableLocalStorage

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.


### Translation strings

This project shares a POEditor project with https://github.com/concord-consortium/building-models.
Please use https://github.com/concord-consortium/building-models repository to add a new strings, update strings
in POEditor using provided scripts, and finally copy over all the JSON files from building-models.
Note that you should push the same changes to both repositories, so they stay in sync.

### Adding a language

To add a new language:

1. Copy over the language file from `building-models`.
2. Add the new language file in the `languageFiles` map in `src/code/utils/translate.ts`

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## CODAP v3 Development

### Prerequisites

Clone these sibling repos alongside `sage-modeler-site`:

| Repo | Branch | Directory |
|------|--------|-----------|
| [codap](https://github.com/concord-consortium/codap) | `main` | `../codap/` |
| [building-models](https://github.com/concord-consortium/building-models) | `main` | `../building-models/` |
| [cloud-file-manager](https://github.com/concord-consortium/cloud-file-manager) | `v1.9.x` | `../cloud-file-manager/` |

Build Building Models and CFM:
- `cd ../building-models && nvm use 14 && npm install && npm run build`
- `cd ../cloud-file-manager && nvm use 18 && npm install && npm run build`

### Dev-server mode (live development, manual reload)

1. Start the CODAP v3 dev server: `cd ../codap/v3 && nvm use 22 && npm start`
2. Start the SageModeler v3 proxy: `nvm use 12 && npm run start:v3`
3. Browser opens to `https://localhost:10000/app/?codap=/codap/index.html`

The `start:v3` script configures webpack to default to CODAP v3, so `https://localhost:10000/app/` also works without the `?codap=` parameter.

CODAP v3 changes require a manual browser reload (HMR does not work through the proxy). SageModeler changes hot-reload normally.

### Static-fallback mode (no CODAP dev server)

1. Build CODAP v3: `cd ../codap/v3 && nvm use 22 && npm run build`
2. Start the SageModeler v3 proxy: `nvm use 12 && npm run start:v3`

The proxy auto-detects that the dev server isn't running and serves from `../codap/v3/dist/`.

### HTTPS mode (optional)

If CODAP v3 is running with `npm run start:secure` (HTTPS), set the environment variable before starting:

```
CODAP_V3_URL=https://localhost:8080 npm run start:v3
```

## Deployment

Deployments are based on the contents of the /dist folder and are built automatically by GitHub Actions for each branch and tag pushed to GitHub.

Branches are deployed to `https://sagemodeler.concord.org/branch/<name>/`.

Tags are deployed to `https://sagemodeler.concord.org/version/<name>/`

You can view the status of all the branch and tag deploys [here](https://github.com/concord-consortium/sage-modeler-site/actions).

The production release is available at `https://sagemodeler.concord.org`.

Production releases are done using a manual GitHub Actions workflow. You specify which tag you want to release to production and the workflow copies all of the files in that tag's version folder to the root folder.

To deploy a production release:

1. Update the version number in `package.json` and `package-lock.json`
    - `npm version --no-git-tag-version [patch|minor|major]`
1. Verify that everything builds correctly
    - `npm run lint && npm run build && npm run test`
1. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
1. Test the master build at: https://sagemodeler.concord.org/index-master.html
1. Push a version tag to GitHub and/or use https://github.com/concord-consortium/sage-modeler-site/releases to create a new GitHub release
1. Stage the release by running the [Release Staging Workflow](https://github.com/concord-consortium/sage-modeler-site/actions/workflows/release-staging.yml) and entering the version tag you just pushed.
1. Test the staged release at https://sagemodeler.concord.org/staging/
1. Update production by running the [Release Workflow](https://github.com/concord-consortium/sage-modeler-site/actions/workflows/release_production.yml) and entering the release version tag.

**NOTE:** This repo and the [building-models](https://github.com/concord-consortium/building-models) repo should be
released at the same time, with the same version numbers, even if one of the two repos has no changes, in order to
keep their version numbers in sync so that the splashscreen and top nav bar show the same version numbers. Refer
to the readme in that repo for release steps.

### QA

Since this project depends on three other deployed projects (CODAP, Sage and CFM) a set of query parameters is available to override
where those projects are deployed.  This enables this project to be tested against branch builds of the other projects.

The parameters are:

- ?codap=<`URL`|`release`> where `URL` is the url to the CODAP index.html page or `release` is the CODAP release folder (example: `build_0473`)
- ?di=<`URL`|`branch`> where `URL` is the url to Sage (di is passed to CODAP, it stands for "data interactive") or `branch` is the deployed Sage branch (example: `164295027-default-to-zero`)
- ?cfmBaseUrl=<`URL`|`branch`> where `URL` is the url to the /js folder for CFM or `branch` is the deployed CFM branch (example: `fix-example-loads-in-codap`).  In order to allow for testing of separate CFM instances in sage-modeler-site, CODAP and building-models you must explicitly also override their cfmBaseUrl's by using either the `codap:` or `sage:` prefix.  Here is an example url that overrides all the CFMs:  https://sagemodeler.concord.org/app/?cfmBaseUrl=add-persistent-saves&sage:cfmBaseUrl=add-persistent-saves&codap:cfmBaseUrl=add-persistent-saves

To test the automatically deploying CODAP branches from Travis builds use `?codap=/codap-dev/branch/BRANCHNAME/` or just `?codap=/codap-dev/` to access the master branch.  Here is an example using a branch:

https://sagemodeler.concord.org/app/?codap=/codap-dev/branch/182222132-disable-dirty-sync-on-load/

### Microsite Updates

The files in `src/microsite` are generated from the SageModeler WordPress site.  This process is automated by using the `src/scripts/microsite` script using the following steps.

1. Start a static site export at the SageModeler WordPress site in the WP2Static plugin.
2. Download the .zip file when the export is complete.  For this example we'll assume its downloaded to `~/Downloads/wp-static-html-output-1557755665.zip`
3. In a terminal change to this repos root folder (you will see an error message in the next step if you don't).
4. Checkout master and clean all local changes (you will see an error message in the next step if you don't).
5. Run `src/scripts/microsite create-branch` to create a branch for the update.
6. Run `src/scripts/microsite process-zip ~/Downloads/wp-static-html-output-1557755665.zip` to process the zip file.
7. Run `src/scripts/microsite view` to view the locally updated microsite folder a browser.
8. Look around the microsite to ensure that it includes your changes from Wordpress and the links work.
9. Run `src/scripts/microsite push-branch` to commit the changes and push the branch to GitHub.
10. Load [https://github.com/concord-consortium/sage-modeler-site/](https://github.com/concord-consortium/sage-modeler-site/) and create a PR for the newly pushed branch (you should see a notice at the top of the page about the new branch with a button to create a PR).
11. Assign the PR to Doug to review and merge to master and production.  This may be automated in the future.

### Testing

TDB.

## License

sage-modeler-site is Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See LICENSE file for the complete license text.

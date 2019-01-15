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

### Building

If you want to build a local version run `npm build`, it will create the files in the `dist` folder.
You *do not* need to build to deploy the code, that is automatic.  See more info in the Deployment section below.


### Translation strings

This project shares a POEditor project with https://github.com/concord-consortium/building-models.
Please use https://github.com/concord-consortium/building-models repository to add a new strings, update strings
in POEditor using provided scripts, and finally copy over all the JSON files from building-models.
Note that you should push the same changes to both repositories, so they stay in sync.

### Notes

1. Make sure if you are using Visual Studio Code that you use the workspace version of TypeScript.
   To ensure that you are open a TypeScript file in VSC and then click on the version number next to
   `TypeScript React` in the status bar and select 'Use Workspace Version' in the popup menu.

## Deployment

Production releases to S3 are based on the contents of the /dist folder and are built automatically by Travis
for each branch pushed to GitHub and each merge into production.

Merges into production are deployed to http://sagemodeler.concord.org.

Other branches are deployed to http://sagemodeler.concord.org/branch/<name>.

You can view the status of all the branch deploys [here](https://travis-ci.org/concord-consortium/sagemodeler/branches).

To deploy a production release:

1. Increment version number in package.json
2. Create `release-<version>` branch and commit changes, push to GitHub, create PR and merge
3. Checkout master and pull
4. Checkout production
5. Run `git merge master --no-ff`
6. Push production to GitHub
7. Use https://github.com/concord-consortium/sagemodeler/releases to create a new release tag

### QA

Since this project depends on three other deployed projects (CODAP, Sage and CFM) a set of query parameters is available to override
where those projects are deployed.  This enables this project to be tested against branch builds of the other projects.

The parameters are:

- ?codap=<URL> where URL is the url to the CODAP index.html page
- ?cfmBaseUrl=<URL> where URL is the url to the /js folder for CFM
- ?di=<URL> where URL is the url to sage (di is passed to CODAP, it stands for "data interactive")

### Testing

TDB.

## License

sage-modeler-site is Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See LICENSE file for the complete license text.

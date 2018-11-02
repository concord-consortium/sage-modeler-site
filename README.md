# SageModeler Site

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

### Testing

TDB.

## License

sage-modeler-site is Copyright 2018 (c) by the Concord Consortium and is distributed under the [MIT license](http://www.opensource.org/licenses/MIT).

See LICENSE file for the complete license text.
# NativeScript AppSync

> ❤️ Built upon the shoulders of giants. Or more accurately, [Microsoft CodePush](https://github.com/microsoft/code-push)!

This repo includes the [management CLI](/cli) and [Node.js management SDK](/sdk), which allows you to manage and automate the needs of your apps.
To get started using AppSync for NativeScript, refer to our [AppSync plugin docs](https://github.com/EddyVerbruggen/nativescript-app-sync),
otherwise, read the following steps if you'd like to build/contribute to the CLI/SDK.

## Dev Setup

* Install [Node.js](https://nodejs.org/)
* Install [Git](http://www.git-scm.com/)
* Install [Gulp](https://gulpjs.com/): `npm install -g gulp`
* Clone the Repository: `git clone https://github.com/EddyVerbruggen/nativescript-app-sync-sdk-cli.git`

### Building

* Run `npm install` from the root of the repository.
* Run `gulp install` to install the NPM dependencies of each module within the project.
* Run `gulp link` to link CLI and SDK for local development. It is advisable to do this step if you are making changes to the SDK and want the CLI to pick those changes.
* Run `gulp build` to build all of the modules. To build just one of the modules (e.g. cli or sdk), run `gulp build-cli` or `gulp build-sdk`.

### Releasing a new CLI version

```shell
gulp build-cli
cd cli/bin
npm publish
```

### Releasing a new SDK version

```shell
gulp build-sdk
cd sdk/bin
npm publish
```

### Running Tests

To run all tests, run `gulp test` script from the root of the project.

To test just one of the projects (e.g. cli or sdk), run `gulp test-cli` or `gulp test-sdk`

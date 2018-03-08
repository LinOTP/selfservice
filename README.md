# KI Selfservice

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.6.1.

## Development

To install all production and dev dependencies to start with development, execute the following command in the root directory of this project:

```bash
yarn
```

This will create the local environment for developing, running and testing the angular application.

### Develeopment Server

To run a dev server, execute:

```bash
yarn start
```

This will load a webpack develompment server that transpiles and bundles all files required. Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any of the source files.

The start script will load an api reverse proxy that can be configured via [[proxy.conf.json](proxy.conf.json)]. Per default it expects a LinOTP instance running on [http://localhost:5001](http://localhost:5001).

### Running unit tests

Unit tests are executed via [Karma](https://karma-runner.github.io) and watch for file changes to rerun.

There are several browsers as test targets supported. You can execute one of the following commands to select a specific browser:

```bash
yarn test:chrome
yarn test:chromium
yarn test:firefox
yarn test:phantomjs
```

The script **`yarn test`** will default to chrome as the test target.

The most used options `--code-coverage / -cc` and `--single-run / -sr` can be appended to any browser specific test script: `yarn test:firefox -sr`. All options available can be found via `ng help test`.

Code coverage results are saved as browsable html in directory [[coverage/](coverage/)] and printed to stdout. You could use the **serve** package (`yarn global add serve`) to view the report: `serve coverage/`

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

The option `--module <name>` may be needed to specify the module that should provide the new _thing_.

## Build

Run `yarn build` to build the project in production mode. The build artifacts will be stored in the `dist/` directory.

Production mode will bundle the [[production environment file](src/environments/environment.prod.ts)] and tries to minimize the bundle size via minification and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

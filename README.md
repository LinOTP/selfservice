# LinOTP Self Service

The Self Service is a frontend for end users of LinOTP that allows them to manage their personal tokens. Available functionality is limited by administrator-defined policies, and includes creating, deleting, enabling and disabling tokens, testing OTP generation, customizing token descriptions and viewing activity history.

## Development

This project is built with [Angular CLI](https://github.com/angular/angular-cli). It was originally generated using version *1.6.1*.

To install all production and dev dependencies to start with development, execute the following command in the root directory of this project:

```bash
yarn
```

This will create the local environment for developing, running and testing the angular application.

### Development Server

To run a dev server, execute:

```bash
yarn start
```

This will load a webpack develompment server that transpiles and bundles all files required. Navigate to [http://localhost:4200/](http://localhost:4200/). The app will automatically reload if you change any of the source files.

The start script will load an api reverse proxy that can be configured via [[proxy.conf.js](proxy.conf.js)]. Per default it expects a LinOTP instance running on [http://localhost:5000](http://localhost:5000).

You can run `yarn start-de` or `yarn start-en` to serve the application with a specific locale.

### Translations

The script `yarn extract-i18n` will collect strings from the html templates and typescript files. The extracted strings will be stored in the file [src/locale/messages.xlf](src/locale/messages.xlf). The language specific translation files in the same folder will be updated. New strings will be added and marked with state _new_ and redundant strings are removed. The default translation file _en_ is already complete and translations are marked with state _final_.

The new translations need to be done per language and checked into the repository. `yarn build` and `yarn start` commands will automatically use the new translations.

### Running unit tests

Unit tests are executed via [Karma](https://karma-runner.github.io) and watch for file changes to rerun.

There are several browsers as test targets supported. You can execute one of the following commands to select a specific browser:

```bash
yarn test:chrome
yarn test:chromium
yarn test:firefox
yarn test:ci
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

The project is set up to compile the web distribution files with yarn and package those files automatically inside of a docker image or a debian package.

### Sources

Run `yarn build` to build the project in production mode. The build artifacts will be stored in the `dist/` directory.

Production mode will bundle the [[production environment file](src/environments/environment.prod.ts)] and tries to minimize the bundle size via minification and [tree shaking](https://webpack.js.org/guides/tree-shaking/).

The application needs to know the URL prefix where the project will be served from, so that it can correctly generate URLs that the browser can use to get associated resources and other pages. This is known as the [base tag](https://angular.io/guide/deployment#the-base-tag).

`yarn build` assumes that the application will run as the only application on the root path `/<lang>/`. You can use `--base-href` to build the app for a different base href. Some examples:

```bash
   yarn build                                     # http://<hostname>/<de|en>/
   yarn build --base-href=/selfservice            # http://<hostname>/selfservice/<de|en>/
   yarn build --base-href=https://my.server/users # https://my.server/users/<de|en>/
```

### Containers

A multi stage [Dockerfile](Dockerfile) is provided to build the sources in the first stage and to produce an nginx based container in the second step.

The build container needs access to the linotp NPM repository, including a TLS trust chain. Please retrieve the required certificate via `step ca root > linotp.de.pem` in the root dir of the repository.

The build container also needs a CI token to access the NPM package
repository on `gitbox.corp.linotp.de`. This will be passed
automatically when the container is built within the Gitlab CI
infrastructure; for local builds, you can find this under “Settings »
CI/CD » Variables” in the project, and pass it as a `--build-arg` to
`docker build`.

You can run the container build afterwards by executing the following command:

```bash
docker build --build-arg NPM_CI_TOKEN=… -t linotp-selfservice .
```

By default, the application is available under `/selfservice`. This
can be changed by rebuilding the container with something like
`--build-arg URL_PATH=/foo` (to have it appear under `/foo`). Specify
`--build-arg=` (empty) to make it available on `/` inside the
container.

Also by default, the web server inside the container runs on TCP
port 8000. This can be changed at run time by passing, e.g., `-e
SERVER_PORT=1234` (to use TCP port 1234). You can also use the
`--port` option of `docker run` to remap any port (within reason) on
the outside to port 8000 inside the container.

### Debian

A separate dockerfile ([Dockerfile.deb-build](Dockerfile.deb-build)) is provided to run an isolated debian environment to build the debian package independent from your machine.

The debian build process can be triggerd with the following commands from withing the project root to build the package locally:

```bash
docker build -t ngs-deb-builder -f Dockerfile.deb-build .
docker run -it --rm -v $(pwd):/app ngs-deb-builder
```

## Customization

The application allows to customize the look and feel after the build. This means that, once installed on a server, support is available to modify the styles served to the customer.

You can put custom files under this location: `/etc/linotp-selfservice/customization/`. Files in this directory will be be served with the url starting with `/selfservice/(en|de)/assets/`.

For example, this feature allows you to replace logo.png and favicon.ico to define your own design.

Support for color modifications is currently limited. Manual css rules can be set to override application colors. We **strongly** advise against relying on this feature because it will not be update proof if newer Selfservice versions modify the templates (which is pretty common). In the future we might provide more advanced features for customization that will be update proof.

If you agree with this limitation and want to use the custom stylesheet, you can create `/etc/linotp-selfservice/customization/custom-styles.css`. The stylesheet will be used from the application automatically.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

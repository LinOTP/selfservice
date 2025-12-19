### STAGE 1: Build ###

FROM node:18.19.1-alpine3.19 as builder

## We run the selfservice on `/selfservice` (rather than `/`)
## because that makes it easy to reverse-proxy selfservice requests
## to the selfservice container from an ingress server.
## This must be a build-time argument rather than a runtime setting
## via an environment variable, because it is baked into the Angular
## application at build time.
ARG URL_PATH=/selfservice

WORKDIR /app

## Copy only the dependency list for enhanced caching
COPY package.json yarn.lock ./

## Install all dependencies required for build
RUN yarn --no-progress --frozen-lockfile

## Copy project excluding ignored files
COPY . .

## Build the static artifacts
ENV urlprefix $URL_PATH
RUN yarn build-with-prefix


### STAGE 2: Setup ###

FROM nginx:alpine as prod
ENV URL_PATH=/selfservice
ENV SERVER_PORT=8000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -sfL http://localhost:${SERVER_PORT}${URL_PATH}/  || exit 1

## Copy our default nginx config
COPY nginx/default.template /etc/nginx/conf.d/

## Fix the URL path in the nginx configuration. We do this here because
## by the time the container actually runs, we no longer have access
## to the value of URL_PATH.
RUN sed -i -e s,@URL_PATH@,${URL_PATH},g /etc/nginx/conf.d/default.template

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## Add build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

## Add convenience symlinks for customisation.
## (The /etc/linotp-selfservice link is for compatibility with older
## non-container documentation.)
RUN mkdir /usr/share/nginx/html/custom-assets && ln -s /usr/share/nginx/html/custom-assets /custom-assets
RUN mkdir -p /etc/linotp-selfservice && ln -sf /usr/share/nginx/html/custom-assets /etc/linotp-selfservice/customization

## Substitute the environment vars in the nginx config and start the server
CMD ["sh",\
  "-c",\
  "envsubst '${SERVER_PORT}' \
  < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf\
  && nginx -g 'daemon off;'"]

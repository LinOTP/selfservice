### STAGE 1: Build ###

FROM node:18.19.1-alpine3.19 AS builder

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
ENV urlprefix=$URL_PATH
RUN yarn build-with-prefix


### STAGE 2: Setup ###

FROM nginxinc/nginx-unprivileged:alpine AS prod
ENV URL_PATH=/selfservice
ENV SERVER_PORT=8000

HEALTHCHECK --interval=10s --timeout=5s --retries=3 --start-period=30s \
  CMD curl -sfL http://localhost:${SERVER_PORT}${URL_PATH}/  || exit 1

## Copy our nginx template for nginx's built-in envsubst startup hook.
## The official nginx entrypoint will render:
## /etc/nginx/templates/default.conf.template -> /etc/nginx/conf.d/default.conf
COPY --chown=nginx:nginx nginx/default.conf.template /etc/nginx/templates/default.conf.template
## Remove default nginx website
USER root
RUN rm -rf /usr/share/nginx/html/*

## Add build artifacts
COPY --from=builder --chown=nginx:nginx /app/dist/en/browser /usr/share/nginx/html/en
COPY --from=builder --chown=nginx:nginx /app/dist/de/browser/de /usr/share/nginx/html/de

## Add convenience symlinks for customisation.
## (The /etc/linotp-selfservice link is for compatibility with older
## non-container documentation.)
RUN mkdir -p /usr/share/nginx/html/custom-assets && ln -sfn /usr/share/nginx/html/custom-assets /custom-assets \
  && mkdir -p /etc/linotp-selfservice && ln -sfn /usr/share/nginx/html/custom-assets /etc/linotp-selfservice/customization \
  && chown -R nginx:nginx /usr/share/nginx/html

USER nginx

EXPOSE ${SERVER_PORT}

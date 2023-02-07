### STAGE 1: Build ###

FROM node:14.21.1-alpine3.15 as builder
ARG NPM_CI_TOKEN

WORKDIR /app

## Copy only the dependency list for enhanced caching
COPY package.json yarn.lock .npmrc ./

## Install all dependencies required for build
RUN yarn --no-progress --frozen-lockfile

## Copy project excluding ignored files
COPY . .

## Build the static artifacts
RUN yarn build


### STAGE 2: Setup ###

FROM nginx:alpine

## Copy our default nginx config
COPY nginx/default.template /etc/nginx/conf.d/

## Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

## Add build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

## Substitute the environment vars in the nginx config and start the server
CMD ["sh",\
  "-c",\
  "envsubst '${SERVER_PORT} ${API_PROXY}' \
  < /etc/nginx/conf.d/default.template > /etc/nginx/conf.d/default.conf\
  && nginx -g 'daemon off;'"]

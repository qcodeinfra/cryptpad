FROM node:16.14-slim AS build

ENV DEBIAN_FRONTEND=noninteractive 
RUN apt-get update -qq && \
    apt-get install -yq git ca-certificates && \
    npm install -g bower

# the bootstrap is created in tools/build-prod.sh
COPY build/bootstrap.tar /
RUN mkdir -p /build && \
    cd /build && \
    tar -xf /bootstrap.tar && \
    npm ci && \
    bower install --allow-root --production

FROM node:16.14-alpine
COPY --from=build /build /app
WORKDIR /app

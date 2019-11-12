FROM node:alpine as dev-deps
WORKDIR /opt/dev-deps
COPY ./package.json ./package-lock.json ./
RUN npm i --no-audit

FROM node:alpine as prod-deps
WORKDIR /opt/prod-deps
COPY ./package.json ./package-lock.json ./
RUN npm i --only=prod --no-audit

FROM node:alpine AS ts-build
WORKDIR /opt/build
COPY ./package.json ./package-lock.json ./
COPY --from=dev-deps /opt/dev-deps ./
COPY ./ ./
RUN npm run lint
RUN npm run build

FROM node:alpine
WORKDIR /opt/app
COPY ./package.json ./package-lock.json ./
COPY --from=ts-build /opt/build/dist ./
COPY --from=prod-deps /opt/prod-deps ./
COPY ./shared ./

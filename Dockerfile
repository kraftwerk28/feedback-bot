FROM node:alpine
WORKDIR /opt/build
COPY ./ ./
RUN npm i --no-audit
RUN npm run lint
RUN npm run build

FROM node:alpine
WORKDIR /opt/app
COPY --from=0 /opt/build/dist ./
COPY ./package.json ./package-lock.json ./
RUN npm i --only=prod --no-audit
COPY ./shared ./

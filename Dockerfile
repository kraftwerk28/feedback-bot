FROM node:alpine
WORKDIR /opt/build
COPY ./ ./
RUN yarn install
RUN yarn lint
RUN yarn build

FROM node:alpine
WORKDIR /opt/app
COPY --from=0 /opt/build/dist ./
COPY ./package.json ./yarn.lock ./
RUN yarn install --prod
COPY ./shared ./

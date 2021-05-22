FROM node:16-alpine3.11 AS build-image

WORKDIR /usr/src/gap-server

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build

FROM node:16-alpine3.11

WORKDIR /usr/src/gap-server
COPY package*.json ./
COPY --from=build-image /usr/src/gap-server/build ./build

RUN npm install --only=prod && \
    npm install --global cross-env && \
    adduser -D appuser

USER appuser
# EXPOSE 4000
CMD ["npm", "start"]
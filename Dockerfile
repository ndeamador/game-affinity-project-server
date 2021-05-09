FROM node:14
WORKDIR /usr/src/game-affinity-project-server
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 4000
CMD ["npm", "start"]
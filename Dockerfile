FROM node:20-alpine
WORKDIR /app
COPY ./dist /dist
COPY ./package.json /package.json
COPY ./package-lock.json /package-lock.json
RUN npm install
COPY . .
CMD ["node", "dist/main.js"]
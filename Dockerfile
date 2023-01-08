FROM node:18
WORKDIR /app
COPY ./build /build
COPY ./package.json /package.json
COPY ./package-lock.json /package-lock.json
RUN npm install
COPY . .
CMD ["node", "build/main.js"]
FROM node:18
RUN npm install
COPY . .
CMD npm run start
EXPOSE 8081
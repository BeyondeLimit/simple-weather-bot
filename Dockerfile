FROM node:18
COPY . .
CMD npm run start
EXPOSE 8081
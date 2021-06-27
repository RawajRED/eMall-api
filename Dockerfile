FROM node:16

WORKDIR /home/salem/eMall-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD [ "nodemon", "./bin/www" ]

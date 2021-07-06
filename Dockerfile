FROM node:16

WORKDIR /home/ubuntu/eMall-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD [ "node", "./bin/www" ]

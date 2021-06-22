FROM node:16

WORKDIR /home/salem/eMall-api

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "node", "./bin/www" ]

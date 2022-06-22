FROM node:16.13.2-alpine 
RUN apk add --no-cache tzdata 
ENV TZ Asia/Seoul

WORKDIR /home/app 
COPY ./package.json ./
COPY . . 

RUN npm install
CMD npm run start 
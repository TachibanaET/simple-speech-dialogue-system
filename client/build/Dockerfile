FROM node:10.15.3-jessie
WORKDIR /src/
COPY ./webserver .

ARG HTTP_PROXY
ENV http_proxy ${HTTP_PROXY}
ENV https_proxy ${HTTP_PROXY}

RUN npm install
ENTRYPOINT [ "npm", "run" ]
CMD [ "start" ]
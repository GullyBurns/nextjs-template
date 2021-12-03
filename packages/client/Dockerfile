FROM node:alpine

ENV PORT 3000

# Install python/pip
ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python2 && ln -sf python2 /usr/bin/python
RUN python2 -m ensurepip
RUN pip2 install --no-cache --upgrade pip setuptools
RUN apk add --update make

# Create app directory
RUN mkdir -p /frontend
WORKDIR /frontend

# Installing dependencies
COPY package*.json /frontend
RUN npm  cache clear --force
RUN npm install

# Copying source files
COPY . /frontend

# Building app
RUN npm run build
EXPOSE 3000

# Running the app
CMD "npm" "run" "dev"
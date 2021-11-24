FROM node:alpine

ENV PORT 3000

# Create app directory
RUN mkdir -p /frontend
WORKDIR /frontend

# Installing dependencies
COPY package*.json /frontend
RUN npm install

# Copying source files
COPY . /frontend

# Building app
RUN npm run build
EXPOSE 3000

# Running the app
CMD "npm" "run" "dev"
FROM telkomindonesia/alpine:nodejs-12

# Set Working Directory
WORKDIR /usr/src/app

# Copy Node Packages Requirement
COPY package*.json ./

# Install Node Modules Based On Node Packages Requirement
RUN apk add --update --no-cache --virtual .build-dev \
      build-base \
      python \
      python-dev \
    && npm i -g npm@6.14.11 \
    && npm i -g node-gyp \
    && npm i \
    && apk del .build-dev

# Copy Node Source Code File
COPY . .

# Expose Application Port
EXPOSE 9000

# Run The Application
CMD ["npm", "start"]
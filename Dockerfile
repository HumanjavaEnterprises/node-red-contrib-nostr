FROM nodered/node-red:latest

USER root

# Set working directory
WORKDIR /usr/src/node-red

# Copy our package files
COPY . /tmp/node-red-contrib-nostr/

# Build and install our package
WORKDIR /tmp/node-red-contrib-nostr
RUN npm install && \
    npm run build && \
    npm install -g . && \
    cd /data && \
    mkdir -p node_modules && \
    cp -r /usr/src/node-red/node_modules/node-red-contrib-nostr /data/node_modules/ && \
    chown -R node-red:node-red /data

USER node-red
WORKDIR /usr/src/node-red

# Start Node-RED
CMD ["npm", "start", "--", "--userDir", "/data"]

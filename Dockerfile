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
    cd /data && \
    mkdir -p node_modules/node-red-contrib-nostr/nodes && \
    cp -r /tmp/node-red-contrib-nostr/dist/nodes/* /data/node_modules/node-red-contrib-nostr/nodes/ && \
    cp -r /tmp/node-red-contrib-nostr/dist/locales /data/node_modules/node-red-contrib-nostr/ && \
    cp /tmp/node-red-contrib-nostr/package.json /data/node_modules/node-red-contrib-nostr/ && \
    chown -R node-red:node-red /data

USER node-red
WORKDIR /usr/src/node-red

# Start Node-RED
CMD ["npm", "start", "--", "--userDir", "/data"]

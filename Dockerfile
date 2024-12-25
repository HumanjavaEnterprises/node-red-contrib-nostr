FROM nodered/node-red:latest

USER root

# Create Node-RED user directory and set permissions
RUN mkdir -p /data && \
    chown -R node-red:node-red /data

# Switch to node-red user for npm installations
USER node-red

# Install dependencies in the user directory
WORKDIR /data
RUN npm install nostr-websocket-utils@0.2.5

# Copy and install the packed module
COPY --chown=node-red:node-red node-red-contrib-nostr-0.1.0.tgz /data/
RUN npm install /data/node-red-contrib-nostr-0.1.0.tgz && \
    npm cache clean --force

# Switch back to Node-RED directory
WORKDIR /usr/src/node-red

# Expose the Node-RED port
EXPOSE 1880

# Start Node-RED
CMD ["npm", "start", "--", "--userDir", "/data"]

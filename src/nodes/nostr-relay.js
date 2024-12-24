module.exports = function(RED) {
    function NostrRelayNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const { relayUrl } = config;

        // Initialize status
        node.status({fill:"red", shape:"ring", text:"disconnected"});

        // Handle incoming messages
        node.on('input', function(msg) {
            // Process incoming message and interact with Nostr relay
            node.status({fill:"green", shape:"dot", text:"connected"});
            node.send(msg);
        });

        // Clean up on node removal
        node.on('close', function() {
            // Cleanup code here
            node.status({});
        });
    }
    RED.nodes.registerType("nostr-relay", NostrRelayNode);
}

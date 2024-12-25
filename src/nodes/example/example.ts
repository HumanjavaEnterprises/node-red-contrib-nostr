import { Node, NodeDef } from 'node-red';

interface ExampleNodeDef extends NodeDef {
    message: string;
}

module.exports = function(RED: any) {
    function ExampleNode(this: Node, config: ExampleNodeDef) {
        RED.nodes.createNode(this, config);
        const node = this;
        
        node.on('input', function(msg: any) {
            msg.payload = config.message;
            node.send(msg);
        });
    }
    
    RED.nodes.registerType("example", ExampleNode);
}

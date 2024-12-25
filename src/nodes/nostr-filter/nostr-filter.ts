import { Node, NodeAPI, NodeDef } from 'node-red';
import { NostrEvent } from '../../nodes/shared/types';

interface NostrFilterDef extends NodeDef {
    filterType: 'kind' | 'tag' | 'since' | 'custom';
    eventKinds: number[];
    tagName: string;
    tagValue: string;
    sinceMinutes: number;
    customFilter: string;
}

interface NostrFilterNode extends Node {
    filterType: 'kind' | 'tag' | 'since' | 'custom';
    eventKinds: number[];
    tagName: string;
    tagValue: string;
    sinceMinutes: number;
    customFilter: string;
}

module.exports = function(RED: NodeAPI) {
    function NostrFilterNode(this: NostrFilterNode, config: NostrFilterDef) {
        RED.nodes.createNode(this, config);

        this.filterType = config.filterType;
        this.eventKinds = config.eventKinds;
        this.tagName = config.tagName;
        this.tagValue = config.tagValue;
        this.sinceMinutes = config.sinceMinutes;
        this.customFilter = config.customFilter;

        this.on('input', (msg: any, send, done) => {
            const event = msg.payload as NostrEvent;
            let match = false;

            try {
                switch (this.filterType) {
                    case 'kind':
                        match = this.eventKinds.includes(event.kind);
                        break;

                    case 'tag':
                        match = event.tags.some(tag => 
                            tag[0] === this.tagName && 
                            (this.tagValue === '' || tag[1] === this.tagValue)
                        );
                        break;

                    case 'since':
                        const cutoff = Math.floor(Date.now() / 1000) - (this.sinceMinutes * 60);
                        match = event.created_at >= cutoff;
                        break;

                    case 'custom':
                        try {
                            const filter = JSON.parse(this.customFilter);
                            match = Object.entries(filter).every(([key, value]) => {
                                if (key.startsWith('#')) {
                                    // Tag filter
                                    const tagName = key.slice(1);
                                    return event.tags.some(tag => 
                                        tag[0] === tagName && 
                                        (value as string[]).includes(tag[1])
                                    );
                                } else if (key === 'kinds') {
                                    return (value as number[]).includes(event.kind);
                                } else if (key === 'since') {
                                    return event.created_at >= (value as number);
                                } else if (key === 'until') {
                                    return event.created_at <= (value as number);
                                }
                                return true;
                            });
                        } catch (e) {
                            this.error('Invalid custom filter JSON');
                            match = false;
                        }
                        break;
                }

                if (match) {
                    send(msg);
                }
                done();
            } catch (error) {
                done(error instanceof Error ? error : new Error('Filter error'));
            }
        });
    }

    RED.nodes.registerType("nostr-filter", NostrFilterNode);
}

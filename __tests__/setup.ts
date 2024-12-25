import { beforeAll, afterAll } from 'vitest';
import * as helper from 'node-red-node-test-helper';

beforeAll(() => {
    // Clear any existing Node-RED runtime
    delete global._RED;
    delete (helper as any)._RED;
});

afterAll(async () => {
    await helper.unload();
});

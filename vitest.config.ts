import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        testTimeout: 10000,
        setupFiles: ['./__tests__/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/__mocks__/**']
        },
        include: ['**/__tests__/**/*.{test,spec}.{js,ts}'],
        mockReset: true
    },
})

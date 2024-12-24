import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        environment: 'node',
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/__mocks__/**']
        },
        include: ['**/__tests__/**/*.{test,spec}.{js,ts}'],
        mockReset: true
    },
})

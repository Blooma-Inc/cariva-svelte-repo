import { defineConfig, mergeConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import viteConfig from './vite.config.js';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      projects: [
        {
          extends: './vite.config.js',
          test: {
            name: 'client',
            include: ['tests/**/*.test.ts'],
            exclude: ['tests/**/*.node.test.ts'],
            browser: {
              enabled: true,
              provider: playwright(),
              instances: [{ browser: 'chromium', headless: true }]
            }
          }
        },
        {
          extends: './vite.config.js',
          test: {
            name: 'server',
            environment: 'node',
            include: ['tests/**/*.node.test.ts']
          }
        }
      ]
    }
  })
);

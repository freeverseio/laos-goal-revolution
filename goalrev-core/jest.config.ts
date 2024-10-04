import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json', 'node'],
  testMatch: ['**/src/**/*.test.ts'],
  roots: ['src'], 
  setupFiles: ['./jest.setup.ts'],
};


export default config;
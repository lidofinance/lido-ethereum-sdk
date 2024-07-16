import getConfig from 'next/config';
export const { serverRuntimeConfig } = getConfig();
export { default as dynamics } from './dynamics';
export * from './api';
export * from './locale';
export * from './storage';

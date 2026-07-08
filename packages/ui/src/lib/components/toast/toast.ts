import { type ExternalToast, toast as sonnerToast } from 'svelte-sonner';
import type { Component } from 'svelte';

const baseStyle = `
  padding: 14px;
  border-radius: 10px;
  border: none;
  font-family: Arial, sans-serif;
  font-size: 14px;
  font-weight: 700;
`;

const styles = {
  success: `
    ${baseStyle}
    background: #d4edda;
    color: #155724;
  `,
  error: `
    ${baseStyle}
    background: #f8d7da;
    color: #721c24;
  `,
  warning: `
    ${baseStyle}
    background-color: '#fff3cd',
    color: '#856404'
  `,
  info: `
    ${baseStyle}
    background-color: '#EFEFEF',
    color: '#262626'
  `
};

export const toast = {
  success: (message: Component | string, data: ExternalToast = {}) =>
    sonnerToast.success(message, {
      ...data,
      style: styles.success
    }),

  error: (message: Component | string, data: ExternalToast = {}) =>
    sonnerToast.error(message, {
      ...data,
      style: styles.error
    }),

  warning: (message: Component | string, data: ExternalToast = {}) =>
    sonnerToast.warning(message, {
      ...data,
      style: styles.warning
    }),

  info: (message: Component | string, data: ExternalToast = {}) =>
    sonnerToast.info(message, {
      ...data,
      style: styles.info
    })
};

import { ESLINT_BANNER } from './shared.js';

export const renderGetIconColor = (ts: boolean): string => {
  if (ts) {
    return `${ESLINT_BANNER}
export const getIconColor = (
  color: string | string[] | undefined,
  index: number,
  defaultColor: string,
) => {
  if (!color) {
    return defaultColor;
  }
  return typeof color === 'string' ? color : color[index] || defaultColor;
};
`;
  }

  return `${ESLINT_BANNER}
/**
 * @param {string | string[] | undefined} color
 * @param {number} index
 * @param {string} defaultColor
 * @return {string}
 */
export const getIconColor = (color, index, defaultColor) => {
  if (!color) {
    return defaultColor;
  }
  return typeof color === 'string' ? color : color[index] || defaultColor;
};
`;
};

export const renderGetIconColorDts = (): string => `${ESLINT_BANNER}
export declare const getIconColor: (color: string | string[] | undefined, index: number, defaultColor: string) => string;
`;

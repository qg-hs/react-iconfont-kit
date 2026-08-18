import type { ColorCounter, XmlSymbol } from '../core/types.js';
import { camelCase } from '../core/names.js';
import { whitespace } from '../core/whitespace.js';

const ATTRIBUTE_FILL_MAP = new Set(['path', 'Path']);

export const eachChild = (
  data: XmlSymbol,
  visitor: (domName: string, node: { $?: Record<string, string> }) => void,
): void => {
  for (const domName of Object.keys(data)) {
    if (domName === '$') {
      continue;
    }
    const value = data[domName];
    if (value && typeof value === 'object' && !Array.isArray(value) && '$' in (value as object)) {
      visitor(domName, value as { $?: Record<string, string> });
    } else if (Array.isArray(value)) {
      for (const sub of value) {
        visitor(domName, sub as { $?: Record<string, string> });
      }
    }
  }
};

export const addJsxAttribute = (
  domName: string,
  sub: { $?: Record<string, string> },
  counter: ColorCounter,
  options: { camelCaseFill?: boolean } = {},
): string => {
  let template = '';
  if (!sub?.$) {
    return template;
  }

  if (ATTRIBUTE_FILL_MAP.has(domName)) {
    sub.$.fill = sub.$.fill || '#333333';
  }

  for (const attributeName of Object.keys(sub.$)) {
    if (attributeName === 'fill') {
      const fillName = options.camelCaseFill ? camelCase(attributeName) : attributeName;
      template += `\n${whitespace((counter.baseIdent || 0) + 4)}${fillName}={getIconColor(color, ${counter.colorIndex}, '${sub.$[attributeName]}')}`;
      counter.colorIndex += 1;
    } else {
      template += `\n${whitespace((counter.baseIdent || 0) + 4)}${camelCase(attributeName)}="${sub.$[attributeName]}"`;
    }
  }

  return template;
};

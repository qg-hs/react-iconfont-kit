import { XMLParser } from 'fast-xml-parser';
import type { XmlData } from './types.js';

const ARRAY_TAGS = new Set([
  'symbol',
  'path',
  'circle',
  'ellipse',
  'rect',
  'line',
  'polygon',
  'polyline',
  'g',
  'defs',
  'linearGradient',
  'radialGradient',
  'stop',
  'use',
]);

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  attributesGroupName: '$',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: false,
  isArray: (tagName) => ARRAY_TAGS.has(tagName),
});

const SVG_RE = /['"]<svg>([\s\S]+?)<\/svg>['"]/;

export const normalizeSymbolUrl = (url: string): string => {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }
  return url;
};

export const parseSymbolXml = (source: string): XmlData => {
  const matches = source.match(SVG_RE);
  if (!matches) {
    throw new Error('You provide a wrong symbol url');
  }

  const parsed = parser.parse(`<svg>${matches[1]}</svg>`) as XmlData;
  if (!parsed?.svg?.symbol) {
    parsed.svg = parsed.svg || { symbol: [] };
    parsed.svg.symbol = parsed.svg.symbol || [];
  }
  return parsed;
};

export const fetchXml = async (url: string): Promise<XmlData> => {
  console.log('Fetching iconfont data...');
  const response = await fetch(normalizeSymbolUrl(url));
  if (!response.ok) {
    throw new Error(`Failed to fetch symbol url: ${response.status} ${response.statusText}`);
  }
  return parseSymbolXml(await response.text());
};

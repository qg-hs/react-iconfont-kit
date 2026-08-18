import { XMLParser } from 'fast-xml-parser';
import type { SvgNode, SvgSymbol, XmlData } from './types.js';

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

type RawNode = Record<string, unknown>;

const toNodes = (raw: RawNode): SvgNode[] => {
  const children: SvgNode[] = [];

  for (const [key, value] of Object.entries(raw)) {
    if (key === '$') {
      continue;
    }

    const list = Array.isArray(value) ? value : [value];
    for (const item of list) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const rec = item as RawNode;
      const attrs = { ...((rec.$ as Record<string, string> | undefined) ?? {}) };
      children.push({ name: key, attrs, children: toNodes(rec) });
    }
  }

  return children;
};

const toSymbol = (raw: RawNode): SvgSymbol => {
  const attrs = (raw.$ as Record<string, string> | undefined) ?? {};
  return {
    id: attrs.id ?? '',
    viewBox: attrs.viewBox ?? '0 0 1024 1024',
    children: toNodes(raw),
  };
};

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

  const parsed = parser.parse(`<svg>${matches[1]}</svg>`) as { svg?: { symbol?: RawNode | RawNode[] } };
  const rawSymbols = parsed.svg?.symbol;
  const list = Array.isArray(rawSymbols) ? rawSymbols : rawSymbols ? [rawSymbols] : [];

  return {
    svg: {
      symbol: list.map(toSymbol),
    },
  };
};

export const fetchXml = async (url: string): Promise<XmlData> => {
  console.log('Fetching iconfont data...');
  const response = await fetch(normalizeSymbolUrl(url));
  if (!response.ok) {
    throw new Error(`Failed to fetch symbol url: ${response.status} ${response.statusText}`);
  }
  return parseSymbolXml(await response.text());
};

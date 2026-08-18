import type { ColorCounter, SvgNode, SvgSymbol } from './types.js';
import { camelCase } from './names.js';
import { whitespace } from './whitespace.js';
import { hexToRgb } from './hex.js';

const FILL_TAGS = new Set(['path', 'Path']);

export const RN_SVG_MAP: Record<string, string> = {
  path: 'Path',
  circle: 'Circle',
  ellipse: 'Ellipse',
  rect: 'Rect',
  line: 'Line',
  polygon: 'Polygon',
  polyline: 'Polyline',
  g: 'G',
  defs: 'Defs',
  linearGradient: 'LinearGradient',
  radialGradient: 'RadialGradient',
  stop: 'Stop',
  use: 'Use',
};

export const eachChild = (symbol: SvgSymbol, visitor: (node: SvgNode) => void): void => {
  for (const node of symbol.children) {
    visitor(node);
  }
};

const withDefaultFill = (node: SvgNode): Record<string, string> => {
  const attrs = { ...node.attrs };
  if (FILL_TAGS.has(node.name) && !attrs.fill) {
    attrs.fill = '#333333';
  }
  return attrs;
};

export const jsxAttributes = (
  node: SvgNode,
  counter: ColorCounter,
  options: { camelCaseFill?: boolean } = {},
): string => {
  let template = '';
  const attrs = withDefaultFill(node);

  for (const [attributeName, value] of Object.entries(attrs)) {
    if (attributeName === 'fill') {
      const fillName = options.camelCaseFill ? camelCase(attributeName) : attributeName;
      template += `\n${whitespace((counter.baseIdent || 0) + 4)}${fillName}={getIconColor(color, ${counter.colorIndex}, '${value}')}`;
      counter.colorIndex += 1;
    } else {
      template += `\n${whitespace((counter.baseIdent || 0) + 4)}${camelCase(attributeName)}="${value}"`;
    }
  }

  return template;
};

export const renderJsxSvg = (
  symbol: SvgSymbol,
  options: {
    indent: number;
    tag: string;
    sizeExpr: string;
    extraOpen?: string;
    mapTag?: (name: string) => string | undefined;
    camelCaseFill?: boolean;
    onUnknownTag?: (name: string) => void;
  },
): string => {
  const extra = options.extraOpen ? ` ${options.extraOpen}` : '';
  let template = `\n${whitespace(options.indent)}<${options.tag} viewBox="${symbol.viewBox}" width={${options.sizeExpr}} height={${options.sizeExpr}}${extra} {...rest}>\n`;

  const counter: ColorCounter = { colorIndex: 0, baseIdent: options.indent };
  for (const node of symbol.children) {
    const tagName = options.mapTag ? options.mapTag(node.name) : node.name;
    if (options.mapTag && !tagName) {
      options.onUnknownTag?.(node.name);
      continue;
    }
    template += `${whitespace(options.indent + 2)}<${tagName}${jsxAttributes(node, counter, {
      camelCaseFill: options.camelCaseFill,
    })}\n${whitespace(options.indent + 2)}/>\n`;
  }

  template += `${whitespace(options.indent)}</${options.tag}>\n`;
  return template;
};

export const renderMpSvgUri = (symbol: SvgSymbol, useHexToRgb: boolean): string => {
  let template = `<svg viewBox='${symbol.viewBox}' xmlns='http://www.w3.org/2000/svg' width='{{svgSize}}px' height='{{svgSize}}px'>`;
  const colorKey = useHexToRgb ? 'colors' : 'color';
  let colorIndex = 0;

  for (const node of symbol.children) {
    let attrs = '';
    const nodeAttrs = withDefaultFill(node);

    for (const [attributeName, value] of Object.entries(nodeAttrs)) {
      if (attributeName === 'fill') {
        const color = useHexToRgb ? hexToRgb(value) : value;
        attrs += ` fill='{{(isStr ? ${colorKey} : ${colorKey}[${colorIndex}]) || '${color}'}}'`;
        colorIndex += 1;
      } else {
        attrs += ` ${attributeName}='${value}'`;
      }
    }

    template += `<${node.name}${attrs} />`;
  }

  template += `</svg>`;
  return template.replace(/<|>/g, (matched) => encodeURIComponent(matched));
};

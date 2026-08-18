import { whitespace } from '../core/whitespace.js';

export const ESLINT_BANNER = '/* eslint-disable */\n';

export const unionNames = (names: string[]): string => names.map((name) => `'${name}'`).join(' | ');

export const renderImports = (components: string[]): string =>
  components.map((name) => `import ${name} from './${name}';`).join('\n');

export const renderReExports = (components: string[]): string =>
  components.map((name) => `export { default as ${name} } from './${name}';`).join('\n');

export const renderSwitchCases = (entries: Array<{ name: string; component: string }>): string =>
  entries
    .map(
      ({ name, component }) =>
        `${whitespace(4)}case '${name}':\n${whitespace(6)}return <${component} {...rest} />;`,
    )
    .join('\n');

export const svgComponentsImport = (components: Set<string>): string => {
  const used = Array.from(components);
  if (!used.length) {
    return '';
  }
  const names = used.map((name) => (name === 'GProps' ? `type ${name}` : name));
  return `import { ${names.join(', ')} } from 'react-native-svg';`;
};
